/*global: window, define */
define([], function () {
  'use strict';
  return {
    load: function (name, req, onLoad, config) {
      var cnf = config.configuration || 'configuration';
      req([cnf], function (configuration) {
        var path = name.length > 0  ? name.replace('[', '.').replace('][', '.').replace(']', '').split('.') : '';
        var sub_configuration = configuration;
        for (var i = 0; i < path.length; i++) {
          var key = path[i];
          sub_configuration = sub_configuration[key];
          if (sub_configuration === undefined)
              throw 'invalid configuration path ' + name.replace(key, '<?' + key + '?>!');
        }
        onLoad(sub_configuration);
      });
    }
  };
});
