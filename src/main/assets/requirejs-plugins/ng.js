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
        ng.get(moduleDefinition, onLoad, onLoad.error);
      });
    }
    ng.load = load;

    function get(moduleDefinition, opt_callback, opt_errback) {
      function callback(result) {
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

      if (_isAngularModule(moduleDefinition)) {
        callback(moduleDefinition);
      } else {
        var deps = moduleDefinition.deps || [];
        var init = moduleDefinition.init || (function () {
          console.warn('no factory defined for ng module ' + name + '!');
          return function () { };
        }());
        var bootstrap = moduleDefinition.bootstrap || false;

        //add angular
        deps.push(angularName);

        require(deps, function () {
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
