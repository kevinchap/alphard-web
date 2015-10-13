define([
  "goog!" + (function () {
    var moduleConfig = requirejs.s.contexts._.config.config["google/visualization"] || {};

    return [
      "visualization",
      moduleConfig.version || "1.1",
      moduleConfig.settings || 'packages:[corechart,geochart,table]'
    ].join(",");
  }())
], function () {
  return google.visualization;
});