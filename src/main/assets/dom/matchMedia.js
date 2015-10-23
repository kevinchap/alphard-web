define([], function () {
  "use strict";

  var global = typeof window !== "undefined" ? window : global;
  var matchMediaPolyfill = (function () {
    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (
      global.styleMedia ||
      global.media ||
      (function () {
        var styleElement = document.createElement('style');
        var script = document.getElementsByTagName('script')[0];
        var info = null;

        styleElement.type = 'text/css';
        styleElement.id = 'matchmediajs-test';
        script.parentNode.insertBefore(styleElement, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = computedStyle(styleElement);
        return {
          matchMedium: function (media) {
            var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

            // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
            if (styleElement.styleSheet) {
              styleElement.styleSheet.cssText = text;
            } else {
              styleElement.textContent = text;
            }

            // Test if media query is true or false
            return info.width === '1px';
          }
        };
      }())
    );

    function computedStyle(element) {
      return ('getComputedStyle' in global) && global.getComputedStyle(element, null) || element.currentStyle;
    }

    function matchMediaPolyfill(media) {
      media = media || 'all';
      return {
        matches: styleMedia.matchMedium(media),
        media: media
      };
    }

    return matchMediaPolyfill;
  }());

  /**
   *
   * @param {string} media
   * @returns {*}
   */
  function matchMedia(media) {
    return (global.matchMedia || matchMediaPolyfill)(media);
  }

  return matchMedia;
});