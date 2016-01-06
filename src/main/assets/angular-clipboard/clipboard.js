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

  return angular
    .module(module.id, [])

    .provider("$clipboard", function () {
      this.$get = [function () {
        return clipboard;
      }];
    })

    /**
     * Usage:
     *
     * <button ng-click-copy="expr"
     *         [ng-copy="fn($text)"]
     *         [ng-copy-error="fn($error)"]>
     * </button>
     */
    .directive("ngClickCopy", ["$clipboard", "$exceptionHandler", "$parse", function ($clipboard, $exceptionHandler, $parse) {

      return {
        restrict: 'A',
        compile: function ($element, $attrs) {
          var ngClickCopy = $parse($attrs.ngClickCopy, /* interceptorFn */ null, /* expensiveChecks */ true);
          var ngCopy = $parse($attrs.ngCopy, null, true);
          var ngCopyError = $attrs.ngCopyError ? $parse($attrs.ngCopyError, null, true) : function (locals) {
            $exceptionHandler(locals && locals.$error);
          };
          return function ngEventHandler($scope, $element) {
            $element.on('click', function ($event) {
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
            });
          };
        }
      };
    }]);
});

