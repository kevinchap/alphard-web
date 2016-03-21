define(["depend!keen-js/keen[goog,google/visualization]"], function () {
  "use strict";
  var global = typeof window != "undefined" ? window : this;
  return global.Keen;
});