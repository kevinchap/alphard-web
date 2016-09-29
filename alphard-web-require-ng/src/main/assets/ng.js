define(['module', 'text', 'angular'], function (module, text, angular) {
	'use strict';

	var masterConfig = (module.config && module.config()) || {};
	var dependenciesRegex = /(?:.|[\r\n])*?define(?:.|[\r\n])*?\[((?:.|[\r\n])*?)\](?:.|[\r\n])*?function/;
	var cleanRegex = /(?:\/\/.*|\/\*(?:.|[\r\n])*?\*\/|'|"|\n|\r|\s)/g;
	var buildMap = {};

	function isFunction(f) {
		var getType = {};
		return f && getType.toString.call(f) === '[object Function]';
	}

	function isNgModule(o) {
		return o &&
			(typeof o === 'object') &&
			o.provider &&
			o.factory &&
			o.service &&
			o.value &&
			o.constant &&
			o.controller &&
			o.filter &&
			o.directive &&
			o.config &&
			o.run &&
			o.name;
	}

	function getNgModule(name) {

		try {
			return angular.module(name);
		} catch (e) {
			// does nothing
		}

	}

	/**
	 * Load js file
	 * @param {string} name
	 * @param {function} req
	 * @param {function} load
	 * @param {string} config
	 */
	var load = function (name, req, load, config) {

		var bootstrap = false;

		var index = name.indexOf('!bootstrap');
		if (index > -1) {
			bootstrap = true;
			name = name.substring(0, index);
		} else {
			bootstrap = masterConfig.bootstrap && masterConfig.bootstrap.indexOf(name) > -1;
		}

		text.get(req.toUrl(name + '.js'), function (content) {

			var match = dependenciesRegex.exec(content);
			var deps = match && match[1] && match[1].replace(cleanRegex, '').split(',') || [];

			if (config.isBuild) {

				buildMap[name] = {
					deps: deps,
					content: content
				};

				load();

			} else {

				req([name], function (ngModuleFactory) {

					if (isNgModule(ngModuleFactory)) {

						load(ngModuleFactory);

					} else if (typeof ngModuleFactory === "string" && getNgModule(ngModuleFactory)) {

						load(getNgModule(ngModuleFactory));

					} else {

						var factory = function () {
							console.warn('no factory defined for ng module ' + name + '!', ngModuleFactory);
							return function () {
							};
						};

						// TODO: REMOVE AFTER NG! REFACTOR
						if (ngModuleFactory && ngModuleFactory.deps) {
							deps = ngModuleFactory.deps;

							if (ngModuleFactory.init) {
								console.warn(name, 'refactor with inline dependencies!');
								factory = ngModuleFactory.init;
							} else {

							}
						} else if (isFunction(ngModuleFactory)) {
							factory = ngModuleFactory;
						}

						req(deps, function () {

							var ngModule;
							var ngDeps = [];
							var resDeps = []; // legacy

							for (var i = 0, l = arguments.length; i < l; i++) {

								var dep = arguments[i];

								if (isNgModule(dep)) {

									ngDeps.push(dep.name);

								} else if (deps[i] == 'module') { // TODO: REMOVE AFTER NG! REFACTOR

									resDeps.push(undefined);

								} else { // TODO: REMOVE AFTER NG! REFACTOR

									resDeps.push(dep);

								}

							}

							ngModule = angular.module(name, ngDeps);
							// TODO: REMOVE CONCAT AFTER NG! REFACTOR
							// ngModule = factory.apply(this, [ngModule]) || ngModule;
							ngModule = factory.apply(this, [ngModule].concat(resDeps)) || ngModule;

							load(ngModule);

							if (bootstrap) {

								angular
									.element(window.document)
									.ready(function () {
										angular.bootstrap(window.document, [ngModule.name]);
									});
							}

						});
					}
				});

			}
		});

	};

	/**
	 * Write the angular require module as it is.
	 * @param plugin the plugin name
	 * @param name the module name
	 * @param write the write callback
	 */
	var write = function (plugin, name, write) {

		if (name in buildMap) {

			write(buildMap[name]);

		}

	};

	return {
		load: load,
		write: write
	};
});
