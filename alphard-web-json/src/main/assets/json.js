define(['module', 'text'], function (module, text) {
	'use strict';

	var config = module.config && module.config() || {};
	var ext = config.ext || '.json';
	var buildMap = {};

	return {
		load: function (name, req, onLoad, config) {
			text.get(
				req.toUrl(name + ext),
				function (rawJson) {
					if (config.isBuild) {
						buildMap[name] = rawJson;
					}
					onLoad(JSON.parse(rawJson));
				},
				function (error) {
					console.error(error);
				}
			);
		},
		write: function (plugin, name, write) {
			if (buildMap.hasOwnProperty(name)) {
				var content = buildMap[name];
				write.asModule(
					plugin + '!' + name,
					'define(function () { return ' + content + ';});\n'
				);
			}
		}
	};

});
