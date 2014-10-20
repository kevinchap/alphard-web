define(['module', 'ng', 'bootloader/bootloader'], function (module, ng) {
  'use strict';

  /**
   * ngboot module
   */
  var ngboot;
  (function (ngboot) {

    function load(name, req, onLoad, config) {
      req(['angular', name], function (angular, moduleDefinition) {
        var deps = moduleDefinition.deps || [];
        var depc = deps.length;

        bootloader.setDisabled(false);
console.warn(moduleDefinition);
        function loader() {
          return function () {
            bootloader.incrementValue(1 / depc);
console.warn(bootloader.getValue(), depc);
          };
        }

        for (var i = 0; i < depc; ++i) {
          req([deps[i]], loader());
        }
        ng.get(moduleDefinition, function (result) {
          bootloader
            .setValue(1)
            .setDisabled(true);
          onLoad(result);
        }, onLoad.error);
      });
    }
    ngboot.load = load;

  }(ngboot || (ngboot = {})));

  return ngboot;
});
