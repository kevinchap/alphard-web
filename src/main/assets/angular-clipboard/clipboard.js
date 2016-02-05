define(["module", "angular", "dom/clipboard"], function (module, angular, clipboard) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};

  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      return console.debug.apply(console, args);
    }
  }

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [])
    .provider("$clipboard", ClipboardProvider)
    .directive("ngClickCopy", NgClickCopy);

  /**
   * $clipboard provider
   *
   * @constructor
   */
  function ClipboardProvider() {
    this.$get = [function () {
      return clipboard;
    }];
  }


  /**
   * Directive
   *
   * @usage
   *
   * <button ng-click-copy="expr"
   *         [ng-copy="fn($text)"]
   *         [ng-copy-error="fn($error)"]>
   * </button>
   */
  NgClickCopy.$directive = "ngClickCopy";
  NgClickCopy.$inject = ["$clipboard", "$exceptionHandler", "$parse"];
  function NgClickCopy($clipboard, $exceptionHandler, $parse) {
    return {
      restrict: "A",
      compile: function ($element, $attrs) {
        var ngClickCopy = $parse($attrs[NgClickCopy.$directive], /* interceptorFn */ null, /* expensiveChecks */ true);
        var ngCopy = $parse($attrs.ngCopy, null, true);
        var ngCopyError = $attrs.ngCopyError ? $parse($attrs.ngCopyError, null, true) : function (locals) {
          $exceptionHandler(locals && locals.$error);
        };
        return function ngEventHandler($scope, $element) {

          function onClick($event) {
            debug("Click event", $event);

            var text = ngClickCopy($scope, {  });
            var callback = function () {
              ngCopy($scope, { $text: text });
            };
            debug(text, "sending to clipboard");
            try {
              //copy text in clipboard
              $clipboard.copyText(text);
              debug(text, "OK");
              if ($scope.$root.$$phase) {
                $scope.$evalAsync(callback);
              } else {
                $scope.$apply(callback);
              }
            } catch (err) {
              debug(text, "Error:", err);
              ngCopyError({ $error: err });
            }
          }

          function onDestroy() {
            $element.unbind('click', onClick);
          }

          $element.bind('click', onClick);
          $scope.$on("$destroy", onDestroy);
        };
      }
    };
  }

  return ngModule;
});

