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

  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = moduleConfig.debug || false;
  var ANGULAR_NAME = moduleConfig.angular || 'angular';

  /**
   * ng module
   */
  var ng = (function () {

    /**
     *
     * @param {string} name
     * @param {function} parentRequire
     * @param {function} onLoad
     * @param {string} config
     */
    function load(name, parentRequire, onLoad, config) {
      parentRequire([ANGULAR_NAME, name], function (angular, moduleDefinition) {
        var percent = 0;

        function callback(result) {
          if (moduleDefinition.onload) {
            moduleDefinition.onload(result);
          }
          if (result) {
            onLoad(result);
          }
        }

        function errback(error) {
          if (error && onLoad.error) {
            onLoad.error(error);
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
          var deps = moduleDefinition.deps || [];
          var init = moduleDefinition.init || (function () {
            console.warn('no factory defined for ng module ' + name + '!');
            return function () { };
          }());
          var bootstrap = moduleDefinition.bootstrap || false;

          //add angular
          deps.push(ANGULAR_NAME);
          var depc = deps.length;

          //progress loader
          for (var i = 0; i < depc; ++i) {
            parentRequire([deps[i]], progressFn(1 / depc));
          }

          parentRequire(deps, function () {
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

              //callback
              callback(ngModule);
              if (bootstrap) {
                angular
                  .element(document)
                  .ready(function () {
                    angular.bootstrap(document, [ ngModule.name ]);
                  });
              }
            } catch (e) {
              errback(e);
            }

          });
        }
      });
    }

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

    //exports
    return {
      load: load
    };
  }());

  return ng;
});
