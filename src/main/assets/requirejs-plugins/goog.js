define(['async'], function (async) {

  /**
   * goog module
   *
   * Usage:
   * require(['goog!visualization,1,packages:[corechart,geochart]']);
   */
  var goog;
  (function (goog) {
    var reParts = /^([^,]+)(?:,([^,]+))?(?:,(.+))?/;
    var jsapi = 'async!' + (document.location.protocol === 'https:' ? 'https' : 'http') + '://www.google.com/jsapi';

    function _parseName(name) {
      var match = reParts.exec(name);
      var data = {
        moduleName: match[1],
        version: match[2] || '1',
        settings: _parseProperties(match[3])
      };
      return data;
    }

    /**
     * @param {string} name
     * @param {function} parentRequire
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, parentRequire, onLoad, config) {
      if (config.isBuild) {
        onLoad(null); //avoid errors on the optimizer
      } else {
        var data = _parseName(name);
        var settings = data.settings;
        settings.callback = onLoad;

        parentRequire([ jsapi ], function () {
          google.load(data.moduleName, data.version, settings);
        });
      }
    }
    goog.load = load;

    //util
    var _parseProperties = (function () {
      var reArray = /^\[([^\]]+)\]$/; //match "[foo,bar]" capturing "foo,bar";
      var reProps = /([\w-]+)\s*:\s*(?:(\[[^\]]+\])|([^,]+)),?/g; //match "foo:bar" and "lorem:[ipsum,dolor]" capturing name as $1 and val as $2 or $3

      function _typecastVal(val) {
        switch (val) {
          case 'null': return null;
          case 'false': return false;
          case 'true': return true;
          case '':
          case "''":
          case '""':
            return '';
          default:
            var typed = val;
            if (reArray.test(val)) {
              typed = val.replace(reArray, '$1').split(',');
            } else if (!isNaN(val)) {
              //isNaN('') == false
              typed = +val;
            }
            return typed;
        }
      }

      function _parseProperties(str) {
        var match, obj = {};
        while (true) {
          match = reProps.exec(str);
          if (match) {
            obj[ match[1] ] = _typecastVal(match[2] || match[3]);
          } else {
            break;
          }
        }
        return obj;
      }

      return _parseProperties;
    }());
    
  }(goog || (goog = {})));

  return goog;
});