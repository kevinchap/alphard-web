define(function () {

  /**
   * depend module
   *
   * Usage:
   *   depend!bar[jquery,lib/foo]
   */
  var depend;
  (function (depend) {
    var reParts = /^(.*)\[([^\]]*)\]$/;

    function parseName(s) {
      var parts = reParts.exec(s);
      var parts_2 = parts[2].split(',');
      var deps = [];
      for (var i = 0, l = parts_2.length; i < l; i++) {
        deps.push(parts_2[i].trim());
      }
      return {
        module: parts[1],
        dependencies: deps
      };
    }

    /**
     * Plugin loading definition
     *
     * @param {string} name
     * @param {function} parentRequire
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, parentRequire, onLoad, config) {
      var parsed = parseName(name);

      parentRequire(parsed.dependencies, function () {
        parentRequire([parsed.module], function (mod) {
          onLoad(mod);
        });
      });
    }

    depend.load = load;

  }(depend || (depend = {})));

  return depend;
});