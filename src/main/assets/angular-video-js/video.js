define(["module", "angular", "video-js/video"], function (module, angular) {
  "use strict";

  var ngModule = angular
    .module(module.id, [])
    .directive("videoJs", VideoJsDirective);

  /**
   *
   * @usage
   *
   * <video video-js>
   * </video>
   */
  function VideoJsDirective() {
    return {
      restrict: "AC",
      link: function ($scope, $element, $attrs) {
        $attrs.$addClass("video-js");

        $element.css("visibility", "hidden");
        require([
          "video-js/video",
          "css!video-js/video-js"
        ], function (videojs) {
          $element.css("visibility", "visible");

          videojs($element[0]);
        });

      }
    };
  }

  return ngModule;
});