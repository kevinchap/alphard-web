/**
 * AngularJS Form module
 */
define(["module", "angular"], function (module, angular) {
  "use strict";

  return angular
    .module(module.id, [])
    .directive("ngEqual", [function () {

      function compile($element, $attrs) {

        return function link($scope, $element, $attrs, ngModel) {
          if (!ngModel) return;// do nothing if no ng-model

          //validator
          ngModel.$validators.equal = function (modelValue, viewValue) {
            return ngModel.$isEmpty(viewValue) || viewValue === $scope.expected;
          };

          $scope.$watch("expected", function() {
            ngModel.$validate();
          });
        };
      }

      return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        compile: compile,
        scope: {
          expected: "=ngEqual"
        }
      };
    }]);
});