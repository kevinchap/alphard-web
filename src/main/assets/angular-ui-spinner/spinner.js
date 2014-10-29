define(
[
  'module',
  'angular',
  'text!./spinner.html'
],
function (
  module,
  angular,
  spinnerHTML
) {
  'use strict';

  /**
   * <spinner>
   * </spinner>
   */
  return angular
    .module(module.id, [])
    .directive("spinner", function spinner() {
      return {
        compile: function ($element, attrs) {
          return function link($scope, $element, attrs) {
            $scope.size = $scope.size || "md";

            $scope.getClass = function () {
              var size = $scope.size;
              return {
                "spinner": true,
                "spinner--default": true,
                "spinner--xs": size === 'xs',
                "spinner--sm": size === 'sm',
                "spinner--md": size === 'md',
                "spinner--lg": size === 'lg'
              };
            };
          };
        },
        restrict: 'E',
        replace: true,
        template: spinnerHTML,
        scope: {
          size: '@'
        }
      };
    });
});
