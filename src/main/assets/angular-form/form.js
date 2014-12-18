define(["module", "angular"], function (module, angular) {
  "use strict";

  return angular
    .module(module.id, [])

  /**
   * ngEqual directive
   *
   * Usage:
   *
   *  <input ng-model="..." ng-equal="myValue">
   *
   *  In controller:
   *  ```
   *  $scope.myValue = 'foo';//add "equal" error if ngModel is not $scope.myValue
   *  ```
   *
   */
    .directive("ngEqual", [function () {

      function compile($element, $attrs) {

        return function link($scope, $element, $attrs, ngModel) {
          if (!ngModel) return;// do nothing if no ng-model

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