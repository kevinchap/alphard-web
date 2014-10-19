/*global: window, define */
define(['module'], function (plugin) {
    'use strict';

    var angular = plugin.config().angular || 'angular';

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
            req([angular, name], function (angular, module) {
                if (_isAngularModule(module)) {
                    onLoad(module);
                    return;
                }
                var deps = module.deps || [];
                var init = module.init || (function () {
                    console.warn('no factory defined for ng module ' + name + '!');
                    return function () {
                    };
                }());
                var bootstrap = module.bootstrap || false;

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

                    ngModule = angular.module(name, angularDependencies);
                    ngModule = init.apply(this, [ ngModule ].concat(resolvedDependencies)) || ngModule;
                    onLoad(ngModule);
                    if (bootstrap) {
                        angular.bootstrap(document, [ ngModule.name ]);
                    }
                });
            });
        }
    };
});
