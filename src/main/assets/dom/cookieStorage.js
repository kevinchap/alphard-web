define(["require", "exports"], function (require, exports) {
  //Constant
  var ES_COMPAT = 3;
  //Util
  var __now = Date.now;
  var __keys = Object.keys;
  var __str = function (o) {
    return "" + o;
  };
  var __defineGetter = Object.defineProperty ? function (o, name, getter) {
    Object.defineProperty(o, name, { get: getter });
  } : null;
  var __cookieRead = (function () {
    var __document = document;
    var __cookies = {};
    var __cookiesStr = '';
    var __decode = decodeURIComponent;
    var __read = function () {
      var cookieArray, cookie, index, name;
      var currentCookieString = __document.cookie || '';
      if (currentCookieString !== __cookiesStr) {
        __cookiesStr = currentCookieString;
        cookieArray = __cookiesStr.split('; ');
        __cookies = {};
        for (var i = 0, l = cookieArray.length; i < l; i++) {
          cookie = cookieArray[i];
          index = cookie.indexOf('=');
          if (index > 0) {
            name = __decode(cookie.substring(0, index));
            // the first value that is seen for a cookie is the most
            // specific one.  values for the same cookie name that
            // follow are for less specific paths.
            if (__cookies[name] === undefined) {
              __cookies[name] = __decode(cookie.substring(index + 1));
            }
          }
        }
      }
      return __cookies;
    };
    return __read;
  }());
  var __cookieWrite = (function () {
    var __document = document;
    var __encodeKey = function (s) {
      var r = s;
      if (r.length) {
        r = encodeURIComponent(r);
        r = r.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
        r = r.replace(/[\(\)]/g, encodeURIComponent); //escape
      }
      return r;
    };
    var __encodeValue = function (s) {
      var r = s;
      if (r.length) {
        r = encodeURIComponent(r);
        r = r.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
      }
      return r;
    };
    var __write = function (key, value, options) {
      if (options === void 0) { options = {}; }
      //options = __extend({ path: '/' }, options);
      var now = __now();
      var domain = options.domain;
      var path = options.path || "/";
      var maxAge = options.maxAge;
      var expires = options.expires;
      var secure = options.secure;
      var expirationDate = null;
      var cookieDelete = false;
      //Expiration
      if (expires !== undefined) {
        expirationDate = new Date(+expires);
      }
      else if (maxAge !== undefined) {
        expirationDate = new Date(now);
        expirationDate.setMilliseconds(expirationDate.getMilliseconds() + maxAge);
      }
      cookieDelete = +now >= +expirationDate;
      //Encode
      var s = "";
      s += __encodeKey(__str(key));
      s += '=' + (cookieDelete ? "" : __encodeValue(__str(value)));
      if (expirationDate) {
        s += '; expires=' + expirationDate.toUTCString();
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
      var cookieOld = __document.cookie;
      __document.cookie = s;
      return (cookieOld !== __document.cookie);
    };
    return __write;
  }());
  var __cookieClear = function () {
    document.cookie = "";
  };
  //Compat
  if (ES_COMPAT <= 3) {
    __now = __now || function () {
        return (new Date()).getTime();
      };
    __keys = __keys || function (o) {
        var keys = [];
        for (var key in o) {
          if (o.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
        return keys;
      };
    __defineGetter = __defineGetter || function (o, name, getter) {
        o.__defineGetter__(name, getter);
      };
  }
  var CookieStorage = (function () {
    function CookieStorage() {
      __defineGetter(this, "length", function () {
        return __keys(__cookieRead()).length;
      });
    }
    CookieStorage.prototype.key = function (index) {
      index = index >>> 0;
      var returnValue = null;
      if (index >= 0) {
        var keys = __keys(__cookieRead());
        if (index < keys.length) {
          returnValue = keys[index];
        }
      }
      return returnValue;
    };
    CookieStorage.prototype.getItem = function (k) {
      return __cookieRead()[k];
    };
    CookieStorage.prototype.setItem = function (k, v, options) {
      __cookieWrite(k, v, options);
    };
    CookieStorage.prototype.removeItem = function (k) {
      __cookieWrite(k, null, { maxAge: -1 });
    };
    CookieStorage.prototype.clear = function () {
      __cookieClear();
    };
    return CookieStorage;
  })();
  var cookieStorage = new CookieStorage();
  return cookieStorage;
});