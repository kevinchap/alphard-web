define([], function () {
  "use strict";

  /**
   * geometry module
   */
  var geometry = (function (_exports) {
    var divElement = document.createElement("div");
    var computed = !!divElement.currentStyle ?
      function (element) {
        return isElement(element) ? element.currentStyle : null;
      } :
      function (element) {
        return isElement(element) ?
          element.ownerDocument.defaultView.getComputedStyle(element, null) : null;
      };
    var nodeName = function (o) {
      return o.nodeName.toUpperCase();
    };
    var px = function px(val) {
      return parseFloat(val) || 0;
    };
    var isWindow = function (o) {
      return o && o.window === o;
    };
    var isElement = function (o) {
      return o && o.nodeType == 1;
      /*ELEMENT*/
    };
    var isElementRoot = function (o) {
      return isElement(o) && /^(?:BODY|HTML)$/.test(nodeName(o));
    };
    var isDocument = function (o) {
      return o && o.nodeType == 9;
    };

    function buildProperty(prop) {

      function _cssFn(prop) {
        return function (element, opt_computedStyle) {
          var cs = opt_computedStyle || computed(element);
          return isWindow(element) ? 0 : px(cs[prop]);
        };
      }

      function _sumFn(f1, f2) {
        return function (element, opt_computedStyle) {
          var cs = opt_computedStyle || computed(element);
          return f1(element, cs) + f2(element, cs);
        };
      }

      var suffix = prop === 'border' ? 'Width' : '';
      var getLeft = _cssFn(prop + 'Left' + suffix);
      var getRight = _cssFn(prop + 'Right' + suffix);
      var getTop = _cssFn(prop + 'Top' + suffix);
      var getBottom = _cssFn(prop + 'Bottom' + suffix);

      return {
        l: getLeft,
        r: getRight,
        t: getTop,
        b: getBottom,
        h: _sumFn(getLeft, getRight),
        v: _sumFn(getTop, getBottom),
        _: function (element, opt_computedStyle) {
          var result, cs, l, r, t, b;
          if (isWindow(element)) {
            result = {left: 0, right: 0, top: 0, bottom: 0, horizontal: 0, vertical: 0};
          } else {
            cs = opt_computedStyle || computed(element);
            l = getLeft(element, cs);
            r = getRight(element, cs);
            t = getTop(element, cs);
            b = getBottom(element, cs);
            result = {
              left: l,
              right: r,
              top: t,
              bottom: b,
              horizontal: l + r,
              vertical: t + b
            };
          }
          return result;
        }
      };
    }

    var _margin = buildProperty("margin");

    function margin(element, opt_computedStyle) {
      return _margin._(element, opt_computedStyle);
    }

    function marginLeft(element, opt_computedStyle) {
      return _margin.l(element, opt_computedStyle);
    }

    function marginRight(element, opt_computedStyle) {
      return _margin.r(element, opt_computedStyle);
    }

    function marginTop(element, opt_computedStyle) {
      return _margin.t(element, opt_computedStyle);
    }

    function marginBottom(element, opt_computedStyle) {
      return _margin.b(element, opt_computedStyle);
    }

    function marginHorizontal(element, opt_computedStyle) {
      return _margin.h(element, opt_computedStyle);
    }

    function marginVertical(element, opt_computedStyle) {
      return _margin.v(element, opt_computedStyle);
    }

    var _padding = buildProperty("padding");

    function padding(element, opt_computedStyle) {
      return _padding._(element, opt_computedStyle);
    }

    function paddingLeft(element, opt_computedStyle) {
      return _padding.l(element, opt_computedStyle);
    }

    function paddingRight(element, opt_computedStyle) {
      return _padding.r(element, opt_computedStyle);
    }

    function paddingTop(element, opt_computedStyle) {
      return _padding.t(element, opt_computedStyle);
    }

    function paddingBottom(element, opt_computedStyle) {
      return _padding.b(element, opt_computedStyle);
    }

    function paddingHorizontal(element, opt_computedStyle) {
      return _padding.h(element, opt_computedStyle);
    }

    function paddingVertical(element, opt_computedStyle) {
      return _padding.v(element, opt_computedStyle);
    }

    var _border = buildProperty("border");

    function border(element, opt_computedStyle) {
      return _border._(element, opt_computedStyle);
    }

    function borderLeft(element, opt_computedStyle) {
      return _border.l(element, opt_computedStyle);
    }

    function borderRight(element, opt_computedStyle) {
      return _border.r(element, opt_computedStyle);
    }

    function borderTop(element, opt_computedStyle) {
      return _border.t(element, opt_computedStyle);
    }

    function borderBottom(element, opt_computedStyle) {
      return _border.b(element, opt_computedStyle);
    }

    function borderHorizontal(element, opt_computedStyle) {
      return _border.h(element, opt_computedStyle);
    }

    function borderVertical(element, opt_computedStyle) {
      return _border.v(element, opt_computedStyle);
    }

    /**
     * @param {HTMLElement|Window|Document} element
     * @return {ClientRect}
     */
    function boundingRect(element) {
      if (isWindow(element)) {
        element = element.document;
      }
      if (isDocument(element)) {
        element = element.documentElement;
      }

      var brect = /** @type object */ element.getBoundingClientRect();
      if (typeof brect.width === "undefined") {
        brect.width = offsetWidth(element);
      }
      if (typeof brect.height === "undefined") {
        brect.height = offsetHeight(element);
      }
      return brect;
    }

    /**
     * @param {HTMLElement|Window|Document} element
     * @return {number}
     */
    function offsetHeight(element) {
      return (
        isWindow(element) ? element.innerHeight : // or element.document.documentElement.clientHeight?
        isDocument(element) ? element.documentElement.offsetHeight :
        element.offsetHeight
      );
    }

    /**
     * @param {HTMLElement|Window|Document} element
     * @return {number}
     */
    function offsetWidth(element) {
      return (
        isWindow(element) ? element.innerWidth :
        isDocument(element) ? element.documentElement.offsetWidth :
        element.offsetWidth
      );
    }

    /**
     * @param {HTMLElement} element
     * @return {HTMLElement}
     */
    function offsetParent(element) {
      var parent = element.offsetParent || document.body;
      while (
      parent && !isElementRoot(parent) &&
      computed(parent).position === "static"
      ) {
        parent = parent.offsetParent;
      }
      return parent;
    }

    /**
     * @param {HTMLElement} element
     * @return {object}
     */
    function offset(element) {
     // var rect = opt_boundingRect;
      var docElement = element.ownerDocument.documentElement;
      var win = docElement.defaultView;
      var top = element.offsetTop;
      var left = element.offsetLeft;
      return {
        //width: rect.width,
        //height: rect.height,
        top: top + (win.pageYOffset || docElement.scrollTop) - (docElement.clientTop || 0),
        left: left + (win.pageXOffset || docElement.scrollLeft) - (docElement.clientLeft || 0)
      };
    }

    /**
     * Provides read-only equivalent of jQuery's position function
     *
     * @param {HTMLElement} element
     * @param {CssStyle=} opt_computedStyle
     */
    function position(element, opt_computedStyle) {
      var computedStyle = opt_computedStyle || computed(element);
      var offsetParentRect = {top: 0, left: 0};
      var elementOffsetParent, elementOffset;

      // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
      if (computedStyle.position === 'fixed') {

        // We assume that getBoundingClientRect is available when computed position is fixed
        elementOffset = boundingRect(element);

      } else {

        // Get *real* elementOffsetParent
        elementOffsetParent = offsetParent(element);
        //elementOffset = offset(element);

        // Get correct offsets
        elementOffset = offset(element);
        if (nodeName(elementOffsetParent) !== 'HTML') {
          offsetParentRect = offset(elementOffsetParent);
        }

        // Add offsetParent borders
        var cs = computed(elementOffsetParent);
        offsetParentRect.top += _exports.borderTop(elementOffsetParent, cs);
        offsetParentRect.left += _exports.borderLeft(elementOffsetParent, cs);
      }

      // Subtract parent offsets and element margins
      return {
        //width: _getOffsetWidth(element),
        //height: _getOffsetHeight(element),
        top: elementOffset.top - offsetParentRect.top - _exports.marginTop(element, computedStyle),
        left: elementOffset.left - offsetParentRect.left - _exports.marginLeft(element, computedStyle)
      };
    }

    /**
     * Return the (dimensions - border - padding)
     * { width: number, height: number }
     *
     * @param {HTMLElement} element
     * @param {CssStyle=} opt_computedStyle
     * @return {object}
     */
    function rect(element, opt_computedStyle) {
      var style = opt_computedStyle || computed(element);
      var height = offsetHeight(element);
      var width = offsetWidth(element);

      return {
        height: height -
        borderVertical(element, style) -
        paddingVertical(element, style),
        width: width -
        borderHorizontal(element, style) -
        paddingHorizontal(element, style)
      };
    }

    /**
     * Return the (dimensions - border)
     * { width: number, height: number }
     *
     * @param {HTMLElement} element
     * @param {CssStyle=} opt_computedStyle
     * @return {object}
     */
    function innerRect(element, opt_computedStyle) {
      var style = opt_computedStyle || computed(element);
      var height = offsetHeight(element);
      var width = offsetWidth(element);
      return {
        height: height - borderVertical(element, style),
        width: width - borderHorizontal(element, style)
      };
    }


    /**
     * Return the (dimensions + margins)
     * { width: number, height: number }
     *
     * @param {HTMLElement} element
     * @param {boolean=} opt_margins
     * @param {CssStyle=} opt_computedStyle
     * @return {object}
     */
    function outerRect(element, opt_margins, opt_computedStyle) {
      var style = opt_computedStyle || computed(element);
      var height = offsetHeight(element);
      var width = offsetWidth(element);
      if (opt_margins) {
        height += marginVertical(element, style);
        width += marginHorizontal(element, style);
      }
      return {
        height: height,
        width: width
      };
    }

    //export
    _exports.boundingRect = boundingRect;
    _exports.offsetHeight = offsetHeight;
    _exports.offsetWidth = offsetWidth;
    _exports.offsetParent = offsetParent;
    _exports.offset = offset;
    _exports.position = position;
    _exports.rect = rect;
    _exports.innerRect = innerRect;
    _exports.outerRect = outerRect;
    _exports.margin = margin;
    _exports.marginLeft = marginLeft;
    _exports.marginRight = marginRight;
    _exports.marginTop = marginTop;
    _exports.marginBottom = marginBottom;
    _exports.marginHorizontal = marginHorizontal;
    _exports.marginVertical = marginVertical;
    _exports.border = border;
    _exports.borderLeft = borderLeft;
    _exports.borderRight = borderRight;
    _exports.borderTop = borderTop;
    _exports.borderBottom = borderBottom;
    _exports.borderHorizontal = borderHorizontal;
    _exports.borderVertical = borderVertical;
    _exports.padding = padding;
    _exports.paddingLeft = paddingLeft;
    _exports.paddingRight = paddingRight;
    _exports.paddingTop = paddingTop;
    _exports.paddingBottom = paddingBottom;
    _exports.paddingHorizontal = paddingHorizontal;
    _exports.paddingVertical = paddingVertical;
    return _exports;
  }({}));


  return geometry;
});