define(['logger'], function (logger) {
  "use strict";
  return function (self, module) {
    var config = (module.config && module.config()) || {};

    var base = '';
    var separatorIndex = module.id.lastIndexOf('/');
    if (separatorIndex >= 0)
      base = module.id.substring(0, separatorIndex);

    var _logger = logger(self, module.id, config.logger || config.debug && 'debug' || 'info');

    _logger.debug('configuration: ', base, config);

    return {
      module: module,
      config: config,
      base: base,
      logger: _logger
    };
  };
});