/**
 * RequireJS css! plugin
 *
 * Usage:
 *
 *  //json as text then parsed using JSON.parse
 *  require(['css!mymodule'], function (linkElement) { ... });
 *
 */
/*global: window, define */
define(['module'], function (module) {
	'use strict';

	console.log("NEW CSS");

	//RequireJS module config
	var moduleConfig = (module.config && module.config()) || {};
	var DEBUG = !!moduleConfig.debug;

	// Util
	function debug(var_args) {
		if (DEBUG) {
			var args = ['[' + module.id + ']'];
			for (var i = 0, l = arguments.length; i < l; i++) {
				args.push(arguments[i]);
			}
			return console.debug.apply(console, args);
		}
	}

	debug("config", moduleConfig);

	var CSSLoader = (function (_super) {
		var __formatMessage = function (url, state) {
			return "GET " + url + " (" + state + ")";
		};
		var __global = window;
		var __doc = __global.document;
		var __head = __doc.getElementsByTagName('head')[0] || __doc.documentElement;
		var __linkElement = __doc.createElement("link");
		var UA = navigator.userAgent.toLowerCase();
		var
			isIE = false,
			isFF = false,
			isOP = false,
			isSafari = false,
			isChrome = false;

		if (UA.indexOf("firefox") >= 0) {
			isFF = true;
		} else if (UA.indexOf("opera") >= 0) {
			isOP = true;
		} else if (UA.indexOf("msie") >= 0) {
			isIE = true;
		} else if (UA.indexOf("chrom") >= 0) {
			isChrome = true;
		} else if (UA.indexOf("safari") >= 0) {
			isSafari = true;
		}

		var hasLinkOnLoad = isIE || isOP || isChrome || (/*!isSafari && */('onload' in __linkElement));

		var supportWarn = _once(function () {
			_warn("<link/> does not support 'onload' event. Image loader enabled");
		});

		function CSSLoader() {
			var self = this;
			if (self instanceof CSSLoader) {
				_super.call(self);
			} else {
				return new CSSLoader();
			}
		}

		CSSLoader.prototype.load = function (url, opt_callback, opt_errback) {
			return _domLoadCSS(url, opt_callback, opt_errback);
		};

		CSSLoader.prototype.normalize = function normalize(name) {
			if (name.slice(-4) !== ".css") {
				name += ".css";
			}
			return name;
		};

		function _domInsert(element, opt_parent) {
			(opt_parent || __head).appendChild(element);
		}

		function _domRemove(element) {
			if (element && element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}

		function _domLoadCSS(href, opt_callback, opt_errback) {
			var message = __formatMessage(href, "Loading");

			debug(message + " Start");
			var link, img;//hack loader
			var onload = _once(function (imageLoader) {
				debug(message + " Success" + (imageLoader ? " <img>" : ""));
				_domRemove(img);
				if (opt_callback) {
					opt_callback.call(link, null, true);
				}
			});
			var onerror = _once(function (imageLoader) {
				var errorMessage = message + " Failed" + (imageLoader ? " <img>" : "");
				debug(errorMessage);
				_domRemove(img);
				var error = new Error(errorMessage);
				if (opt_errback) {
					opt_errback.call(link, error, null);
				} else {
					throw error;
				}
			});

			link = _createLink(href,
				function () {
					onload(false);
				},
				function () {
					onerror(false);
				}
			);
			_domInsert(link);

			//image loader is a fallback
			if (!hasLinkOnLoad) {
				img = _createImg(href,
					function () {
						onload(true);
					},
					function () {
						onerror(true);
					}
				);
				//_domInsert(img);
				supportWarn();//warn once
			}
			return link;
		}

		function _createLink(url, onload, onerror) {
			var link = __doc.createElement('link');
			link.rel = 'stylesheet';
			link.href = url;
			link.onload = onload;
			link.onerror = onerror;
			link.onreadystatechange = function () {
				var state = link.readyState;
				if (state === 'loaded' || state === 'complete') {
					link.onload.call(link);
				}
			};
			return link;
		}

		function _createImg(url, onload, onerror) {
			var img = new Image();
			img.onload = onload;
			img.onerror = onerror;
			img.src = url;
			return img;
		}

		function _warn(message) {
			if (typeof console !== "undefined") {
				console.warn(message);
			}
		}

		function _once(fn) {
			var done = false, result;
			return function () {
				if (!done) {
					done = true;
					result = fn.apply(this, arguments);
				}
				return result;
			};
		}

		return CSSLoader;
	}(Object));


	/**
	 * css module
	 */
	var css = (function () {
		var loader = new CSSLoader();
		var ATTR = 'data-requirecss';

		/**
		 * @param {string} name
		 * @param {function(name: string): string} normalizeFn
		 * @return {string}
		 */
		function normalize(name, normalizeFn) {
			return loader.normalize(name);
		}

		/**
		 * @param {string} url
		 * @param {function=} opt_callback
		 * @param {function=} opt_errback
		 */
		function get(url, opt_callback, opt_errback) {
			return loader.load(url, opt_callback, opt_errback);
		}

		/**
		 * @param {string} name
		 * @param {function} parentRequire
		 * @param {function} onLoad
		 * @param {object} config
		 */
		function load(name, parentRequire, onLoad, config) {
			if (_isIncluded(name)) {
				onLoad();
			} else {
				var url = parentRequire.toUrl(normalize(name));
				var link = get(url, onLoad, onLoad.error);
				link.setAttribute(ATTR, name);
			}
		}

		function _isIncluded(name) {
			var links = document.getElementsByTagName('link');
			for (var i = 0, l = links.length; i < l; ++i) {
				if (links[i].getAttribute(ATTR) === name) {
					return true;
				}
			}
			return false;
		}

		//exports
		return {
			normalize: normalize,
			get: get,
			load: load
		};
	}());

	return css;
});
