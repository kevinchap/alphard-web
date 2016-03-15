define([
  "module",
  "angular",
  "./ngModelEquals",
  "./ngModelJson",
  "./ngModelPercent"
], function (
  module,
  angular,
  ngModelEquals,
  ngModelJson,
  ngModelPercent
) {
  "use strict";

  return angular
    .module(module.id, [
      ngModelEquals.name,
      ngModelJson.name,
      ngModelPercent.name
    ]);
});