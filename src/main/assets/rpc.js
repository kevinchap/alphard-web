// jshint ignore: start
(function (global, _exports) {
  'use strict';


  function provider(type, async, JSONSchema) {

    var
    baseURL    = global.location ? global.location.href : "",
    ToBoolean  = Boolean,
    ToString   = String,
    isArray    = Array.isArray,
    aslice     = Array.prototype.slice;

    type.module("rpc", function (rpc) {

      /**
       * @param {String} name
       * @return {Function}
       */
      function envelope(name) {
        var fn = envelope[_key(name)];
        return fn ? async(fn) : _throwError(name + " is not a valid envelope");
      }

      /**
       * @param {String} name
       * @return {Function}
       */
      function transport(name) {
        var fn = transport[_key(name)];
        return fn ? async(fn) : _throwError(name + " is not a valid transport");
      }

      function _key(s) {
        return ToString(s).toUpperCase();
      }

      return {
        envelope: envelope,
        transport: transport
      };
    });

    /**
     * Service class
     */
    type("rpc.Service", [], function (Service) {

      /**
       * @constructor
       * @param {Object} smd
       * @param {Object=} options -> see #config()
       */
      function __new__(smd, options) {
        var
        self   = this,
        smdObj;


        //configuration
        self.config(options);

        //build methods
        if (smd) {
          smdObj = /*self.__smd__ =*/ new rpc.SMD(smd);
          smdObj.forEach(function (serviceSMD) {
            if (serviceSMD.hasOwnProperty("parameters")) {
              var
              name   = serviceSMD.name,
              method = new rpc.ServiceMethod(self, serviceSMD);
              method.displayName = name;
              self[name] = method;
            }
          });
        }
      }

      /**
       * Configure the service
       *
       * @param {Object=} data
       *  - debug: true|false
       * @return this
       */
      function config(data) {
        var p;
        if (data) {
          for (p in data) {
            if (p in this) {
              this[p] = data[p];
            }
          }
        }
        return this;
      }

      /**
       *
       * @return {Service}
       */
      function concat(var_args) {
        var
        self   = this,
        proto  = Service.prototype,
        result = new Service(),
        prop, service, i, l;

        //mix configuration & methods
        for (prop in self) {
          result[prop] = bind(self[prop]);
        }

        //mix services methods
        for (i = 0, l = arguments.length; i < l; ++i) {
          service = arguments[i];
          if (service) {
            for (prop in service) {
              if (!(prop in proto)) {
                result[prop] = bind(service[prop]);
              }
            }
          }

        }

        function bind(val) {
          return val && val.smd ? val.bind(result) : val;
        }
        return result;
      }

      /**
       * @param {String} name
       * @return {Function}
       */
      function envelope(name) {
        return rpc.envelope(name);
      }

      /**
       * @param {String} name
       * @return {Function}
       */
      function transport(name) {
        return rpc.transport(name);
      }

      function _forward(self, eventName) {
        return function () {
          var result;
          if (self[eventName]) {
            result = self[eventName].apply(self, arguments);
          }
          return result;
        };
      }

      return {
        debug: false,

        onRequestInit: null,
        onRequestTransport: null,
        onRequestLoad: null,
        onRequestError: null,
        onReturn: null,

        //__smd__: null,
        __new__: __new__,
        config: config,
        concat: concat,
        envelope: envelope,
        transport: transport
      };
    });

    type("rpc.ServiceMethod", [], function (ServiceMethod) {

      /**
       * @constructor
       * @param {rpc.Service} service
       * @param {rpc.SMD} smd
       */
      function __new__(service, smd) {

        function serviceMethod(/*[...]*/) {
          return serviceMethod.apply(this, arguments);
        }
        serviceMethod.smd = smd;
        serviceMethod.service = service;
        serviceMethod.debug = this.debug;

        serviceMethod.apply = this.apply;
        serviceMethod.bind = this.bind;
        serviceMethod.clone = this.clone;
        serviceMethod.envelope = this.envelope;
        serviceMethod.transport = this.transport;
        serviceMethod.toRepresentation = this.toRepresentation;
        serviceMethod.toString = this.toString;
        serviceMethod.__apply__ = this.__apply__;

        return serviceMethod;
      }

      /**
       * @param {Object=} thisp
       * @param {Object|Array} args
       */
      function apply(thisp, args) {
        return this.__apply__(new rpc.Parameters(this.smd.parameters || [], args));
      }

      /**
       * @param {Object=} thisp
       * @return {rpc.ServiceMethod}
       */
      function bind(thisp) {
        var result = clone.call(this);
        result.service = thisp;
        return result;
      }

      /**
       * @param {Object=} thisp
       * @return {rpc.ServiceMethod}
       */
      function clone() {
        var result = new ServiceMethod(this.service, this.smd);
        return result;
      }

      /**
       * @param {String} name
       * @return {Function}
       */
      function envelope(name) {
        return (this.service || rpc).envelope(name);
      }

      /**
       * @param {String} name
       * @return {Function}
       */
      function transport(name) {
        return (this.service || rpc).transport(name);
      }

      /**
       * Dump string representation
       *
       * @return {String}
       */
      function toRepresentation() {
        return _str(this, '...');
      }

      /**
       * String representation
       *
       * @return {String}
       */
      function toString() {
        return _str(this);
      }

      function __apply__(parameters) {
        var
        self     = this,
        smd      = self.smd,
        service  = self.service,
        isDebug  = (self.debug || service.debug),
        request  = new rpc.Request(smd, parameters),
        debug    = isDebug ? _consoleDebug : _void,
        debugErr = isDebug ? _consoleError : _void,
        promise;


        debug(ToString(request) + ' envelope=' + smd.envelope + ' transport=' + smd.transport);
        promise = async
          .call(function () {
            //1. envelope
            request = _delegate(self, 'onRequestInit', request) || request;
            return self
              .envelope(smd.envelope)
              .call(request, request);
          })
          .then(function (transportRequest) {
            //2. transport
            transportRequest = _delegate(self, 'onRequestTransport', request, transportRequest) || transportRequest;

            return self
              .transport(smd.transport)
              .call(request, transportRequest)
              .then(transportRequest.onload, transportRequest.onerror);
          })
          .then(
            function (result) { return _delegate(self, 'onRequestLoad', request, result) || result; },
            function (error) { return _delegate(self, 'onRequestError', request, error) || _throw(error); }
          )
          ["finally"](function (val, isFailure) {
            //3. log
            if (!isFailure) {
              debug(ToString(request) + ' -> ', val);
            } else {
              debugErr(ToString(request) + ' -> ', ToString(val));
            }
          });

        return _delegate(self, 'onReturn', request, promise) || promise;
      }

      function _delegate(self, methodName) {
        var service = self.service, method, result;
        var args = aslice.call(2, arguments);
        if (self[methodName]) {
          result = self[methodName].apply(this, args);
        } else if (service[methodName]) {
          result = service[methodName].apply(this, args);
        }
        return result;
      }

      function _str(self, opt_body) {
        var
        smd        = self.smd,
        parameters = smd.parameters,
        returns    = smd.returns,
        s = "", i, l, parameter, parameterStr;
        s += 'function (';
        for (i = 0, l = parameters.length; i < l; ++i) {
          parameter = parameters[i];
          s += i !== 0 ? ", " : "";
          parameterStr = _strType(parameter);
          if (parameterStr.length > 0) {
            s += "/*" + parameterStr + "*/ ";
          }
          s += (parameter.name || "$" + i);
        }
        s += ") {";
        if (opt_body) {
          s += opt_body;
        } else {
          s += "/* -> " + _strType({
            type: "Promise",
            items: returns
          }) + "*/";
          s += "\n  return request(arguments);\n";
        }
        s += "}";
        return s;
      }

      function _strType(parameter) {
        if (typeof parameter === 'string') {
          return parameter;
        }

        var
        type  = parameter.type,
        items = parameter.items,
        s     = "";

        type = !type ? [ 'any' ] : isArray(type) ? type : [ type ];

        if (type.indexOf("any") < 0) {
          s = type.filter(function (t) { return t !== 'null'; }).join("|");

          if (!!items) {
            s += "<";
            s += _strType(items);
            s += ">";
          }
          if (parameter.optional || type.indexOf("null") >= 0) {
            s += "?";
          }
        }
        return s;
      }

      return {
        debug: false,

        __new__: __new__,
        __apply__: __apply__,
        apply: apply,
        bind: bind,
        clone: clone,
        envelope: envelope,
        transport: transport,

        onRequestInit: null,
        onRequestTransport: null,
        onRequestLoad: null,
        onRequestError: null,
        onReturn: null,

        toRepresentation: toRepresentation,
        toString: toString
      };
    });


    /**
     * Service Request class
     */
    type("rpc.Request", [], function (Request) {
      var nextId = 1, $name = type.getName;

      /**
       * @constructor
       * @param {rpc.SMD} smd
       * @param {rpc.Parameters} parameters
       */
      function __new__(smd, parameters) {
        this.smd = smd;
        this.parameters = parameters;
        this.id = nextId++;
      }

      /**
       * @return {string}
       */
      function toRepresentation() {
        return $name(this.constructor) +
          '#' + this.id +
          '(`' + ToString(this) + '`)';
      }

      /**
       * @return {string}
       */
      function toString() {
        return this.smd.name + "(" + ToString(this.parameters).slice(1, -1) + ")";
      }

      return {
        smd: null,
        parameters: null,
        id: null,

        __new__: __new__,
        toRepresentation: toRepresentation,
        toString: toString
      };
    });


    /**
     * Service Parameters class
     */
    type("rpc.Parameters", [], function (Parameters) {
      var
      $instanceOf    = type.instanceOf,
      $inspect       = std.inspect,
      ParametersData = type.$private(Parameters),
      $get = ParametersData.get,
      $set = ParametersData.set;

      /**
       * @constructor
       * @param {Object} descriptors
       * @param {Array|Object} arrayOrObject
       */
      function __new__(descriptors, arrayOrObject) {

        var
        data    = {},
        descriptorc = descriptors.length,
        byName  = data.byName  = {},
        byIndex = data.byIndex = new Array(descriptorc),
        descriptor, i, l, name;

        $set(this, data);

        for (i = 0; i < descriptorc; ++i) {
          descriptor = descriptors[i];
          name = ToString(descriptor.name);
          byIndex[i] = byName[name] = {
            "name": name,
            "type": descriptor.type || "any",
            "optional": ToBoolean(descriptor.optional),
            "default": descriptor["default"],
            "index": i
          };
        }

        data.schema = new JSONSchema({
          "type": "object",
          "properties": byName
        });

        //if specified then import data
        if (arrayOrObject) {
          update.call(this, arrayOrObject);
        }
      }

      /**
       * @return {Array}
       */
      function keys() {
        return Object.keys($get(this).byName);
      }

      /**
       * @param {number|string} indexOrName
       * @return {*}
       */
      function get(indexOrName) {
        return $instanceOf(indexOrName, Number) ?
          _getByIndex(this, indexOrName) :
          _getByName(this, indexOrName);
      }

      /**
       * @param {number|string} indexOrName
       * @param {*} value
       */
      function set(indexOrName, value) {
        if ($instanceOf(indexOrName, Number)) {
          _setByIndex(this, indexOrName, value);
        } else {
          _setByName(this, indexOrName, value);
        }
        return this;
      }

      /**
       * @param {Object} arrayOrObject
       * @return {rpc.Parameter} this
       */
      function update(arrayOrObject) {
        var self = this, i, l;
        if (arrayOrObject) {
          if (_isArrayLike(arrayOrObject)) {
            this.isArray = true;
            for (i = 0, l = arrayOrObject.length; i < l; ++i) {
              _setByIndex(self, i, arrayOrObject[i]);
            }
          } else {
            this.isObject = true;
            for (i in arrayOrObject) {
              if (arrayOrObject.hasOwnProperty(i)) {
                _setByName(self, i, arrayOrObject[i]);
              }
            }
          }
          _validate(self);
        }
        return self;
      }

      /**
       * @return {Array}
       */
      function toArray() {
        var
        self   = this,
        length = _size(self),
        result = [], buf = [],
        desc, value;

        for (var i = 0; i < length; i++) {
          desc = _descriptorByIndex(self, i);
          value = _getByDescriptor(self, desc);
          buf.push(value);
          if (!desc.optional) {
            result = result.concat(buf);
            buf.length = 0;
          }
        }
        return result;
      }

      /**
       * @return {Object}
       */
      function toObject() {
        var
        self = this,
        l = _size(self), i, value, desc,
        result = {};
        for (i = 0; i < l; ++i) {
          desc = _descriptorByIndex(self, i);
          value = _getByDescriptor(self, desc);

          if (
            value !== undefined &&
            (!desc.optional || value !== desc["default"])
          ) {
            result[desc.name] = value;
          }
        }
        return result;
      }

      /**
       * @return {Array|Object}
       */
      function toJSON() {
        return this.isArray ? this.toArray() : this.toObject();
      }

      /**
       * @return {String}
       */
      function toRepresentation() {
        return type.getName(this.constructor) + '(' + _str(this) + ')';
      }

      /**
       * @return {String}
       */
      function toString() {
        return '[' + _str(this) + ']';
      }

      //util
      function _descriptorByIndex(self, index) {
        return $get(self).byIndex[index] || _throwError(index + " is not a valid argument index");
      }

      function _descriptorByName(self, name) {
        return $get(self).byName[name] || _throwError(name + " is not a valid argument name");
      }

      function _getByDescriptor(self, desc) {
        var value = self[desc.name];
        return value === undefined ? desc["default"] : value;
      }

      function _getByIndex(self, index) {
        return _getByDescriptor(self, _descriptorByIndex(self, index));
      }

      function _getByName(self, name) {
        return _getByDescriptor(self, _descriptorByName(self, name));
      }

      function _setByDescriptor(self, desc, value) {
        self[desc.name] = value;
      }

      function _setByIndex(self, index, value) {
        _setByDescriptor(self, _descriptorByIndex(self, index), value);
      }

      function _setByName(self, name, value) {
        _setByDescriptor(self, _descriptorByName(self, name), value);
      }

      function _size(self) {
        return $get(self).byIndex.length;
      }

      function _validate(self) {
        $get(self).schema.validate(self, {"throws": true});
      }

      function _str(self) {
        var
        hidden = self.__hidden__ || {},
        s = "",
        l = _size(self), i, value, desc, name,
        result = {};
        for (i = 0; i < l; ++i) {
          desc = _descriptorByIndex(self, i);
          value = _getByDescriptor(self, desc);
          name = desc.name;

          if (i !== 0) {
            s += ',';
          }
          s += name + '=';
          if (hidden[name]) {
            s += _mask(ToString(value).length);
          } else {
            s += $inspect(value);
          }
        }
        return s;
      }

      function _mask(length) {
        var s = "", i;
        for (i = 0; i < length; ++i) {
          s += "*";
        }
        return s;
      }

      function _isArrayLike(o) {
        return $instanceOf(o, Array) || (typeof o === 'object' && typeof o.length === 'number');
      }

      return {
        isArray: false,
        isObject: false,

        __new__: __new__,
        __hidden__: { "password": true },
        get: get,
        set: set,
        keys: keys,
        toArray: toArray,
        toObject: toObject,
        toJSON: toJSON,
        toRepresentation: toRepresentation,
        toString: toString
      };
    });


    ///////////////////////ENVELOPE///////////////////////////
    (function (envelope) {

      //====================URL ENVELOPE=====================
      envelope["URL"] = async(function (request) {
        var smd = request.smd;

        return {
          jsonpCallbackParameter: smd.jsonpCallbackParameter,
          target: smd.target,

          contentType: smd.contentType,
          contentString: _queryString(request.parameters.toObject())
        };
      });

      //=====================JSON ENVELOPE======================
      envelope["JSON"] = async(function (request) {

        var
        smd        = request.smd,
        jsonObject = _parametersToJSON(request.parameters, smd.parametersType);

        return async.resolve({
          jsonpCallbackParameter: smd.jsonpCallbackParameter,
          target: smd.target,

          contentType: "application/json",//smd.contentType,
          contentJSON: jsonObject,
          contentString: JSON.stringify(jsonObject),

          onload: JSON.parse,
          onerror: null
        });
      });

      //====================JSONRPC ENVELOPE=====================
      envelope["JSON-RPC-2.0"] = async(function (request) {

        return new async.Promise(function (resolve, reject) {
          _require([ 'JSONRPC' ], function (JSONRPC) {
            var
            smd         = request.smd,
            jsonRequest = new JSONRPC.Request(
              smd.name,
              _parametersToJSON(request.parameters, smd.parametersType),
              request.id
            );

            resolve({
              jsonpCallbackParameter: smd.jsonpCallbackParameter,
              target: smd.target,

              contentType: "application/json", //smd.contentType,
              contentJSON: jsonRequest.toJSON(),
              contentString: ToString(jsonRequest),

              onload: function (jsonData) {
                jsonData = JSONRPC.parseResponse(jsonData);
console.warn(jsonData);
                if (jsonData.error) {
                  throw jsonData.error;
                }
                if (jsonData.id !== request.id) {
                  throw new JSONRPCError('request/response id does not match', JSONRPCError.USER_INTERNAL_ERROR, request);
                }
                return jsonData.result;
              },
              onerror: null
            });
          });
        });

      });
      function _parametersToJSON(p, mode) {
        switch (mode) {
          case "object": return p.toObject();
          case "array": return p.toArray();
          default: return p.isArray ? p.toArray() : p.toObject()
        }
      }


      return envelope;
    }(rpc.envelope));

    ///////////////////////TRANSPORT///////////////////////////
    (function (transport) {
      function _http(data) {
        return new async.Promise(function (resolve, reject) {
          var
          self    = this,
          method  = ToString(data.method || 'GET').toUpperCase(),
          url     = data.url,
          withCredentials = ('withCredentials' in global.XMLHttpRequest.prototype),
          Request = withCredentials ? global.XMLHttpRequest :
            global.XDomainRequest || global.XMLHttpRequest,
          xhr     = new Request(),
          headers = data.headers || {}, key;


          xhr.onload = function (response) {
            //TODO: handle response status etc.
            resolve(response);
          };
          xhr.onerror = function (error) {
            reject(new Error(method + ' ' + url + ' (Http Error)'));
          };
          xhr.onabort = function () {
            self.cancel();
          };
          xhr.open(method, url, true);

          //set headers
          for (key in headers) {
            xhr.setRequestHeader(key, headers[key]);
          }

          xhr.send(data.data);
        });
      }

      //====================JSONP TRANSPORT=====================
      transport["JSONP"] = async(function (r) {
        return new async.Promise(function (resolve, reject) {
          _require(["JSONPRequest"], function (JSONPRequest) {
            var
            request = new JSONPRequest(),
            url     = _queryJoin(
              r.target,
              r.contentJSON ? { data: r.contentString } : r.contentString
            );

            request.onload = resolve;
            request.onerror = reject;
            request.open(url, r.jsonpCallbackParameter);
            request.send();
          });
        });
      });

      //====================GET TRANSPORT=====================
      transport["GET"] = async(function (r) {
        var url = _queryJoin(r.target, r.contentString);

        return _http({
          method: "GET",
          url: url,
          headers: {
            "Content-Type": r.contentType
          }
        });
      });

      //====================POST TRANSPORT=====================
      transport["POST"] = async(function (r) {
        return _http({
          method: "POST",
          url: r.target,
          headers: {
            "Content-Type": r.contentType
          },
          data: r.contentString
        });
      });
      return transport;
    }(rpc.transport));


    /**
     * Service SMD class
     */
    type("rpc.SMD", [], function (SMD) {
      var
      smdDefault = {
        name: "",
        envelope: "URL",
        transport: "POST",
        contentType: "application/json",
        target: baseURL,
        jsonpCallbackParameter: "callback",
        parametersType: 'auto'// this is a custom parameter (= not in spec)
        /*parameters: []*/
      },
      smdSchema = {
        "type": "object",
        "properties": {
          "envelope": { "type": "string", "optional": true },
          "transport": { "type": "string", "optional": true },
          "contentType": { "type": "string", "optional": true },
          "target": { "type": "string", "optional": true },
          "jsonpCallbackParameter": { "type": "string", "optional": true },
          "services": { "type": "object", "optional": true },
          "parametersType": { "type": "string", "optional": true, "enum" : ["object", "array", "auto"] },
          "parameters": {
            "type": "array",
            "optional": true,
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "required": true, "optional": false },
                "type": { "type": "any"/*[ "string", "array", "object" ]*/, "optional": true, "default": 'any' },
                "optional": { "type": "boolean", "optional": true, "default": false }
              }
            }
          }
        }
      };


      function __new__(data) {

        data = data || {};
        this.services = data.services || {};
        _serviceInherits(this, data);
        _serviceInherits(this, smdDefault);
        _serviceSMD(this, 0);

        //default values
        this.SMDVersion = this.SMDVersion;
        //root.id = root.id;
        this.description = this.description;
      }

      function forEach(fn, thisp) {
        function callback(root, thisp) {
          fn.call(thisp, root);
          var services = root.services, serviceName;
          if (services) {
            for (serviceName in services) {
              if (services.hasOwnProperty(serviceName)) {
                callback(services[serviceName], thisp);
              }
            }
          }
          return root;
        }

        callback(this, thisp);
      }

      function _serviceInherits(service, parent) {
        service.envelope = service.envelope || parent.envelope;
        service.transport = service.transport || parent.transport;
        service.contentType = service.contentType || parent.contentType;
        service.target = service.target || parent.target;
        service.jsonpCallbackParameter = service.jsonpCallbackParameter || parent.jsonpCallbackParameter;

        if (service.parameters || parent.parameters) {
          service.parameters = (parent.parameters || []).concat(service.parameters || []);
        }
        service.parametersType = service.parametersType || parent.parametersType;
        return service;
      }

      function _serviceSMD(root, d) {
        var services = root.services, service, serviceName;

        if (d >= 10) return;
        if (services) {
          for (serviceName in services) {
            if (services.hasOwnProperty(serviceName)) {
              service = services[serviceName];
              JSONSchema.validate(smdSchema, service, { "throws": true });

              service.name = service.name || (root.name ? root.name + "." + serviceName : serviceName);
              _serviceSMD(_serviceInherits(service, root), d + 1);
            }
          }
        }
        return root;
      }

      return {
        SMDVersion: "2.0",
        description: "",

        __new__: __new__,
        forEach: forEach
      };
    });

    //util
    function _require(names, fn) {
      if (global.require) {
        global.require(names, fn);
      } else {
        fn.apply(null, names.map(type.require));
      }
    }


    function _queryString(o) {
      if (typeof o === "string") return o;
      var propertyName, s = "", isEmpty = true;
      for (propertyName in o) {
        s += (isEmpty ? "" : "&") + encodeURIComponent(propertyName);
        s += "=" + encodeURIComponent(o[propertyName]);
        isEmpty = false;
      }
      return s;
    }

    function _queryJoin(base, part) {
      part = _queryString(part);
      if (part) {
        base += ((base.indexOf("?") === -1) ? '?' : '&') + part;
      }
      return base;
    }

    function _throw(e) {
      throw e;
    }

    function _throwError(message, opt_class) {
      throw new (opt_class || Error)(message);
    }

    function _void() {

    }

    function _consoleDebug(var_args) {
      var c = global.console, p = "[rpc]";
      switch (arguments.length) {
        case 1: c.debug(p, arguments[0]);break;
        case 2: c.debug(p, arguments[0], arguments[1]);break;
        case 3: c.debug(p, arguments[0], arguments[1], arguments[2]);break;
        case 4: c.debug(p, arguments[0], arguments[1], arguments[2], arguments[3]);break;
      }
    }

    function _consoleError(var_args) {
      var c = global.console, p = "[rpc]";
      switch (arguments.length) {
        case 1: c.error(p, arguments[0]);break;
        case 2: c.error(p, arguments[0], arguments[1]);break;
        case 3: c.error(p, arguments[0], arguments[1], arguments[2]);break;
        case 4: c.error(p, arguments[0], arguments[1], arguments[2], arguments[3]);break;
      }
    }

    return rpc;
  }

  if (global.define) {
       global.define("rpc", [ "type", "async", "JSONSchema" ], provider);
     } else {
       provider(
         type,
         type.require('async'),
         type.require('JSONSchema')
       );
     }


/*
  //export angular
  if (typeof angular !== 'undefined') {
    angular
    .module("ngRpc", [])
    .factory(
      "$rpc",
      [function () {
        return function $rpc(smd) {
          return new rpc.Service(smd);
        }
      }]
    )
  }
*/

}(this, typeof exports !== 'undefined' ? exports : this));
