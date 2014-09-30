/* jshint ignore: start */

/*global std*/
(function (global, undefined) {
  "use strict";

  function asyncProvider(type) {
    var 
    process      = global.process,
    nextTick     = process && process.nextTick,
    isNodeJS     = !!process,
    //ToString     = String,
    ToBoolean    = Boolean,
    //ToObject    = Object,
    $cast        = type.cast,
    //$equals     = std.equals,
    //$hashCode   = std.hashCode,
    $super       = type.$super,
    //$instanceOf  = type.instanceOf,
    //$id          = std.id,
    $inspect     = std.inspect,
    $name        = type.getName,
    $private     = type.$private,
    $require     = type.require,
    //$typeOf     = type.of,
    asyncOld     = global.async;

    function async(fn) {
      return async.__apply__(fn);
    }

    function $throwError(message, opt_class) {
      var Constructor = (opt_class|| Error);
      throw new Constructor(message);
    }

    function $isCallable(o) {
      return o && typeof o.call === "function";
    }

    function $assertCallable(o) {
      if (!$isCallable(o)) {
        $throwError(o + ' is not valid callable', TypeError);
      }
      return o;
    }

    function $arrayCopy(a) {
      return a.slice();
    }

    function $arrayReverse(a) {
      var l = a.length, r = new Array(l), i = 0;
      while (l--) {
        r[i] = a[l];
        ++i;
      }
      return r;
    }

    function $arrayPick(a, index) {
      var v = a[index];
      a[index] = undefined;
      return v;
    }

    /*
    function $arraySlice(array, start, end) {
      var l, ret;

      l = array.length;
      start = start >>> 0;
      end = $isEmpty(end) ? l : end;
      ret = new Array(end - start);


      if (0 !== l) {
        while (l-- > start) {
          ret[l - start] = array[l];
        }
      }
      return ret;
    }
    */

    function $identity(e) { return e; }

    function $isEmpty(o) {
      return o === null || o === undefined;
    }

    function $isThenable(o) {
      return o && typeof o.then === "function";
    }

    function $setImmediate(fn) {
      return (global.setImmediate || nextTick || global.setTimeout)(fn, 0);
    }

    /*
    function $clearImmediate(id) {
      return (global.clearImmediate || global.clearTimeout)(id);
    }*/

    function $setTimeout(fn, ms) {
      return global.setTimeout(fn, ms);
    }

    function $clearTimeout(id) {
      return global.clearTimeout(id);
    }

    function $handleError(e) {
      if (!async.onerror || !async.onerror(e)) {
        std.handleError(e);
      }
    }

    type.mixin(async, {
      noConflict: function noConflict() {
        global.async = asyncOld;
        return async;
      }
    });

    global.async = async;



type.mixin(async, (function () {
  
  var 
  bufferc  = 0,
  buffer   = new Array(1024),
  flushing = false,
  _requestFlush, domain;

  /**
   * Throw asynchronously an error
   *
   * @param {*}
   */
  function throwError(error) {
    function ThrowAsyncError() { 
      throw error; 
    }
    $setImmediate(ThrowAsyncError);
  }

  /**
   * Enqueue task to be done as soon as possible
   *
   * @param {function} callable
   */
  function asap(callable, opt_this) {
    $assertCallable(callable);
    if (isNodeJS && process.domain) {
      callable = process.domain.bind(callable);
    }
    buffer[bufferc] = [callable, opt_this];
    ++bufferc;

    if (!flushing) {
      _requestFlush();
      flushing = true;
    }
  }

  function _flush() {
    var i, task;
    for (i = 0; i < bufferc; ++i) {
      task = $arrayPick(buffer, i);
      if (task !== undefined) {
        try {
          task[0].call(task[1]);
        } catch (e) {
          if (isNodeJS) {
            _requestFlush();
            throw e;
          } else {
            // In browsers, uncaught exceptions are not fatal.
            // Re-throw them asynchronously to avoid slow-downs.
            throwError(e);
          }
        }
      }
    }
    bufferc = 0;
    flushing = false;
  }

  
  //source: github:kriskowal/q
  function _requestFlushNodeJS() {
    return function _requestFlush() {
      // Ensure flushing is not bound to any domain.
      var currentDomain = process.domain, req = (1, require);
      if (currentDomain) {
        domain = domain || req("domain");
        domain.active = process.domain = null;
      }

      // Avoid tick recursion - use setImmediate if it exists.
      if (flushing) {
        $setImmediate(_flush);
      }

      if (currentDomain) {
        domain.active = process.domain = currentDomain;
      }
    };
  }
  

  function _requestFlushBrowser() {
    return function _requestFlush() {
      $setImmediate(_flush);
    };
  }

  _requestFlush = isNodeJS ? _requestFlushNodeJS() : _requestFlushBrowser();

  return {
    //events
    onerror: null,
    asap: asap,
    throwError: throwError
  };
}()));



/**
 * Thrown when a promise times out
 */
type("async.TimeoutError", [ Error ]);

/**
 * Thrown when a promise is canceled
 */
type("async.CancelError", [ Error ]);

/**
 * Thrown when a promise resolve to itself or that a thenable cycle is detected
 */
type("async.CycleError", [ Error ]);

/**
 * Promise class
 *
 * A promise represent the result of an asynchronous computation. It can be either a Resolve(value)
 * or a Reject(error).
 *
 * Usage:
 *
 *  function asyncMethod() {
 *    return new Promise(function (resolve, reject) {
 *
 *      doSomethingAsynchronous(function (error, result) {
 *        if (error) reject(error);
 *        else resolve(result);
 *      });
 *    });
 *  }
 *
 *  //...
 *
 *  asyncMethod()
 *   .then(function (result) {
 *     return [ result , 'more-data' ];
 *   })
 *   .then(function (array) { // array === [ result , 'more-data' ]
 *     throw new TypeError();
 *   })
 *   .then(function (array) {
 *     //won't be called
 *   }, function (error) {
 *     //error is the thrown TypeError;
 *   });
 */
type("async.Promise", [], function (Promise) {
  var
  STATUS_EMPTY   = 0,
  STATUS_SUCCESS = 1,
  STATUS_FAILURE = 2,
  TimeoutError   = $require("async.TimeoutError"),
  CancelError    = $require("async.CancelError"),
  CycleError     = $require("async.CycleError"),
  asap           = $require("async.asap"),
  PromiseData    = $private(Promise, {
      parent: null,
      status: STATUS_EMPTY,
      value: undefined,
      isCaught: false,
      isNotifying: false,
      timerId: null,
      timeout: Infinity,
      handlers: null,//lazy init
      oncancel: null,
      promise: null//reference to the owner
    }),
  $get           = PromiseData.get,
  $set           = PromiseData.set;

  /**
   * @constructor
   * @param {Function=} opt_fn
   * @param {Function=} opt_cancel
   */
  function __new__(opt_fn, opt_cancel) {
    $super(Promise, '__new__', this, arguments);
    var 
    self = this, 
    data = new PromiseData();
    data.promise = self;
    $set(self, data);


    if (!$isEmpty(opt_cancel)) {
      data.oncancel = $assertCallable(opt_cancel);
    }
    if (!$isEmpty(opt_fn)) {
      $assertCallable(opt_fn);
      try {
        opt_fn.call(
          self,
          _resolveFn(data),
          _rejectFn(data)
        );
      } catch (e) {
        _setStatus(data, STATUS_FAILURE, e);
      }
    }
  }

  /**
   * Destroy this promise
   */
  function __destroy__() {
    this.cancel();
  }

  /**
   * Getter/Setter for status
   *
   * @param {number} status
   * @param {*} value
   */
  function __status__(status, value) {
    var self = this, data = $get(this);
    if (status !== undefined) {
      _setStatus(data, status, value);
      return self;
    } else {
      return data.status;
    }
  }

  /**
   * Cancel this promise
   *
   * @return {async.Promise}
   */
  function cancel() {
    var 
    self     = this, 
    data     = $get(this),
    oncancel = data.oncancel,
    error;

    if (data.status === STATUS_EMPTY) {
      try {
        if (oncancel) {
          oncancel.call(self);
        }
        error = new CancelError($inspect(self) + " is canceled");
        data.isCaught = true;//Set as caught so it wont throw error
      } catch (e) {
        error = e;
      }
      _setStatus(data, STATUS_FAILURE, error);
    }
    
    return self;
  }

  /**
   * Return `true` if this deferred is not defined
   *
   * @return {boolean}
   */
  function isEmpty() {
    return $get(this).status === STATUS_EMPTY;
  }
  
  /**
   * Return `true` if this deferred is defined
   *
   * @return {boolean}
   */
  function isDefined() {
    return $get(this).status !== STATUS_EMPTY;
  }
  
  /**
   * Return `true` if this deferred is successful
   *
   * @return {boolean}
   */
  function isResolved() {
    return $get(this).status === STATUS_SUCCESS;
  }

  /**
   * Return `true` if this deferred had an error
   *
   * @return {boolean}
   */
  function isRejected() {
    return $get(this).status === STATUS_FAILURE;
  }

  /**
   * Add a listener on success and the second argument on error
   *
   * @param {Function=} onResolved(result, isError)
   * @param {Function=} onRejected(error, isError)
   * @return {async.Promise}
   */
  function then(onResolved, onRejected) {
    var 
    self       = this,
    hasResolve = !$isEmpty(onResolved),
    hasReject  = !$isEmpty(onRejected),
    child      = self;

    if (hasResolve || hasReject) {
      if (hasResolve) {
        $assertCallable(onResolved);
      }
      if (hasReject) {
        $assertCallable(onRejected);
      }
      child = _addListener(self, onResolved, onRejected, false);
    }
    return child;
  }

  /**
   * @param {function} onRejected
   * @return {async.Promise}
   */
  function $catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * @param {function} callback
   * @return {async.Promise}
   */
  function $finally(callback) {
    var 
    self  = this,
    child = self;

    if (!$isEmpty(callback)) {
      $assertCallable(callback);
      child = _addListener(self, callback, callback, true);
    }

    return child;
  }

  /**
   * @param {async.Deferred} deferred
   * @return {async.Promise}
   */
  function pipe(deferred) {
    deferred = $cast(deferred, async.Deferred) || $throwError($inspect(deferred) + ' is not a Deferred', TypeError);
    this.then(
      function (result) {
        deferred.tryResolve(result);
      }, 
      function (error) {
        deferred.tryReject(error);
      }
    );
    return deferred.promise;//$cast(deferred, Promise);
  }

  /**
   * Set a timeout that will emitError if no resolve or reject was called
   *
   * @param {*|undefined} opt_milliseconds
   * @return this
   */
  function timeout(opt_milliseconds) {
    //Static init
    var 
    self = this,
    data = $get(self);

    //process
    if (arguments.length) {
      _clearTimeout(data);
      if (
        data.status === STATUS_EMPTY &&
        (opt_milliseconds || opt_milliseconds === 0)
      ) {

        _setTimeout(data, function () {
          _setStatus(
            data, 
            STATUS_FAILURE,
            new TimeoutError($inspect(self) + " has timed out")
          );
        }, opt_milliseconds);
      }
      return self;
    } else {
      //getter
      return data.timeOut;
    }
  }

  /**
   * @return {async.Promise}
   */
  function toPromise() {
    return this;
  }

  /**
   * @return {String}
   */
  function toString() {
    var 
    self = this,
    data = $get(self), 
    s    = $name(self.constructor);
    s += "(";
    switch (data.status) {
      case STATUS_EMPTY:
        s += "?";
        break;
      case STATUS_SUCCESS:
        s += $inspect(data.value);
        break;
      case STATUS_FAILURE:
        s += "!" + $inspect(data.value);
        break;
    }
    s += ")";
    return s;
  }

  //util
  function _createChild(data) {
    var child = new data.promise.constructor();
    $get(child).parent = data;
    return child;
  }

  function _addListener(self, callback, errback, isFinally) {
    var 
    data     = $get(self),
    status   = data.status, 
    child    = self,
    isEmpty  = status === STATUS_EMPTY,
    handlers;

    if (isEmpty || 
      (callback && status === STATUS_SUCCESS) ||
      (errback && status === STATUS_FAILURE)
    ) {
      child = _createChild(data);

      handlers = data.handlers || (data.handlers = []);
      handlers.push(child, callback, errback, isFinally);
      data.isCaught = true;
      //try to notify
      if (!isEmpty) {
        _notifyAll(data);
      }
    }

    return child;
  }

  function _pipeFn(srcData, destData) {
    return function () {
      _setStatus(destData, srcData.status, srcData.value);
    };
  }

  function _resolveFn(data) {
    return function (result) {
      _setStatus(data, STATUS_SUCCESS, result);
    };
  }

  function _rejectFn(data) {
    return function (error) {
      _setStatus(data, STATUS_FAILURE, error);
    };
  }

  function _setStatus(data, status, value) {
    if (data.status === STATUS_EMPTY) {
      data.status = status;
      data.value = value;
      //drop other handlers
      switch (status) {
        case STATUS_SUCCESS:
          data.isCaught = true;
          break;
        case STATUS_FAILURE:
          break;
        default:
          _throwStatusError(status);
      }
      _clearTimeout(data);
      _notifyAll(data);
    }
  }

  function _setTimeout(data, fn, opt_milliseconds) {
    _clearTimeout(data);
    if (opt_milliseconds !== Infinity) {
      data.timeOut = opt_milliseconds;
      data.timerId = $setTimeout(function () {
        data.timerId = null;
        data.timeOut = 0;
        fn();
      }, opt_milliseconds);
    }
  }

  function _clearTimeout(data) {
    if (data.timerId) {
      $clearTimeout(data.timerId);
      data.timerId = null;
      data.timeOut = Infinity;
    }
  }

  function _notifyAll(data) {
    if (!data.isNotifying) {
      data.isNotifying = true;
      //lazy init task
      asap(_notifyAllNextTick, data);
    }
  }

  function _notifyAllNextTick() {
    
    var
    data      = this,
    handlers  = data.handlers, 
    handlerc  = handlers && handlers.length || 0, 
    status    = data.status,
    value     = data.value,
    isReject  = status === STATUS_FAILURE, 
    i, child, childData, callback, isFinally, pipeFn, result;

    data.isNotifying = false;

    if (handlerc > 0) {
      for (i = 0; i < handlerc; i += 4) {
        //fast shift
        child = $arrayPick(handlers, i);
        childData = $get(child);
        callback = isReject ? $arrayPick(handlers, i + 2) : $arrayPick(handlers, i + 1);
        isFinally = $arrayPick(handlers, i + 3);
        
        try {
          if (isFinally) {
            result = callback.call(null, value, isReject);
            if ($isThenable(result)) {
              _handleCycleError(data, result);
              pipeFn = _pipeFn(data, childData);
              result.then(pipeFn, pipeFn);
            } else {
              _setStatus(childData, status, value);
            }

          } else {
            if (callback) {
              result = callback.call(null, value, isReject);
              if ($isThenable(result)) {
                _handleCycleError(data, result);
                result.then(
                  _resolveFn(childData), 
                  _rejectFn(childData)
                );
              } else {
                _setStatus(childData, STATUS_SUCCESS, result);
              }
            } else {
              _setStatus(childData, status, value);
            }
          }
        } catch (e) {
          _setStatus(childData, STATUS_FAILURE, e);
        }
      }

      //clear handlers
      handlers.length = 0;
    }

    //throw uncaught error
    if (!data.isCaught && isReject) {
      data.isCaught = true;//thrown only once
      $handleError(value);
    }
  }

  function _throwStatusError(status) {
    $throwError(status + " is not a valid status");
  }

  function _handleCycleError(data, thenableChild, origin) {
    origin = origin || data;
    if (data.promise === thenableChild) {
      throw new CycleError($inspect(origin) + ' has infinite recursion');
    } else if (data.parent) {
      _handleCycleError(data.parent, thenableChild, origin);
    }
  }

  return {
    EMPTY: STATUS_EMPTY,
    SUCCESS: STATUS_SUCCESS,
    FAILURE: STATUS_FAILURE,

    //canceller: null,
    __new__: __new__,
    __destroy__: __destroy__,
    __status__: __status__,
    cancel: cancel,
    isEmpty: isEmpty,
    isDefined: isDefined,
    isResolved: isResolved,
    isRejected: isRejected,
    pipe: pipe,
    then: then,
    "catch": $catch, 
    "finally": $finally,
    timeout: timeout,
    toPromise: toPromise,
    toString: toString
  };
}, 
function (Promise) {
  
  function __apply__(fnOrValue) {
    return $cast(fnOrValue, Promise);
  }

  /**
   * Try to coerce to a Promise
   *
   * @param {*} o
   * @return {async.Promise}
   */
  function $cast(o) {
    var p;
    if (typeof o === "object" && o !== null) {
      if (o instanceof Promise) {
        p = o;
      } else if ("toPromise" in o) {
        p = o.toPromise();
      } else if ($isThenable(o)) {
        //conversion
        p = new Promise(
          function (resolve, reject) {
            o.then(resolve, reject);
          }, 
          o.cancel ? function () { o.cancel(); } : null
        );
      } else if ("promise" in o) {
        p = typeof o.promise === "function" ? o.promise() : o.promise;
        p = o !== p ? $cast(p, Promise) : undefined;
      } else {
        p = resolve(o);
      }
    } else {
      p = resolve(o);
    }
    return p;
  }

  /**
   * Return a resolved promise
   *
   * @param {*} val
   * @return {async.Promise}
   */
  function resolve(val) {
    var p = new Promise();
    return p.__status__(p.SUCCESS, val);
  }

  /**
   * Return a rejected promise
   *
   * @param {*} error
   * @return {async.Promise}
   */
  function reject(error) {
    var p = new Promise();
    return p.__status__(p.FAILURE, error);
  }

  return {
    __apply__: __apply__,
    "cast": $cast,
    resolve: resolve,
    reject: reject
  };
});



/**
 * Deferred class
 * 
 * A Deferred is a Promise builder object.
 *
 * Usage:
 *
 *  function asyncMethod() {
 *    var deferred = new Deferred();
 *    doSomethingAsynchronous(function (error, result) {
 *      if (error) deferred.setFailure(error);
 *      else deferred.setSuccess(result);
 *    });
 *    return deferred.promise;
 *  }
 */
type("async.Deferred", [], function (Deferred) {

  var
  Promise          = $require("async.Promise"),
  PromisePrototype = Promise.prototype,
  STATUS_EMPTY     = PromisePrototype.EMPTY,
  STATUS_SUCCESS   = PromisePrototype.SUCCESS,
  STATUS_FAILURE   = PromisePrototype.FAILURE;

  /**
   * @constructor
   * @param {Function=} opt_cancel
   */
  function __new__(opt_cancel) {
    $super(Deferred, '__new__', this, arguments);
    this.promise = new Promise(undefined, opt_cancel);
  }

  function __status__(status, val) {
    var 
    self = this,
    p    = self.promise;
    if (arguments.length) {
      p.__status__(status, val);
      return self;
    } else {
      return p.__status__();
    }
  }

  /**
   * @param {Object=} thisp
   * @param {Object=} error
   * @param {Object=} result
   * @return undefined
   */
  function call(thisp, error, result) {
    if ($isEmpty(error)) {
      this.resolve(result);
    } else {
      this.reject(error);
    }
  }

  /**
   * @param {Object=} thisp
   * @param {Array=} args
   * @return undefined
   */
  function apply(thisp, args) {
    args = args || [];
    return this.call(thisp, args[0], args[1]);
  }

  /**
   * @return {boolean}
   */
  function isEmpty() {
    return _isEmpty(this);
  }

  /**
   * @return {boolean}
   */
  function isDefined() {
    return !_isEmpty(this);
  }

  /**
   * Emit failure signal
   *
   * @param {*} error
   * @return this
   */
  function reject(error) {
    _assertEmpty(this);
    this.__status__(STATUS_FAILURE, error);
    return this;
  }

  /**
   * Emit success signal
   *
   * @param {*} value
   * @return this
   */
  function resolve(value) {
    _assertEmpty(this);
    this.__status__(STATUS_SUCCESS, value);
    return this;
  }
  
  /**
   * Try to emit failure signal
   *
   * @param {*} value
   * @return this
   */
  function tryReject(error) {
    this.__status__(STATUS_FAILURE, error);
    return this;
  }
  
  /**
   * Try to emit success signal
   *
   * @param {*} value
   * @return this
   */
  function tryResolve(value) {
    this.__status__(STATUS_SUCCESS, value);
    return this;
  }

  /**
   * @return {async.Promise}
   */
  function toPromise() {
    return this.promise;
  }

  /**
   * @return {Function}
   */
  function toFunction() {
    var 
    self = this,
    fn   = this.__fn__;
    if (!fn) {
      fn = this.__fn__ = function (error, result) {
        return self.call(this, error, result);
      };
    }
    return fn;
  }

  function _isEmpty(self) {
    return self.__status__() === STATUS_EMPTY;
  }

  function _assertEmpty(self) {
    if (!_isEmpty(self)) {
      $throwError($inspect(self) + " is already defined");
    }
  }
  

  return {
    promise: null,
    __fn__: null,

    __new__: __new__,
    __status__: __status__,
    apply: apply,
    call: call,
    isEmpty: isEmpty,
    isDefined: isDefined,
    reject: reject,
    resolve: resolve,
    tryReject: tryReject,
    tryResolve: tryResolve,
    toPromise: toPromise,
    toFunction: toFunction
  };
});

type.mixin(async, (function () {
  var 
  arraySlice = [].slice,
  Deferred   = async.Deferred,
  Promise    = async.Promise;

  /**
   *
   *
   * @param {function} fn
   * @return {function}
   */
  function __apply__(fn) {
    $assertCallable(fn);
    var 
    arity   = fn.length,
    asyncFn = fn;

    if (!asyncFn.isAsync) {
      asyncFn = function () {
        var
        argumentc = arguments.length,
        callback  = arguments[arity],
        argc      = arity < argumentc ? arity : argumentc,
        args      = argc > 0 ? arraySlice.call(arguments, 0, argc) : null,
        promise   = apply(fn, this, args);

        if (callback) {
          promise.then(
            function (result) { return callback(null, result); }, 
            function (error) { return callback(error, null); }
          );
        }
        return promise;
      };
      asyncFn.isAsync = true;
    }
    return asyncFn;
  }

  /**
   * Call fn.apply(opt_this, opt_args) and coerce it as a Promise
   *
   * @param {function} fn
   * @param {*} opt_this
   * @param {Array=} opt_args
   * @return {async.Promise}
   */
  function apply(fn, opt_this, opt_args) {
    var p;
    try {
      $assertCallable(fn);
      p = opt_args && opt_args.length ? fn.apply(opt_this, opt_args) : fn.call(opt_this);
      p = $cast(p, Promise);
    } catch (e) {
      p = reject(e);
    }
    return p;
  }

  /**
   * Call fn.call(opt_this, ...) and coerce it as a Promise
   *
   * @param {function} fn
   * @param {*} opt_this
   * @return {async.Promise}
   */
  function call(fn, opt_this/*, ...*/) {
    return apply(fn, opt_this, arguments.length >= 3 ? arraySlice.call(arguments, 2) : null);
  }

  /**
   * Create a failed promise
   *
   * @param {*} value
   * @return {async.Promise}
   */
  function resolve(value) {
    return Promise.resolve(value);
  }

  /**
   * Create a failed promise
   *
   * @param {*} error
   * @return {Promise}
   */
  function reject(error) {
    return Promise.reject(error);
  }

  /**
   * Create a new unresolved future (a.k.a Deferred)
   *
   * @return {async.Deferred} A deferred future
   */
  function defer(opt_cancel) {
    return new Deferred(opt_cancel);
  }

  /**
   * Delays for a given amount of time and then fulfills the returned future.
   *
   * @param {number} milliseconds The number of milliseconds to delay
   * @return {async.Promise} A future that will be fulfilled after the delay
   */
  function delay(milliseconds) {
    milliseconds = milliseconds >>> 0;

    return milliseconds === 0 ? resolve(null) : new Promise(function (setSuccess) {
      var self = this;
      self.timerId = $setTimeout(function () {
        self.timerId = null;
        setSuccess(null);
      }, milliseconds);
    }, _delayCancel);
  }
  function _delayCancel() {
    if (this.timerId) {
      $clearTimeout(this.timerId);
    }
  }

  /**
   * Try to run fn.apply(opt_this, opt_args)
   * If failure occured then retry the process `ntimes`
   *
   * @param {number} ntimes
   * @param {function} fn
   * @param {*} opt_this
   * @param {Array=} opt_args
   * @return {async.Promise}
   */
  function retry(ntimes, fn, opt_this, opt_args) {
    ntimes = ntimes >>> 0;
    var promise = apply(fn, opt_this, opt_args);

    return ntimes === 0 ? promise : 
      promise.then(undefined, function () {
        return retry(ntimes - 1, fn, opt_this, opt_args);
      });
  }

  return {
    __apply__: __apply__,
    apply: apply,
    call: call,
    defer: defer,
    delay: delay,
    resolve: resolve,
    reject: reject,
    retry: retry
  };
}()));


type.mixin(async, (function () {

  var 
  //toAsync = async,
  defer   = async.defer,
  Promise = async.Promise,
  resolve = Promise.resolve;

  
  /**
   * Apply onEachResolve and onEachError on every future result/error.
   *
   * @param {Array} arrayOfPromises
   * @param {Function} onResolve(value, index, isError) -> result
   * @param {Function} onError(error, index, isError) -> result
   * @return {async.Promise}
   */
  function forEach(arrayOfPromises, onEachResolve, onEachReject) {
    return forEachPar(arrayOfPromises, onEachResolve, onEachReject);
  }

  function forEachSeq(arrayOfPromises, onEachResolve, onEachReject) {
    return _forEach(_forEachSeq, arrayOfPromises, onEachResolve, onEachReject);
  }

  function forEachPar(arrayOfPromises, onEachResolve, onEachReject) {
    return _forEach(_forEachPar, arrayOfPromises, onEachResolve, onEachReject);
  }

  /**
   * 
   *
   * @param {Array} arrayOfPromises
   * @param {Function} predicate(value, index) -> boolean
   * @return {async.Promise}
   */
  function filter(arrayOfPromises, predicate) {
    return filterPar(arrayOfPromises, predicate);
  }

  function filterSeq(arrayOfPromises, predicate) {
    return _filter(_forEachSeq, arrayOfPromises, predicate);
  }

  function filterPar(arrayOfPromises, predicate) {
    return _filter(_forEachPar, arrayOfPromises, predicate);
  }

  /**
   * 
   *
   * @param {Array} arrayOfPromises
   * @param {Function} mapFn(value, index) -> result
   * @return {async.Promise}
   */
  function map(arrayOfPromises, mapFn) {
    return mapPar(arrayOfPromises, mapFn);
  }

  function mapSeq(arrayOfPromises, mapFn) {
    return _map(_forEachSeq, arrayOfPromises, mapFn);
  }

  function mapPar(arrayOfPromises, mapFn) {
    return _map(_forEachPar, arrayOfPromises, mapFn);
  }

  /**
   * 
   *
   * @param {Array} arrayOfPromises
   * @param {Function} reduceFn(accumulator, value, index) -> newaccumulator
   * @param {*=} initial
   * @return {async.Promise}
   */
  function reduce(arrayOfPromises, reduceFn, initial) {
    return reduceLeft(arrayOfPromises, reduceFn, initial);
  }

  function reduceLeft(arrayOfPromises, reduceFn, initial) {
    return _reduce(_forEachSeq, arrayOfPromises, reduceFn, initial, false);
  }

  function reduceRight(arrayOfPromises, reduceFn, initial) {
    return _reduce(_forEachSeq, arrayOfPromises, reduceFn, initial, true);
  }

  /**
   * Return a Promise(true) if for each promises values all `predicate(promiseValue)` is truthy
   * If failure, first failure is returned.
   *
   * @param {Array} arrayOfPromises
   * @param {Function} predicate(value, index) -> bool
   * @return {async.Promise}
   */
  function every(arrayOfPromises, predicate) {
    return everyPar(arrayOfPromises, predicate);
  }

  function everySeq(arrayOfPromises, predicate) {
    return _ifAny(_forEachSeq, arrayOfPromises, predicate, false);
  }

  function everyPar(arrayOfPromises, predicate) {
    return _ifAny(_forEachPar, arrayOfPromises, predicate, false);
  }

  /**
   * Return a Promise(true) if for each promises values at least one `predicate(promiseValue)` is falsy
   * If failure, first failure is returned.
   *
   * @param {Array} arrayOfPromises
   * @param {Function} predicate(value, index) -> bool
   * @return {async.Promise}
   */
  function some(arrayOfPromises, predicate) {
    return somePar(arrayOfPromises, predicate);
  }

  function someSeq(arrayOfPromises, predicate) {
    return _ifAny(_forEachSeq, arrayOfPromises, predicate, true);
  }

  function somePar(arrayOfPromises, predicate) {
    return _ifAny(_forEachPar, arrayOfPromises, predicate, true);
  }

  /**
   * Waits for all arguments to be resolved
   *
   * @param {Object|async.Promise} promiseOrValue
   * @return {async.Promise}
   */
  function when(promiseOrValue/*...*/) {
    var p, val;
    if (arguments.length <= 1) {
      p = _asPromise(promiseOrValue);
    } else {
      p = _forEachPar(arguments, function (result, index) {
        if (index === 0) {
          val = result;
        }
        return val;
      });
    }
    return p;
  }

  //Util
  function _forEach(forEachFn, arrayOfPromises, onEachResolve, onEachReject) {
    return forEachFn(
      _asArray(arrayOfPromises),
      $isEmpty(onEachResolve) || $assertCallable(onEachResolve),
      $isEmpty(onEachReject) ? _throw : $assertCallable(onEachReject)
    );
  }

  function _forEachSeq(arrayOfPromises, onEachResolve, onEachReject) {
    var
    result, deferred,
    length = arrayOfPromises.length,
    done   = false,
    broken = false,
    index  = 0,
    current, lastResult;

    function $break() {
      if (!done) {
        broken = done = true;
      }
    }

    function cancel() {
      $break();
      _cancel(current);
    }

    function call(fn, val) {
      if (!done) {
        if (fn) {
          try {
            lastResult = fn.call(null, val, index, $break);
          } catch (e) {
            done = true;
            deferred.tryReject(e);
          }
        }

        done = done || (index === (length - 1));
        if (done) {
          deferred.tryResolve(lastResult);
        } else {
          ++index;
          next();
        }

      }
    }

    function onresolve(val) {
      call(onEachResolve, val);
    }

    function onreject(error) {
      call(onEachReject, error);
    }

    function next() {
      var promiseOrValue = arrayOfPromises[index];
      if ($isThenable(promiseOrValue)) {
        current = _asPromise(promiseOrValue).then(onresolve, onreject);
      } else {
        current = null;
        call(onEachResolve, promiseOrValue, index);
      }
    }

    if (length === 0) {
      result = resolve(undefined);
    } else {
      deferred = defer(cancel);
      result = deferred.promise;

      //start iteration
      next();
    }

    return result;
  }

  function _forEachPar(arrayOfPromises, onEachResolve, onEachReject) {
    var
    result, deferred,
    length = arrayOfPromises.length,
    todo   = length,
    done   = false,
    broken = false,
    cancellable, index, lastResult;

    function $break() {
      if (!done) {
        broken = done = true;
      }
    }

    function cancel() {
      $break();
      _cancel(cancellable);
    }

    function call(fn, val, index) {
      if (!done) {
        
        if (fn) {
          try {
            lastResult = fn.call(null, val, index, $break);
          } catch (e) {
            done = true;
            deferred.tryReject(e);
          }
        }

        --todo;
        done = done || (todo === 0);
        if (done) {
          deferred.tryResolve(lastResult);
          _cancel(cancellable);//cancel the others
        }
      }
    }

    function next(index) {
      var promiseOrValue = arrayOfPromises[index];
      if ($isThenable(promiseOrValue)) {
        promiseOrValue = _asPromise(promiseOrValue).then(
          function (val) {
            cancellable[index] = null;
            call(onEachResolve, val, index);
          },
          function (error) {
            cancellable[index] = null;
            call(onEachReject, error, index);
          }
        );
        cancellable[index] = promiseOrValue;

      } else {
        call(onEachResolve, promiseOrValue, index);
      }
    }

    if (length === 0) {
      result = resolve(undefined);
    } else {
      deferred = defer(cancel);
      result = deferred.promise;
      cancellable = new Array(length);
      
      for (index = 0; index < length; ++index) {
        next(index);
      }
    }

    return result;
  }


  function _ifAny(forEachFn, arrayOfPromises, predicate, expected) {
    predicate = $isEmpty(predicate) ? $identity : $assertCallable(predicate);
    arrayOfPromises = _asArray(arrayOfPromises);

    var result, val = !expected;
    if (arrayOfPromises.length === 0) {
      result = resolve(val);
    } else {
      result = forEachFn(arrayOfPromises, function (value, index, $break) {
        if (ToBoolean(predicate.call(null, value, index)) === expected) {
          val = expected;
          $break();
        }
        return val;
      });
    }
    return result;
  }

  function _filter(forEachFn, arrayOfPromises, predicate) {
    predicate = $isEmpty(predicate) ? $identity : $assertCallable(predicate);
    arrayOfPromises = _asArray(arrayOfPromises);

    var result, val = [];
    if (arrayOfPromises.length === 0) {
      result = resolve(val);
    } else {
      result = forEachFn(arrayOfPromises, function (value, index) {
        if (predicate.call(null, value, index)) {
          val.push(value);
        }
        return val;
      }, _throw);
    }
    return result;
  }

  function _map(forEachFn, arrayOfPromises, mapFn) {
    mapFn = $isEmpty(mapFn) ? $identity : $assertCallable(mapFn);
    arrayOfPromises = _asArray(arrayOfPromises);

    var result, l = arrayOfPromises.length, val = new Array(l);
    if (l === 0) {
      result = resolve(val);
    } else {
      result = forEachFn(arrayOfPromises, function (value, index) {
        val[index] = mapFn.call(null, value, index);
        return val;
      }, _throw);
    }
    return result;
  }

  function _reduce(forEachFn, arrayOfPromises, reduceFn, initial, reverse) {
    $assertCallable(reduceFn);
    arrayOfPromises = _asArray(arrayOfPromises);

    if (reverse) {
      arrayOfPromises = $arrayReverse(arrayOfPromises);
    }
    if (initial !== undefined) {
      arrayOfPromises = [ initial ].concat(arrayOfPromises);
    }

    var result, val, first = true;
    if (arrayOfPromises.length === 0) {
      result = resolve(val);
    } else {
      result = forEachFn(arrayOfPromises, function (currentVal, index) {
        if (first) {
          val = currentVal;
          first = false;
        } else {
          val = reduceFn.call(null, val, currentVal, index);
        }
        return val;
      });
    }
    return result;
  }

  function _throw(error) {
    throw error;
  }

  function _asArray(o) {
    return $arrayCopy($cast(o, Array) || $throwError($inspect(o) + ' is not an array'));
  }

  function _asPromise(o) {
    return $cast(o, Promise);
  }

  function _cancel(promises) {
    if (promises) {
      if (promises.cancel) {
        promises.cancel();
      } else if (promises.length) {
        var i, l = promises.length;
        for (i = 0; i < l; ++i) {
          _cancel(promises[i]);
        }
      } else {
        for (var key in promises) {
          _cancel(promises[key]);
        }
      }
    }
  }


  return {
    every: every,
    everyPar: everyPar,
    everySeq: everySeq,
    filter: filter,
    filterSeq: filterSeq,
    filterPar: filterPar,
    forEach: forEach,
    forEachPar: forEachPar,
    forEachSeq: forEachSeq,
    map: map,
    mapPar: mapPar,
    mapSeq: mapSeq,
    reduce: reduce,
    reduceLeft: reduceLeft,
    reduceRight: reduceRight,
    some: some,
    somePar: somePar,
    someSeq: someSeq,
    when: when
  };
}()));



  
    return async;
  } //asyncProvider


  //COMMONJS
  if (typeof module !== "undefined") {
    module.exports = asyncProvider(require("type"));

  //AMD
  } else if (global.define) {
    global.define("async", [ "type" ], asyncProvider);

  //GLOBAL
  } else {
    if (!global.type) {
      throw new Error("type() is not defined");
    }
    asyncProvider(global.type);
  }

}(this));
