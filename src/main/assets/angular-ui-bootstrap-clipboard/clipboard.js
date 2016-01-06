define(["module", "angular", "angular-clipboard"], function (module, angular, ngClipboard) {
  "use strict";

  return angular
    .module(module.id, [ngClipboard.name])

    .directive("uibClipboard", function () {
      return {
        replace: true,
        priority: 0,
        template:
        '<button ' +
          'class="btn btn-default" ' +
          'tooltip="{{tooltip}}" ' +
          'ng-click-copy="uibClipboard()" ' +
          'ng-copy="onCopy($text);" ' +
          'ng-copy-error="onCopyError($error);" ' +
          'ng-mouseenter="tooltip = tooltipHint;">' +
          '<i class="fa fa-clipboard"></i>' +
        '</button>',
        scope: {
          uibClipboard: "&"
        },
        link: function ($scope) {
          $scope.tooltipHint = 'Copy to clipboard';//TODO translate
          $scope.tooltipOK = 'Copied!';
          $scope.tooltip = $scope.tooltipHint;

          $scope.onCopy = function ($text) {
            $scope.tooltip = $scope.tooltipOK;
          };
          $scope.onCopyError = function ($error) {
            //$scope.ngCopyError({$error: $error});
          };
        }
      };
    });
});