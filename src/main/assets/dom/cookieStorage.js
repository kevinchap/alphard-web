define([], function () {
  "use strict";

  //Util
  var __str = function (o) {
    return "" + o;
  };
  var __keys = Object.keys || function (o) {
      var keys = [];
      for (var key in o) {
        if (o.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys;
    };
  var __decode = function (s) {
    try {
      return decodeURIComponent(s);
    } catch (e) {
      return s;
    }
  };
  var __defineGetter = Object.defineProperty ?
    function (o, name, getter) {
      Object.defineProperty(o, name, {get: getter});
    } :
    function (o, name, getter) {
      o.__defineGetter__(name, getter);
    };
  var __extend = function (dest, var_args) {
    for (var argi = 1, argc = arguments.length; argi < argc; argi++) {
      var argument = arguments[argi];
      if (argument !== undefined) {
        var keys = __keys(argument);
        for (var i = 0, l = keys.length; i < l; i++) {
          var key = keys[i];
          dest[key] = argument[key];
        }
      }
    }
    return dest;
  };


  var _cookie = (function () {
    var __document = document || {};
    var __cookies = {};
    var __cookiesStr = '';
    var __cookiesKeys = [];


    function keys() {
      _pull();
      return __cookiesKeys;
    }

    function read() {
      _pull();
      return __cookies;
    }

    function write(key, value, options) {
      options = __extend({path: '/'}, options);

      var domain = options.domain;
      var path = options.path;
      var expires = options.expires;
      var secure = options.secure;
      var valueStr;

      if (value === undefined || value === null) {
        expires = -1;
        valueStr = "";
      } else {
        valueStr = __str(value);
      }

      if (typeof key !== "string") {
        throw new TypeError("key must be string");
      }

      if (typeof expires === 'number' && expires >= 0) {
        var expiredAt = new Date();
        expiredAt.setMilliseconds(expiredAt.getMilliseconds() + expires);
        expires = expiredAt;
      }

      /*
       try {
       var result = JSON.stringify(value);
       if (/^[\{\[]/.test(result)) {
       value = result;
       }
       } catch (e) {}*/

      var valueEncoded = encodeURIComponent(valueStr);
      valueEncoded = valueEncoded.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

      var keyEncoded = encodeURIComponent(__str(key));
      keyEncoded = keyEncoded.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
      keyEncoded = keyEncoded.replace(/[\(\)]/g, escape);

      var s = "" + keyEncoded + '=' + valueEncoded;
      if (expires) {
        s += '; expires=' + expires.toUTCString();
      }
      if (path) {
        s += '; path=' + path;
      }
      if (domain) {
        s += '; domain=' + domain;
      }
      if (secure) {
        s += '; secure';
      }

      return (__document.cookie = s);
    }

    function clear() {
      __document.cookie = __cookiesStr = "";
      __cookies = {};
      __cookiesKeys = [];
    }

    function size() {
      return keys().length;
    }

    function _pull() {
      var cookieArray, cookie, i, index, name;
      var currentCookieString = __document.cookie || '';

      if (currentCookieString !== __cookiesStr) {
        __cookiesStr = currentCookieString;
        cookieArray = __cookiesStr.split('; ');
        __cookies = {};

        for (i = 0; i < cookieArray.length; i++) {
          cookie = cookieArray[i];
          index = cookie.indexOf('=');
          if (index > 0) { //ignore nameless cookies
            name = __decode(cookie.substring(0, index));
            // the first value that is seen for a cookie is the most
            // specific one.  values for the same cookie name that
            // follow are for less specific paths.
            if (__cookies[name] === undefined) {
              __cookies[name] = __decode(cookie.substring(index + 1));
            }
          }
        }
        __cookiesKeys = __keys(__cookies);
      }
    }

    //exports
    return {
      keys: keys,
      read: read,
      write: write,
      clear: clear,
      size: size
    };
  }());


  /**
   * CookieStorage class
   */
  var CookieStorage = (function (_super) {

    function CookieStorage() {
      _super.call(this);
      __defineGetter(this, "length", _cookie.size);
    }

    CookieStorage.prototype = Object.create(_super.prototype);

    CookieStorage.prototype.constructor = CookieStorage;

    CookieStorage.prototype.length = 0;

    CookieStorage.prototype.clear = function clear() {
      _cookie.clear();
    };

    CookieStorage.prototype.key = function key(index) {
      index = index >>> 0;
      var returnValue;
      if (index >= 0) {
        var keys = _cookie.keys();
        returnValue = keys[index];
      }
      return returnValue;
    };

    CookieStorage.prototype.getItem = function getItem(key) {
      var data = _cookie.read();
      return data[key];
    };

    CookieStorage.prototype.setItem = function getItem(key, value, opt_options) {
      _cookie.write(key, value, opt_options !== undefined ? opt_options : {});
    };

    CookieStorage.prototype.removeItem = function removeItem(key, opt_options) {
      _cookie.write(key, null, opt_options);
    };

    return CookieStorage;
  }(Object));

  var cookieStorage = new CookieStorage();
  return cookieStorage;
});