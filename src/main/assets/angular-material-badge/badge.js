define(["module", "angular", "angular-material"], function (module, angular, ngMaterial) {
  "use strict";

  /**
   * module
   */
  var ngModule = angular
    .module(module.id, [ ngMaterial.name ])


    /**
     * directive
     */
    .directive("mdBadge", function MdBadge() {
      return {
        restrict: "E",
        controller: "MdBadgeCtrl",
        controllerAs: "mdBadge"
      };
    })

    /**
     * controller
     */
    .controller("MdBadgeCtrl", function MdBadgeCtrl($scope, $element, $attrs, $injector) {
      var $inject = $injector.get;
      var $mdTheming = $inject("$mdTheming");

      function initialize() {
        //Apply theme
        $mdTheming($element);
        $element.addClass("md-badge");
      }
      initialize();

    })

    .run(["$injector", "$log", function ($injector, $log) {
      var mdBadge = "mdBadgeDirective";
      if (
        $injector.has(mdBadge) &&
        $injector.get(mdBadge).length > 1
      ) {
        $log.warn("<md-badge> is implemented in angular-material and may conflict");
      }
    }]);



  return ngModule;
});