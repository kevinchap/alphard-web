/* define window */
define(['module', 'text', 'nunjucks'], function (module, text, nunjucks) {
	'use strict';

	var masterConfig = module.config && module.config() || {};
	var ext = masterConfig.ext || '.njk';
	var precompiledExt = masterConfig.precompiledExt || ext + '.js';

	var templates = {};
	var precompiledTemplates = {};
	var environment = undefined;

	var njk = {};

	njk.environment = function () {

		if (!environment) {

			var precompiled = function (precompiledTemplatePath) {
				return window.nunjucksPrecompiled && window.nunjucksPrecompiled[precompiledTemplatePath];
			};

			var RequireLoader = nunjucks.Loader.extend({
				async: true,
				init: function () {

				},
				getSource: function (path, callback) {
					var precompiledTemplate = precompiled(path);
					if (precompiledTemplate) {
						callback(undefined, {
							src: {
								type: 'code',
								obj: precompiledTemplate
							},
							path: path
						});
					} else {
						require([path], function (template) {
							precompiledTemplate = precompiled(path);
							if (precompiledTemplate) {
								callback(undefined, {
									src: {
										type: 'code',
										obj: precompiledTemplate
									},
									path: path
								});
							} else {
								callback(undefined, {
									src: template,
									path: path,
									noCache: false
								});
							}
						}, function () {
							text.get(path, function (template) {
								callback(undefined, {
									src: template,
									path: path,
									noCache: false
								});
							}, function (error) {
								callback(error);
							});
						});
					}
				}
			});
			environment = new nunjucks.Environment(new RequireLoader());
		}

		return environment;
	};


	njk.load = function (name, req, load, config) {

		if (config.isBuild) {

			text.get(req.toUrl(name + precompiledExt), function (precompiledTemplate) {
				precompiledTemplates[name] = precompiledTemplate;
				load();
			}, function () {
				text.get(req.toUrl(name + ext), function (template) {
					templates[name] = template;
					load();
				});
			})

		} else {

			njk.environment().getTemplate(name + ext, true, function (err, tpl) {
				if (err) {
					throw err;
				} else {
					load(tpl);
				}
			});
		}

	};

	njk.write = function (plugin, name, write) {

		if (name in templates) {

			write.asModule(
				name + ext,
				'define(function() {' +
				'    return \'' + text.jsEscape(templates[name]) + '\';' +
				'});'
			);

		} else if (name in precompiledTemplates) {

			write.asModule(
				name + ext,
				'define(function() {' +
				'    ' + precompiledTemplates[name] + ';' +
				'});'
			);
		}

	};

	return njk;
});
