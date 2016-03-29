define(["module", "angular", "../json/jsonschema"], function (module, angular, jsonschema) {
  "use strict";

  var JSONSchema = jsonschema.JSONSchema;

  /**
   * Angular module
   *
   */
  var ngModule = angular
    .module(module.id, [])
    .directive("ngModelJsonschema", NgModelJsonschema);


  /**
   * @usage
   *
   * <input ng-model-jsonschema="..."
   *        ng-model="...">
   */
  NgModelJsonschema.$inject = ["$parse"];
  function NgModelJsonschema($parse) {
    var $$name = "ngModelJsonschema";

    function compile($element, $attrs) {
      var ngJsonSchemaExpr = $parse($attrs[$$name]);

      return function link($scope, $element, $attrs, $ctrls) {
        var ngModel = $ctrls[0];
        var schema;
        if (ngModel) {
          ngModel.$validators.jsonSchema = function (modelValue, viewValue) {
            return schema ? JSONSchema.test(schema, modelValue) : true;
          };

          $scope.$watch(
            function () {
              return ngJsonSchemaExpr();
            },
            function (ngJsonSchema) {
              schema = ngJsonSchema;
              ngModel.$validate();
            });
        }
      };
    }

    return {
      restrict: "A",
      require: ['?ngModel'],
      compile: compile
    };
  }

  return ngModule;
});