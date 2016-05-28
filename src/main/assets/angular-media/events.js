define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   *
   *
   * @see https://github.com/angular/angular.js/blob/master/src/ng/directive/ngEventDirs.js
   * @usage
   *
   * <video ng-abort="..."
   *        ng-canplay="...">
   * </video>
   *
   */
  var ngModule = angular
    .module(module.id, [])
    .directive(ngEventDirectives());

  /**
   * Return an object containing all event directives
   * @returns {{}}
   */
  function ngEventDirectives() {
    var directives = {};
    angular.forEach(
      "abort canplay canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
      function (eventName) {
        var directive = ngEventDirective(eventName);
        directives[directive.$name] = directive;
      }
    );
    return directives;
  }

  /**
   * Create angular directive from event name
   *
   * @param {string} eventName
   * @returns {ngDirective}
   */
  function ngEventDirective(eventName) {
    var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
    var MOZ_HACK_REGEXP = /^moz([A-Z])/;
    var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i;

    function toCamelCase(name) {
      return (name
          .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
          })
          .replace(MOZ_HACK_REGEXP, 'Moz$1')
      );
    }

    function directiveNormalize(name) {
      return toCamelCase(name.replace(PREFIX_REGEXP, ''));
    }

    ngDirective.$name = directiveNormalize('ng-' + eventName);
    ngDirective.$inject = ["$parse"];
    function ngDirective($parse) {

      return {
        restrict: 'A',
        compile: function ($element, $attrs) {

          // Parse callback
          var fn = $parse($attrs[ngDirective.$name], /* interceptorFn */ null, /* expensiveChecks */ true);

          // Return the event handler
          return function ngEventHandler($scope, $element) {
            $element.bind(eventName, function ($event) {
              $scope.$apply(function () {
                fn($scope, {$event: $event});
              });
            });
          };
        }
      };
    }

    return ngDirective;
  }

  return ngModule;
});