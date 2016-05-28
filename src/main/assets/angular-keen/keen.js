define(["module", "angular", "../keen/keen"], function (module, angular, Keen) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};
  var $$minErr = angular.$$minErr;

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
    var $$name = "$keenFactory";
    var DEFAULT_KEY = "";
    var _clients = {};

    //public
    this.get = get;
    this.set = set;
    this.setDefault = setDefault;
    this.$get = $get;

    function $get() {


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
        return !!opt_settings ? set(clientId, opt_settings) : get(clientId);
      };
    }

    /**
     *
     * @param {string} clientId
     * @returns {boolean}
     */
    function has(clientId) {
      return _clients.hasOwnProperty(clientId);
    }

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
       * } settings
     */
    function set(clientId, settings) {
      clientId = clientId || DEFAULT_KEY;
      var returnValue;
      if (has(clientId)) {
        throw $$minErr($$name)('iid', "ClientId '{0}' is already taken!", clientId);
      }
      returnValue = _clients[clientId] = new Keen(settings || {});
      return returnValue;
    }

    function setDefault(settings) {
      return set(DEFAULT_KEY, settings);
    }

    /**
     * @param {string} clientId
     */
    function get(clientId) {
      clientId = clientId || DEFAULT_KEY;
      var returnValue =_clients[clientId];
      if (!returnValue) {
        throw $$minErr($$name)('iid', "ClientId '{0}' is does not exist!", clientId);
      }
      return returnValue;
    }
  }
});