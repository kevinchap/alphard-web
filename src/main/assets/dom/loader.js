define(["module"], function (module) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};

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

  function assertType(o, type) {
    if (typeof o !== type) {
      throw new TypeError(o + " is not a valid " + type);
    }
  }

  function requireProperty(o, name) {
    if (!(name in o)) {
      throw new TypeError(name + " is a required property");
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
      var READYSTATECHANGE = "readystatechange";
      var $$signal = symbol("signal");

      function TLoader() {
        this.readyState = TLoader.prototype.readyState;
        //this.load = TLoader.prototype.load;
        this.initLoader = TLoader.prototype.initLoader;
        this.getURL = TLoader.prototype.getURL;
        this.addListener = TLoader.prototype.addListener;
        this.removeListener = TLoader.prototype.removeListener;
        this.inspect = TLoader.prototype.inspect;
        this.toString = TLoader.prototype.toString;
        this.$$setReadyState = TLoader.prototype.$$setReadyState;
      }
      TLoader.prototype.readyState = ReadyState.INIT;
      TLoader.prototype.initLoader = function initLoader(executor) {
        assertType(executor, "function");

        //Init properties
        this.readyState = ReadyState.INIT;
        this[$$signal] = {
          readystatechange: new Signal(),
          load: new Signal(),
          error: new Signal()
        };

        //Call builder
        executor.call(this, __createResolver(this), __createRejecter(this));
      };

      TLoader.prototype.addListener = function addListener(eventName, f) {
        assertType(f, "function");
        var sig = this[$$signal][eventName] || null;

        switch (this.readyState) {
          case ReadyState.INIT:
          case ReadyState.LOADING:
            sig.add(f);
            break;
          case ReadyState.LOADED:
            if (eventName === LOAD) {
              f();
            }
            break;
          case ReadyState.ERROR:
            if (eventName === ERROR) {
              f();
            }
            break;
          default:
            //Do nothing
            break;
        }
      };

      TLoader.prototype.removeListener = function removeListener(eventName, f) {
        assertType(f, "function");
        var sig = this[$$signal][eventName] || null;
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

          if (returnValue) {
            __emit(self, READYSTATECHANGE, newState);
          }
        }
        return !!returnValue;
      };

      function __createResolver(self) {
        return function resolve(value) {
          if (__setReadyState(self, ReadyState.LOADED)) {
            debug("GET", self.getURL() || String(self), "OK");
            __emit(self, LOAD, value);
          }
        };
      }

      function __createRejecter(self) {
        return function reject(error) {
          if (__setReadyState(self, ReadyState.ERROR)) {
            debug("GET", self.getURL() || String(self), "ERROR", error);
            __emit(self, ERROR, error);
          }
        };
      }

      function __setReadyState(self, readyState) {
        return self.$$setReadyState(readyState);
      }

      function __emit(self, eventName, value) {
        self[$$signal][eventName].emit(value);
        if (self["on" + eventName]) {
          self["on" + eventName](value);
        }
        if (eventName === LOAD || eventName === ERROR) {//once
          self[$$signal] = {};
        }
      }

      return TLoader;
    }());

    var TMediaLoader = (function () {

      function TMediaLoader() {
        TLoader.call(this);
        this.url = TMediaLoader.prototype.url;
        this.initMediaLoader = TMediaLoader.prototype.initMediaLoader;
        this.load = TMediaLoader.prototype.load;
        this.cancel = TMediaLoader.prototype.cancel;
        this.getURL = TMediaLoader.prototype.getURL;
        this.getWidth = TMediaLoader.prototype.getWidth;
        this.getHeight = TMediaLoader.prototype.getHeight;
        requireProperty(this, "$$createElement");
        requireProperty(this, "$$load");
        requireProperty(this, "$$cancel");
        requireProperty(this, "$$getWidth");
        requireProperty(this, "$$getHeight");
      }
      TMediaLoader.prototype.url = "";
      TMediaLoader.prototype.initMediaLoader = function initMediaLoader(url, opt_settings) {
        this.url = url;
        this.initLoader(function (resolve, reject) {
          this.$$createElement(resolve, reject, opt_settings || {});
        });
      };
      TMediaLoader.prototype.load = function load() {
        if (this.readyState === ReadyState.INIT) {
          //debug("GET", this.getURL() || String(this), "...");
          __setReadyState(this, ReadyState.LOADING);
          this.$$load();
        }
      };
      TMediaLoader.prototype.cancel = function cancel() {
        if (this.readyState === ReadyState.LOADING) {
          debug("GET", this.getURL() || String(this), "Canceled");
          this.$$cancel();
          __setReadyState(this, ReadyState.INIT);
        }
      };
      TMediaLoader.prototype.getURL = function () {
        return this.url;
      };
      TMediaLoader.prototype.getWidth = function () {
        return this.$$getWidth();
      };
      TMediaLoader.prototype.getHeight = function () {
        return this.$$getHeight();
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
      var $$imgElement = symbol("imgElement");

      function ImageLoader(url, opt_settings) {
        _super.call(this);
        this.initMediaLoader(url, opt_settings);
      }
      ImageLoader.prototype.$$createElement = function (resolve, reject, settings) {
        var $this = this;
        var element = this[$$imgElement] = document.createElement("img");
        if (settings.crossOrigin) {
          element.crossOrigin = settings.crossOrigin;
        }

        element.onload = resolve;
        element.onreadystatechange = function (event) {
          if (element.readyState === "complete") {
            resolve(event);
          }
        };
        element.onerror = function (event) {
          if ($this.readyState === ReadyState.LOADING) {
            reject(event);
          } else {
            //ignore cancelation errors
          }
        };
        return element;
      };
      ImageLoader.prototype.$$load = function () {
        this[$$imgElement].src = this.getURL();
      };
      ImageLoader.prototype.$$cancel = function () {
        this[$$imgElement].src = "";
      };
      ImageLoader.prototype.$$getWidth = function () {
        return this[$$imgElement].naturalWidth;
      };
      ImageLoader.prototype.$$getHeight = function () {
        return this[$$imgElement].naturalHeight;
      };
      TMediaLoader.call(ImageLoader.prototype);//mixin

      return ImageLoader;
    }(Object));
    loader.ImageLoader = ImageLoader;

    /**
     * VideoLoader class
     */
    var VideoLoader = (function (_super) {
      var $$videoElement = symbol("videoElement");

      function VideoLoader(url, opt_settings) {
        _super.call(this);
        this.initMediaLoader(url, opt_settings);
      }
      VideoLoader.prototype.$$createElement = function (resolve, reject, settings) {
        var $this = this;
        var element = this[$$videoElement] = document.createElement("video");
        if (settings.crossOrigin) {
          element.crossOrigin = settings.crossOrigin;
        }

        element.onload = resolve;
        element.oncanplaythrough = function (event) {
          if (element.readyState === 4) {
            resolve(event);
          }
        };
        element.onerror = function (event) {
          if ($this.readyState === ReadyState.LOADING) {
            reject(event);
          } else {
            //ignore cancelation errors
          }
        };
        return element;
      };

      VideoLoader.prototype.$$load = function () {
        this[$$videoElement].src = this.getURL();
        this[$$videoElement].load();
      };
      VideoLoader.prototype.$$cancel = function () {
        this[$$videoElement].src = "";
      };
      VideoLoader.prototype.$$getWidth = function () {
        return this[$$videoElement].videoWidth;
      };
      VideoLoader.prototype.$$getHeight = function () {
        return this[$$videoElement].videoHeight;
      };
      TMediaLoader.call(VideoLoader.prototype);//mixin
      return VideoLoader;
    }(Object));
    loader.VideoLoader = VideoLoader;
    
  }(loader || (loader = {})));


  return loader;
});