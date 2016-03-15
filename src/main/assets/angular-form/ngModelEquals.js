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
    .directive("ngModelEquals", NgModelEquals);


  /**
   * Directive declaration
   *
   * @constructor
   */
  NgModelEquals.$inject = ["$parse"];
  function NgModelEquals($parse) {
    function compile($element, $attrs) {
      var ngEqualsExpr = $parse($attrs.ngModelEquals);

      return function link($scope, $element, $attrs, ngModel) {
        if (!ngModel) return;// do nothing if no ng-model

        var expected;

        ngModel.$validators.equal = function (modelValue, viewValue) {
          return ngModel.$isEmpty(viewValue) || viewValue === expected;//TODO: check for dirtyness instead of empty
        };

        $scope.$watch(
          function () { return ngEqualsExpr(); },
          function (expectedNew) {
            expected = expectedNew;
            ngModel.$validate();
          });
      };
    }

    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      compile: compile
    };
  }

  return ngModule;
});