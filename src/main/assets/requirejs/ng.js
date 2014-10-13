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
/*global: window */
define(['module'], function (module) {

  var ng;
  (function (ng) {

    /**
     * Plugin definition
     *
     * @param {string} name
     * @param {function} req
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, req, onLoad, config) {
      var angularName = config.angularName || 'angular';

      req([angularName, name], function (angular, value) {
        var dependencies = value.dependencies || [];
        var factory = value.factory || function () {
          console.warn('no factory defined for ng module ' + name + '!');
        };
        var bootstrap = value.bootstrap || false;
        req(dependencies, function () {
          var resolvedDependencies = [];
          var angularDependencies = [];

          for (var i = 0, l = arguments.length; i < l; i++) {
            var resolvedDependency = arguments[i];
            resolvedDependencies.push(resolvedDependency);
            if (isAngularModule(resolvedDependency)) {
              angularDependencies.push(resolvedDependency.name);
            }
          }

          var ngModule = angular.module(name, angularDependencies);

          factory.apply(this, [ ngModule ].concat(resolvedDependencies));

          if (bootstrap) {
            angular.bootstrap(document, [ name ]);
          }
          onLoad(ngModule);
        });
      });
    }
    ng.load = load;


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
