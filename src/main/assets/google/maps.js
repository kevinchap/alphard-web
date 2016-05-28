define([
  "goog!" + (function () {

    function forEach(o, f) {
      if (o) {
        for (var prop in o) {
          if (o.hasOwnProperty(prop)) {
            f(o[prop], prop);
          }
        }
      }
    }

    function peek(o, name, defaultValue) {
      var v = o[name] !== undefined ? o[name] : defaultValue;
      delete o[name];
      return v;
    }

    function merge(var_args) {
      var dest = {};
      for (var i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        if (o) {
          for (var prop in o) {
            if (o.hasOwnProperty(prop)) {
              dest[prop] = o[prop];
            }
          }
        }
      }
      return dest;
    }

    var moduleConfig = requirejs.s.contexts._.config.config["google/maps"] || {};
    moduleConfig = merge({
      china: false,
      version: '3.17',
      libraries: '',
      language: 'en',
      sensor: false
    }, moduleConfig);
    var version = peek(moduleConfig, "version", "3.17");
    var other_params = "";
    var first = true;
    forEach(moduleConfig, function (k, v) {
      if (v !== undefined && v !== '') {
        if (first) {
          first = false;
        } else {
          other_params += "&";
        }
        other_params += k + "=" + v;
      }
    });

    return [
      "maps",
      version,
      'other_params:' + other_params + ''
    ].join(",");
  }())
], function () {
  "use strict";

  return google.maps;
});