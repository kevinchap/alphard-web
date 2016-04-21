define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [])

    /**
     * JSON formatter/parser for ngModel that provide simple text based
     * edition of JSON content
     *
     * @usage
     *
     * <textarea ng-model-json
     *           ng-model="...">
     * </textarea>
     */
    .directive("ngModelJson", NgModelJsonDirective);


  /**
   * Directive declaration
   *
   * @constructor
   */
  function NgModelJsonDirective() {
    return {
      require: ["ngModel"],
      restrict: "A",
      link: function ($scope, $element, $attrs, $ctrls) {
        var ngModel = $ctrls[0];
        var lastValid = null;
        var INVALID_JSON = "json";

        if (ngModel) {
          //Configure ngModel
          ngModel.$formatters.push(ngModelFormat);
          ngModel.$parsers.push(ngModelParse);
        }


        function ngModelFormat(val) {
          return angular.toJson(val, true);
        }

        function ngModelParse(val) {
          var validity = true;
          var returnValue;
          if (!val || val.trim() === '') {
            validity = true;
            returnValue = null;
          } else {
            try {
              lastValid = angular.fromJson(val);
            } catch (e) {
              validity = false;
            }
            returnValue = lastValid;
          }
          ngModel.$setValidity(INVALID_JSON, validity);
          return returnValue;
        }
      }
    };
  }

  return ngModule;
});