// jshint ignore: start

(function (global, undefined) {

  "use strict";

  function typeProvider() {

var typeOld = global.type;

/**
 * Return a new class function
 * 
 * @param {String} name
 * @param {Array} parents
 * @param {Object=} opt_instanceMembers
 * @param {Object=} opt_staticMembers
 * @return {Function}
 */
function type(name, parents, opt_instanceMembers, opt_staticMembers) {
  return type.create(name, parents, opt_instanceMembers, opt_staticMembers);
}

/**
 * @return {type}
 */
type.noConflict = function noConflict() {
  global.type = typeOld;
  return type;
};

global.type = type;

var ES;
(function (ES) {
  var
  ObjectPrototype  = Object.prototype,
  ArrayPrototype   = Array.prototype,
  objectHasOwn     = ObjectPrototype.hasOwnProperty,
  objectToString   = ObjectPrototype.toString,
  objectSetDefault = function (o, prop, defaultValue) {
    if (!ES.HasOwnProperty(o, prop)) {
      o[prop] = defaultValue;
    } 
  },
  isFinite         = global.isFinite,
  isNaN            = global.isNaN,
  isObject         = function (o) { 
    /* jshint eqnull:true */ 
    return o != null && Object(o) === o; 
  },
  isArray          = Array.isArray || function (o) { 
    return objectToString.call(o) === '[object Array]';
  },
  arraySlice       = ArrayPrototype.slice,

  /** 
   * @const 
   * @type {number} 
   */
  MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1,

  /** 
   * @const 
   * @type {number} 
   */
  MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -ES.MAX_SAFE_INTEGER,
  abs              = Math.abs,
  floor            = Math.floor;

  function _assertObject(o) {
    if (!isObject(o)) {
      throw new TypeError(o + ' is not a valid object');
    }
    return o;
  }

  
  function _assertCallable(o) {
    if (!IsCallable(o)) {
      throw new TypeError(o + ' is not a valid callable');
    }
    return o;
  }

  function _assertBoolean(o) {
    if (typeof o !== 'boolean') {
      throw new TypeError(o + ' is not a valid boolean');
    }
    return o;
  }

  function _assertIsPropertyKey(k) {
    if (!IsPropertyKey(k)) {
      throw new TypeError(k + ' is not a valid property key');
    }
    return k;
  }

  function Void() { }
  ES.Void = Void;

  /**
   * @constructor
   */
  ES.Symbol = global.Symbol;

  /*
  function $$OwnPropertyKeys(o) {
    return Object.keys(o);
  }
  ES.$$OwnPropertyKeys = $$OwnPropertyKeys;

  function $$GetPrototypeOf(o) {
    return Object.getPrototypeOf(o);
  }
  ES.$$GetPrototypeOf = $$GetPrototypeOf;

  function $$SetPrototypeOf(o, proto) {
    return Object.setPrototypeOf(o, proto);
  }
  ES.$$SetPrototypeOf = $$SetPrototypeOf;*/

  /**
   * @param {*} o
   * @param {string=} opt_message
   * @return {*}
   */
  function CheckObjectCoercible(o, opt_message) {
    /* jshint eqnull:true */
    if (o == null) {
      throw new TypeError(opt_message || ('Cannot call method on ' + o));
    }
    return o;
  }
  ES.CheckObjectCoercible = CheckObjectCoercible;

  function ToObject(o) {
    return Object(CheckObjectCoercible(o));
  }
  ES.ToObject = ToObject;

  function ToString(o) {
    return String(o);
  }
  ES.ToString = ToString;

  function ToBoolean(o) {
    return Boolean(o);
  }
  ES.ToBoolean = ToBoolean;

  function ToNumber(o) {
    return Number(o);
  }
  ES.ToNumber = ToNumber;

  //Numbers
  ES.MAX_SAFE_INTEGER = MAX_SAFE_INTEGER;
  ES.MIN_SAFE_INTEGER = MIN_SAFE_INTEGER;

  /**
   * @param {number} o
   * @return {number}
   */
  function ToInt32(o) {
    return o >> 0;
  }
  ES.ToInt32 = ToInt32;

  /**
   * @param {number} o
   * @return {number}
   */
  function ToUint32(o) {
    return o >>> 0;
  }
  ES.ToUint32 = ToUint32;

  /**
   * @param {number} o
   * @return {number}
   */
  function ToInteger(o) {
    var num = ToNumber(o);
    return (
      isNaN(num) ? 0 :
      num === 0 || !isFinite(num) ? num :
      Math.sign(num) * floor(abs(num))//TODO math sign()
    );
  }
  ES.ToInteger = ToInteger;

  /**
   * @param {number} value
   * @return {number}
   */
  function ToLength(value) {
    var len = ToInteger(value);
    return len <= 0 ? 0 : 
      len > MAX_SAFE_INTEGER ? MAX_SAFE_INTEGER :
      len;
  }
  ES.ToLength = ToLength;

  

  /*
  function ToPrimitive(o, opt_hint) {
    var $$toPrimitive = ES.Symbol.toPrimitive, result;
    switch (opt_hint) {
      case undefined: opt_hint = "default"; break;
      case Number: opt_hint = "number"; break;
      case String: opt_hint = "string"; break;
    }
    if (o[$$toPrimitive]) {
      result = o[$$toPrimitive](opt_hint);
    } else {
      result = opt_hint === "string" ? ToString(o) : ToNumber(o);
    }
    return result;
  }
  ES.ToPrimitive = ToPrimitive;
  */

  /**
   * @param {!Object} o
   * @return {string|Symbol}
   */
  function ToPropertyKey(o) {
    return ES.Type(o) === "symbol" ? o : ToString(o);
  }
  ES.ToPropertyKey = ToPropertyKey;

  /*function AssertType(o, type) {

  }
  ES.AssertType = AssertType;*/

  /**
   * @param {Function} fn
   * @param {*=} thisp
   * @param {Arguments|Array=} args
   * @return {*}
   */
  function Call(fn, thisp, args) {
    _assertCallable(fn);
    var hasThisp = thisp !== undefined, result;
    switch (args ? args.length : 0) {
      case 0: result = hasThisp ? 
        fn.call(thisp) : 
        fn(); 
        break;
      case 1: result = hasThisp ?
        fn.call(thisp, args[0]) : 
        fn(args[0]); 
        break;
      case 2: result = hasThisp ? 
        fn.call(thisp, args[0], args[1]) : 
        fn(args[0], args[1]); 
        break;
      case 3: result = hasThisp ? 
        fn.call(thisp, args[0], args[1], args[2]) : 
        fn(args[0], args[1], args[2]); 
        break;
      case 4: result = hasThisp ? 
        fn.call(thisp, args[0], args[1], args[2], args[3]) :
        fn(args[0], args[1], args[2], args[3]); 
        break;
      case 5: result = hasThisp ? 
        fn.call(thisp, args[0], args[1], args[2], args[3], args[4]) :
        fn(args[0], args[1], args[2], args[3], args[4]); 
        break;
      default: 
        args = isArray(args) ? args : arraySlice.call(args);
        result = fn.call.apply(fn, [ thisp ].concat(args));
        //result = fn.apply(thisp, args);
    }
    return result;
  }
  ES.Call = Call;

  /**
   * @param {Object} proto
   * @param {Object=} opt_properties
   * @return {*}
   */
  function ObjectCreate(proto, opt_properties) {
    return Object.create(proto, opt_properties);
  }
  ES.ObjectCreate = ObjectCreate;

  /**
   * @param {Object} target
   * @param {Object} source
   * @return {Object}
   */
  ES.ObjectAssign = Object.assign;

  /**
   * @param {*} o
   * @return {string}
   */
  function ObjectToStringTag(o) {
    return ObjectToString(o).slice(8, -1);
  }
  ES.ObjectToStringTag = ObjectToStringTag;

  /**
   * @param {*} o
   * @return {string}
   */
  function ObjectToString(o) {
    return objectToString.call(o);
  }
  ES.ObjectToString = ObjectToString;

  /**
   * @param {*} o
   * @return {string}
   */
  function Type(o) {
    return typeof o;
  }
  ES.Type = Type;

  /**
   * @param {*} o1
   * @param {*} o2
   * @return {boolean}
   */
  ES.SameValue = Object.is;

  /**
   * @param {*} a
   * @param {*} b
   * @return {boolean}
   */
  function SameValueZero(a, b) {
    // same as SameValue except for SameValueZero(+0, -0) == true
    return (a === b) || (isNaN(a) && isNaN(b));
  }
  ES.SameValueZero = SameValueZero;

  /**
   * @param {*} o
   * @return {boolean}
   */
  function IsCallable(o) {
    return !!o && typeof o.call === 'function';
  }
  ES.IsCallable = IsCallable;

  /**
   * @param {*} o
   * @return {boolean}
   */
  function IsPropertyKey(o) {
    var type = ES.Type(o);
    return type === 'string' || type === 'symbol';
  }
  ES.IsPropertyKey = IsPropertyKey;

  /**
   * @param {!Object} o
   * @return {boolean}
   */
  function IsExtensible(o) {
    return Object.isExtensible(o);
  }
  ES.IsExtensible = IsExtensible;

  //properties

  /**
   * @param {!Object} o
   * @param {string} name
   * @return {boolean}
   */
  function HasProperty(o, name) {
    _assertObject(o);
    _assertIsPropertyKey(name);
    return (name in o);
  }
  ES.HasProperty = HasProperty;

  /**
   * @param {!Object} o
   * @param {string} name
   * @return {boolean}
   */
  function HasOwnProperty(o, name) {
    _assertIsPropertyKey(name);
    return o && o.hasOwnProperty ? o.hasOwnProperty(name) : objectHasOwn.call(o, name);
  }
  ES.HasOwnProperty = HasOwnProperty;

  /**
   * @param {!Object} o
   * @param {string} name
   * @return {ObjectPropertyDescriptor|undefined}
   */
  function GetOwnProperty(o, name) {
    _assertIsPropertyKey(name);
    return Object.getOwnPropertyDescriptor(o, name);
  }
  ES.GetOwnProperty = GetOwnProperty;

  /**
   * @param {!Object} o
   * @param {string} name
   * @param {!ObjectPropertyDescriptor} desc
   * @return {!Object}
   */
  function DefineOwnProperty(o, name, desc) {
    return Object.defineProperty(o, name, desc);
  }
  ES.DefineOwnProperty = DefineOwnProperty;

  /**
   * @param {!Object} o
   * @param {string} name
   * @return {boolean}
   */
  function DeleteOwnProperty(o, name) {
    return delete o[name];
  }
  ES.DeleteOwnProperty = DeleteOwnProperty;

  /**
   * @param {!Object} o
   * @param {string} name
   * @return {Function}
   */
  function GetMethod(o, name) {
    _assertObject(o);
    _assertIsPropertyKey(name);
    var result = o[name];
    if (result !== undefined) {
      _assertCallable(result);
    }
    return result;
  }
  ES.GetMethod = GetMethod;

  /**
   * @param {!Object} o
   * @param {string} name
   * @param {Array} args
   * @return {Function}
   */
  function Invoke(o, name, args) {
    _assertObject(o);
    _assertIsPropertyKey(name);
    return Call(o[name], o, args);
  }
  ES.Invoke = Invoke;

  /**
   * @param {!Object} o
   * @return {Iterator}
   */
  function Enumerate(o) {
    return CreateListIterator(ES.GetOwnPropertyKeys(o, String));
  }
  ES.Enumerate = Enumerate;

  /**
   * @param {!Object} o
   * @param {Function=} opt_type
   * @return {Array}
   */
  function GetOwnPropertyKeys(o, opt_type) {
    var result;
    switch (opt_type) {
      case undefined:
        result = Object.keys(o).concat(Object.getOwnPropertySymbols(o));
        break;
      case String: 
        result = Object.keys(o);
        break;
      case Symbol:
        result = Object.getOwnPropertySymbols(o);
        break;
      default:
        throw new TypeError();
    }
    return result;
  }
  ES.GetOwnPropertyKeys = GetOwnPropertyKeys;

  

  //Iterators functions
  /**
   * @param {*} o
   * @return { { next: function (number=): {value: *, done: boolean} } }
   */
  function GetIterator(o) {
    return _assertObject(o[ES.Symbol.iterator]());
  }
  ES.GetIterator = GetIterator;

  /**
   * @param { { next: function (number=): {value: *, done: boolean} } } iter
   * @param {number=} opt_value
   * @return { {value: *, done: boolean} }
   */
  function IteratorNext(iter, opt_value) {
    return _assertObject(iter.next(opt_value));
  }
  ES.IteratorNext = IteratorNext;

  /**
   * @param {{value: *, done: boolean}} iterResult
   * @return {boolean}
   */
  function IteratorComplete(iterResult) {
    return ToBoolean(_assertObject(iterResult).done);
  }
  ES.IteratorComplete = IteratorComplete;

  /**
   * @param {{value: *, done: boolean}} iterResult
   * @return {*}
   */
  function IteratorValue(iterResult) {
    return ToBoolean(_assertObject(iterResult).value);
  }
  ES.IteratorValue = IteratorValue;

  function CreateIterResultObject(value, done) {
    return { value: value, done: _assertBoolean(done) };
  }
  ES.CreateIterResultObject = CreateIterResultObject;

  function CreateListIterator(list) {
    var 
    $$iterator = ES.Symbol.iterator,
    iter       = list[$$iterator];

    if (list[$$iterator]) {
      iter = list[$$iterator]();
    } else {
      var i = 0;
      iter = {};
      iter[$$iterator] = function (value) {
        value = value || 1;
        var iterResult;
        if (i < list.length) {
          iterResult = CreateIterResultObject(list[i], false);
        } else {
          i += value;
          iterResult = CreateIterResultObject(undefined, true);
        }
        return iterResult;
      };
    }
    return iter;
  }
  ES.CreateListIterator = CreateListIterator;

  var emptyList = [];
  function CreateEmptyIterator() {
    return CreateListIterator(emptyList);
  }
  ES.CreateEmptyIterator = CreateEmptyIterator;

  /**
   * @param {object} o
   * @return {boolean}
   */
  function IsIterable(o) {
    var result = false;
    switch (ES.ObjectToStringTag(o)) {
      case 'Undefined':
      case 'Null':
        break;
      case 'String':
      case 'Arguments':
      case 'Array':
        result = true;
        break;
      default: 
        result = ES.HasProperty(o, ES.Symbol.iterator);
    }
    return result;
  }
  ES.IsIterable = IsIterable;

  /**
   * @param {function} Constructor
   * @param {Array} args
   * @return {function}
   */
  function Construct(Constructor, args) {
    // CreateFromConstructor
    var 
    $$create = ES.Symbol.create,
    obj, result;

    if (Constructor[$$create]) {
      obj = Constructor[$$create]();
      _assertObject(obj);
    } else {
      // OrdinaryCreateFromConstructor
      obj = ObjectCreate(Constructor.prototype || null);
    }

    // Call the constructor.
    result = Call(Constructor, obj, args);
    return isObject(result) ? result : obj;
  }
  ES.Construct = Construct;

  /**
   * @param {object=} options
   * @param {name} property
   * @return {function}
   */
  function GetOption(options, property) {
    var result;
    if (options !== undefined) {
      _assertObject(options);
      result = options[property];
    }
    return result;
  }
  ES.GetOption = GetOption;

  /**
   * @param {string} fullName
   * @param {function=} opt_parent
   * @param {object=} opt_descriptors
   * @return {function}
   */
  function Constructor(fullName, opt_parent, opt_descriptors) {
    fullName = ToString(fullName || '');
    opt_parent = opt_parent || Object;
    opt_descriptors = opt_descriptors || {};

    var
    ctorDesc = opt_descriptors.constructor || {},
    ctor     = ctorDesc.value || (ctorDesc.get && ctorDesc.get()) || Void,
    index    = fullName.lastIndexOf('.'),
    baseName = index >= 0 ? fullName.slice(index + 1) : fullName,
    /*jslint evil: true*/
    builder  = new Function("construct",
      "return (function " + baseName + "() {\n" +
      "  return construct(" + (baseName || 'arguments.callee') + ", this, arguments);\n" +
      "});"
    ), 
    /*jslint evil: false*/
    result   = builder(function (Constructor, thisp, args) {
      return ES.Call(ctor, thisp, args);
      /*return ES.IsInstanceOf(thisp, Constructor) ? 
        ES.Call(ctor, thisp, args) :
        ES.Construct(Constructor, args);*/
    });

    opt_descriptors.constructor = { value: result };
    if (fullName.length) {
      objectSetDefault(opt_descriptors, ES.Symbol.toStringTag, { value: fullName });
    }
    result.prototype = ES.Prototype(opt_parent.prototype, opt_descriptors);
    return result;
  }
  ES.Constructor = Constructor;

  function PrototypeDescriptor(desc) {
    var descNew = ES.ObjectAssign({}, desc);
    objectSetDefault(descNew, 'enumerable', false);
    objectSetDefault(descNew, 'writable', true);
    objectSetDefault(descNew, 'configurable', true);
    return descNew;
  }

  /**
   * @param {object=} opt_proto
   * @param {object=} opt_descriptors
   * @return {object}
   */
  function Prototype(opt_proto, opt_descriptors) {
    opt_proto = opt_proto || Object;

    var 
    descriptors = {},
    props, prop, i, l;

    if (opt_descriptors) {
      props = ES.GetOwnPropertyKeys(opt_descriptors);
      for (i = 0, l = props.length; i < l; ++i) {
        prop = props[i];
        descriptors[prop] = PrototypeDescriptor(opt_descriptors[prop]);
      }
    }
    return ObjectCreate(opt_proto, descriptors);
  }
  ES.Prototype = Prototype;

  /**
   * Return true if `o` is instance of `klass`
   *
   * @param {*} o
   * @param {Function} klass
   * @return {boolean}
   */
  function IsInstanceOf(o, klass) {
    return o instanceof klass;
  }
  ES.IsInstanceOf = IsInstanceOf;

}(ES || (ES = {})));

(function (ES) {

  var
  objectString = Object.prototype.toString;

  ES.Symbol = global.Symbol || (function (/*_super*/) {
    var 
    NAME          = 'Symbol',
    SECRET        = {},
    NAMES         = {},
    _name_create  = function (opt_description) {
      opt_description = opt_description !== undefined ? String(opt_description) : '';

      var postfix = 0;
      while (NAMES[opt_description + (postfix || '')]) {
        ++postfix;
      }
      opt_description += (postfix || '');
      NAMES[opt_description] = true;
      return '@@' + opt_description;
    },
    $$internal    = _name_create('symbolInternal'),
    $$description = _name_create('symbolDescription'),
    $$data        = _name_create('symbolData');

    //util
    function _get_data(o) {
      return o[$$data] || _throw_error(o + ' must have ' + $$data, TypeError);
    }

    function _throw_error(message, klass) {
      var C = (klass || Error);
      throw new C(message);
    }

    /**
     * @constructor
     */
    function Symbol(opt_description) {
      if (this instanceof Symbol) {
        if (arguments[1] !== SECRET) {
          _throw_error("", TypeError);
        }
        this[$$data] = this;
        this[$$internal] = _name_create(opt_description);
        this[$$description] = opt_description;

        Symbol[this[$$internal].slice(2)] = this;//instances
      } else {
        return new Symbol(opt_description, SECRET);
      }
    }

    Symbol.displayName = NAME;

    Symbol.prototype.valueOf = function valueOf() {
      return _get_data(this)[$$internal];
    };

    Symbol.prototype.toRepresentation = function toRepresentation() {
      return NAME + '(' + (_get_data(this)[$$description] || "") + ')';
    }; 

    Symbol.prototype.toString = function toString() {
      return this.valueOf();
    };

    Symbol.polyfill = true;

    Symbol.create = Symbol('create');
    Symbol.hasInstance = Symbol('hasInstance');
    Symbol.isConcatSpreadable = Symbol('isConcatSpreadable');
    Symbol.isRegExp = Symbol('isRegExp');
    Symbol.iterator = Symbol('iterator');
    Symbol.toPrimitive = Symbol('toPrimitive');
    Symbol.toStringTag = Symbol('toStringTag');
    Symbol.unscopables = Symbol('unscopables');

    Symbol.prototype[Symbol.toStringTag] = NAME;
    Symbol.prototype[Symbol.toPrimitive] = function (/*opt_hint*/) {
      _throw_error("", TypeError);
    };

    global.Symbol = Symbol;
    return Symbol;
  }(Object));

  if (!ES.SameValue) {
    ES.SameValue = function (a, b) {
      return (
        a === b ? (a === 0 ? 1 / a === 1 / b : true) : 
        Number.isNaN(a) && Number.isNaN(b)
      );
    };
  }

  if (!ES.ObjectAssign) {
    ES.ObjectAssign = function (target, source) {
      var to = ToObject(target);
      var from = ToObject(source);
      var keys = ES.GetOwnPropertyKeys(from);
      for (var i = 0, l = keys.length, key; i < l; ++i) {
        key = keys[i];
        to[key] = from[key];
      }
      return to;
    };
  }

  if (global.Symbol.polyfill) {
    (function () {
      var 
      Symbol = global.Symbol, 
      HasProperty = ES.HasProperty,
      HasOwnProperty = ES.HasOwnProperty,
      $$hasInstance = Symbol.hasInstance, 
      $$toStringTag = Symbol.toStringTag;

      function _is_symbol_key(str) {
        return typeof str === 'string' && str.slice(0, 2) === '@@';
      }

      function _get_symbol(str) {
        return Symbol[str.slice(2)];
      }

      ES.Type = function (o) {
        var result = typeof o;
        if (result === 'object') {
          if (o === null) {
            result = 'null';
          } else if (o instanceof Symbol) {
            result = 'symbol';
          }
        }
        return result;
      };

      ES.HasProperty = function (o, name) {
        return HasProperty(o, ToString(name));
      };

      ES.HasOwnProperty = function (o, name) {
        return HasOwnProperty(o, ToString(name));
      };

      ES.DeleteOwnProperty = function (o, name) {
        return delete o[ToString(name)];
      };

      ES.GetOwnPropertyKeys = function (o, type) {
        var result = [], keys = Object.keys(o), i, l, k;
        for (i = 0, l = keys.length; i < l; ++i) {
          k = keys[i];
          switch (type) {
            case undefined:
              result.push(_is_symbol_key(k) ? _get_symbol(k) : k);
              break;
            case String:
              if (!_is_symbol_key(k)) {
                result.push(k);
              }
              break;
            case Symbol:
              if (_is_symbol_key(k)) {
                result.push(_get_symbol(k));
              }
              break;
            default:
              throw new TypeError();
          }
        }
        return result;
      };

      ES.Enumerate = function (o) {
        var list = [], prop;
        for (prop in o) {
          if (!_is_symbol_key(prop)) {
            list.push(prop);
          }
        }
        return ES.CreateListIterator(list);
      };

      var builtinTags = ["Arguments", "Array", "Boolean", "Date", "Error", "Function", "Number", "RegExp", "String"];
      ES.ObjectToStringTag = function (o) {
        var tag, builtinTag;
        if (o === undefined) {
          tag = 'Undefined';
        } else if (o === null) {
          tag = 'Null';
        } else {
          builtinTag = objectString.call(o).slice(8, -1);
          tag = o[$$toStringTag];
          if (tag) {
            if (typeof tag !== 'string') {
              tag = '???';
            } else if (builtinTag !== tag && builtinTags.indexOf(tag) >= 0) {
              tag = '~' + tag;
            }
          } else {
            tag = builtinTag;
          }
        }
        return tag;
      };

      ES.ObjectToString = function (o) {
        return '[object ' + ES.ObjectToStringTag(o) + ']';
      };

      ES.IsInstanceOf = function (o, constructor) {
        var result;
        if (constructor[$$hasInstance]) {
          result = ES.ToBoolean(constructor[$$hasInstance](o));
        } else {
          result = o instanceof constructor;
        }
        return result;
      };

    }());
    

    
  }

}(ES));


//util
var 
TYPE_NULL = 1,
TYPE_UNDEFINED = 2,
TYPE_BOOLEAN = 4,
TYPE_FUNCTION = 8,
TYPE_NUMBER = 16,
TYPE_STRING = 32,
TYPE_OBJECT = 64,

TYPE_EMPTY = TYPE_NULL|TYPE_UNDEFINED,
TYPE_SCALAR = TYPE_BOOLEAN|TYPE_NUMBER|TYPE_STRING,
TYPE_MUTABLE = TYPE_OBJECT|TYPE_FUNCTION,

PROPERTY_INTERNAL = {
  //'name': true,
  '__proto__': true,
  //'callee': true,
  //'caller': true,
  'arguments': true,
  /*length: true,*/
  'prototype': true,
  'constructor': true
},
DESCRIPTOR_READONLY = { writable: false, configurable: true },
DESCRIPTOR_HIDDEN = { enumerable: false, writable: true, configurable: true },

ObjectPrototype  = Object.prototype,
ArrayPrototype   = Array.prototype,

//symbols*
Symbol           = ES.Symbol,
//$$create         = Symbol.create,
$$hasInstance    = Symbol.hasInstance,
$$iterator       = Symbol.iterator,
$$toStringTag    = Symbol.toStringTag,

defineProperties = Object.defineProperties,
defineProperty   = Object.defineProperty,
arraySlice       = ArrayPrototype.slice,
$type_of_cache,

//assert
$assert_array, $assert_callable, $assert_iterable, $assert_function, $assert_object, 
$assert_string, $assert_true, $assert_iterator,

//object
$object_assign, $object_mixin, 
$object_create = ES.ObjectCreate, $object_keys, $object_freeze, 
$object_has    = ES.HasProperty, 
$object_hasown = ES.HasOwnProperty, 
$object_proto, $object_proto_in, $object_equals, $object_get, 
$object_tag    = ES.ObjectToStringTag, 

//function
$constructor, $call, $throw_error, $type_of,

//properties
$property_def, $property_names, $property_descriptor, $property_descriptor_in,
$property_protected, $property_hidden, $property_descriptors, 


ToString  = ES.ToString,
ToBoolean = ES.ToBoolean,
ToNumber  = ES.ToNumber,
ToObject  = ES.ToObject;

function $Identity(o) { return o; }

function $Void() {}

//is_*
function $is_empty(o) {
  return o === undefined || o === null;
}

function $is_defined(o) {
  return !$is_empty(o);
}

function $is_array(o) {
  return $object_tag(o) === 'Array';
}

/*
function $is_boolean(o) {
  return $object_tag(o) === 'Boolean';
}*/

function $is_number(o) {
  return $object_tag(o) === 'Number';
}

function $is_string(o) {
  return $object_tag(o) === 'String';
}

function $is_function(o) {
  return typeof o === "function";
}

function $is_callable(o) {
  return ES.IsCallable(o); 
}

function $is_iterable(o) {
  return $is_array(o) || $is_string(o) || (o && $is_function(o[$$iterator]));
}

function $is_prototype(o) {
  return (
    o !== null &&
    typeof o === "object" && 
    $object_hasown(o, "constructor") && 
    $is_function(o.constructor)
  );
}

function $is_iterator(o) {
  return o && $is_function(o.next);
}

function $is_type_native(o) {
  var result = false;
  switch (o) {
    case Object:
    case Number:
    case Boolean:
    case String:
    case Function:
    case Array:
    case RegExp:
    case Date:
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      result = true;
  }
  return result;
}

//string
function $string_upper(s) {
  return ToString(s).toUpperCase();
}

function $string_lcfirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function $string_ucfirst(s) {
  return $string_upper(s.charAt(0)) + s.slice(1);
}

/*
function $string_isupper(s) {
  return $string_upper(s) === s;
}
*/

(function () {

  //reflect
  $object_keys = Object.keys;
  $object_get = function (o, name, opt_default) {
    return $object_hasown(o, name) ? o[name] : opt_default;
  };
  $object_freeze = Object.freeze || $Identity;

  $object_assign = Object.assign || function (target, source) {
    var keys = $object_keys(source), key, i = 0, l = keys.length;
    while (i < l) {
      key = keys[i];
      target[key] = source[key];
      ++i;
    }
    return target;
  };
  $object_mixin = Object.mixin || function (target, source) {
    $property_def(target, $property_descriptors(source));
    return target;
  };
  $object_proto = Object.getPrototypeOf;
  $object_proto_in = function getPrototypesOf(o) {
    var 
    result = arguments[1] || [],
    parent = $object_proto(o);

    if (parent) {
      result.push(parent);
      getPrototypesOf(parent, result);
    }
    return result;
  };

  //$getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  //$getOwnPropertyDescriptors = 

  $constructor = function (fullName) {
    fullName = ToString(fullName || '');

    var
    /*jslint evil: false*/
    Constructor = ES.Constructor(fullName, Object, {
      constructor: { value: function constructor(/*...*/) {
        var
        self   = this === global ? undefined : this, // force strict
        isCall = !ES.IsInstanceOf(self, Constructor),
        args   = arguments,
        result;

        if (isCall) {
          if (Constructor.__apply__) {
            result = ES.Call(Constructor.__apply__, Constructor, args);
          } else {
            result = ES.Construct(Constructor, args);
          }
        } else {
          if (self.__new__) {
            result = ES.Call(self.__new__, self, args);
          }
        }
        return result;
      }}
  });
/*
  index    = fullName.lastIndexOf('.'),
    baseName = index >= 0 ? fullName.slice(index + 1) : fullName,
    builder  = new Function("construct",
      "return (function " + baseName + "() {\n" +
      "  return construct(" + (baseName || 'arguments.callee') + ", this, arguments);\n" +
      "});"
    ),
    ctor     = builder(function (Constructor, thisp, args) {
      var isCall = !ES.IsInstanceOf(thisp, Constructor), init, result;
      
      if (isCall && Constructor.__apply__) {
        result = ES.Call(Constructor.__apply__, Constructor, args);
      } else {
        if (isCall) {
          if (ES.HasProperty(Constructor, $$create)) {
            thisp = Constructor[$$create]();
          } else {
            // OrdinaryCreateFromConstructor
            thisp = ES.ObjectCreate(Constructor.prototype || null);
          }
        }
        init = thisp.__new__;
        if (init) {
          result = ES.Call(init, thisp, args);
        }
        if (isCall) {
          result = thisp;
        }
      }
      return result;
    });*/

    if (fullName.length) {
      $property_hidden(Constructor, "displayName", fullName);
      $property_hidden(Constructor.prototype, $$toStringTag, fullName);
    }
    return Constructor;
  };

  

  $call = function $call(o, opt_this) {
    return typeof o === "function" ? o.apply(opt_this, arraySlice.call(arguments, 2)) : o;
  };

  $assert_true = function (tester, typeName) {
    return function (o, opt_method) {
      if (!tester(o)) {
        $throw_error(
          opt_method ? opt_method + " called on a non-" + typeName :
          o + " is not a " + typeName,
          TypeError
        );
      }
      return o;
    };
  };

  $assert_array = $assert_true($is_array, "array");

  $assert_object = $assert_true(function (o) {
    var t = typeof o;
    return (t == "object" && o !== null) || t == "function";
  }, "object");

  $assert_function = $assert_true($is_function, "function");
  
  $assert_callable = $assert_true($is_callable, "callable");

  $assert_string = $assert_true($is_string, "string");

  $assert_iterable = $assert_true($is_iterable, "iterable");

  $assert_iterator = $assert_true($is_iterator, "iterator");

  $object_equals = function equals(a, b) {
    var 
    ka   = $object_keys(a), 
    kb   = $object_keys(b),
    l, key;

    if (ka.length != kb.length) {
      return false;
    }

    l = ka.length;
    while (l--) {
      key = ka[l];
      if (a[key] != b[key]) {
        return false;
      }
    }
    l = kb.length;
    while (l--) {
      key = kb[l];
      if (a[key] != b[key]) {
        return false;
      }
    }
    return true;
  };

  $throw_error = function $throw_error(message, opt_type) {
    var Constructor = opt_type || Error;
    throw new Constructor(message);
  };

  $type_of_cache = $object_create(null);
  $type_of_cache.Boolean = TYPE_BOOLEAN;
  $type_of_cache.Function = TYPE_FUNCTION;
  $type_of_cache.Number = TYPE_NUMBER;
  $type_of_cache.String = TYPE_STRING;
  $type_of = function of(o) {
    return (
      o === undefined ? TYPE_UNDEFINED :
      o === null ? TYPE_NULL : 
      $type_of_cache[$object_tag(o)] || TYPE_OBJECT
    );
  };


  ////////////////////////////Properties////////////////////////////
  $property_def = function (o, nameOrVals, val) {
    if (arguments.length >= 3) {
      defineProperty(o, nameOrVals, val);
    } else {
      defineProperties(o, nameOrVals);
    }
  };

  $property_names = Object.getOwnPropertyNames;
  $property_descriptor = Object.getOwnPropertyDescriptor;
  $property_descriptor_in = function $property_descriptor_in(o, name) {
    var result;
    if ($object_hasown(o, name)) {
      result = $property_descriptor(o, name);
    } else {
      var parent = $object_proto(o);
      if (parent) {
        result = $property_descriptor_in(parent, name);
      }
    }
    return result;
  };
  $property_hidden = function (o, name, value) {
    $property_def(o, name, {
      value: value,
      enumerable: false,
      writable: true,
      configurable: true
    });
  };
  $property_protected = function (o, name, value) {
    $property_def(o, name, {
      value: value,
      enumerable: false,
      writable: false,
      configurable: true
    });
  };

  $property_descriptors = function (o, opt_internals) {
    $assert_object(o);
    var
    descriptors = {}, descriptor,
    names       = $property_names(o),
    i, l, name;

    for (i = 0, l = names.length; i < l; ++i) {
      name = names[i];

      if (opt_internals || !$object_hasown(PROPERTY_INTERNAL, name)) {
        descriptor = $property_descriptor(o, name);
        if (descriptor) {
          descriptors[name] = descriptor;
        }
      }
    }
    return descriptors;
  };

  

}());


var 
//$array_empty = $object_freeze([]),
arrayEvery = ArrayPrototype.every,
arrayFilter = ArrayPrototype.filter,
arrayMap = ArrayPrototype.map,
arrayReduce = ArrayPrototype.reduce,
arraySome = ArrayPrototype.some,
arrayString = ArrayPrototype.toString;

function $array_add(a, element) {
  var result = false;
  if ($array_indexof(a, element) < 0) {
    $array_push(a, element);
    result = true;
  }
  return result;
}

/*
function $array_addall(a, elements) {
  for (var i = 0, l = elements.length, element, changed = false; i < l; i++) {
    element = elements[i];
    if ($array_add(a, element)) {
      changed = true;
    }
  }
  return changed;
}
*/

function $array_clone(a) {
  for (var i = 0, l = a.length, clone = new Array(l); i < l; i++) {
    clone[i] = a[i];
  }
  return clone;
}

function $array_contains(a, element) {
  return $array_indexof(a, element) >= 0;
}

function $array_every(a, fn, opt_this) {
  return arrayEvery.call(a, fn, opt_this);
}

function $array_indexof(a, element) {
  var index = -1;
  for (var i = 0, l = a.length - 1, m = Math.floor(l / 2); i <= m; i++) { 
    if (a[i] === element) {
      index = i;
      break;
    }
    if (a[(l - i)] === element) {
      index = l - i; 
      break;
    }
  }
  return index;
}

function $array_isempty(a) {
  return a.length === 0;
}

function $array_filter(a, fn, opt_this) {
  return arrayFilter.call(a, fn, opt_this);
}

function $array_map(a, fn, opt_this) {
  return arrayMap.call(a, fn, opt_this);
}

function $array_push(a, element) {
  var l = a.length;
  a[l++] = element;
  if (a.length !== l) {
    a.length = l;
  }
}

function $array_pushall(a, tail) {
  var al = a.length;
  for (var i = 0, l = tail.length; i < l; i++) {
    a[al++] = tail[i];
  }
  if (a.length !== al) {
    a.length = al;
  }
  return a;
}

function $array_reduce(a, init, fn, opt_this) {
  return arrayReduce.call(a, init, fn, opt_this);
}

function $array_some(a, fn, opt_this) {
  return arraySome.call(a, fn, opt_this);
}

function $array_string(a) {
  return arrayString.call(a);
}

var 
FunctionPrototype = Function.prototype,
functionString    = FunctionPrototype.toString;

function $function_apply(callable, thisp, args) {
  return callable.apply ? callable.apply(thisp, args) :
    callable.call.apply(callable, $array_pushall([thisp], args));
}

function $function_assign(fn, properties) {
  $assert_function(fn);
  var 
  proto = fn.prototype, propertyName,
  descs = $property_descriptors(properties);
  $object_assign(proto, properties);

  //fix prototype
  for (propertyName in descs) {
    $object_assign(descs[propertyName], DESCRIPTOR_HIDDEN);
  }
  $property_def(proto, descs);
}

function $function_name(fn, val) {
  if (arguments.length >= 2) {
    $assert_function(fn);
    val = ToString(val);

    var str = functionString.call(fn);
    str = 'function ' + val + str.slice(str.indexOf('('));

    fn.displayName = val;
    $property_protected(fn, "displayName", val);
    fn.toString = function toString() {
      return str;
    };
  } else {
    //$assert_function(fn);
    var name = fn.displayName || fn.name, fnName;
    if (name) {
      return name;
    } else {
      fnName = functionString.call(fn);
      fnName = fnName.substr(9);//'function '.length
      fnName = fnName.substr(0, fnName.indexOf('('));
      //cache it
      $property_hidden(fn, "displayName", fnName);
      return fnName;
    }
  }
}

function $function_prototype(fn) {
  return $assert_function(fn).prototype; 
}

function $function_inherits(base, parent) {
  $assert_function(base);
  $assert_function(parent);
  var proto = base.prototype;
  base.prototype = $object_create(
    parent.prototype, 
    $property_descriptors(proto, true)
  );
  return base;
}

function $function_string(fn) {
  return functionString.call(fn);
}

//add internal
PROPERTY_INTERNAL.displayName = true;


(function (Error) {
  var
  ErrorPrototype = Error.prototype,
  isMozilla      = typeof Components !== 'undefined',
  //hasLineNumber = !!Error.prototype.lineNumber, //ex: Firefox
  hasStack       = !!ErrorPrototype.stack //ex: Chrome, Nodejs, ...
  ;


  /**
   * @param {Object} obj
   * @param {Function} stripPoint
   */
  if (!Error.captureStackTrace) {
    Error.captureStackTrace = function captureStackTrace(obj/*, stripPoint*/) {
      if (hasStack) {
        var
        error = new Error(),
        stack = error.stack.split("\n");

        // remove one stack level:
        if (isMozilla) {
          // Mozilla:
          stack.shift();
        }

        //Remove first calls
        stack.splice(0, 2);
        stack.unshift(ToString(obj));
        obj.stack = {
          object: obj,
          entries: stack,
          toString: function toString() {
            return ToString(this.object) + '\n' + this.entries.join("\n");
          }
        };
      }
    };
  }
}(Error));

var std;
(function () {

  var Object = ES.Constructor("std.Object");

  var Module = ES.Constructor("std.Module", Object, {
    constructor: { value: function constructor(moduleName) {
      var
      self   = this,
      isCall = ES.IsInstanceOf(self, Module) && self !== std;

      if (isCall) {
        Object.call(self);
      } else {
        var moduleType = ES.Constructor(moduleName, Module);
        self = new moduleType();
      }
      return self;
    }},
    toString: { value: function toString() {
      return ES.ObjectToString(this);
    }}
  });
  std = new Module("std");
  std.Module = Module;
  std.Object = Object;

  /**
   * Symbol alias
   */
  std.Symbol = Symbol;

  /**
   * 
   * @param {*} o
   */
  function destroy(o) {
    return o && o.__destroy__ ? o.__destroy__() : false;
  }
  std.destroy = destroy;

  //global
  global.std = std;
}());

std.Prototypes = (function (_super) {
  var Prototypes = ES.Constructor("std.Prototypes", _super, {
    length: { value: 0 },
    __owner__: { value: 0 },

    constructor: { value: function constructor(o) {
      this.__owner__ = o;
      this.length = 0;
    }},

    push: { value: function push(/*...*/) {
      return this.pushAll(arguments);
    }},

    pushAll: { value: function pushAll(prototypes) {
      var added = [], i, l, prototype;
      this.onBeforeChange();
      for (i = 0, l = prototypes.length; i < l; i++) {
        prototype = prototypes[i];
        if (_add(this, prototype)) {
          added.push(prototype);
        }
      }
      this.onAfterChange(added);
    }},

    toString: { value: function toString() {
      return $array_string(this);
    }},

    onBeforeChange: { value: $Void },

    onAfterChange: { value: $Void }
  });

  function _add(self, element) {
    if ($array_add(self, element)) {
      $property_def(self, self.length - 1, DESCRIPTOR_READONLY);
      return true;
    }
    return false;
  }

  return Prototypes;
}(Array));


var 
_pathSep     = ".",
_pathReParts = /[a-zA-Z_$][0-9a-zA-Z_$]*/;

function $assert_path(o) {
  $assert_string(o);
  var parts = o.split(_pathSep), l = parts.length;
  for (var i = 0; i < l; i++) {
    if (!_pathReParts.test(parts[i])) {
      throw SyntaxError(o + " is not a valid path");
    }
  }
  return o;
}

function $path_base(string) {
  string = ToString(string);
  var i = string.lastIndexOf(_pathSep);
  return i >= 0 ? string.slice(i + 1) : string;
}

function $path_join(var_args) {
  return $array_reduce(arguments.length > 1 ? arguments : var_args, _path_join_reduce, "");
}
function _path_join_reduce(acc, v) {
  return (
    v.length === 0 ? acc : 
    acc.length === 0 ? v : 
    acc + _pathSep + v
  );
}

function $path_parent(string) {
  string = ToString(string);

  var i = string.lastIndexOf(_pathSep);
  return i >= 0 ? string.slice(0, i) : "";
}

function $path_split(string) { 
  return ToString(string).split(_pathSep); 
}



function $module_get(string) {
  string = ToString(string);

  var 
  cursor = global,
  parts  = $path_split(string), 
  i = 0, l = parts.length, part;
  while (i < l) {
    part = parts[i];
    cursor = cursor[part];
    if (!cursor) {
      break;
    }
    i += 1;
  }
  return cursor;
}

function $module_set(string, value) {
  var 
  parentName = $path_parent(string),
  baseName   = $path_base(string),
  parent     = _module_mkpath(parentName, global);
  parent[baseName] = value;
  //return value;
}

function $module_create(name, properties) {
  $assert_path(name);
  var moduleNew = _module_mkpath(name, global);
  properties = $call(properties, moduleNew, moduleNew);
  if (properties) {
    _module_copy(moduleNew, properties);
  }
  return moduleNew;
}

function _module_mkpath(fullpath, root) {
  if (!fullpath.length) {
    return root;
  }

  var 
  baseName   = $path_base(fullpath),
  parent     = _module_mkpath($path_parent(fullpath), root);

  if (!$object_hasown(parent, baseName)) {
    parent[baseName] = std.Module(fullpath);
  }
  return parent[baseName];
}

function _module_copy(mod, properties) {
  var 
  modPath = mod === global ? "" : $function_name(mod.constructor),
  descriptors = $property_descriptors(properties), 
  propertyName, val;

  for (propertyName in descriptors) {
    val = descriptors[propertyName].value;
    if ($is_function(val) && !val.displayName) {
      $function_name(val, $path_join(modPath, propertyName));
    }
  }
  $property_def(mod, descriptors);
}

var $type = (function () {
  var
  Prototypes       = std.Prototypes,
  PROTOS           = Symbol("protos"),
  CAST             = "cast",
  INHERITED        = "__inherited__",
  __all__          = (function () {
    return $array_map(
      [
      Object, Number, Boolean, String, Function, Array, RegExp, Date,
      Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError
      ],
      $function_prototype
    );
  }()),
  __queue__        = [],
  
  ObjectPrototypes = $object_freeze(new Prototypes(ObjectPrototype)),
  
  required         = (function () {
    var t = $constructor("Required");
    $function_assign(t, {
      toString: function () { return "<type.required>"; }
    });
    return $object_freeze(new t());
  }()),

  TypeBase         = std.Object; //or Object?

  //add internals
  PROPERTY_INTERNAL[PROTOS] = true;

  $function_assign(Prototypes, {
    onBeforeChange: function () {
      this._mroBak = _getMRO(this.__owner__);
    },
    onAfterChange: function (added) {
      var 
      owner = this.__owner__,
      ownerCtor = owner.constructor,
      ownerMroOld = this._mroBak, ownerMroNew,
      hook, i, l, proto, protoCtor;

      this._mroBak = null;

      if (added.length) {
        _onChange(owner, true);
        ownerMroNew = _getMRO(owner);
        //inherited hook
        for (i = 0, l = ownerMroNew.length; i < l; ++i) {
          proto = ownerMroNew[i];
 
          if (!$array_contains(ownerMroOld, proto)) {
            protoCtor = proto.constructor;
            hook = $object_get(protoCtor, INHERITED);
            if (hook) {
              hook.call(protoCtor, ownerCtor);
            }
          }
        }
      }
    }
  });


  /**
   * @param {String} name
   * @param {Array} parents
   * @param {Object} properties
   */
  function create(name, parents, opt_instanceMembers, opt_staticMembers) {
    $assert_path(name);
    parents = $array_clone($assert_array(parents));

    var klass = $constructor(name);
    var priv = $private(name), has = priv.has, get = priv.get;
    var __private = function (o) {
      var data;
      if (!has(o)) {
        data = {};
        priv.set(o, data);
      } else {
        data = get(o);
      }
      return data;
    };

    //inherits
    if (parents.length === 0) {
      $array_add(parents, TypeBase);
    }
    $function_inherits(klass, parents[0]);
    _createPrototypes(klass);
    _createPrototypes(klass.prototype).pushAll($array_map(parents, $function_prototype));
    $module_set(name, klass);

    

    //properties
    opt_instanceMembers = $call(opt_instanceMembers, klass, klass, __private);
    if (opt_instanceMembers) {
      defineProperties(klass.prototype, $property_descriptors(opt_instanceMembers));
    }
    _validatePrototype(klass.prototype);

    opt_staticMembers = $call(opt_staticMembers, klass, klass, __private);
    if (opt_staticMembers) {
      defineProperties(klass, $property_descriptors(opt_staticMembers));
    }
    _validatePrototype(klass);
    return klass;
  }

  /**
   * Return `fn` name
   * 
   * @param {Function} fn
   * @return {String}
   */
  function getName(o) {
    return $is_function(o) ? $function_name(o) : $object_tag(o);
  }

  /**
   * Define properties
   *
   * To add/remove descriptors filters :
   * type.defineProperties.push(function (o, descriptors) {})
   *
   * @param {Object} o
   * @param {Object} descriptors
   */
  var defineProperties_filters = [];
  function defineProperties(o, descriptors) {
    $assert_object(o, "type.defineProperties");
    descriptors = ToObject(descriptors);
    $assert_object(descriptors, "type.defineProperties");

    var i, l;
    l = defineProperties_filters.length;
    for (i = 0; i < l; ++i) {
      defineProperties_filters[i](o, descriptors);
    }

    //patch descriptor for prototype
    $property_def(o, _filterNonRequired(descriptors));
    if (_isType(o)) {
      $object_assign(_getOwnDescriptors(o), descriptors);
      if (getChildren(o).length > 0) {
        _onChange(o, true);
      }
    }
    return o;
  }
  defineProperties.push = function push(fn) {
    defineProperties_filters.push(fn);
    return this;
  };

  //add new filters
  defineProperties
  .push(function (o, descriptors) {
    var name, descriptor;
    if ($is_prototype(o)) {
      for (name in descriptors) {
        descriptor = descriptors[name];
        descriptor.enumerable = false;
        if (!("writable" in descriptor)) {
          descriptor.writable = true;
        }
        if (!("configurable" in descriptor)) {
          descriptor.configurable = true;
        }
      }
    }
  })
  .push(function (o, descriptors) {
    var name, descriptor; 
    for (name in descriptors) {
      descriptor = descriptors[name];
      if (descriptor.lazy) {
        descriptors[name] = _descriptorLazy(name, descriptor);
      }
    }
  });

  /**
   * Define property
   *
   * @param {Object} o
   * @param {String} name
   * @param {Object} descriptor
   */
  function defineProperty(o, name, descriptor) {
    var desc = {};
    desc[name] = $assert_object(descriptor);
    return defineProperties(o, desc);
  }

  /**
   * Delete property
   *
   * @param {Object} o
   * @param {String} name
   */
  function deleteProperty(o, name) {
    if (_isType(o)) {
      var descs = _getOwnDescriptors(o);
      if ($object_hasown(descs, name)) {
        delete o[name];
        delete descs[name];
      }
    } else {
      if ($object_hasown(o, name)) {
        delete o[name];
      }
    }
  }

  /**
   *
   * @param {Object} o
   * @param {String} name
   */
  function has(o, name) {
    return $object_has(o, name);
  }

  /**
   *
   * @param {Object} o
   * @param {String} name
   */
  function hasOwn(o, name) {
    return $object_hasown(o, name);
  }

  /**
   * Define property
   *
   * @param {Object} o
   * @param {Object} values
   */
  function mixin(o, values) {
    return defineProperties(o, $property_descriptors(values));
  }

  /**
   * 
   *
   * @param {Object} o
   * @return {Object}
   */
  function getOwnPropertyDescriptors(o) {
    return _getOwnDescriptors($assert_object(o, "type.getOwnPropertyDescriptors"));//TODO clone
  }

  /**
   * 
   *
   * @param {Object} o
   * @param {String} name
   * @return {Object}
   */
  function getOwnPropertyDescriptor(o, name) {
    return getOwnPropertyDescriptors(o)[name];
  }

  /**
   * 
   *
   * @param {Object} o
   * @return {Array}
   */
  function prototypesOf(o) {
    return $array_clone(_getPrototypes($assert_object(o, 'type.prototypesOf')));
  }

  /**
   * Return an array of prototypes 
   *
   * @param {Object} object
   * @return {Array}
   */
  function mro(o) {
    return $array_clone(_getMRO($assert_object(o, "type.mro")));
  }

  /**
   * Return an object containing get/set for private Symbol
   *
   * @param {string=} opt_symbol
   * @return {Object}
   */
  function $private(typeOrName, opt_prototype) {

    var
    name    = (
      $is_empty(typeOrName) ? '' :
      $is_string(typeOrName) ? $assert_path(typeOrName) : 
      $path_base(getName(typeOrName)) + 'Data'
    ),
    sym     = Symbol($string_lcfirst(name)), 
    str     = Symbol.polyfill ? ToString(sym) : sym,
    ctor    = $constructor($string_ucfirst(name)),
    desc    = { enumerable: false, writable: true, configurable: true };

    ctor.symbol = sym;
    ctor.has = function has(o) {
      return $object_hasown(o, str);
    };
    ctor.get = function get(o) {
      return $object_hasown(o, str) ? 
        o[str] : 
        $throw_error((std.inspect || ToString)(o) + " has no " + str, TypeError);
    };
    ctor.set = function set(o, val) {
      desc.value = val;
      $property_def(o, str, desc);
    };

    if (opt_prototype) {
      $function_assign(ctor, opt_prototype);
    }
    return ctor;
  }

  /**
   * Apply super method
   * 
   * @param {Function} callee
   * @param {String} methodName
   * @param {Object} self
   * @param {Array|Arguments} args
   * @return {*}
   */
  function $super(callee, methodName, self, args) {
    $assert_function(callee, "type.$super");
    $assert_string(methodName, "type.$super");
    $assert_object(self, "type.$super");
    
    var 
    calleeProto = callee.prototype,
    proto    = $object_proto(self),
    protoMRO, method, parent, i, l;

    if (_isType(self)) {
      protoMRO = _getMRO(proto);
      i = $array_indexof(protoMRO, calleeProto);
      l = protoMRO.length;
      if (i >= 0) {
        i += 1;
        while (i < l) {
          method = $object_get(protoMRO[i], methodName);
          //method = protoMRO[i][methodName];
          if (method !== undefined) {
            break;
          }
          i += 1;
        }
      } else {
        $throw_error(getName(calleeProto) + " not found in mro of " + getName(proto));
      }
    } else {

      //prototypal way
      parent = $object_proto(calleeProto) || ObjectPrototype;
      method = parent[methodName];
    }
    
    if (method) {
      return ES.Call(method, self, args);
    }
  }

  /**
   * @param {Object} o
   * @return {Array}
   */
  function getChildren(o) {
    return o === ObjectPrototype ? __all__ : $array_filter(__all__, function (t) {
      return isChildOf(t.constructor, o.constructor);
    });
  }

  /**
   * Return true if `object` is instance of `klass`
   * 
   * @param {Object} o
   * @param {Function} typeBase
   * @return {Boolean}
   */
  function instanceOf(o, typeBase) {
    var otype = $type_of(o), result = false;
    switch (otype) {
      case TYPE_UNDEFINED:
      case TYPE_NULL: 
        break;
      default:
        switch (typeBase) {
          case Object: result = true; break;
          case Boolean: result = otype === TYPE_BOOLEAN; break;
          case String: result = otype === TYPE_STRING; break;
          case Number: result = otype === TYPE_NUMBER; break;
          case Function: result = otype === TYPE_FUNCTION; break;
          default:
            $assert_function(typeBase);
            if ($is_type_native(typeBase)) {
              result = $function_name(typeBase) === $object_tag(o);
            }

            if (!result) {
              if (typeBase[$$hasInstance]) {
                result = typeBase[$$hasInstance](o);
              } else if (TYPE_MUTABLE & otype) {
                if (o instanceof typeBase) {
                  result = true;
                } else {
                  var order = _getMRO(o);
                  result = order ? $array_contains(order, typeBase.prototype) : false;
                }
              }
            }
        }
    }
    return result;
  }

  /**
   * Type coercion
   *
   * @param {Object} o
   * @param {Function} typeBase
   * @return {*}
   */
  function $cast(o, typeBase) {
    var result;
    switch (typeBase) {
      case Object:
      case Boolean:
      case String:
      case Number: 
        result = typeBase(o);
        break;
      case Array: 
        result = (
          $is_empty(o) ? undefined :
          $is_array(o) ? o : 
          o.toArray ? o.toArray() : 
          $is_number(o.length) && !$is_function(o) ? $array_clone(o) :
          undefined
        );
        break;
      case Function: 
        result = (
          $is_function(o) ? o : 
          o && o.toFunction ? o.toFunction() : 
          $is_callable(o) ? function () { return $function_apply(o, this, arguments); } :
          undefined
        );
        break;
      default:
        $assert_function(typeBase);

        if (
          $is_defined(o) &&
          (
            //inline default: of instanceOf
            (typeBase[$$hasInstance] && typeBase[$$hasInstance](o)) ||
            (typeof o === "object" && 
              (
              o instanceof typeBase ||
              $array_contains(
                _getMRO($object_proto(o)), 
                typeBase.prototype
              )
              )
            )
          )
        ) {
          result = o;
        } else if (typeBase[CAST]) {
          result = typeBase[CAST](o);
        }
    }
    return result;
  }

  /**
   * 
   * 
   * @param {Function} typeChild
   * @param {Function} typeBase
   * @return {Boolean}
   */
  function isChildOf(typeChild, typeBase) {
    $assert_function(typeChild, "type.isChildOf");
    //$assert_function(typeBase, "type.isChildOf");
    var result, protoChild, protoBase;
    if (!typeBase) {
      result = false;
    } else {
      protoChild = typeChild.prototype;
      protoBase = typeBase.prototype;
      if (protoChild === protoBase || typeBase === Object) {
        result = true;
      } else if (_isType(protoBase)) {
        result = $array_contains(_getMRO(protoChild), protoBase);
      } else {
        result = protoChild instanceof typeBase;
      }
    }
    return result;
  }

  function _onChange(o, opt_resolve) {
    var trait, children, l, descriptors, descriptorOld, propertyName;
    if ($array_add(__queue__, o)) {
      //unset cache
      delete _getPrototypes(o).__mro__;
      children = getChildren(o);
      l = children.length;
      while (l--) {
        _onChange(children[l], false);
      }
    }

    if (opt_resolve) {
      //__queue__ = _c3MROMerge($array_map(__queue__, mro));
      while (__queue__.length) {
        trait = __queue__.pop();
        if (_isType(trait)) {
          descriptors = _getDescriptors(trait);

          for (propertyName in descriptors) {
            descriptorOld = $property_descriptor_in(trait, propertyName);

            if (descriptorOld && $object_equals(descriptors[propertyName], descriptorOld)) {
              delete descriptors[propertyName];
            }
          }

          //finally export
          $property_def(trait, descriptors);
        }
      }
    }
  }

  function _createPrototypes(o) {
    var val, descs = $property_descriptors(o);

    $array_add(__all__, o);//register

    $property_def(o, PROTOS, {
      value: val = new Prototypes(o),
      enumerable: false,
      writable: true,
      configurable: true
    });
    val.__descriptors__ = descs;
    return val;
  }

  function _getPrototypes(o) {
    var val;
    if (o === ObjectPrototype) {//never change Object.prototype
      val = ObjectPrototypes;
    } else if ($object_hasown(o, PROTOS)) {
      val = o[PROTOS];//make a copy
    } else {
      val = [ $object_proto(o) ];
    }
    return val;
  }

  function _validatePrototype(o) {
    if (!_isAbstract(o)) {
      var 
      required = _getRequired(o), 
      missing  = [], 
      prop;
      for (prop in required) {
        if (!(prop in o)) {
          missing.push(prop);
        }
      }
      if (missing.length > 0) {
        $throw_error(o + ' must define properties : "' + missing.join('", "') + '"');
      }
    }
  }

  function _getOwnDescriptors(o) {
    var result;
    if (_isType(o)) {
      result = _getPrototypes(o).__descriptors__;
    } else {
      //classic prototypal inheritance
      result = $property_descriptors(o);
    }
    return result;
  }

  function _getDescriptors(o) {
    var result, mro, l;

    mro = _getMRO(o);
    result = {};

    l = mro.length;
    while (l--) {
      $object_assign(result, _filterNonRequired(_getOwnDescriptors(mro[l])));
    }
    return result;
  }

  function _getRequired(o) {
    var result, mro, l;

    mro = _getMRO(o);
    result = {};

    l = mro.length;
    while (l--) {
      $object_assign(result, _filterRequired(_getOwnDescriptors(mro[l])));
    }
    return result;
  }

  function _getMRO(o) {
    var val, protos;
    if (_isType(o)) {
      protos = _getPrototypes(o);
      val = protos.__mro__;
      if (val === undefined) {
        val = protos.__mro__ = $array_pushall([o], _c3MROMerge($array_map(_getPrototypes(o), _getMRO)));
      }
    } else {
      //classic prototypal inheritance
      val = $array_pushall([o], $object_proto_in(o));
    }
    return val;
  }

  function _c3MROMerge(arrayOfarray) {
    var 
    mro = [],
    current = $array_clone(arrayOfarray),
    type, found, i, l;

    function arrayRestContainsType(a) {
      return a.indexOf(type, 1) >= 0; 
    }

    function arrayPopType(a) {
      return a[0] === type ? a.slice(1) : a;
    }

    while (true) {
      found = false;
      l = current.length;
      for (i = 0; i < l; ++i) {
        if (current[i].length !== 0) {
          type = current[i][0];

          if (!$array_some(current, arrayRestContainsType)) {//in tail
            found = true;
            $array_add(mro, type);
            current = $array_map(current, arrayPopType);
            break;
          }
        }
      }
      if (!found) {
        if ($array_every(current, $array_isempty)) {
          return mro;
        }
        $throw_error("Cannot create a consistent method resolution order (MRO)");
      }
    }
  }

  function _filterNonRequired(descriptors) {
    var result = {}, props = $object_keys(descriptors), prop, desc, i, l;
    for (i = 0, l = props.length; i < l; ++i) {
      prop = props[i];
      desc = descriptors[prop];
      if (desc.value !== required) {
        result[prop] = desc;
      }
    }
    return result;
  }

  function _filterRequired(descriptors) {
    var result = {}, props = $object_keys(descriptors), prop, desc, i, l;
    for (i = 0, l = props.length; i < l; ++i) {
      prop = props[i];
      desc = descriptors[prop];
      if (desc.value === required) {
        result[prop] = desc;
      }
    }
    return result;
  }

  function _isType(o) {
    return $object_has(o, PROTOS);
  }

  function _isAbstract(o) {
    return $object_keys(_filterRequired(_getOwnDescriptors(o))).length > 0;
  }

  function _descriptorLazy(propertyName, desc) {
    var 
    descNew = $object_assign({}, desc),
    writable = $object_get(desc, "writable", true),
    enumerable = $object_get(desc, "enumerable", true),
    configurable = $object_get(desc, "configurable", true),
    getter  = $assert_callable(desc.get),
    setter = function (o, val) {
      if (!$is_prototype(o)) {
        $property_def(o, propertyName, { 
          value: val, 
          enumerable: enumerable, 
          configurable: configurable, 
          writable: false 
        });
        return val;
      }
    };
    descNew.get = function () {
      return setter(this, getter.call(this));
    };
    descNew.set = function (val) {
      if (!writable) {
        $throw_error("Cannot assign to read only property '" + propertyName + "' of " + this, TypeError);
      }
      setter(this, val);
    };
    descNew.configurable = true;
    delete descNew.writable;
    delete descNew.lazy;//mark as processed
    return descNew;
  }


  //export
  return {
    cast: $cast,
    constructor: $constructor,
    create: create,
    defineProperties: defineProperties,
    defineProperty: defineProperty,
    deleteProperty: deleteProperty,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    getOwnPropertyDescriptors: getOwnPropertyDescriptors,
    getName: getName,
    has: has,
    hasOwn: hasOwn,
    instanceOf: instanceOf,
    isChildOf: isChildOf,
    mixin: mixin,
    mro: mro,
    $private: $private,
    prototypeOf: $object_proto,
    prototypesOf: prototypesOf,
    required: required,
    $super: $super
  };
}());

(function () {
  var
  $name          = $type.getName,
  $type_def      = $type.defineProperty,
  $type_mixin    = $type.mixin;


  $type_mixin(Error, {
    __inherited__: function __inherited__(subclass) {
      $type_def(subclass.prototype, "name", {
        value: $name(subclass || Object)
      });
    }
  });

  $type_mixin(Error.prototype, {
    __new__: function __new__(dataOrMessage) {
      var key;
      if ($is_string(dataOrMessage)) {
        this.message = ToString(dataOrMessage);
      } else {
        for (key in dataOrMessage) {
          if (key in this) {//property must be defined in prototype chain
            this[key] = dataOrMessage[key];
          }
        }
      }
      Error.captureStackTrace(this, this.constructor);
    }
  });
}());





//expose functions
$object_assign(type, $type);

$object_assign(type, {
  UNDEFINED: TYPE_UNDEFINED,
  NULL: TYPE_NULL,
  BOOLEAN: TYPE_BOOLEAN,
  NUMBER: TYPE_NUMBER,
  STRING: TYPE_STRING,
  FUNCTION: TYPE_FUNCTION,
  OBJECT: TYPE_OBJECT,

  /**
   *
   * @param {*} object
   * @return {Number}
   */
  of: $type_of,

  /**
   * Return a new module object
   * 
   * @param {String} name
   * @param {Object|Function} properties
   * @return {Module}
   */
  module: function module(name, properties) {
    return $module_create(name, properties);
  },

  path: {
    baseName: $path_base,
    join: $path_join,
    parentName: $path_parent,
    split: $path_split
  },

  /**
   *
   * @param {string} string
   * @return {*}
   */
  require: function require(string) {
    var m = $module_get(string);
    return m !== undefined ? m : $throw_error(string + " does not exist");
  }

  
});

(function (std) {
  var
  //uid
  ID_SYMBOL  = Symbol("id"),
  ID_CURRENT = 1,
  ID_RADIX   = 36;

  /**
   * 
   * @return {string}
   */
  function uid() {
    var id = ID_CURRENT.toString(ID_RADIX);
    ++ID_CURRENT;
    return id;
  }
  std.uid = uid;

  /**
   * 
   * @return {string}
   */
  function id(o) {
    return o ? o[ID_SYMBOL] : undefined;
  }
  std.id = id;

  $type.defineProperty(std.Object.prototype, ID_SYMBOL, {
    get: uid,
    lazy: true
  });
}(std));

(function (std) {
  var
  console    = global.console,
  hasConsole = !!console,
  isHandling = false;

  /**
   * Default error handler
   */
  std.onerror = null;

  /**
   * @param {Error|*} error
   */
  function handleError(error) {
    var 
    handler  = std.onerror,
    uncaught = !handler, 
    fatalError;
    if (!isHandling) {
      isHandling = true;
      if (!uncaught) {
        try {
          $assert_callable(handler);
          uncaught = !handler.call(std, error);
        } catch (e) {
          uncaught = true;
          fatalError = e;
        }
      }
      if (uncaught) {
        _handleUncaughtError(error, 'Uncaught ');
      }
      isHandling = false;
    } else {
      fatalError = error;
    }
    if (fatalError) {
      _handleUncaughtError(fatalError, 'Fatal ');
    }
    //return uncaught;
  }
  std.handleError = handleError;

  /**
   * @param {function} fn
   * @param {*} opt_thisp
   * @param {Array} opt_args
   */
  function $try(fn, opt_thisp, opt_args) {
    $assert_callable(fn);

    var result, thisp = opt_thisp || this;
    try {
      if (opt_args) {
        result = fn.apply(thisp, opt_args);
      } else {
        result = fn.call(thisp);
      }
    } catch (error) {
      std.handleError(error);
    }
    return result;
  }
  std['try'] = $try;


  function _handleUncaughtError(error, prefix) {
    if (hasConsole && console.error) {
      var str = type.instanceOf(error, Error) ? ToString(error.stack || error) : (std.inspect || ToString)(error);
      console.error(prefix + str);
    } else {//rethrow so it is catched by global.onerror
      throw error;
    }
  }


}(std));



(function (std) {

  /**
   * @param {Object} source
   * @param {Object=} opt_destination
   * @return {Object}
   */
  function copy(source, opt_destination) {
    if (!opt_destination) {
      opt_destination = _copy(source, null, _copy);
    } else {
      if ($assert_object(source) === $assert_object(opt_destination)) {
        $throw_error("Source and destination are identical.");
      }
      _copy(source, opt_destination, _copy);
    }
    return opt_destination;
  }
  std.copy = copy;


  /**
   * @param {*} o
   * @return {*}
   */
  function clone(o) {
    return o && o.clone ? o.clone() : _copy(o, null, $Identity);
  }
  std.clone = clone;


  function _copy(src, dest, eachFn) {
    var descs, prop, props, desc, l, i;

    switch ($type_of(src)) {
      case TYPE_UNDEFINED:
      case TYPE_NULL: 
        dest = src;
        break;
      case TYPE_BOOLEAN: dest = ToBoolean(src); break;
      case TYPE_NUMBER: dest = ToNumber(src); break;
      case TYPE_STRING: dest = ToString(src); break;
      default:
        switch ($object_tag(src)) {
          case "Array": 
            l = src.length;
            dest = dest || new Array(l);
            for (i = 0; i < l; i++) {
              dest[i] = eachFn(src[i]);
            }
            break;
          case "Date": 
            dest = dest || new Date();
            dest.setTime(src.getTime()); 
            break;
          case "RegExp": 
            dest = new RegExp(src.source);//immutable
            break;
          default: 
            descs = $property_descriptors(src);
            props = $object_keys(descs);

            for (i = 0, l = props.length; i < l; i++) {
              desc = descs[props[i]];
              if ($object_hasown(desc, "value")) {
                desc.value = eachFn(desc.value);
              }
            }

            if (dest) {
              $property_def(dest, descs);
              props = $object_keys(dest);
              for (i = 0, l = props.length; i < l; i++) {
                prop = props[i];
                if (!$object_hasown(src, prop)) {
                  $type.deleteProperty(dest, prop);
                }
              }
            } else {
              dest = $object_create($object_proto(src), descs);
            }
        }
    }
    return dest;
  }


  $type.mixin(std.Object.prototype, {

    /**
     * @return {Object}
     */
    clone: function clone() {
      var o = this;
      return $object_create($object_proto(o), $property_descriptors(o));
    }

  });

}(std));

(function (std) {
  var
  TYPE_EMPTY_SCALAR = TYPE_EMPTY|TYPE_SCALAR;


  /**
   * @param {*} left
   * @param {*} right
   * @return {boolean}
   */
  function equals(left, right) {
    var result, typeleft, typeright, impl;
    if (left && left.equals) {
      result = left.equals(right);
    } else if (right && right.equals) {
      result = right.equals(right);
    } else {
      typeleft  = $type_of(left); 
      typeright = $type_of(right); 
      impl = (
        typeleft & TYPE_EMPTY_SCALAR ? typeleft :
        typeright & TYPE_EMPTY_SCALAR ? typeright :
        undefined
      );

      switch (impl) {
        case TYPE_UNDEFINED:
        case TYPE_NULL:
          result = left === right;
          break;
        case TYPE_BOOLEAN: 
          result = typeleft === typeright && ToBoolean(left) == ToBoolean(right);
          break;
        case TYPE_NUMBER: 
          result = typeleft === typeright && +left == +right;
          break;
        case TYPE_STRING: 
          result = typeleft === typeright && ToString(left) == ToString(right);
          break;
        default:
          switch ($object_tag(left)) {
            case "Date": 
              result = left.getTime() === right.getTime();
              break;
            case "RegExp": 
              result = left.source === right.source;
              break;
            default:
              result = _equals(left, right);
          }
      }
    }
    return result;
  }
  std.equals = equals;

  function _equals(left, right) {
    return left === right;
  }

  /**
   * @param {*} o
   * @return {string}
   */
  function hashCode(o) {
    var result = 0;
    if (o && o.hashCode) {
      result = o.hashCode();
    } else {
      switch ($type_of(o)) {
        case TYPE_UNDEFINED:
        case TYPE_NULL:
          break;
        case TYPE_BOOLEAN: result = o ? 1231 : 1237; break;
        case TYPE_NUMBER: result = _hashCodeInt(o); break;
        case TYPE_STRING: result = _hashCodeString(o); break;
        default:
          switch ($object_tag(o)) {
            case "Date": 
              result = _hashCodeInt(o.getTime());
              break;
            case "RegExp": 
              result = _hashCodeString(o.source);
              break;
            default:
              result = _hashCode(o);
          }
      }
    }
    return result;
  }
  std.hashCode = hashCode;

  function _hashCode(o) {
    var result = 0, oid = std.id(o);
    if (oid) {
      result = parseInt(oid, 36);//id radix
    }
    return result;
  }

  function _hashCodeInt(i) {
    return (i >>> 0) * 31;
  }

  function _hashCodeString(s) {
    var i, l = s.length, result = 0;
    for (i = 0; i < l; ++i) {
      result = (((result << 5) - result) + s.charCodeAt(i)) | 0;
    }
    return result;
  }


  $type.mixin(std.Object.prototype, {
  
    /**
     * @return {boolean}
     */
    equals: function equals(o) {
      return _equals(this, o);
    },

    /**
     * @return {string}
     */
    hashCode: function hashCode() {
      return _hashCode(this);
    }
  });
}(std));

(function (std) {

  var 
  $super = type.$super,
  _iteratorResult  = ES.CreateIterResultObject,
  _iterResultEmpty = $object_freeze(_iteratorResult(undefined, true));


  /**
   * @param {*} o
   * @param {string=} opt_kind
   * @return {*}
   */
  function iterator(o, opt_kind) {
    $assert_iterable(o);

    var iter;
    if (o[$$iterator]) {
      iter = o[$$iterator](opt_kind);
    } else {
      switch ($type_of(o)) {
        case TYPE_STRING:
          iter = new std.SeqIterator(o, opt_kind);
          break;
        case TYPE_OBJECT:
          if ($is_array(o)) {
            iter = new std.SeqIterator(o, opt_kind);
          } else {
            iter = new std.Iterator(o, opt_kind);
          }
          break;
      }
    }
    return iter;
  }
  std.iterator = iterator;

  /**
   * @param {std.Iterator} iter
   * @param {function} fn
   * @param {*=} opt_this
   */
  function iterate(iter, fn, opt_this) {
    $assert_iterator(iter);
    $assert_callable(fn);
    var 
    next   = iter.next(), 
    broken = false;
    
    function $break() {
      broken = true;
    }

    while (!broken && !next.done) {
      fn.call(opt_this, next.value, $break);
      next = iter.next();
    }
  }
  std.iterate = iterate;

  /**
   * @param {*} o
   * @return {*}
   */
  function keys(o) {
    return iterator(o, 'key');
  }
  std.keys = keys;

  /**
   * @param {*} o
   * @return {*}
   */
  function values(o) {
    return iterator(o, 'value');
  }
  std.values = values;

  /**
   * @param {*} o
   * @param {function} fn
   * @param {*=} opt_this
   * @return {*}
   */
  function forEach(o, fn, opt_this) {
    $assert_callable(fn);
    var index;
    if ($is_iterator(o)) {
      index = 0;
      iterate(o, function (value, $break) {
        fn.call(opt_this, value, index++, $break);
      });
    } else {
      iterate(iterator(o, 'key+value'), function (value, $break) {
        fn.call(opt_this, value[1], value[0], $break);
      });
    }
  }
  std.forEach = forEach;


  type("std.Iterator", [ ], function (Iterator) {

    function __new__(o, opt_kind) {
      $super(Iterator, "__new__", this, arguments);
      this.object = o;
      this.kind = opt_kind || this.kind;
      this.index = 0;
    }

    function iterator(/*opt_kind*/) {
      return this;
    }

    function next() {
      var 
      result, 
      obj     = this.object,
      resolve = this.__resolve__ || (this.__resolve__ = this["_" + this.kind]),
      keys    = this.__keys__ || (this.__keys__ = $object_keys(obj)),
      keyc    = keys.length,
      index   = this.index, key;

      while (index < keyc) {
        key = keys[index];
        if ($object_hasown(obj, key)) {
          result = _iteratorResult(resolve(obj, index), false);
          break;
        }
        ++index;
      }
      this.index = index;
      return result || _iterResultEmpty;
    }


    type.defineProperty(Iterator.prototype, $$iterator, {
      value: iterator
    });

    //util


    function _key(o, key) {
      return key;
    }

    function _val(o, key) {
      return o[key];
    }

    function _keyval(o, key) {
      return [key, o[key]];
    }

    return {
      kind: 'value',
      __new__: __new__,
      next: next,

      "_key": _key,
      "_value": _val,
      "_key+value": _keyval
    };
  }, 
  function (/*Iterator*/) {

    function empty() {
      return new std.EmptyIterator();
    }

    function result(value, done) {
      return _iteratorResult(value, done);
    }

    function __inherited__(subclass) {
      var subType = subclass.prototype.type;
      if (subType) {
        type.defineProperty(subType.prototype, $$iterator, {
          value: function iterator(opt_kind) {
            return new subclass(this, opt_kind);
          }
        });
      }
    }

    return {
      empty: empty,
      result: result,
      __inherited__: __inherited__
    };
  });

  type("std.EmptyIterator", [ std.Iterator ], {
    next: function next() {
      return _iterResultEmpty;
    }
  });

  type("std.SeqIterator", [ std.Iterator ], function (SeqIterator) {

    function __new__(o/*, opt_kind*/) {
      $super(SeqIterator, "__new__", this, arguments);
      this.length = o.length;
    }
    
    function next() {
      var 
      result, 
      resolve = this.__resolve__ || (this.__resolve__ = this["_" + this.kind]),
      index   = this.index;
      if (index < this.length) {
        result = _iteratorResult(resolve(this.object, index), false);
        this.index = index + 1;
      }
      return result || _iteratorResult(undefined, true);
    }

    return {
      __new__: __new__,
      next: next
    };
  });

  //create immutable empty iterator instance
  type.defineProperty(std.Iterator, "Empty", {
    value: $object_freeze(std.Iterator.empty())
  });
  

}(std));

(function (std) {


  /**
   * @param {*} o
   * @return {string}
   */
  function inspect(o) {
    var s, i, l;
    if (o && o.toRepresentation) {
      s = ToString(o.toRepresentation());
    } else {
      switch ($type_of(o)) {
        case TYPE_UNDEFINED:
        case TYPE_NULL:
        case TYPE_BOOLEAN:
        case TYPE_NUMBER: 
          s = ToString(o);
          break;
        case TYPE_STRING:
          s = '"' + o.replace(/(["\\\b\f\n\t\v\r])/g, _inspect_replace) + '"';
          break;
        case TYPE_FUNCTION:
          s = $function_string(o);
          s = s.substr(0, s.indexOf('{')) + '{...}';
          break;
        default:
          if ($is_array(o)) {
            l = o.length;
            s = '[';
            for (i = 0; i < l; ++i) {
              if (i !== 0) {
                s += ",";
              }
              s += inspect(o[i]);
            }
            s += ']';
          } else {
            s = _inspect(o);
          }
          
      }
    }
    return s;
  }
  std.inspect = inspect;

  function _inspect(o) {
    var s, oid;
    s = "[object ";
    s += ES.ObjectToStringTag(o);

    if (std.id) {//safe feature detection
      oid = std.id(o);
      if (oid !== undefined) {
        s += "#" + oid;
      }
    }
    s += "]";
    return s;
  }

  function _inspect_replace(match, $1) {
    var val;
    switch ($1) {
      case '"': val = '\\"'; break;
      case "\b": val = '\\b'; break;
      case "\f": val = '\\f'; break;
      case "\n": val = '\\n'; break;
      case "\t": val = '\\t'; break;
      case "\v": val = '\\v'; break;
      case "\r": val = '\\r'; break;
      default: val = '\\' + $1; break;
    }
    return val;    
  }

  $type.mixin(std.Object.prototype, {

    /**
     * Return this string representation (i.e. for debugging, dumping, ...)
     *
     * @return {string}
     */
    toRepresentation: function toRepresentation() {
      return _inspect(this);
    },

    /**
     * Return string representation
     *
     * @return {string}
     */
    toString: function toString() {
      return this.toRepresentation();
    }

  });


}(std));


    return type;
  } // typeProvider

  //COMMONJS
  if (typeof module !== "undefined") {
    module.exports = typeProvider();

  //AMD
  } else if (global.define) {
    global.define("type", [ ], typeProvider);

  //GLOBAL
  } else {
    typeProvider();
  }

}(this));
