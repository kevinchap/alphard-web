define([], function () {
  "use strict";


  /**
   * attribute module
   */
  var attribute;
  (function (attribute) {
    var __str = function (o) { return "" + o; };
    var __keys = Object.keys || function (o) {
      var keys = [];
      for (var prop in o) {
        if (o.hasOwnProperty(prop)) {
          keys.push(prop);
        }
      }
      return keys;
    };

    /**
     *
     * @param {Element} element
     * @param {string} name
     * @returns {boolean}
     */
    function has(element, name) {
      return element.hasAttribute(name);
    }

    attribute.has = has;

    /**
     *
     * @param {Element} element
     * @param {string} name
     * @returns {string}
     */
    function get(element, name) {
      return element.getAttribute(name);
    }

    attribute.get = get;

    /**
     *
     * @param {Element} element
     * @param {string} name
     * @param {string} value
     */
    function set(element, name, value) {
      if (value === undefined || value === null) {
        //unset
        element.removeAttribute(name);
      } else {
        value = __str(value);
        if (element.getAttribute(name) !== value) {
          element.setAttribute(name, value);
        }
      }
    }

    attribute.set = set;

    /**
     *
     * @param {Element} element
     * @param {string} name
     * @param {string} value
     * @returns {string}
     */
    function setDefault(element, name, value) {
      var returnValue;
      var valueStr = __str(value);
      if (
        !element.hasAttribute(name) ||
        (returnValue = element.getAttribute(name)) !== valueStr
      ) {
        returnValue = valueStr;
        element.setAttribute(name, valueStr);
      }
      return returnValue;
    }

    attribute.setDefault = setDefault;

    /**
     *
     * @param {Element} element
     * @param {object} attributes
     */
    function update(element, attributes) {
      var keys = __keys(attributes);
      for (var i = 0, l = keys.length; i < l; ++i) {
        var key = keys[i];
        set(element, key, attributes[key]);
      }
    }

    attribute.update = update;

  }(attribute || (attribute = {})));

  return attribute;
});