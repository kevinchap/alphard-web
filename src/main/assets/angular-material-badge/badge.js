define(["module", "angular", "angular-material"], function (module, angular, ngMaterial) {
  "use strict";

  /**
   * module
   */
  var ngModule = angular
    .module(module.id, [ ngMaterial.name ])
    .directive("mdBadge", MdBadge)
    .run(run);

  /**
   * @usage
   * <md-badge>12</md-badge>
   *
   * <div class="md-has-badge">
   *   <md-badge>123</md-badge>
   * </div>
   */
  function MdBadge() {
    return {
      restrict: "E",
      controller: MdBadgeCtrl,
      controllerAs: "mdBadge"
    };
  }

  MdBadgeCtrl.$inject = ["$scope", "$element", "$attrs", "$injector"];
  function MdBadgeCtrl($scope, $element, $attrs, $injector) {
    var $inject = $injector.get;
    var $mdTheming = $inject("$mdTheming");

    //Apply theme
    $mdTheming($element);
    $element.addClass("md-badge");
  }

  run.$inject = ["$injector", "$log"];
  function run($injector, $log) {
    var mdBadge = "mdBadgeDirective";
    if (
      $injector.has(mdBadge) &&
      $injector.get(mdBadge).length > 1
    ) {
      $log.warn("<md-badge> is implemented in angular-material and may conflict");
    }
  }

  return ngModule;
});