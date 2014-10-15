/*global: window, define */
define(function () {
    'use strict';

    function _isAngularModule(o) {
        return (typeof o === 'object') &&
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

    return {
        load: function load(name, req, onLoad, config) {
            var angular = config.angular || 'angular';
            req([angular, name], function (angular, module) {
                if (_isAngularModule(module)) {
                    onLoad(module);
                    return;
                }
                var dependencies = module.dependencies || [];
                var factory = module.factory || (function () {
                    console.warn('no factory defined for ng module ' + name + '!');
                    return function () {
                    };
                }());
                var bootstrap = module.bootstrap || false;

                req(dependencies, function () {
                    var ngModule;
                    var resolvedDependencies = [];
                    var angularDependencies = [];

                    for (var i = 0, l = arguments.length; i < l; i++) {
                        var resolvedDependency = arguments[i];
                        resolvedDependencies.push(resolvedDependency);
                        if (_isAngularModule(resolvedDependency)) {
                            angularDependencies.push(resolvedDependency.name);
                        }
                    }

                    ngModule = angular.module(name, angularDependencies);
                    ngModule = factory.apply(this, [ ngModule ].concat(resolvedDependencies)) || ngModule;
                    onLoad(ngModule);
                    if (bootstrap) {
                        angular.bootstrap(document, [ ngModule.name ]);
                    }
                });
            });
        }
    };
});
