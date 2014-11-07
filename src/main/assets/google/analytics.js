/**
 * -GoogleAnalyticsObject: "ga"
 * -forceLoad: false
 */
define(['module'], function (module) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * ga module
   */
  var ga = (function () {
    //prepare ga
    var gaDebug = moduleConfig.debug;
    var gaLoaded = false;
    var gaName = window.GoogleAnalyticsObject ||
      (window.GoogleAnalyticsObject = moduleConfig.GoogleAnalyticsObject || 'ga');
    var gaPusher = window[gaName] || (window[gaName] = function () {
      _load();
      gaPusher.q.push(arguments);
    });
    gaPusher.q = gaPusher.q || [];
    //ga.l = ga.l || (new Date()).getTime();


    //force to load if asked to
    if (moduleConfig.forceLoad) {
      _load();
    }

    function _load() {
      if (!gaLoaded) {
        gaLoaded = true;
        var isSecured = 'https:' == window.location.protocol;
        var scriptElement = document.createElement('script');
        scriptElement.async = true;
        scriptElement.type = 'text/javascript';
        scriptElement.src =
          (isSecured ? 'https://ssl' : 'http://www') +
          '.google-analytics.com/' +
          (gaDebug ? 'analytics_debug' : 'analytics') +
          '.js';
        var parentElement = document.getElementsByTagName('head')[0];
        parentElement.appendChild(scriptElement);
      }
    }

    //exports
    return function ga() {
      return window[gaName].apply(window[gaName], arguments);
    };
  }());

  return ga;
});
