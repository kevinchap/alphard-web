define([], function () {
  "use strict";

  /**
   * style module
   */
  var style = (function (_exports) {
    var testElement = document.createElement("div");
    var hasCurrentStyle = !!testElement.currentStyle;
    var hooks = [];
    var hooksCache = {};
    var isElement = function (o) { return o && o.nodeType == 1/*ELEMENT*/; };

    /**
     * @param {HTMLElement} element
     * @return {CssStyle}
     */
    var computed = hasCurrentStyle ?
      function (element) {
        return isElement(element) ? element.currentStyle : null;
      } :
      function (element) {
        return isElement(element) ?
          element.ownerDocument.defaultView.getComputedStyle(element, null) : null;
      };

    /**
     * @param {*} val
     * @return {number}
     */
    function px(val) {
      return parseFloat(val) || 0;
    }

    /**
     * @param {HTMLElement} element
     * @param {string} name
     * @return {number}
     */
    function get(element, name) {
      name = _camelCase(name);
      var result, hook = _getHook(name);
      var cs = computed(element) || element.style;
      var getter = hook && hook.get;
      if (getter) {
        result = getter(element, name, cs);
      } else {
        result = cs[name];
      }
      return result;
    }

    /**
     * @param {HTMLElement} element
     * @param {string|object} nameOrObject
     * @param {*} val
     * @return {number}
     */
    function set(element, nameOrObject, val) {
      if (typeof nameOrObject === 'string') {
        _set(element, nameOrObject, val);
      } else {
        update(element, nameOrObject);
      }
    }

    /**
     * @param {HTMLElement} element
     * @param {object} style
     */
    function update(element, style) {
      var keys = Object.keys(style), key;
      for (var i = 0, l = keys.length; i < l; ++i) {
        key = keys[i];
        _set(element, key, style[key]);
      }
    }

    function addHook(hook) {
      _assertHook(hook);
      hooks.push(hook);
      return _exports;
    }

    function _set(element, name, val) {
      name = _camelCase(name);
      var hook = _getHook(name);
      var setter = hook && hook.set;
      if (setter) {
        setter(element, name, val);
      } else {
        element.style[name] = val;
      }
    }

    function _assertHook(hook) {
      if (!hook) {
        throw new TypeError(hook + ' is not defined');
      }
      if (!hook.test) {
        throw new TypeError('["test"] is required');
      }
    }

    function _getHook(name) {
      var hook = hooksCache[name];
      if (!hook) {
        for (var i = 0, l = hooks.length, h; i < l; ++i) {
          h = hooks[i];
          if (h.test(name)) {
            hook = hooksCache[name] = h;
            break;
          }
        }
      }
      return hook;
    }

    //util
    function _camelCaseFn(all, letter) { return letter.toUpperCase(); }
    function _camelCase(string) {
      return string.replace(/-([a-z])/ig, _camelCaseFn);
    }

    //hooks
    var FLOAT_PROP = (
      'styleFloat' in testElement.style ? 'styleFloat' :
        'float' in testElement.style ? 'float' :
          'cssFloat'
    );
    addHook({
      test: function (n) { return /styleFloat|float|cssFloat/.test(n); },
      get: function (element, name, cs) { return cs[FLOAT_PROP]; },
      set: function (element, name, val) { element.style[FLOAT_PROP] = val; }
    });


    addHook({
      test: function (n) {
        n = n.toLowerCase();
        return (
        /top|bottom|left|right/.test(n) ||
        /margin|padding|width|height|max|min|offset/.test(n)
        );
      },
      get: function (element, name, cs) { return px(cs[name]); },
      set: function (element, name, val) { element.style[name] = val; }
    });

    //export
    _exports.computed = computed;
    _exports.px = px;
    _exports.get = get;
    _exports.set = set;
    _exports.update = update;
    _exports.addHook = addHook;
    return _exports;
  }({}));

  return style;
});