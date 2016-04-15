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
        this.addListener = TLoader.prototype.addListener;
        this.removeListener = TLoader.prototype.removeListener;
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
      TLoader.prototype.addListener = function (eventName, f) {
        var isLoad = eventName === LOAD;
        var isError = eventName === ERROR;
        var sig = isLoad ? __getSignal(this, $$sigLoad) :
          isError ? __getSignal(this, $$sigError) :
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
        var sig = eventName === LOAD ? __getSignal(this, $$sigLoad) :
          eventName === ERROR ? __getSignal(this, $$sigError) :
            null;
        if (sig) {
          sig.remove(f);
        }
      };

      TLoader.prototype.setReadyState = function (newState) {
        var self = this;
        var oldState = self.readyState;
        var returnValue = false;
        if (oldState !== newState) {
          self.readyState = newState;
          if (self.readyStateTransition) {
            returnValue = self.readyStateTransition(newState, oldState);
          }
          if (returnValue === undefined) {
            returnValue = true;
          }
        }
        return !!returnValue;
      };

      function __getSignal(self, name) {
        return self[name] || (self[name] = new Signal());
      }

      return TLoader;
    }());

    /**
     * ImageLoader class
     */
    var ImageLoader = (function (_super) {
      var $$sigLoad = TLoader.$$signalLoad;
      var $$sigError = TLoader.$$signalError;
      var $$imgElement = symbol("img");

      function ImageLoader(url) {
        _super.call(this);
        this.url = url;
        this.readyState = ReadyState.INIT;
        this.lastError = null;
      }
      TLoader.call(ImageLoader.prototype);
      ImageLoader.prototype.url = "";
      ImageLoader.prototype.load = function () {
        var url = this.url;
        if (this.readyState === ReadyState.INIT) {
          debug("GET", url, "...");
          __setReadyState(this, ReadyState.LOADING);
          __getImg(this).src = url;
        }
      };

      ImageLoader.prototype.cancel = function () {
        if (this.readyState === ReadyState.LOADING) {
          if (__getImg(this).src !== "") {
            __getImg(this).src = "";
          }
          this.readyState = ReadyState.INIT;
        }
      };

      ImageLoader.prototype.getWidth = function () {
        return __getImg(this).naturalWidth;
      };

      ImageLoader.prototype.getHeight = function () {
        return __getImg(this).naturalHeight;
      };

      function __getImg(self) {
        var returnValue = self[$$imgElement];
        if (!returnValue) {
          returnValue = self[$$imgElement] = new Image();
          returnValue.onload = function (event) {
            __trigger(self, true, event);
          };
          returnValue.onreadystatechange = function (event) {
            if (returnValue.readyState === 'complete') {
              __trigger(self, true, event);
            }
          };
          returnValue.onerror = function (event) {
            __trigger(self, false, event);
          };
        }
        return returnValue;
      }

      function __trigger(self, isSuccess, event) {
        var url = self.url;
        if (isSuccess) {
          debug("GET", url, "OK");
          __setReadyState(self, ReadyState.LOADED);
          self[$$sigLoad].emit(event);
          self[$$sigLoad] = null;
          self[$$sigError] = null;
        } else {
          debug("GET", url, "ERROR", event);
          self.lastError = event;
          __setReadyState(self, ReadyState.ERROR);
          self[$$sigError].emit(event);
          self[$$sigLoad] = null;
          self[$$sigError] = null;
        }
      }

      function __setReadyState(self, readyState) {
        return self.setReadyState(readyState);
      }

      return ImageLoader;
    }(Object));
    loader.ImageLoader = ImageLoader;

    /**
     * VideoLoader class
     */
    var VideoLoader = (function (_super) {
      var $$videoElement = symbol("video");


      function VideoLoader() {
        _super.call(this);
      }
      TLoader.call(VideoLoader.prototype);

      VideoLoader.prototype.load = function load() {

      };

      function __getVideo(self) {
        var returnValue = self[$$videoElement];
        if (!returnValue) {
          returnValue = self[$$videoElement] = new Video();
          returnValue.onload = function (event) {
            __trigger(self, true, event);
          };
          returnValue.oncanplaythrough = function (event) {
            __trigger(self, true, event);
          };
          returnValue.onerror = function (event) {
            __trigger(self, false, event);
          };
        }
        return returnValue;
      }

      return VideoLoader;
    }(Object));
    loader.VideoLoader = VideoLoader;
    
  }(loader || (loader = {})));


  return loader;
});