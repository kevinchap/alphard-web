define([], function () {
  "use strict";

  //Reference : https://github.com/ded/domready/blob/master/ready.js

  //Constant
  var DOM_CONTENT_LOADED = "DOMContentLoaded";

  //Util
  var __doc = document;
  var __hack = !!__doc.documentElement.doScroll;
  var __loaded = (__hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(__doc.readyState);
  var __setImmediate = typeof setImmediate !== "undefined" ? setImmediate : setTimeout;
  var __onceLoaded = function (f) {
      var handler = function () {
        __doc.removeEventListener(DOM_CONTENT_LOADED, handler, false);
        f();
      };
      __doc.addEventListener(DOM_CONTENT_LOADED, handler, false);
    };
  var __loadedCallbacks = [];

  //Init
  if (!__loaded) {
    __onceLoaded(function () {
      __loaded = true;
      for (var i = 0, l = __loadedCallbacks.length; i < l; i++) {
        __setImmediate(__loadedCallbacks[i]);
      }
      __loadedCallbacks = null;//free
    });
  }

  var __onReady = function (f) {
    if (__loaded) {
      __setImmediate(f);
    } else {
      __loadedCallbacks.push(f);
    }
  };

  return __onReady;
});