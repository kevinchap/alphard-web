define(
[
  'module',
  'angular',
  'text!./spinner.html'
],
function (
  module,
  angular,
  spinnerHTML
) {
  'use strict';

  /**
   * <spinner>
   * </spinner>
   */
  return angular
    .module(module.id, [])
    .directive("spinner", function spinner() {
      return {
        restrict: 'E',
        replace: true,
        template: spinnerHTML
      };
    });
});
