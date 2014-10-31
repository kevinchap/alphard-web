// Setup requirejs to have the right base URL
global.requirejs = require("requirejs");

requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname
});

//global.assert = require("assert");
