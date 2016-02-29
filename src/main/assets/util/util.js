define(['logger'], function (logger) {
  "use strict";

  return function (self, module) {
    var config = (module.config && module.config()) || {};
    var logger = logger(self, module.id, config.debug);

    debug('configuration: ', config);

    return {
      module: module,
      config: config,
      logger: logger
    };
  };
});