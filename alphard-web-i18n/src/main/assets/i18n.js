define(['module', 'text'], function (module, text) {
	'use strict';

	var config = module.config && module.config() || {};
	var ext = config.ext || '.i18n';
	var locale = config.locale || 'en-US';
	var pattern = config.pattern || '{module}.{locale}{ext}';
	var translations = {};
	var buildMap = {};

	/**
	 * Translates a key.
	 *
	 * The methods first looks up into the current locale parts.
	 * If no translations are found, it returns the opt_value.
	 *
	 * @param key the key (mandatory)
	 * @param opt_value the default value if no translations are found.
	 * @returns {*}
	 */
	var i18n = function (key, opt_value) {
		return translations[locale] && translations[locale][key] ||
			opt_value ||
			key;
	};

	/**
	 * Get or set locale.
	 * @param opt_locale the locale to set
	 * @returns {i18n.locale|*|string}
	 */
	i18n.locale = function (opt_locale) {
		if (arguments.length > 0) {
			locale = opt_locale;
		} else {
			return locale;
		}
	};

	/**
	 * Get or add segments.
	 * @param locale the locale.
	 * @param opt_segments the segments as a js object made of key, value pairs.
	 * @returns {*}
	 */
	i18n.segments = function (locale, opt_segments) {
		if (arguments.length > 1) {
			translations[locale] = translations[locale] || {};
			for (var key in opt_segments) {
				if (opt_segments.hasOwnProperty(key)) {
					translations[locale][key] = opt_segments[key];
				}
			}
		} else {
			return translations[locale];
		}
	};

	// TODO: use a cache to prevent loading files already loaded ...
	i18n.load = function (name, req, onLoad, config) {
		var loc = locale;
		var res = req.toUrl(pattern.replace('{module}', name).replace('{locale}', loc).replace('{ext}', ext));
		text.get(
			res,
			function (rawJson) {
				if (config.isBuild) {
					buildMap[name] = rawJson;
				}
				i18n.segments(loc, JSON.parse(rawJson));
				onLoad(i18n);
			},
			function (error) {
				console.error(error);
			});
	};

	// TODO: define in the configuration which locale should be embed
	i18n.write = function (plugin, name, write) {
		if (name in buildMap) {
			var content = buildMap[name];
			if (content.length == 0)
				content = '{}';
			write.asModule(plugin + '!' + name,
				'define(\'i18n\', function (i18n) { ' +
				'  i18n.segments(i18n.locale(), ' + content + ');' +
				'  return i18n; ' +
				'});');
		}
	};

	return i18n;

});
