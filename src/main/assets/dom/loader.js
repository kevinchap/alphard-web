define(["module"], function (module) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};
  moduleConfig.debug = true;
  //util
  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  function symbol(name) {
    /*jslint newcap:true*/
    return typeof Symbol !== "undefined" ? Symbol(name) : "@@" + name;
  }

  /**
   * loader module
   */
  var loader;
  (function (loader) {
    /**
     * Signal (internal) class
     */
    var Signal = (function (_super) {

      function Signal() {
        _super.call(this);
        this.$$fns = [];
      }

      Signal.prototype.add = function add(f) {
        var fns = this.$$fns;
        if (fns.indexOf(f) < 0) {
          fns.push(f);
        }
      };

      Signal.prototype.remove = function remove(f) {
        var fns = this.$$fns;
        var i = fns.indexOf(f);
        if (i >= 0) {
          fns.splice(i, 1);
        }
      };

      Signal.prototype.emit = function (v) {
        var fns = this.$$fns;
        for (var i = 0, l = fns.length; i < l; i++) {
          fns[i](v);
        }
      };

      return Signal;
    }(Object));

    /**
     * ReadyState (internal) enum
     */
    var ReadyState;
    (function (ReadyState) {
      ReadyState[ReadyState.INIT = 1] = "INIT";
      ReadyState[ReadyState.LOADING = 2] = "LOADING";
      ReadyState[ReadyState.LOADED = 3] = "LOADED";
      ReadyState[ReadyState.ERROR = 4] = "ERROR";
    }(ReadyState || (ReadyState = {})));
    loader.ReadyState = ReadyState;

    /**
     * Common trait for loaders
     */
    var TLoader = (function () {
      var LOAD = "load";
      var ERROR = "error";
      var $$sigLoad = symbol("load");
      var $$sigError = symbol("error");

      function TLoader() {
        this.readyState = TLoader.prototype.readyState;
        this.lastError = TLoader.prototype.lastError;
        //this.load = TLoader.prototype.load;
        this.initLoader = TLoader.prototype.initLoader;
        this.getURL = TLoader.prototype.getURL;
        this.addListener = TLoader.prototype.addListener;
        this.removeListener = TLoader.prototype.removeListener;
        this.inspect = TLoader.prototype.inspect;
        this.toString = TLoader.prototype.toString;
        this.$$setReadyState = TLoader.prototype.$$setReadyState;

        if (!this.$$readyStateTransition) {
          //throw new Error('$$readyStateTransition is required');
        }
      }
      TLoader.$$signalLoad = $$sigLoad;
      TLoader.$$signalError = $$sigError;
      TLoader.prototype.readyState = ReadyState.INIT;
      TLoader.prototype.lastError = null;
      TLoader.prototype.initLoader = function initLoader(executor) {
        //Init properties
        this.readyState = ReadyState.INIT;
        this.lastError = null;
        this[$$sigLoad] = new Signal();
        this[$$sigError] = new Signal();

        //Call builder
        executor.call(this, __createResolver(this), __createRejecter(this));
      };

      TLoader.prototype.addListener = function addListener(eventName, f) {
        var isLoad = eventName === LOAD;
        var isError = eventName === ERROR;
        var sig = isLoad ? this[$$sigLoad] :
          isError ? this[$$sigError] :
            null;

        switch (this.readyState) {
          case ReadyState.INIT:
          case ReadyState.LOADING:
            sig.add(f);
            break;
          case ReadyState.LOADED:
            if (isLoad) {
              f();
            }
            break;
          case ReadyState.ERROR:
            if (isError) {
              f(this.lastError);
            }
            break;
          default:
            //Do nothing
            break;
        }
      };

      TLoader.prototype.removeListener = function removeListener(eventName, f) {
        var sig = eventName === LOAD ? this[$$sigLoad] :
          eventName === ERROR ? this[$$sigError] :
            null;
        if (sig) {
          sig.remove(f);
        }
      };

      TLoader.prototype.getURL = function getURL() {
        return null;
      };

      TLoader.prototype.inspect = function inspect() {
        return this.constructor.name + ' { ' + this.getURL() + ' }';
      };

      TLoader.prototype.toString = function toString() {
        return this.inspect();
      };

      TLoader.prototype.$$setReadyState = function (newState) {
        var self = this;
        var oldState = self.readyState;
        var returnValue = false;
        if (oldState !== newState) {
          self.readyState = newState;
          if (self.$$readyStateTransition) {
            returnValue = self.$$readyStateTransition(newState, oldState);
            if (returnValue === undefined) {
              returnValue = true;
            }
          } else {
            returnValue = true;
          }
        }
        return !!returnValue;
      };

      function __createResolver(self) {
        return function resolve(value) {
          if (__setReadyState(self, ReadyState.LOADED)) {
            debug("GET", self.getURL() || String(self), "OK");
            self[$$sigLoad].emit(value);
            self[$$sigLoad] = null;
            self[$$sigError] = null;
          }
        };
      }

      function __createRejecter(self) {
        return function reject(error) {
          if (__setReadyState(self, ReadyState.ERROR)) {
            debug("GET", self.getURL() || String(self), "ERROR", error);
            self.lastError = error;
            self[$$sigError].emit(event);
            self[$$sigLoad] = null;
            self[$$sigError] = null;
          }
        };
      }

      function __setReadyState(self, readyState) {
        return self.$$setReadyState(readyState);
      }

      return TLoader;
    }());

    var TMediaLoader = (function () {
      var $$element = symbol("element");

      function TMediaLoader() {
        TLoader.call(this);
        this.url = TMediaLoader.prototype.url;
        this.initMediaLoader = TMediaLoader.prototype.initMediaLoader;
        this.load = TMediaLoader.prototype.load;
        this.cancel = TMediaLoader.prototype.cancel;
        this.getURL = TMediaLoader.prototype.getURL;
        this.getWidth = TMediaLoader.prototype.getWidth;
        this.getHeight = TMediaLoader.prototype.getHeight;
      }
      TMediaLoader.prototype.url = "";
      TMediaLoader.prototype.initMediaLoader = function initMediaLoader(url, element) {
        this.url = url;
        this[$$element] = element;
        this.initLoader(function (resolve, reject) {
          var loader = this;
          var element = this[$$element];
          element.onload = resolve;
          element.onreadystatechange = function (event) {
            if (element.readyState === "complete") {
              resolve(event);
            }
          };
          element.oncanplaythrough = function (event) {
            if (element.readyState === 4) {
              resolve(event);
            }
          };
          element.onerror = function (event) {
            if (loader.readyState === ReadyState.LOADING) {
              reject(event);
            } else {
              //ignore cancelation errors
            }
          };
        });
      };
      TMediaLoader.prototype.load = function load() {
        if (this.readyState === ReadyState.INIT) {
          //debug("GET", this.getURL() || String(this), "...");
          __setReadyState(this, ReadyState.LOADING);
          this[$$element].src = this.url;
        }
      };
      TMediaLoader.prototype.cancel = function cancel() {
        if (this.readyState === ReadyState.LOADING) {
          debug("GET", this.getURL() || String(this), "Canceled");
          var element = this[$$element];
          element.src = "";
          __setReadyState(this, ReadyState.INIT);
        }
      };
      TMediaLoader.prototype.getURL = function () {
        return this.url;
      };
      TMediaLoader.prototype.getWidth = function () {
        var element = this[$$element];
        return (
          ("naturalWidth" in element) ? element.naturalWidth :
          ("videoWidth" in element) ? element.videoWidth :
          0
        );
      };
      TMediaLoader.prototype.getHeight = function () {
        var element = this[$$element];
        return (
          ("naturalHeight" in element) ? element.naturalHeight :
          ("videoHeight" in element) ? element.videoHeight :
          0
        );
      };

      function __setReadyState(self, readyState) {
        return self.$$setReadyState(readyState);
      }
      return TMediaLoader;
    }());

    /**
     * ImageLoader class
     */
    var ImageLoader = (function (_super) {

      function ImageLoader(url) {
        _super.call(this);
        this.initMediaLoader(url, new Image());
      }
      TMediaLoader.call(ImageLoader.prototype);//mixin

      return ImageLoader;
    }(Object));
    loader.ImageLoader = ImageLoader;

    /**
     * VideoLoader class
     */
    var VideoLoader = (function (_super) {

      function VideoLoader(url) {
        _super.call(this);
        this.initMediaLoader(url, new Video());
      }
      TMediaLoader.call(VideoLoader.prototype);//mixin

      return VideoLoader;
    }(Object));
    loader.VideoLoader = VideoLoader;
    
  }(loader || (loader = {})));


  return loader;
});