define(['JSONSchema', 'q'], function (JSONSchema, Q) {
  'use strict';

  var
  /*jshint evil:true */
  global     = (new Function('return this')).call(null),
  /*jshint evil:false */
  baseURL    = global.location ? global.location.href : "",
  isArray    = Array.isArray,
  Promise    = Q.Promise,
  toBoolean  = Boolean,
  toString   = String,
  toAsyncFn  = function (f) {
    if (f.isAsync) return f;
    var returnValue = function () {
      return Q.when(f.apply(this, arguments));
    };
    returnValue.isAsync = true;
    return returnValue;
  },
  aslice     = Array.prototype.slice;

  var rpc;
  (function (rpc) {

    /**
     * @param {String} name
     * @return {Function}
     */
    function envelope(name) {
      var fn = envelope[toString(name).toUpperCase()];
      return fn ? toAsyncFn(fn) : _throwError(name + " is not a valid envelope");
    }
    rpc.envelope = envelope;

    /**
     * @param {String} name
     * @return {Function}
     */
    function transport(name) {
      var fn = transport[toString(name).toUpperCase()];
      return fn ? toAsyncFn(fn) : _throwError(name + " is not a valid transport");
    }
    rpc.transport = transport;

    /**
     * Request class
     */
    var Request = (function () {
      var nextId = 1;

      function Request(smd, parameters) {
        this.smd = smd;
        this.parameters = parameters;
        this.id = nextId++;
      }

      /**
       * @return {string}
       */
      Request.prototype.inspect = function inspect() {
        return (this.constructor.displayName || this.constructor.name) +
          '#' + this.id +
          '(`' + toString(this) + '`)';
      };

      /**
       * @return {string}
       */
      Request.prototype.toString = function toString() {
        return this.smd.name + "(" + String(this.parameters).slice(1, -1) + ")";
      };

      return Request;
    }());
    rpc.Request = Request;

    /**
     * Service Parameters class
     */
    var Parameters = (function () {

      /**
       * @constructor
       * @param {Object} descriptors
       * @param {Array|Object} arrayOrObject
       */
      function Parameters(descriptors, arrayOrObject) {
        var
        data = this.__data__ = {},
        descriptorc = descriptors.length,
        byName  = data.byName  = {},
        byIndex = data.byIndex = new Array(descriptorc),
        descriptor, l, name;

        for (var i = 0; i < descriptorc; ++i) {
          descriptor = descriptors[i];
          name = toString(descriptor.name);
          byIndex[i] = byName[name] = {
            "name": name,
            "type": descriptor.type || "any",
            "optional": toBoolean(descriptor.optional),
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
          this.update(arrayOrObject);
        }
      }

      Parameters.prototype.__hidden__ = { "password": true };

      /**
       * @return {String}
       */
      Parameters.prototype.inspect = function inspect() {
        return (this.constructor.displayName || this.constructor.name) + '(' +
          _str(this) +
        ')';
      };

      /**
       * @return {Array}
       */
      Parameters.prototype.keys = function keys() {
        return Object.keys(this.__data__.byName);
      };

      /**
       * @param {number|string} indexOrName
       * @return {*}
       */
      Parameters.prototype.get = function get(indexOrName) {
        return _isNumber(indexOrName) ?
          _getByIndex(this, indexOrName) :
          _getByName(this, indexOrName);
      };

      /**
       * @param {number|string} indexOrName
       * @param {*} value
       */
      Parameters.prototype.set = function set(indexOrName, value) {
        if (_isNumber(indexOrName)) {
          _setByIndex(this, indexOrName, value);
        } else {
          _setByName(this, indexOrName, value);
        }
        return this;
      };

      /**
       * @param {Object} arrayOrObject
       * @return {rpc.Parameter} this
       */
      Parameters.prototype.update = function update(arrayOrObject) {
        var self = this;
        if (arrayOrObject) {
          var arr = _toArray(arrayOrObject);
          if (arr) {
            this.isArray = true;
            for (var i = 0, l = arr.length; i < l; ++i) {
              _setByIndex(self, i, arr[i]);
            }
          } else {
            this.isObject = true;
            for (var key in arrayOrObject) {
              if (arrayOrObject.hasOwnProperty(key)) {
                _setByName(self, key, arrayOrObject[key]);
              }
            }
          }
          _validate(self);
        }
        return self;
      };

      /**
       * @return {Array}
       */
      Parameters.prototype.toArray = function toArray() {
        var self   = this;
        var length = _size(self);
        var result = [];
        var buf    = [];
        var desc, value;

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
      };

      /**
       * @return {Object}
       */
      Parameters.prototype.toObject = function toObject() {
        var self = this;
        var l = _size(self), i, value, desc;
        var result = {};
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
      };

      /**
       * @return {Array|Object}
       */
      Parameters.prototype.toJSON = function toJSON() {
        return this.isArray ? this.toArray() : this.toObject();
      };

      /**
       * @return {String}
       */
      Parameters.prototype.toString = function toString() {
        return '[' + _str(this) + ']';
      };

      //util
      function _descriptorByIndex(self, index) {
        return self.__data__.byIndex[index] || _throwError(index + " is not a valid argument index");
      }

      function _descriptorByName(self, name) {
        return self.__data__.byName[name] || _throwError(name + " is not a valid argument name");
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
        return self.__data__.byIndex.length;
      }

      function _validate(self) {
        self.__data__.schema.validate(self, {"throws": true});
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
            s += _mask(toString(value).length);
          } else {
            s += (value && value.inspect ? value.inspect() : value);
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

      function _isNumber(o) {
        return typeof o === 'number';
      }

      function _toArray(o) {
        return (
          Array.isArray(o) ? o :
          o && o.toArray ? o.toArray() :
          typeof o.length === 'number' && !!o.callee ? aslice.call(o) :
          null
        );
      }

      return Parameters;
    }());
    rpc.Parameters = Parameters;


    var ServiceMethod = (function () {

      /**
       * @constructor
       * @param {rpc.Service} service
       * @param {rpc.SMD} smd
       */
      function ServiceMethod(service, smd) {
        function serviceMethod(/*[...]*/) {
          var argc = arguments.length;
          var args = new Array(argc);
          for (var i = 0; i < argc; ++i) {
            args[i] = arguments[i];
          }

          return (
            /* jshint validthis:true */
            serviceMethod.apply(this, args)
            /* jshint validthis:false */
          );
        }
        serviceMethod.smd = smd;
        serviceMethod.service = service;
        serviceMethod.debug = this.debug;

        serviceMethod.apply = this.apply;
        serviceMethod.bind = this.bind;
        serviceMethod.clone = this.clone;
        serviceMethod.envelope = this.envelope;
        serviceMethod.inspect = this.inspect;
        serviceMethod.transport = this.transport;
        serviceMethod.toString = this.toString;
        serviceMethod.__apply__ = this.__apply__;

        return serviceMethod;
      }

      ServiceMethod.prototype.debug = false;
      ServiceMethod.prototype.onRequestInit = null;
      ServiceMethod.prototype.onRequestTransport = null;
      ServiceMethod.prototype.onRequestLoad = null;
      ServiceMethod.prototype.onRequestError = null;
      ServiceMethod.prototype.onReturn = null;

      /**
       * @param {Object=} thisp
       * @param {Object|Array} args
       */
      ServiceMethod.prototype.apply = function apply(thisp, args) {
        return this.__apply__(new rpc.Parameters(this.smd.parameters || [], args));
      };

      /**
       * @param {Object=} thisp
       * @return {rpc.ServiceMethod}
       */
      ServiceMethod.prototype.bind = function bind(thisp) {
        var result = this.clone();
        result.service = thisp;
        return result;
      };

      /**
       * @param {Object=} thisp
       * @return {rpc.ServiceMethod}
       */
      ServiceMethod.prototype.clone = function clone() {
        return new ServiceMethod(this.service, this.smd);
      };

      /**
       * Dump string representation
       *
       * @return {String}
       */
      ServiceMethod.prototype.inspect = function inspect() {
        return _str(this, '...');
      };

      /**
       * @param {String} name
       * @return {Function}
       */
      ServiceMethod.prototype.envelope = function envelope(name) {
        return (this.service || rpc).envelope(name);
      };

      /**
       * @param {String} name
       * @return {Function}
       */
      ServiceMethod.prototype.transport = function transport(name) {
        return (this.service || rpc).transport(name);
      };

      /**
       * String representation
       *
       * @return {String}
       */
      ServiceMethod.prototype.toString = function toString() {
        return _str(this);
      };

      ServiceMethod.prototype.__apply__ = function __apply__(parameters) {
        var
        self     = this,
        smd      = self.smd,
        service  = self.service,
        isDebug  = (self.debug || service.debug),
        request  = new rpc.Request(smd, parameters),
        debug    = isDebug ? _consoleDebug : _void,
        debugErr = isDebug ? _consoleError : _void,
        promise;

        debug(toString(request) + ' envelope=' + smd.envelope + ' transport=' + smd.transport);
        promise = Q['try'](function () {
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
            function (result) {
              return _delegate(self, 'onRequestLoad', request, result) || result;
            },
            function (error) {
              return _delegate(self, 'onRequestError', request, error) || _throw(error);
            }
          )
          ["finally"](function (val, isFailure) {
            //3. log
            if (!isFailure) {
              debug(toString(request) + ' -> ', val);
            } else {
              debugErr(toString(request) + ' -> ', toString(val));
            }
          });

        return _delegate(self, 'onReturn', request, promise) || promise;
      };

      //util

      function _delegate(self, methodName) {
        var service = self.service, method, result;
        var args = aslice.call(arguments, 2);
        if (self[methodName]) {
          result = self[methodName].apply(self, args);
        } else if (service[methodName]) {
          result = service[methodName].apply(service, args);
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


      return ServiceMethod;
    }());
    rpc.ServiceMethod = ServiceMethod;

    var Service = (function () {

      /**
       * @constructor
       * @param {Object} smd
       * @param {Object=} options -> see #config()
       */
      function Service(smd, options) {
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

      Service.prototype.debug = false;
      Service.prototype.onRequestInit = null;
      Service.prototype.onRequestTransport = null;
      Service.prototype.onRequestLoad = null;
      Service.prototype.onRequestError = null;
      Service.prototype.onReturn = null;

      /**
       * Configure the service
       *
       * @param {Object=} data
       *  - debug: true|false
       * @return this
       */
      Service.prototype.config = function config(data) {
        var p;
        if (data) {
          for (p in data) {
            if (p in this) {
              this[p] = data[p];
            }
          }
        }
        return this;
      };

      /**
       *
       * @return {Service}
       */
      Service.prototype.concat = function concat(var_args) {
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
      };

      /**
       * @param {String} name
       * @return {Function}
       */
      Service.prototype.envelope = function envelope(name) {
        return rpc.envelope(name);
      };

      /**
       * @param {String} name
       * @return {Function}
       */
      Service.prototype.transport = function transport(name) {
        return rpc.transport(name);
      };

      function _forward(self, eventName) {
        return function () {
          var result;
          if (self[eventName]) {
            result = self[eventName].apply(self, arguments);
          }
          return result;
        };
      }

      return Service;
    }());
    rpc.Service = Service;

    /**
     * Service SMD class
     */
    var SMD = (function () {
      var SMD_DEFAULT = {
        name: "",
        envelope: "URL",
        transport: "POST",
        contentType: "application/json",
        target: baseURL,
        jsonpCallbackParameter: "callback",
        parametersType: 'auto'// this is a custom parameter (= not in spec)
        /*parameters: []*/
      };
      var SMD_SCHEMA = {
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

      function SMD(data) {
        data = data || {};
        this.services = data.services || {};
        _serviceInherits(this, data);
        _serviceInherits(this, SMD_DEFAULT);
        _serviceSMD(this, 0);

        //default values
        this.SMDVersion = this.SMDVersion;
        //root.id = root.id;
        this.description = this.description;
      }

      SMD.prototype.SMDVersion = "2.0";
      SMD.prototype.description = "";

      SMD.prototype.forEach = function forEach(fn, thisp) {
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
      };

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
              JSONSchema.validate(SMD_SCHEMA, service, { "throws": true });

              service.name = service.name || (root.name ? root.name + "." + serviceName : serviceName);
              _serviceSMD(_serviceInherits(service, root), d + 1);
            }
          }
        }
        return root;
      }

      return SMD;
    }());
    rpc.SMD = SMD;

  }(rpc || (rpc = {})));



  ///////////////////////ENVELOPE///////////////////////////
  (function (envelope) {
    /*jshint sub:true*/

    //====================URL ENVELOPE=====================
    envelope["URL"] = toAsyncFn(function (request) {
      var smd = request.smd;

      return {
        jsonpCallbackParameter: smd.jsonpCallbackParameter,
        target: smd.target,

        contentType: smd.contentType,
        contentString: _queryString(request.parameters.toObject())
      };
    });

    //=====================JSON ENVELOPE======================
    envelope["JSON"] = toAsyncFn(function (request) {

      var
      smd        = request.smd,
      jsonObject = _parametersToJSON(request.parameters, smd.parametersType);

      return Q.resolve({
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
    envelope["JSON-RPC-2.0"] = toAsyncFn(function (request) {

      return new Promise(function (resolve, reject) {
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
            contentString: toString(jsonRequest),

            onload: function (jsonData) {
              jsonData = JSONRPC.parseResponse(jsonData);

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
        default: return p.isArray ? p.toArray() : p.toObject();
      }
    }

    /*jshint sub:false*/
    return envelope;
  }(rpc.envelope));

  ///////////////////////TRANSPORT///////////////////////////
  (function (transport) {
    /*jshint sub:true*/

    function _http(data) {
      return new Promise(function (resolve, reject) {
        var
        self    = this,
        method  = toString(data.method || 'GET').toUpperCase(),
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
    transport["JSONP"] = toAsyncFn(function (r) {
      return new Promise(function (resolve, reject) {
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
    transport["GET"] = toAsyncFn(function (r) {
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
    transport["POST"] = toAsyncFn(function (r) {
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

    /*jshint sub:false*/
  }(rpc.transport));


  //util
  function _require(names, fn) {
    if (typeof require !== 'undefined') {
      require(names, fn);
    } else {
      _throwError('no loader');
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
    var Constructor = opt_class || Error;
    throw new Constructor(message);
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
});
