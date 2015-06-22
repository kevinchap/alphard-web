define([], function () {
  "use strict";

  /**
   * node module
   */
  var node;
  (function (node) {
    //Node.ELEMENT_NODE == 1 ( element node )
    //Node.ATTRIBUTE_NODE == 2 ( node attribute )
    //Node.TEXT_NODE == 3 ( text node )
    //Node.CDATA_SECTION_NODE == 4 ( CDATA section node )
    //Node.ENTITY_REFERENCE_NODE == 5 ( node reference to an entity )
    //Node.ENTITY_NODE == 6 ( Feature node )
    //Node.PROCESSING_INSTRUCTION_NODE == 7 ( processing instruction node )
    //Node.COMMENT_NODE == 8 ( comment node )
    //Node.DOCUMENT_NODE == 9 ( document node )
    //Node.DOCUMENT_TYPE_NODE == 10 ( Document Type node )
    //Node.DOCUMENT_FRAGMENT_NODE == 11 ( node document fragment )
    //Node.NOTATION_NODE == 12 ( node notation )

    var DOMErrorCode;
    (function (DOMErrorCode) {
      DOMErrorCode[DOMErrorCode.INDEX_SIZE_ERR = 1] = "INDEX_SIZE_ERR";
      DOMErrorCode[DOMErrorCode.HIERARCHY_REQUEST_ERR = 3] = "HIERARCHY_REQUEST_ERR";
      DOMErrorCode[DOMErrorCode.WRONG_DOCUMENT_ERR = 4] = "WRONG_DOCUMENT_ERR";
      DOMErrorCode[DOMErrorCode.INVALID_CHARACTER_ERR = 5] = "INVALID_CHARACTER_ERR";
      DOMErrorCode[DOMErrorCode.NO_MODIFICATION_ALLOWED_ERR = 7] = "NO_MODIFICATION_ALLOWED_ERR";
      DOMErrorCode[DOMErrorCode.NOT_FOUND_ERR = 8] = "NOT_FOUND_ERR";
      DOMErrorCode[DOMErrorCode.NOT_SUPPORTED_ERR = 9] = "NOT_SUPPORTED_ERR";
      DOMErrorCode[DOMErrorCode.INVALID_STATE_ERR = 11] = "INVALID_STATE_ERR";
      DOMErrorCode[DOMErrorCode.SYNTAX_ERR = 12] = "SYNTAX_ERR";
      DOMErrorCode[DOMErrorCode.INVALID_MODIFICATION_ERR = 13] = "INVALID_MODIFICATION_ERR";
      DOMErrorCode[DOMErrorCode.NAMESPACE_ERR = 14] = "NAMESPACE_ERR";
      DOMErrorCode[DOMErrorCode.INVALID_ACCESS_ERR = 15] = "INVALID_ACCESS_ERR";
      DOMErrorCode[DOMErrorCode.TYPE_MISMATCH_ERR = 17] = "TYPE_MISMATCH_ERR";
      DOMErrorCode[DOMErrorCode.SECURITY_ERR = 17] = "TYPE_MISMATCH_ERR";
      DOMErrorCode[DOMErrorCode.TYPE_MISMATCH_ERR = 18] = "SECURITY_ERR";
      DOMErrorCode[DOMErrorCode.NETWORK_ERR = 19] = "NETWORK_ERR";
      DOMErrorCode[DOMErrorCode.ABORT_ERR = 20] = "ABORT_ERR";
      DOMErrorCode[DOMErrorCode.URL_MISMATCH_ERR = 21] = "URL_MISMATCH_ERR";
      DOMErrorCode[DOMErrorCode.QUOTA_EXCEEDED_ERR = 22] = "QUOTA_EXCEEDED_ERR";
      DOMErrorCode[DOMErrorCode.TIMEOUT_ERR = 23] = "TIMEOUT_ERR";
      DOMErrorCode[DOMErrorCode.INVALID_NODE_TYPE_ERR = 24] = "INVALID_NODE_TYPE_ERR";
      DOMErrorCode[DOMErrorCode.DATA_CLONE_ERR = 25] = "DATA_CLONE_ERR";
    }(DOMErrorCode || (DOMErrorCode = {})));

    /**
     * DOMError class
     */
    var DOMError = (function (_super) {
      var __protoOf = Object.getPrototypeOf || function (o) { return o.__proto__; };
      var __parent = (function () {
        var proto;
        try {
          //force an exception to be generated;
          document.removeChild({});
        } catch (e) {
          //use it as the prototype
          proto = __protoOf(e);
        }
        return proto;
      }());

      function DOMError(code, message) {
        //_super.call(this);

        if (typeof code !== "number") {
          throw new TypeError("Wrong argument");
        }

        var name = DOMErrorCode[code];
        if (name === undefined) {
          throw new TypeError("Unknown exception code: " + code);
        }
        this.name = name;
        this.code = code;
        this.message = message;
      }

      DOMError.prototype = Object.create(__parent);

      DOMError.prototype.constructor = DOMError;

      DOMError.prototype.toString = function toString() {
        return this.name + ": DOM Exception " + this.code;
      };

      return DOMError;
    }(Object));


    var __isNode = function (o) {
      return (
        typeof Node === "object" ? o instanceof Node :
        o &&
        typeof o === "object" &&
        typeof o.nodeType === "number" &&
        typeof o.nodeName === "string"
      );
    };
    var __isElement = function (o) {
      return o.nodeType === 1;
    };
    var __isElementOrDocument = function (o) {
      var nodeType = o.nodeType;
      return (
        nodeType === 1 || //element
        nodeType === 11 || //doc fragment
        nodeType === 9 // document node
      );
    };
    var __setText = function (element, text) {
      if (__isElementOrDocument(element)) {
        element.textContent = text;
      }
    };
    var __getText = function (element) {
      var returnValue = "";
      var nodeType = element.nodeType;

      if (
        nodeType === 1 ||
        nodeType === 9 ||
        nodeType === 11
      ) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (jQuery #11153)
        returnValue = element.textContent;
        if (typeof returnValue !== "string") {
          returnValue = "";
          // Traverse its children
          for (element = element.firstChild; element; element = element.nextSibling) {
            returnValue += __getText(element);
          }
        }
      } else if (
        nodeType === 3 ||
        nodeType === 4
      ) {
        returnValue = element.nodeValue;
      }
      // Do not include comment or processing instruction nodes

      return returnValue;
    };

    /**
     * Return true if `o` is a Node
     *
     * @param {*} o
     * @returns {boolean}
     */
    function isNode(o) {
      return __isNode(o);
    }

    node.isNode = isNode;

    /**
     * Return true if `o` is an Element
     *
     * @param o
     * @returns {boolean}
     */
    function isElement(o) {
      return __isElement(o);
    }

    node.isElement = isElement;

    /**
     *
     * @param {Node} element
     * @param {string=} opt_val
     * @returns {*}
     */
    function text(element, opt_val) {
      if (arguments.length >= 2) {
        //setter
        //empty(element);
        __setText(element, opt_val);
      } else {
        //getter
        return __getText(element);
      }
    }

    node.text = text;


    var Position;
    (function (Position) {
      Position[Position.BEFORE = 1] = "BEFORE";
      Position[Position.AFTER = 2] = "AFTER";
      Position[Position.FIRST = 3] = "FIRST";
      Position[Position.LAST = 4] = "LAST";
      Position[Position.REPLACE = 5] = "REPLACE";

    }(Position || (Position = {})));
    node.Position = Position;

    /**
     *
     * @param {Node} node
     * @param {Position} position
     * @param {Node} refNode
     */
    function place(node, position, refNode) {
      var returnValue = false;
      var positionValue = typeof position === "string" ?
        Position[position] :
        position;
      var parentNode;

      switch (positionValue) {
        case 1: //BEFORE
          parentNode = refNode.parentNode;
          if (parentNode) {
            parentNode.insertBefore(node, refNode);
            returnValue = true;
          }
          break;
        case 2: //AFTER
          parentNode = refNode.parentNode;
          if (parentNode) {
            parentNode.insertBefore(node, refNode.nextSibling);
            returnValue = true;
          }
          break;
        case 3: //FIRST
          refNode.insertBefore(node, refNode.firstChild);
          break;
        case 4: //LAST
          refNode.appendChild(node);
          break;
        case 5: //REPLACE
          parentNode = refNode.parentNode;
          if (parentNode) {
            parentNode.replaceChild(node, refNode);
            returnValue = true;
          }
          break;
        default:
          throw new Error("Unknown position : " + position);
      }
      return returnValue;
    }

    node.place = place;

    /**
     *
     * @param {Node} nodeObject
     */
    function empty(nodeObject) {
      if (__isElement(nodeObject)) {
        // Remove any remaining nodes
        __setText(nodeObject, "");
      }
    }

    node.empty = empty;


    /**
     *
     * @param {Node} nodeObject
     */
    function remove(nodeObject) {
      var parentNode = nodeObject.parentNode;
      if (parentNode) {
        parentNode.removeChild(nodeObject);
      }
    }

    node.remove = remove;

  }(node || (node = {})));


  return node;
});