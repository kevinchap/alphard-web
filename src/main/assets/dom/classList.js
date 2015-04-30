define([], function () {
  "use strict";

  /**
   * classList module
   */
  var classList;
  (function (classList) {
    var divElement = document.createElement("div");
    var hasClassList = "classList" in divElement;

    var _contains = hasClassList ?
      function (element, classStr) {
        var classList = element.classList;
        return classList && classList.contains(classStr);
      } :
      function (element, classStr) {
        return ((" " + element.className + " ").indexOf(" " + classStr + " ") >= 0);
      };

    var _add = hasClassList ?
      function (element, classStr) {
        var classListNew = _strToArray(classStr);
        var classList = element.classList;
        for (var i = 0, len = classListNew.length; i < len; ++i) {
          classList.add(classListNew[i]);
        }
      } :
      function (element, classStr) {
        var classListNew = _strToArray(classStr);
        var className = element.className, oldLen;
        className = className ? " " + className + " " : " ";
        oldLen = className.length;
        for (var i = 0, len = classListNew.length, classNew; i < len; ++i) {
          classNew = classListNew[i];
          if (classNew && className.indexOf(" " + classNew + " ") < 0) {
            className += c + " ";
          }
        }
        if (oldLen < className.length) {
          element.className = className.substr(1, className.length - 2);
        }
      };

    var _remove = hasClassList ?
      function (element, opt_classStr) {
        if (opt_classStr === undefined) {
          element.className = "";
        } else {
          var classListNew = _strToArray(opt_classStr);
          var classList = element.classList;
          for (var i = 0, len = classListNew.length; i < len; ++i) {
            classList.remove(classListNew[i]);
          }
        }
      } :
      function (element, opt_classStr) {
        var className = element.className;
        var classNameNew = "";
        if (opt_classStr !== undefined) {
          var classListNew = _strToArray(opt_classStr);
          classNameNew = " " + className + " ";
          for (var i = 0, len = classListNew.length; i < len; ++i) {
            classNameNew = classNameNew.replace(" " + classListNew[i] + " ", " ");
          }
          classNameNew = classNameNew.trim();
        }
        if (className !== classNameNew) {
          element.className = classNameNew;
        }
      };

    var _toggle = hasClassList ?
      function (element, classStr, opt_condition) {
        if (opt_condition === undefined) {
          var classListNew = _strToArray(classStr);
          var classList = element.classList;
          for (var i = 0, len = classListNew.length; i < len; ++i) {
            classList.toggle(classListNew[i]);
          }
        } else {
          (opt_condition ? _add : _remove)(element, classStr);
        }
        return opt_condition;
      } :
      function (element, classStr, opt_condition) {
        if (opt_condition === undefined) {
          var classListNew = _strToArray(classStr);
          for (var i = 0, len = classListNew.length, classNew; i < len; ++i) {
            classNew = classListNew[i];
            (_contains(element, classNew) ? _remove : _add)(element, classNew);
          }
        } else {
          (opt_condition ? _add : _remove)(element, classStr);
        }
        return condition;   // Boolean
      };


    /**
     *
     * @param {Element} element
     * @param {string|Array<string>} classStr
     * @returns {boolean}
     */
    function contains(element, classStr) {
      return _contains(element, classStr);
    }

    classList.contains = contains;

    /**
     *
     * @param {Element} element
     * @param {string|Array<string>} classStr
     */
    function add(element, classStr) {
      return _add(element, classStr);
    }

    classList.add = add;

    /**
     *
     * @param {Element} element
     * @param {string|Array<string>=} opt_classStr
     */
    function remove(element, opt_classStr) {
      return _remove(element, opt_classStr);
    }

    classList.remove = remove;

    /**
     *
     * @param {Element} element
     * @param {string|Array<string>} classStr
     * @param {boolean=} opt_condition
     * @returns {*}
     */
    function toggle(element, classStr, opt_condition) {
      return _toggle(element, classStr, opt_condition);
    }

    classList.toggle = toggle;


    var reSpaces = /\s+/, a1 = [""];

    function _strToArray(s) {
      if (typeof s == "string" || s instanceof String) {
        if (s && !reSpaces.test(s)) {
          a1[0] = s;
          return a1;
        }
        var a = s.split(reSpaces);
        if (a.length && !a[0]) {
          a.shift();
        }
        if (a.length && !a[a.length - 1]) {
          a.pop();
        }
        return a;
      }
      // assumed to be an array
      if (!s) {
        return [];
      }
      return array.filter(s, function (x) {
        return x;
      });
    }
  }(classList || (classList = {})));

  return classList;
});