define(["module", "angular", "angular-material", "angular-clipboard"], function (module, angular, ngMaterial, ngClipboard) {
  "use strict";

  /**
   * Module
   */
  var ngModule = angular
    .module(module.id, [ngMaterial.name, ngClipboard.name])
    .directive("mdInputClipboard", MdInputClipboard);

  /**
   *
   * @usage
   * <md-input-clipboard [ng-model="..."]
   *                     [ng-value="fn()"]
   *                     [md-copy="fn($text)]
   *                     [md-copy-error="fn($error)]
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
        mdCopy: "&",
        mdCopyError: "&",
        mdToast: "@"
      }
    };
  }

  MdInputClipboardCtrl.$inject = ["$scope", "$element", "$attrs", "$injector"];
  function MdInputClipboardCtrl($scope, $element, $attrs, $injector) {
    var NOTIFICATION_DELAY = 1500;//ms

    var self = this;
    var $inject = $injector.get;
    var $translate = $mdInputClipboardI18n($injector);
    var $mdTheming = $inject("$mdTheming");
    var $mdToast = $inject("$mdToast");
    var $mdListInkRipple = $inject("$mdListInkRipple");
    var $exceptionHandler = $inject("$exceptionHandler");
    var mdInputContainer = $element.controller("mdInputContainer");
    var containerElement = $element.find("div");//.md-input-clipboard__container

    this.placeholder = placeholder;
    this.disabled = disabled;
    this.tooltip = tooltip;
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

    function tooltip() {
      return $translate("md_input_clipboard_tooltip");
    }

    function disabled() {
      return "disabled" in $attrs;
    }

    function onCopy(text) {
      //if (self.mdCopy) {
      self.mdCopy({
        $text: text
      });
      //}

      if (text) {
        var hasToast = "mdToast" in $attrs;
        var textToast = $attrs.mdToast || $translate("md_input_clipboard_toast");
        if (hasToast) {
          notify(textToast);
        }
      }
    }

    function onCopyError(error) {
      if (!self.mdCopyError({
        $error: error
      })) {
        $exceptionHandler(error);
      }
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



  function $mdInputClipboardI18n($injector) {
    //Simple translation (only one key)
    var TRANSLATIONS = {
      "en_US": {
        "md_input_clipboard_tooltip": "Copy",
        "md_input_clipboard_toast": "Copied to clipboard!"
      },
      "fr_FR": {
        "md_input_clipboard_tooltip": "Copier",
        "md_input_clipboard_toast": "Copié dans le presse-papier!"
      }
    };
    var $locale = $injector.has("$translate") ? $injector.get("$translate").use : function (key) {
      return "en_US";
    };
    return function (key) {
      return ((TRANSLATIONS[$locale()] || TRANSLATIONS.en_US)[key]) || key;
    };
  }

  return ngModule;
});