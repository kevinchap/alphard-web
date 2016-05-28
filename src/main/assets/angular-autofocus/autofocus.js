define(['module', 'angular'], function (module, angular) {
  'use strict';

  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug;

  //Deprecation warning
  console.warn("[" +  module.id + "] is deprecated use <tag md-autofocus></tag> instead");

  //Util
  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  //Autofocus is an existing HTML  attribute that conflicts
  debug("config", config);
  return angular
    .module(module.id, [])

  /**
   *
   * Usage:
   *
   * <tag ng-autofocus="isFocused"> </tag>
   *
   */
    .directive('ngAutofocus', ['$document', '$timeout', '$parse',
      function ($document, $timeout, $parse) {
        return {
          restrict: 'A',
          link: function ($scope, $element, $attrs) {

            //scope getter/setter
            var ngAutofocus = (function () {
              var getter = $parse($attrs.ngAutofocus);
              var setter = getter.assign;
              return {
                get: function () {
                  return getter($scope);
                },
                set: function (val) {
                  setter($scope, val);
                }
              };
            }());

            (function init() {
              //event handlers
              $element.bind('blur', onBlur);
              $element.bind('focus', onFocus);

              //Scope event handlers
              $scope.$on("$destroy", onDestroy);

              //watchers
              $scope.$watch(ngAutofocus.get, function (value) {
                if (value === true) {
                  $timeout(function () {
                    debug('focus on ', $element);
                    $element[0].focus();
                  }, 0, false);
                }
              });

              triggerFocusChange();
            }());

            function onDestroy($event) {
              $element.unbind('blur', onBlur);
              $element.unbind('focus', onFocus);
            }

            function onFocus($event) {
              debug('onFocus', $element);
              triggerFocusChange();
            }

            function onBlur($event) {
              debug('onBlur', $element);
              triggerFocusChange();
            }

            function triggerFocusChange() {
              if ($scope.$root.$$phase) {
                $scope.$evalAsync(onFocusChange);
              } else {
                $scope.$apply(onFocusChange);
              }
            }

            function onFocusChange() {
              ngAutofocus.set(isFocused());
            }

            function isFocused() {
              var activeElement = $document[0].activeElement;
              return activeElement && (activeElement === $element[0]);
            }

          }
        };
      }]);
});