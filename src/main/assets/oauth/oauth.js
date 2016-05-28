define(["module"], function (module) {
  "use strict";

  var config = (module.config && module.config()) || {};

  function debug(var_args) {
    if (config.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      return console.debug.apply(console, args);
    }
  }

  /**
   * oauth module
   */
  var oauth;
  (function (oauth) {
    var global = window;
    var callbacks = global;
    var currentId = 0;

    function openWindow(url, title, opt_params) {
      var opts = "";
      if (opt_params) {
        var first = true;
        for (var prop in opt_params) {
          if (!first) {
            opts += ",";
          } else {
            first = false;
          }
          opts += prop + "=" + opt_params[prop];
        }
      }
      return global.open(url, title, opts);
    }

    function qualifyURL(url) {
      var a = document.createElement('a');
      a.href = url;
      return a.href;
    }

    function callbackName(id) {
      return "__oauth__" + id;
    }

    function requestId() {
      return currentId++;
    }

    /**
     * Request class
     */
    var Request = (function (_super) {

      function Request() {
        _super.call(this);
        this._id = requestId();
      }

      Request.prototype.getCallbackUrl = function () {
        var reqId = this._id;
        var url = qualifyURL(require.toUrl(module.id) + "_callback.html");
        url += (url.indexOf("?") >= 0 ? "&" : "?");
        url += "js_callback=" + encodeURIComponent(callbackName(reqId));
        return url;
      };

      Request.prototype.open = function (url, opt_callback, opt_errback) {
        debug("open(", url, ")");

        var title = "OAuth login";
        var callbackPath = callbackName(this._id);
        var callback = opt_callback || function () {};
        var errback = opt_errback || function () {};
        callbacks[callbackPath] = function (error, result) {
          debug("received error=", error, "result=", result);

          callbacks[callbackPath] = null;
          if (error) {
            errback(error);
          } else {
            callback(result);
          }
        };

        //open requester
        var w = 1200;
        var h = 800;
        var dualScreenLeft = global.screenLeft !== undefined ? global.screenLeft : screen.left;
        var dualScreenTop = global.screenTop !== undefined ? global.screenTop : screen.top;
        var width = global.innerWidth ? global.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        var height = global.innerHeight ? global.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;
        var newWindow = openWindow(
          url,
          title,
          {
            toolbar: 'no',
            location: 'no',
            directories: 'no',
            status: 'no',
            menubar: 'no',
            scrollbars: 'no',
            resizable: 'no',
            copyhistory: 'no',
            width: w,
            height: h,
            top: top,
            left: left
          }
        );
        if (newWindow) {
          newWindow.focus();
          var timerId = setInterval(function () {
            if (newWindow.closed) {
              clearInterval(timerId);
              if (callbacks[callbackPath]) {
                callbacks[callbackPath](new Error("OAuth cancelled"), null);
              }
              newWindow = null;
            }
          }, 500);
        }
        return newWindow;
      };

      return Request;
    }(Object));
    oauth.Request = Request;


  }(oauth || (oauth = {})));

  return oauth;
});