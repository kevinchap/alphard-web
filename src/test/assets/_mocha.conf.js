// Setup requirejs to have the right base URL
global.requirejs = require("requirejs");
global.define = requirejs.define;
console.warn(global.requirejs);
requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname
});

requirejs(['./_allSpec']);
