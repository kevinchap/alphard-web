define([], function () {
  "use strict";

  var __sym = typeof Symbol !== "undefined" ? Symbol : function (s) { return "@@" + s;  };
  var __def = Object.defineProperty || function (o, name, desc) {
    o[name] = desc.value;
  };
  var $$data = __sym("data");

  /**
   *
   * @param {Node} element
   */
  function data(element) {
    var returnValue = data.get(element);
    if (!returnValue) {
      returnValue = {};
      data.set(element, returnValue);
    }
    return returnValue;
  }

  /**
   *
   * @param {Node} element
   * @returns {boolean}
   */
  data.has = function (element) {
    return !!element[$$data];
  };

  /**
   *
   * @param {Node} element
   * @returns {*}
   */
  data.get = function (element) {
    return element[$$data];
  };

  /**
   *
   * @param {Node} element
   * @param {*} val
   */
  data.set = function (element, val) {
    if (element.nodeType) {
      element[$$data] = val;
    } else {
      __def(element, $$data, {
        value: val,
        configurable: true
      });
    }
  };

  /**
   *
   * @param {Node} element
   */
  data.delete = function (element) {
    delete element[$$data];
  };

  return data;
});