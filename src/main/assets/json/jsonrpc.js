// jshint ignore: start
/**
 * JSONRPC
 *
 * Usage:
 *
 */
define([], function () {
  'use strict';

  /**
   * jsonrpc module
   */
  var jsonrpc;
  (function (jsonrpc) {
    var ostring = Object.prototype.toString;
    var __isString = function (o) {
      return ostring.call(o) === '[object String]'
    };
    var __isInteger = function (o) {
      return o === o | 0;
    };
    var __isArray = Array.isArray || function (o) {
        return ostring.call(o) === '[object Array]';
      };
    var __create = Object.create || function (proto) {
      function F() {}
      F.prototype = proto;
      var ctor = proto.constructor;
      proto.constructor = F;
      var o = new F();
      proto.constructor = ctor;
      return o;
    };
    var __throw = function (e) {
      throw e;
    };
    var __assertIn = function (o, name) {
      (name in o) || __throw(new TypeError(name + ' is required'));
    };


    /**
     * @param {string|object} jsonResponse
     * @return {*}
     */
    function parseResponse(stringOrObject) {
      var jsonData, error, result, jsonResponse;

      //check valid json
      if (__isString(stringOrObject)) {
        try {
          jsonData = JSON.parse(stringOrObject);
        } catch (e) {
          jsonResponse = new JSONRPCResponse();
          jsonResponse.error = new JSONRPCError(null, JSONRPCError.USER_PARSE_ERROR, stringOrObject);
        }
      } else {
        jsonData = stringOrObject;
      }

      if (!jsonResponse) {
        if (__isArray(jsonData)) {
          jsonResponse = new Array(jsonData.length);
          for (var i = 0, l = jsonData.length; i < l; ++i) {
            jsonResponse[i] = _toResponse(jsonData[i]);
          }
        } else {
          jsonResponse = _toResponse(jsonData);
        }
      }
      return jsonResponse;
    }

    jsonrpc.parseResponse = parseResponse;

    function _toResponse(json) {
      var response;

      //check valid json response
      try {
        response = JSONRPCResponse.fromObject(json);
      } catch (e) {
        if (e instanceof TypeError) {
          response = new JSONRPCResponse();
          response.error = new JSONRPCError(e.message, JSONRPCError.USER_INVALID_RESPONSE, json);
        } else {
          throw e;
        }
      }
      return response;
    }

    /**
     * JSONRPCError class
     *
     */
    var JSONRPCError = (function (_super) {
      var __messages = {
        '-32700': 'Parse Error',
        '-32600': 'Invalid Request',
        '-32601': 'Method not found',
        '-32602': 'Invalid params',
        '-32603': 'Internal error',

        //Client errors
        '-31000': 'Parse Error',
        '-31001': 'Invalid Response',
        '-31002': 'Internal error'
      };

      /**
       * @constructor
       * @param {string}
       * @param {number} code
       */
      function JSONRPCError(message, code, opt_data) {
        if (this instanceof JSONRPCError) {
          _super.call(this);
          this.message = message || __messages[code];
          this.code = code;
          this.data = opt_data;

          if (!__isString(this.message)) {
            throw new TypeError('[message] must be an string');
          }
          if (!__isInteger(this.code)) {
            throw new TypeError('[code] must be an integer');
          }
          //__stack(this, this.constructor);
        } else {
          return new JSONRPCError(message, code, opt_data);
        }
      }

      JSONRPCError.displayName = "JSONRPCError";

      JSONRPCError.fromObject = function fromObject(o) {
        __assertIn(o, 'message');
        __assertIn(o, 'code');
        return new JSONRPCError(o.message, o.code, o.data);
      };

      //Server codes
      JSONRPCError.PARSE_ERROR = -32700;
      JSONRPCError.INVALID_REQUEST = -32600;
      JSONRPCError.METHOD_NOT_FOUND = -32601;
      JSONRPCError.INVALID_PARAMS = -32602;
      JSONRPCError.INTERNAL_ERROR = -32603;

      //Client codes
      JSONRPCError.USER_PARSE_ERROR = -31000;
      JSONRPCError.USER_INVALID_RESPONSE = -31001;
      JSONRPCError.USER_INTERNAL_ERROR = -31002;

      JSONRPCError.prototype = Object.create(_super.prototype);

      JSONRPCError.prototype.constructor = JSONRPCError;

      /**
       * Error code
       *
       * @type {number}
       */
      JSONRPCError.prototype.code = NaN;

      /**
       * Error data
       *
       * @type {Object=}
       */
      JSONRPCError.prototype.data = null;

      return JSONRPCError;
    }(Error));
    jsonrpc.Error = JSONRPCError;

    /**
     * JSONRPCObject class
     *
     */
    var JSONRPCObject = (function (_super) {
      /**
       * @constructor
       */
      function JSONRPCObject(opt_id) {
        if (this instanceof JSONRPCObject) {
          _super.call(this);
          if (opt_id) {
            this.id = opt_id;
            if (!__isString(opt_id) && !__isInteger(opt_id)) {
              throw new TypeError('[id] must be an string or integer');
            }
          }
        } else {
          return new JSONRPCObject(opt_id);
        }
      }

      JSONRPCObject.displayName = 'JSONRPCObject';

      JSONRPCObject.prototype = Object.create(_super.prototype);

      JSONRPCObject.prototype.constructor = JSONRPCObject;

      /**
       * Unique Request identifier
       *
       * @type {number|string}
       */
      JSONRPCObject.prototype.id = null;


      /**
       * @return {string}
       */
      JSONRPCObject.prototype.inspect = function inspect() {
        var s = '', obj = this.toJSON(), prop, val;
        for (prop in obj) {
          val = obj[prop];
          if (s.length) s += ',';
          s += prop + '=' + val;
        }
        return this.constructor.displayName + '(' + s + ')';
      };

      /**
       *
       * @return {string}
       */
      JSONRPCObject.prototype.toJSON = function toJSON() {
        var json = {}, prop, val;
        for (prop in this) {
          val = this[prop];
          if (val != null) {
            json[prop] = val;
          }
        }
        return json;
      };

      /**
       *
       * @return {string}
       */
      JSONRPCObject.prototype.toString = function toString() {
        return JSON.stringify(this);
      };

      return JSONRPCObject;
    }(Object));

    /**
     * JSONRPCRequest class
     *
     */
    var JSONRPCRequest = (function (_super) {
      //var reMethod = /^[a-zA-Z][a-zA-Z0-9_.]*$/;

      /**
       * @constructor
       * @param {string} method
       * @param {object} params
       * @param {*} opt_id
       */
      function JSONRPCRequest(method, opt_params, opt_id) {
        if (this instanceof JSONRPCRequest) {
          _super.call(this, opt_id);
          this.jsonrpc = this.jsonrpc;
          this.method = method;
          if (opt_params) {
            this.params = opt_params;
          }
        } else {
          return new JSONRPCRequest(method, opt_params, opt_id);
        }
      }

      JSONRPCRequest.displayName = "JSONRPCRequest";

      JSONRPCRequest.prototype = __create(_super.prototype);

      JSONRPCRequest.prototype.constructor = JSONRPCRequest;

      /**
       * Protocol version
       *
       * @type {string}
       */
      JSONRPCRequest.prototype.jsonrpc = "2.0";

      /**
       * Method requested
       *
       * @type {string}
       */
      JSONRPCRequest.prototype.method = null;

      /**
       * Params passed to the method
       *
       * @type {array|object}
       */
      JSONRPCRequest.prototype.params = null;

      return JSONRPCRequest;
    }(JSONRPCObject));
    jsonrpc.Request = JSONRPCRequest;

    /**
     * JSONRPCResponse class
     *
     */
    var JSONRPCResponse = (function (_super) {
      /**
       * @constructor
       * @param {*} value
       */
      function JSONRPCResponse(opt_id) {
        if (this instanceof JSONRPCResponse) {
          _super.call(this, opt_id);
        } else {
          return new JSONRPCResponse(opt_id);
        }
      }

      JSONRPCResponse.displayName = "JSONRPCResponse";

      JSONRPCResponse.fromObject = function fromObject(o) {
        __assertIn(o, 'id');
        if (!("result" in o)) {
          __assertIn(o, 'error');
        }

        var response = new JSONRPCResponse(o.id);
        var error = o.error;
        var result = o.result;

        if (error) {
          response.error = JSONRPCError.fromObject(error);
        }
        if (result) {
          response.result = result;
        }
        return response;
      };

      JSONRPCResponse.prototype = __create(_super.prototype);

      JSONRPCResponse.prototype.constructor = JSONRPCResponse;

      /**
       * @type {*=}
       */
      JSONRPCResponse.prototype.result = null;

      /**
       * @type {*=}
       */
      JSONRPCResponse.prototype.error = null;

      return JSONRPCResponse;
    }(JSONRPCObject));
    jsonrpc.Response = JSONRPCResponse;

  }(jsonrpc || (jsonrpc = {})));

  return jsonrpc;
});
