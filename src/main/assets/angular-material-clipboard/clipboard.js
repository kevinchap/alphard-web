define(["module", "angular", "angular-material", "angular-clipboard"], function (module, angular, ngMaterial, ngClipboard) {
  "use strict";

  /**
   *
   * @usage
   * <md-input-clipboard [ng-model="..."]
   *                     [ng-value="fn()"]
   *                     [disabled]
   *                     [md-toast="..."]>
   * </md-input-clipboard>
   */

  function MdInputClipboard() {
    return {
      restrict: "E",
      templateUrl: module.id + ".html",
      bindToController: true,
      controller: MdInputClipboardCtrl,
      controllerAs: "mdInputClipboard",
      scope: {
        ngModel: "=",
        ngValue: "&",
        mdToast: "@"
      }
    };
  }

  MdInputClipboardCtrl.$inject = ["$scope", "$element", "$attrs", "$injector"];
  function MdInputClipboardCtrl($scope, $element, $attrs, $injector) {
    var NOTIFICATION_DELAY = 1500;//ms

    var self = this;
    var $inject = $injector.get;
    var $mdTheming = $inject("$mdTheming");
    var $mdToast = $inject("$mdToast");
    var $mdListInkRipple = $inject("$mdListInkRipple");
    var $exceptionHandler = $inject("$exceptionHandler");
    var mdInputContainer = $element.controller("mdInputContainer");
    var containerElement = $element.find("div");//.md-input-clipboard__container

    this.placeholder = placeholder;
    this.disabled = disabled;
    this.onCopy = onCopy;
    this.onCopyError = onCopyError;
    this.viewValue = "";
    this.toast = null;

    //initialize
    $mdListInkRipple.attach($scope, containerElement/*, options*/);
    $mdTheming($element);
    if (!$attrs.tabindex) {
      $element.attr('tabindex', '-1');
    }

    function placeholder() {
      return $attrs.placeholder;
    }

    function disabled() {
      return "disabled" in $attrs;
    }

    function onCopy(text) {
      if (text) {
        if ($attrs.mdToast) {
          notify($attrs.mdToast);
        }
      }
    }

    function onCopyError(error) {
      $exceptionHandler(error);
    }

    function notify(text) {
      if (!self.toast) {
        self.toast = $mdToast
          .simple()
          .textContent(text)
          .hideDelay(NOTIFICATION_DELAY)
          .highlightAction(false)
          .position("bottom right");

        $mdToast
          .show(self.toast)
          .finally(function () {
            self.toast = null;
          });
      }
    }

    $scope.$watchGroup(
      [
        function () { return self.ngModel; },
        function () { return self.ngValue(); }
      ],
      function (dataNew) {
        self.viewValue = dataNew[1] || dataNew[0];
        if (mdInputContainer) {
          mdInputContainer.setHasValue(!!self.viewValue);
        }
      });
  }

  return angular
    .module(module.id, [ngMaterial.name, ngClipboard.name])

    .directive("mdInputClipboard", MdInputClipboard);
});