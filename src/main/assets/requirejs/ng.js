/**
 * RequireJS ng! plugin
 *
 * Usage:
 *
 *  //
 *  define([], function () {
 *    return {
 *      dependencies: [ 'ngModule1', 'ngModule2' ],
 *      factory: function (ngModule) {
 *
 *      }
 *    };
 *  });
 *
 *  //is equivalent to angular.module(..., [ 'ngModule1', 'ngModule2' ])
 *
 */
/*global: window, define */
define(['module', 'angular'], function (module, angular) {
  'use strict';

  //RequireJS module config
  var moduleConfig = module.config ? module.config() : {};

  var ng;
  (function (ng) {

    /**
     * Plugin loading definition
     *
     * @param {string} name
     * @param {function} req
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, req, onLoad, config) {
      req([name], function (ngModuleDef) {
        if (isAngularModule(ngModuleDef)) {
          onLoad(ngModuleDef);
          return;
        }
        var dependencies = ngModuleDef.dependencies || [];
        var factory = ngModuleDef.factory || (function () {
          console.warn('no factory defined for ng module ' + name + '!');
          return function () {};
        }());
        var bootstrap = ngModuleDef.bootstrap || false;

        req(dependencies, function () {
          var ngModule;
          var resolvedDependencies = [];
          var angularDependencies = [];

          for (var i = 0, l = arguments.length; i < l; i++) {
            var resolvedDependency = arguments[i];
            resolvedDependencies.push(resolvedDependency);
            if (isAngularModule(resolvedDependency)) {
              angularDependencies.push(resolvedDependency.name);
            }
          }

          ngModule = angular.module(name, angularDependencies);
          ngModule = factory.apply(this, [ ngModule ].concat(resolvedDependencies)) || ngModule;
          onLoad(ngModule);
          if (bootstrap) {
            angular.bootstrap(document, [ ngModule.name ]);
          }
        });
      });
    }
    ng.load = load;

    /**
     * @param {string} name
     * @param {function} normalizeFn
     * @return {string}
     */
    /*
    function normalize(name, normalizeFn) {

    }
    ng.normalize = normalize;*/

    function isAngularModule(o) {
      return (
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
        o.name
      );
    }

  }(ng || (ng = {})));

  return ng;
});
