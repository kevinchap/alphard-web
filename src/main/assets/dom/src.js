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

  /**
   * src module
   */
  var src;
  (function (src) {

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

    /**
     * LoaderEntry class
     */
    var LoaderEntry = (function (_super) {

      function LoaderEntry(url) {
        _super.call(this);
        var self = this;

        self.url = url;
        self.readyState = ReadyState.INIT;
        self.lastError = null;
        self.$$sigLoad = new Signal();
        self.$$sigError = new Signal();

        var imgElement = self.$$imgElement = new Image();
        imgElement.onload = function () {
          debug("GET", url, "OK");
          self.readyState = ReadyState.LOADED;
          self.$$sigLoad.emit();
          self.$$sigLoad = null;
          self.$$sigError = null;
        };
        imgElement.onerror = function (event) {
          debug("GET", url, "ERROR", event);
          self.readyState = ReadyState.ERROR;
          self.lastError = event;
          self.$$sigError.emit(event);
          self.$$sigLoad = null;
          self.$$sigError = null;
        };
      }

      LoaderEntry.prototype.lastError = null;
      LoaderEntry.prototype.readyState = NaN;
      LoaderEntry.prototype.url = "";
      LoaderEntry.prototype.load = function () {
        var self = this;
        if (self.readyState === ReadyState.INIT) {
          debug("GET", self.url, "...");
          self.readyState = ReadyState.LOADING;
          self.$$imgElement.setAttribute("src", self.url);
        }
      };

      LoaderEntry.prototype.getWidth = function () {
        return this.$$imgElement.naturalWidth;
      };

      LoaderEntry.prototype.getHeight = function () {
        return this.$$imgElement.naturalHeight;
      };

      LoaderEntry.prototype.addListener = function (eventName, f) {
        var self = this;
        var isLoad = eventName === "load";
        var isError = eventName === "error";
        var sig = isLoad ? self.$$sigLoad :
          isError ? self.$$sigError :
            null;

        switch (self.readyState) {
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
              f(self.lastError);
            }
            break;
          default:
            //Do nothing
            break;
        }
      };

      LoaderEntry.prototype.removeListener = function (eventName, f) {
        var self = this;
        var sig = eventName === "load" ? self.$$sigLoad :
          eventName === "error" ? self.$$sigError :
            null;
        if (sig) {
          sig.remove(f);
        }
      };

      return LoaderEntry;
    }(Object));

    /**
     * Loader class
     */
    var Loader = (function (_super) {

      function Loader() {
        _super.call(this);
        this.$$registry = {}; // { [url:string]: LoaderEntry }
        this.$$keys = [];
        this.$$length = 0;
      }

      Loader.prototype.$$registry = null;

      Loader.prototype.key = function (i) {
        return this.$$keys[i];
      };

      Loader.prototype.item = function (url) {
        return url === undefined || url === null ? url : getItem(this, url);
      };

      Loader.prototype.size = function () {
        return this.$$length;
      };

      function getItem(self, url) {
        var registry = self.$$registry;
        var img = registry[url];
        if (!img) {
          img = registry[url] = new LoaderEntry(url);
          self.$$keys = Object.keys(registry);
          self.$$length += 1;
        }
        return img;
      }

      return Loader;
    }(Object));

    /**
     * Src class
     */
    var Src = (function (_super) {
      var loaderDefault = new Loader();

      function Src(url, opt_loader) {
        url = url ? String(url) : null;
        opt_loader = opt_loader || loaderDefault;

        if (this instanceof Src) {
          _super.call(this);
          var self = this;
          self.readyState = self.INIT;
          self.width = NaN;
          self.height = NaN;
          self.$$url = null;
          self.$$loader = opt_loader;
          self.$$update = function () {
            __update(self);
          };

          self.url(url);
        } else {
          return new Src(url);
        }
      }

      Src.INIT = Src.prototype.INIT = ReadyState.INIT;
      Src.LOADING = Src.prototype.LOADING = ReadyState.LOADING;
      Src.LOADED = Src.prototype.LOADED = ReadyState.LOADED;
      Src.ERROR = Src.prototype.ERROR = ReadyState.ERROR;

      Src.prototype.onreadystatechange = null;

      Src.prototype.width = NaN;

      Src.prototype.height = NaN;

      Src.prototype.readyState = 1;

      Src.prototype.equals = function equals(o) {
        return (o instanceof Src) && this.url() === o.url();
      };

      Src.prototype.url = function url(opt_val) {
        if (arguments.length) {
          var self = this;
          if (self.$$url !== opt_val) {
            var $$update = self.$$update;
            var entry = __entry(self);

            //unregister
            if (entry) {
              entry.removeListener("load", $$update);
              entry.removeListener("error", $$update);
            }
            self.readyState = self.INIT;
            self.width = NaN;
            self.height = NaN;
            self.$$url = opt_val;

            //register
            $$update();
            entry = __entry(self);
            entry.addListener("load", $$update);
            entry.addListener("error", $$update);
          }
          return self;
        } else {
          return this.$$url;
        }
      };

      Src.prototype.load = function load() {
        var self = this;
        var entry = __entry(self);
        if (entry) {
          entry.load();
          __update(self);
        }
        return self;
      };

      function __entry(self) {
        return self.$$loader.item(self.$$url);
      }

      function __update(self) {
        var imgEntry = __entry(self);
        if (imgEntry) {
          var readyState = imgEntry.readyState;
          if (self.readyState !== readyState) {
            self.readyState = readyState;
            switch (readyState) {
              case self.INIT:
                break;
              case self.LOADING:
                break;
              case self.LOADED:
                self.width = imgEntry.getWidth();
                self.height = imgEntry.getHeight();
                break;
              case self.ERROR:
                break;
            }
            //debug(url, "onreadystatechange");

            if (self.onreadystatechange) {
              self.onreadystatechange();
            }
          }
        }
      }

      return Src;
    }(Object));

    src.Src = Src;

    /**
     * SrcSet class
     */
    var SrcSet = (function (_super) {

      function SrcSet(opt_urls) {
        if (this instanceof SrcSet) {
          _super.call(this);
          var self = this;
          this.readyState = this.INIT;
          this.$$srcs = [];
          this.$$srcLoaded = null;
          this.$$update = function () {
            __update(self);
          };
          this.length = 0;
          if (opt_urls) {
            __append(self, opt_urls);
          }
        } else {
          return new SrcSet(opt_urls);
        }
      }

      SrcSet.INIT = SrcSet.prototype.INIT = ReadyState.INIT;
      SrcSet.LOADING = SrcSet.prototype.LOADING = ReadyState.LOADING;
      SrcSet.LOADED = SrcSet.prototype.LOADED = ReadyState.LOADED;
      SrcSet.ERROR = SrcSet.prototype.ERROR = ReadyState.ERROR;
      /*
       SrcSet.prototype.equals = function (o) {
       var returnValue = false;
       if (o instanceof SrcSet) {
       var length = this.length;
       if (length === o.length) {
       returnValue = true;
       for (var i = 0; i < length; i++) {
       if (!this[i].equals(o[i])) {
       returnValue = false;
       break;
       }
       }
       }
       }
       return returnValue;
       };*/

      SrcSet.prototype.load = function () {
        var srcs = this.$$srcs;
        for (var i = 0, l = srcs.length; i < l; i++) {
          srcs[i].load();
        }
      };

      SrcSet.prototype.url = function () {
        var src = this.$$srcLoaded;
        return src && src.url() || null;
      };

      function __readyState(self, state) {
        if (self.readyState !== state) {
          self.readyState = state;
          if (self.onreadystatechange) {
            self.onreadystatechange();
          }
        }
      }

      function __append(self, urls) {
        var selfUpdate = self.$$update;
        var update = false;
        for (var i = 0, l = urls.length, url, src; i < l; i++) {
          url = urls[i];
          if (__indexOf(self, url) < 0) {
            src = new Src(url);

            //add src to the pool
            src.onreadystatechange = selfUpdate;
            self[self.length] = src;
            self.length += 1;

            //trigger loading
            //src.load();
            update = true;
          }
        }

        if (update) {
          __update(self);
        }
      }

      function __indexOf(self, url) {
        var srcs = self;
        for (var i = 0, l = srcs.length, src; i < l; i++) {
          src = srcs[i];
          if (src.url() === url) {
            return i;
          }
        }
        return -1;
      }

      function __update(self) {
        var srcs = self.$$srcs;
        var srcc = srcs.length;
        var srcLoaded = null;
        var isLoading = false;
        var errored = false;
        for (var i = 0; i < srcc; i++) {
          var src = srcs[i];
          switch (src.readyState) {
            case src.INIT:
            case src.LOADING:
              errored = false;
              isLoading = true;
              break;
            case src.LOADED:
              srcLoaded = src;
              errored = false;
              break;
            case src.ERROR:
              if (!srcLoaded) {
                errored = true;
              }
              break;
          }
        }

        if (isLoading) {
          __readyState(self, self.LOADING);
        } else if (errored) {
          __readyState(self, self.ERROR);
        } else {
          __readyState(self, self.LOADED);
        }
        self.$$srcLoaded = srcLoaded;
      }

      return SrcSet;
    }(Object));

    src.SrcSet = SrcSet;

  }(src || (src = {})));

  return src;
});