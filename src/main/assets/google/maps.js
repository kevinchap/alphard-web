define([
  "async!" + (function () {
    function forEach(o, f) {
      if (o) {
        for (var prop in o) {
          if (o.hasOwnProperty(prop)) {
            f(o[prop], prop);
          }
        }
      }
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

    function peek(o, name, defaultValue) {
      var v = o[name] !== undefined ? o[name] : defaultValue;
      delete o[name];
      return v;
    }

    var config = requirejs.s.contexts._.config.config;
    var options = merge({
      china: false,
      v: '3.17',
      libraries: '',
      language: 'en',
      sensor: false
    }, config["google/maps"]);

    var url = peek(options, 'china') ?
      "http://maps.google.cn/maps/api/js" :
      "https://maps.googleapis.com/maps/api/js";
    url += "?";
    var first = true;
    forEach(options, function (k, v) {
      if (v !== undefined && v !== '') {
        if (first) {
          first = false;
        } else {
          url += "&";
        }
        url += k + "=" + v;
      }
    });
    return url;
  }())
], function () {
  "use strict";

  return window.google.maps;
});