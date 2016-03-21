define(["module", "angular", "../keen/keen"], function (module, angular, Keen) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};

  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", moduleConfig);

  return angular
    .module(module.id, [])

    .value("$keenConstant", $keenConstant())

    /**
     * @usage
     */
    .provider("$keen", $keenProvider)

    /**
     * @usage
     *
     *  var keenClient = $keenFactory("", {
     *    projectId: ...,
     *    writeKey: ...,
     *    readKey: ...,
     *    masterKey: ...,
     *    requestType: ...,
     *    host: ...,
     *    protocol: ...,
     *    globalProperties: ...
     *  })
     */
    .provider("$keenFactory", $keenFactoryProvider);

  function $keenConstant() {
    return {
      INTERVAL: {
        MINUTELY: "minutely",
        HOURLY: "hourly",
        DAILY: "daily",
        WEEKLY: "weekly",
        MONTHLY: "monthly",
        YEARLY: "yearly"
      },
      REFERENCE: {
        PREVIOUS: "previous",
        THIS: "this"
      },
      UNIT: {
        MINUTES: "minutes",
        HOURS: "hours",
        DAYS: "days",
        MONTHS: "months",
        YEARS: "years"
      }
    };
  }

  function $keenProvider() {
    this.$get = $get;

    function $get() {
      return Keen;
    }
  }

  function $keenFactoryProvider() {
    var DEFAULT_KEY = "";

    this.$get = $get;

    function $get() {
      var clients = {};

      /**
       * @param {string} clientId
       * @param {
       * {
       *   projectId: string,
       *   masterKey: string,
       *   readKey: string,
       *   writeKey: string,
       *   requestType: string,
       *   host: string,
       *   protocol: string,
       *   globalProperties: {}
       * }
       * } opt_settings
       */
      return function $keenFactory(clientId, opt_settings) {
        clientId = clientId || DEFAULT_KEY;

        var doCreate = !!opt_settings;
        if (doCreate) {
          if (clients.hasOwnProperty(clientId)) {
            throw new Error();
            //throw minErr('$cacheFactory')('iid', "CacheId '{0}' is already taken!", cacheId);
          }
          clients[clientId] = new Keen(opt_settings || {});
        }
        return clients[clientId];
      };
    }
  }
});