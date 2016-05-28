define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Angular module
   *
   */
  var ngModule = angular
    .module(module.id, [])
    .directive('ngModelPercent', NgModelPercentDirective);

  /**
   * @usage
   *
   * <input ng-model-percent ng-model="...">
   */
  function NgModelPercentDirective() {
    return {
      restrict: 'A',
      require: ['ngModel'],
      link: function ($scope, $element, $attrs, $ctrls) {
        var ngModel = $ctrls[0];

        if (ngModel) {
          ngModel.$formatters.push(ngModelFormat);
          ngModel.$parsers.push(ngModelParse);
        }

        function ngModelFormat(val) {
          return Math.round(val * 100.0);
        }

        function ngModelParse(val) {
          return val / 100.0;
        }
      }
    };
  }

  return ngModule;
});