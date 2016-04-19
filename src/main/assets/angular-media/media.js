define(["module", "angular", "./events", "./video"], function (module, angular) {
  "use strict";

  /**
   * @usage
   *
   */
  return angular
    .module(module.id, [].slice.call(arguments, 2)
      .map(function (arg) { return arg.name; })
      .filter(function (name) { return !!name; })
    );
});