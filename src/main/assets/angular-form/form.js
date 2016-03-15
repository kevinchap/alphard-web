define([
  "module",
  "angular",
  "./ngModelEquals",
  "./ngModelJson",
  "./ngModelPercent"
], function (
  module,
  angular
) {
  "use strict";

  return angular
    .module(module.id, [].slice.call(arguments, 2)
      .map(function (arg) { return arg.name; })
      .filter(function (name) { return !!name; })
    );
});