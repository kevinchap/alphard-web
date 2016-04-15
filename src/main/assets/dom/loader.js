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

  function fbind(f, thisp) {
    return function () {
      return f.apply(thisp, arguments);
    };
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
     * Common trait for loaders (video, image, etc)
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
        this.addListener = TLoader.prototype.addListener;
        this.removeListener = TLoader.prototype.removeListener;
        this.$$setReadyState = TLoader.prototype.$$setReadyState;

        if (!this.$$readyStateTransition) {
          //throw new Error('$$readyStateTransition is required');
        }
      }
      TLoader.$$signalLoad = $$sigLoad;
      TLoader.$$signalError = $$sigError;
      TLoader.prototype.readyState = ReadyState.INIT;
      TLoader.prototype.lastError = null;
      /*TLoader.prototype.load = function load() {
        var url = this.url;
        if (this.readyState === ReadyState.INIT) {
          debug("GET", url, "...");
          __setReadyState(this, ReadyState.LOADING);
          __getImg(this).src = url;
        }
      };*/
      TLoader.prototype.initLoader = function (executor) {
        //Init properties
        this.readyState = ReadyState.INIT;
        this.lastError = null;
        __getSignal(this, $$sigLoad);
        __getSignal(this, $$sigError);

        //Call builder
        executor.call(this, __createResolver(this), __createRejecter(this));
      };

      TLoader.prototype.addListener = function (eventName, f) {
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

      TLoader.prototype.removeListener = function (eventName, f) {
        var sig = eventName === LOAD ? this[$$sigLoad] :
          eventName === ERROR ? this[$$sigError] :
            null;
        if (sig) {
          sig.remove(f);
        }
      };

      TLoader.prototype.$$setReadyState = function (newState) {
        var self = this;
        var oldState = self.readyState;
        var returnValue = false;
        if (oldState !== newState) {
          self.readyState = newState;
          if (self.$$readyStateTransition) {
            returnValue = self.$$readyStateTransition(newState, oldState);
          }
          if (returnValue === undefined) {
            returnValue = true;
          }
        }
        return !!returnValue;
      };

      function __createResolver(self) {
        return function resolve(value) {
          debug("GET", String(self), "OK");
          __setReadyState(self, ReadyState.LOADED);
          self[$$sigLoad].emit(value);
          self[$$sigLoad] = null;
          self[$$sigError] = null;
        };
      }

      function __createRejecter(self) {
        return function reject(error) {
          debug("GET", String(self), "ERROR", error);
          self.lastError = error;
          __setReadyState(self, ReadyState.ERROR);
          self[$$sigError].emit(event);
          self[$$sigLoad] = null;
          self[$$sigError] = null;
        };
      }

      function __setReadyState(self, readyState) {
        return self.$$setReadyState(readyState);
      }

      function __getSignal(self, name) {
        return self[name] || (self[name] = new Signal());
      }

      return TLoader;
    }());

    /**
     * ImageLoader class
     */
    var ImageLoader = (function (_super) {
      var $$imgElement = symbol("img");

      function ImageLoader(url) {
        _super.call(this);
        this.url = url;
        this.initLoader(function (resolve, reject) {
          var img = this[$$imgElement] = new Image();
          img.onload = resolve;
          img.onreadystatechange = function (event) {
            if (img.readyState === 'complete') {
              resolve(event);
            }
          };
          img.onerror = reject;
        });
      }
      TLoader.call(ImageLoader.prototype);
      ImageLoader.prototype.url = "";
      ImageLoader.prototype.load = function () {
        var url = this.url;
        if (this.readyState === ReadyState.INIT) {
          debug("GET", url, "...", this);
          __setReadyState(this, ReadyState.LOADING);
          __getImg(this).src = url;
        }
      };

      ImageLoader.prototype.cancel = function () {
        if (this.readyState === ReadyState.LOADING) {
          if (__getImg(this).src !== "") {
            __getImg(this).src = "";
          }
          __setReadyState(this, ReadyState.INIT);
        }
      };

      ImageLoader.prototype.getWidth = function () {
        return __getImg(this).naturalWidth;
      };

      ImageLoader.prototype.getHeight = function () {
        return __getImg(this).naturalHeight;
      };

      ImageLoader.prototype.toString = function () {
        return 'ImageLoader { ' + this.url + ' }';
      };

      function __getImg(self) {
        return self[$$imgElement];
      }

      function __setReadyState(self, readyState) {
        return self.$$setReadyState(readyState);
      }

      return ImageLoader;
    }(Object));
    loader.ImageLoader = ImageLoader;

    /**
     * VideoLoader class
     */
    var VideoLoader = (function (_super) {
      var $$videoElement = symbol("video");


      function VideoLoader(url) {
        _super.call(this);
        this.url = url;

        this.initLoader(function (resolve, reject) {
          var videoElement = this[$$videoElement] = new Video();
          videoElement.onload = resolve;
          videoElement.oncanplaythrough = resolve;
          videoElement.onerror = reject;
        });
      }
      TLoader.call(VideoLoader.prototype);

      VideoLoader.prototype.load = function load() {

      };

      VideoLoader.prototype.toString = function () {
        return 'VideoLoader { ' + this.url + ' }';
      };

      return VideoLoader;
    }(Object));
    loader.VideoLoader = VideoLoader;
    
  }(loader || (loader = {})));


  return loader;
});