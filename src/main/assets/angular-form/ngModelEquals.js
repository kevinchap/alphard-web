define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [])

    /**
     * ngModelEqual directive
     *
     * Usage:
     *
     *  <input ng-model="..." ng-model-equals="myValue">
     *
     *  In controller:
     *  ```
     *  $scope.myValue = 'foo';//add "equal" error if ngModel is not $scope.myValue
     *  ```
     *
     */
    .directive("ngModelEquals", NgModelEqualsDirective);


  /**
   * Directive declaration
   *
   * @constructor
   */
  NgModelEqualsDirective.$name = "ngModelEquals";
  NgModelEqualsDirective.$inject = ["$parse"];
  function NgModelEqualsDirective($parse) {
    return {
      restrict: 'A', // only activate on element attribute
      require: ['ngModel'], // get a hold of NgModelController
      compile: function compile($element, $attrs) {
        var ngEqualsExpr = $parse($attrs[NgModelEqualsDirective.$name]);

        return function link($scope, $element, $attrs, $ctrls) {
          var ngModel = $ctrls[0];
          var expected;

          // check if ng-model
          if (!ngModel) {
            ngModel.$validators.equal = function (modelValue, viewValue) {
              return ngModel.$isEmpty(modelValue) || modelValue === expected;//TODO: check for dirtyness instead of empty
            };

            $scope.$watch(
              function () { return ngEqualsExpr(); },
              function (expectedNew) {
                expected = expectedNew;
                ngModel.$validate();
              });
          }
        };
      }
    };
  }

  return ngModule;
});