define(["module"], function (module) {
  "use strict";

  /**
   * timer module
   */
  var timer;
  (function (timer) {
    var __global = typeof window !== "undefined" ? window : null;
    var __now = Date.now;
    var __setTimeout = __global.setTimeout;
    var __clearTimeout = __global.clearTimeout;
    var __setInterval = __global.setInterval;
    var __clearInterval = __global.clearInterval;
    var __setImmediate = __global.setImmediate ||
      __global.msSetImmediate ||
      __global.mozSetImmediate ||
      __global.webkitSetImmediate ||
      function (f, var_args) {
        var delayedFn = f;
        if (arguments.length >= 2) {
          var args = [];
          for (var i = 3, l = arguments.length; i < l; i++) {
            args[i] = arguments[i];
          }
          delayedFn = function () {
            f.apply(null, args);
          };
        }
        return __setTimeout(delayedFn, 0);
      };
    var __clearImmediate = __global.clearImmediate ||
      __global.msClearImmediate ||
      __global.mozClearImmediate ||
      __global.webkitClearImmediate ||
      function (id) {
        __clearTimeout(id);
      };
    var __deltaTimers = {};


    /**
     * DeltaTimer class
     */
    var DeltaTimer = (function (_super) {

      function DeltaTimer(f, milliseconds) {
        _super.call(this);

        var lastTime = __now();
        var timeout = __setTimeout(loop, 0);

        function loop() {
          var thisTime = __now();
          var deltaTime = thisTime - lastTime;
          var delay = milliseconds - deltaTime;
          if (delay < 0) {
            delay = 0;
          }
          timeout = __setTimeout(loop, delay);
          lastTime = thisTime + delay;
          f(thisTime);
        }

        this.timerId = timeout;

        this.cancel = function cancel() {
          clearTimeout(timeout);
          return lastTime;
        };
      }

      return DeltaTimer;
    }(Object));
    

    function setDelta(f, delay) {
      var t = new DeltaTimer(f, delay);
      var id = t.timerId;
      __deltaTimers[id] = t;
      return id;
    }
    timer.setDelta = setDelta;

    function clearDelta(id) {
      if (__deltaTimers[id]) {
        __deltaTimers[id].cancel();
        __deltaTimers[id] = null;
      }
    }
    timer.clearDelta = clearDelta;

    /**
     *
     * @param {function} f
     * @param {number} delay
     * @param {...any} var_args
     * @returns {number}
     */
    function setTimeout(f, delay, var_args) {
      var delayedFn = f;
      var argc = arguments.length;
      if (argc >= 3) {
        var args = [];
        for (var i = 3; i < argc; i++) {
          args[i] = arguments[i];
        }
        delayedFn = function () {
          f.apply(null, args);
        };
      }
      return __setTimeout(delayedFn, delay);
    }
    timer.setTimeout = setTimeout;

    /**
     *
     * @param {number} id
     * @returns {void}
     */
    function clearTimeout(id) {
      __clearTimeout(id);
    }
    timer.clearTimeout = clearTimeout;

    /**
     *
     * @param {function} f
     * @param {number} delay
     * @returns {number}
     */
    function setInterval(f, delay) {
      return __setInterval(f, delay);
    }
    timer.setInterval = setInterval;

    /**
     *
     * @param {number} id
     * @returns {void}
     */
    function clearInterval(id) {
      __clearInterval(id);
    }
    timer.clearInterval = clearInterval;

    /**
     *
     * @param {function()} f
     * @returns {number}
     */
    function setImmediate(f) {
      return __setImmediate(f);
    }
    timer.setImmediate = setImmediate;

    /**
     * Cancel Immediate
     *
     * @param {number} id
     * @returns {void}
     */
    function clearImmediate(id) {
      __clearImmediate(id);
    }
    timer.clearImmediate = clearImmediate;

  }(timer || (timer = {})));
  return timer;
});