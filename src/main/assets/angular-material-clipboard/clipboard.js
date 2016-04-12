define(["module", "angular", "angular-material", "angular-clipboard"], function (module, angular, ngMaterial, ngClipboard) {
  "use strict";

  /**
   * Module
   */
  var ngModule = angular
    .module(module.id, [ngMaterial.name, ngClipboard.name])
    .directive("mdInputClipboard", MdInputClipboardDirective);

  /**
   *
   * @usage
   * <md-input-clipboard [ng-model="..."]
   *                     [ng-value="fn()"]
   *                     [md-copy="fn($text)]
   *                     [md-copy-error="fn($error)]
   *                     [md-toast="..."]
   *                     [ng-disabled="..."]
   *                     [disabled]
   *                     [ng-readonly="..."]
   *                     [readonly]>
   * </md-input-clipboard>
   */

  function MdInputClipboardDirective() {
    return {
      restrict: "E",
      templateUrl: module.id + ".html",
      bindToController: true,
      controller: MdInputClipboardCtrl,
      controllerAs: "mdInputClipboard",
      scope: {
        ngReadonly: "&",
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
    var $timeout = $inject("$timeout");
    var $mdTheming = $inject("$mdTheming");
    var $mdToast = $inject("$mdToast");
    var $mdListInkRipple = $inject("$mdListInkRipple");
    var $exceptionHandler = $inject("$exceptionHandler");
    var mdInputContainer = $element.controller("mdInputContainer");
    var containerElement = $element.find("div");//.md-input-clipboard__container
    var _notificationCount = 0;

    this.placeholder = placeholder;
    this.disabled = disabled;
    this.tooltip = tooltip;
    this.onCopy = onCopy;
    this.onCopyError = onCopyError;
    this.viewValue = "";
    this.toast = null;
    this.isNotifying = isNotifying;

    //initialize
    function initialize() {
      $mdListInkRipple.attach($scope, containerElement/*, options*/);
      $mdTheming($element);
      $element
        .addClass("md-input-clipboard")
        .bind("focus", onFocus)
        .bind("blur", onBlur);

      //Init focus state
      if (!$attrs.tabindex) {
        $attrs.$set("tabindex", "0");
      }

      //Configure Container
      //Create error spacer
      if (mdInputContainer) {
        var errorsSpacerElement = angular.element('<div class="md-errors-spacer">');
        // element.after appending the div before the icon (if exist) which cause a problem with calculating which class to apply
        $element.parent().append(errorsSpacerElement);
      }
    }
    initialize();


    function placeholder() {
      return $attrs.placeholder;
    }

    function tooltip() {
      return $translate("md_input_clipboard_tooltip");
    }

    function readonly() {
      return disabled() || (("readonly" in $attrs) && $attrs.readonly !== false) || self.ngReadonly();
    }

    function disabled() {
      return ("disabled" in $attrs) && $attrs.disabled !== false;
    }

    function focused(opt_val) {
      if (mdInputContainer) {
        mdInputContainer.setFocused(opt_val);
      }
    }

    function onFocus($event) {
      focused(true);
    }

    function onBlur($event) {
      focused(false);
    }

    function onCopy(text) {
      notifyIcon();

      //if (self.mdCopy) {
      self.mdCopy({
        $text: text
      });
      //}

      if (text) {
        var hasToast = "mdToast" in $attrs;
        var textToast = $attrs.mdToast || $translate("md_input_clipboard_toast");
        if (hasToast) {
          notifyToast(textToast);
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

    function isNotifying() {
      return _notificationCount > 0;
    }

    function notifyIcon() {
      _notificationCount++;
      $timeout(function () {
        _notificationCount--;
      }, NOTIFICATION_DELAY);
    }

    function notifyToast(text) {
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