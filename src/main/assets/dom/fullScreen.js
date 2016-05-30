define(["module"], function (module) {
  "use strict";

  /**
   * fullScreen module
   */
  var fullScreen;
  (function (fullScreen) {
    var ELEMENT = _findProperty(document, [
      "fullscreenElement",
      "webkitFullscreenElement",
      "webkitCurrentFullScreenElement",
      "mozFullScreenElement",
      "msFullscreenElement"
    ]);
    var REQUEST = _findProperty(document.createElement("div"), [
      "requestFullScreen",
      "webkitRequestFullScreen",
      "webkitEnterFullscreen",
      "mozRequestFullScreen",
      "msRequestFullScreen"
    ]);
    var EXIT = _findProperty(document, [
      "exitFullScreen",
      "webkitCancelFullScreen",
      "webkitExitFullScreen",
      "mozCancelFullScreen",
      "msCancelFullScreen",
      "msExitFullscreen"
    ]);
    var ENABLED = _findProperty(document, [
      "fullscreenEnabled",
      "webkitFullscreenEnabled",
      "webkitIsFullScreen",
      "mozFullScreen",
      "msFullscreenEnabled"
    ]);


    /**
     * Returns true if document has the ability to display elements fullscreen, or false otherwise.
     *
     * @returns {boolean}
     */
    function isEnabled() {
      return !!document[ENABLED];
    }
    fullScreen.isEnabled = isEnabled;

    /**
     * Returns the element that is displayed fullscreen, or null if there is no such element
     *
     * @returns {Node}
     */
    function getElement() {
      return document[ELEMENT] || null;
    }
    fullScreen.getElement = getElement;

    /**
     * Displays opt_element fullscreen.
     *
     * @param {Node=} opt_element
     */
    function request(opt_element) {
      var element = opt_element || document.documentElement;
      element[REQUEST]();
    }
    fullScreen.request = request;

    /**
     * Exit fullScreen mode
     */
    function exit() {
      document[EXIT]();
    }
    fullScreen.exit = exit;

    function _findProperty(o, propNames) {
      var returnValue, propName;
      for (var i = 0, l = propNames.length; i < l; ++i) {
        propName = propNames[i];
        if (propName in o) {
          returnValue = propName;
          break;
        }
      }
      return returnValue;
    }


  }(fullScreen || (fullScreen = {})));

  return fullScreen;
});