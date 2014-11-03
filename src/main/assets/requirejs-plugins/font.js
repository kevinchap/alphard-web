/**
 * RequireJS font! plugin
 *
 * Usage:
 *
 *  //load font!provider,
 *  require(['font!google,families:[Tangerine,Cantarell:700]'], function (f) { ... });
 *
 */
/*global: define */
define(['module', 'css'], function (module, css) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * font module
   */
  var font = (function () {
    //example: font!google,families:[Tangerine,Cantarell,Yanone Kaffeesatz:700]
    var
    reParts   = /^([^,]+),([^\|]+)\|?/,
    reProps   = /([\w-]+)\s*:\s*(?:(\[[^\]]+\])|([^,]+)),?/g, //match "foo:bar" and "lorem:[ipsum,dolor]" capturing name as $1 and val as $2 or $3
    reArray   = /^\[([^\]]+)\]$/, //match "[foo,bar]" capturing "foo,bar";
    providers = {};


    function provider(name, impl) {
      if (arguments.length > 1) {
        providers[name] = impl;
        return font;
      } else {
        return providers[name];
      }
    }

    /**
     * @param {string} name
     * @param {function} normalizeFn
     * @return {string}
     */
    /*
    function normalize(name, normalizeFn) {

    }*/

    /**
     * @param {string} name
     * @param {function=} opt_callback
     * @param {function=} opt_errback
     */
    function get(name, opt_callback, opt_errback) {
      var data = _parseName(name);
      var providerc = 0;
      var providerName;

      function throwError(e) {
        if (opt_errback) {
          opt_errback(e);
        } else {
          setTimeout(function () {
            throw e;
          }, 0);
        }
      }

      function onFontLoad() {
        --providerc;
        if (providerc <= 0) {
          if (opt_callback) {
            opt_callback(null);
          }
        }
      }

      for (providerName in data) {
        if (providerName in providers) {
          ++providerc;
          providers[providerName].load(data[providerName], onFontLoad);
        } else {
          throwError(new Error(providerName + ' font provider not implemented'));
        }
      }

      if (!providerc) {
        if (opt_callback) {
          opt_callback(null);
        }
      }
    }

    /**
     * @param {string} name
     * @param {object} req
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, req, onLoad, config) {
      if (config.isBuild) {
        onLoad(null); //avoid errors on the optimizer
      } else {
        get(name, onLoad, onLoad.error);
      }
    }

    //util
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
          if (reArray.test(val)) {
            val = val.replace(reArray, '$1').split(',');
          } else if (!isNaN(val)) {
            //isNaN('') == false
            val = +val;
          }
      }
      return val;
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

    function _parseName(name) {
      var
      data    = {},
      vendors = name.split('|'),
      vendorc = vendors.length,
      match;

      while (vendorc--) {
        match = reParts.exec(vendors[vendorc]);
        data[ match[1] ] = _parseProperties(match[2]);
        data[ match[1] ].module = name;
      }
      return data;
    }

    //exports
    return {
      provider: provider,
      get: get,
      load: load
    };
  }());

  //init
  font.provider('google', {
    load: function load(data, opt_callback) {
      var
      families = data.families,
      familiec = families.length,
      url      = '',
      i = 0;

      //url += (location.protocol === "https:" ? "https:" : "http:");
      url += "//fonts.googleapis.com/css?";

      if (families) {
        url += "family=";
        while (i < familiec) {
          if (i !== 0) {
            url += "|";
          }
          url += families[i];
          ++i;
        }
      }

      _cssLoad(data.module, url, opt_callback);
    }
  });

  font.provider("font-awesome", {
    load: function load(data, opt_callback) {
      var url  = "";
      //url += (location.protocol === "https:" ? "https:" : "http:");
      url += "//netdna.bootstrapcdn.com/font-awesome";
      url += "/" + (data.version || '4.2.0');//version
      url += "/css/font-awesome.min.css";
      _cssLoad(data.module, css.normalize(url), opt_callback);
    }
  });

  function _cssLoad(name, url, opt_callback, opt_errback) {
    return css.get(require.toUrl(url), function (result) {
      //this.setAttribute("data-requiremodule", name);
      if (opt_callback) {
        opt_callback.apply(this, arguments);
      }
    }, opt_errback);
  }

  return font;
});
