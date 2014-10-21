/**
 * RequireJS ng! plugin
 *
 * Usage:
 *
 *  define([], function () {
 *    return {
 *      bootstrap: true|false, //optional
 *      deps: [ 'ng!mod1', 'ng!mod2', 'jsmod' ],
 *      init: function (ngModule) {
 *        //ngModule is the generated module with mod1 and mod2 dependencies
 *      },
 *      onprogress: function (percent) {  },//optional
 *      onload: function (ngModule) { }//optional
 *    };
 *  });
 *
 */
/*global: window, define */
define(['module'], function (module) {
  'use strict';

  var angularName = module.config().angular || 'angular';

  /**
   * ng module
   */
  var ng;
  (function (ng) {

    function load(name, req, onLoad, config) {
      req([angularName, name], function (angular, moduleDefinition) {
        ng.get(moduleDefinition, onLoad, onLoad.error, req);
      });
    }
    ng.load = load;

    function get(moduleDefinition, opt_callback, opt_errback, opt_req) {
      var percent = 0;

      function callback(result) {
        if (moduleDefinition.onload) {
          moduleDefinition.onload(result);
        }
        if (result && opt_callback) {
          opt_callback(result);
        }
      }

      function errback(error) {
        if (error && opt_errback) {
          opt_errback(error);
        } else {
          throw error;
        }
      }

      function progressFn(inc) {
        return function () {
          percent += inc;
          if (moduleDefinition.onprogress) {
            moduleDefinition.onprogress(percent);
          }
        };
      }

      if (_isAngularModule(moduleDefinition)) {
        progressFn(1)();
        callback(moduleDefinition);
      } else {
        var req = (opt_req || require);
        var deps = moduleDefinition.deps || [];
        var init = moduleDefinition.init || (function () {
          console.warn('no factory defined for ng module ' + name + '!');
          return function () { };
        }());
        var bootstrap = moduleDefinition.bootstrap || false;

        //add angular
        deps.push(angularName);
        var depc = deps.length;

        //progress loader
        for (var i = 0; i < depc; ++i) {
          req([deps[i]], progressFn(1 / depc));
        }

        req(deps, function () {
          var ngModule;
          var resolvedDependencies = [];
          var angularDependencies = [];

          for (var i = 0, l = arguments.length; i < l; i++) {
            var resolvedDependency = arguments[i];
            if (_isAngularModule(resolvedDependency)) {
              angularDependencies.push(resolvedDependency.name);
            } else if (deps[i] == 'module') {
              console.warn('module is not allowed in deps!');
              resolvedDependencies.push(undefined);
            } else {
              resolvedDependencies.push(resolvedDependency);
            }
          }

          try {
            ngModule = angular.module(name, angularDependencies);
            ngModule = init.apply(this, [ ngModule ].concat(resolvedDependencies)) || ngModule;

            if (bootstrap) {
              angular.bootstrap(document, [ ngModule.name ]);
            }

            callback(ngModule);
          } catch (e) {
            errback(e);
          }

        });
      }
    }
    ng.get = get;

    function _isAngularModule(o) {
      return o &&
        (typeof o === 'object') &&
        o.provider &&
        o.factory &&
        o.service &&
        o.value &&
        o.constant &&
        o.animation &&
        o.controller &&
        o.filter &&
        o.directive &&
        o.config &&
        o.run &&
        o.name;
    }

  }(ng || (ng = {})));

  return ng;
});
