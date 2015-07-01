define(["module"], function (module) {
  "use strict";

  //Constant
  var LN10 = Math.LN10;

  //Util
  var __abs = Math.abs;
  var __log = Math.log;
  var __pow = Math.pow;
  var __keys = Object.keys;
  var __isString = function (o) { return typeof o === "string"; };
  var __assertTypeOf = function (o, t) {
    if (typeof o !== t) {
      throw new TypeError(o + " must be instanceof " + t);
    }
    return o;
  };
  var __assertInstanceOf = function (o, c) {
    if (!(o instanceof c)) {
      throw new TypeError(o + " must be instanceof " + c.name);
    }
    return o;
  };
  var __num = Number;
  var __numFormat = function (o) {
    return "" + o;
  };
  var __strEndsWith = function (s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
  };

  /**
   * unit module
   */
  var unit;
  (function (unit) {

    /**
     * QuantityComposed class
     */
    var Quantity = (function (_super) {
      var SECRET = {};
      var KEYS = [];
      var __instance = {};

      function Quantity(opt_quantity, opt_secret) {
        if (this instanceof Quantity) {
          if (opt_secret !== SECRET) {
            throw new Error("Private constructor");
          }

          _super.call(this);
          if (opt_quantity) {
            var keys = __keys(opt_quantity);
            for (var i = 0, l = keys.length; i < l; i++) {
              var key = keys[i];
              if (key in this) {
                this[key] = opt_quantity[key];
              } else {
                //TODO warn
              }
            }
          }
        }
      }

      Quantity.compose = function (muls, divs) {
        var q = {};//tmp
        __mulAll(q, muls, false);
        __mulAll(q, divs, true);
        return Quantity.for(q);
      };

      Quantity.base = function (name) {
        __assertTypeOf(name, "string");
        var q = {};
        q[name] = 1;
        var h = Quantity.hash(q);
        var instance = __instance[h];
        if (!instance) {
          Quantity.prototype[name] = 0;
          KEYS.push(name);
          instance = __instance[h] = new Quantity(q, SECRET);
        }
        return instance;
      };

      Quantity.for = function (q) {
        __assertTypeOf(q, "object");
        var h = Quantity.hash(q);
        var instance = __instance[h];
        if (!instance) {
          instance = __instance[h] = new Quantity(q, SECRET);
        }
        return instance;
      };

      Quantity.hash = function (q) {
        var s = "";
        var buffer = "";
        for (var i = 0, l = KEYS.length, value; i < l; i++) {
          value = q[KEYS[i]];
          if (value === 0) {
            buffer += ":";
          } else {
            s += buffer + ":" + value;
            buffer = "";
          }
        }
        return s;
      };

      Quantity.Empty = Quantity.for(new Quantity(null, SECRET));
      Quantity.Length = Quantity.base("Length");
      Quantity.Mass = Quantity.base("Mass");
      Quantity.Current = Quantity.base("Current");
      Quantity.Temperature = Quantity.base("Temperature");
      Quantity.LuminousIntensity = Quantity.base("LuminousIntensity");
      Quantity.AmountOfSubstance = Quantity.base("AmountOfSubstance");
      Quantity.Force = Quantity.base("Force");
      Quantity.Bit = Quantity.base("Bit");

      //Util
      var __mul = function (dest, src, inv) {
        var quantities, quantity;

        quantities = __keys(src);
        var i = 0, l = quantities.length;
        if (inv) {
          while (i < l) {
            quantity = quantities[i];
            src[quantity] -= src[quantity];
            i += 1;
          }
        } else {
          while (i < l) {
            quantity = quantities[i];
            src[quantity] += src[quantity];
            i += 1;
          }
        }
      };
      var __mulAll = function (dest, srcs, inv) {
        for (var i = 0, l = srcs.length; i < l; i++) {
          __mul(dest, srcs[i], inv);
        }
      };

      return Quantity;
    }(Object));
    unit.Quantity = Quantity;


    /*
     //SI
     unit.Empty = new Unit("", "");
     unit.Length = new Unit("m", "meter", Quantity.Length);
     unit.Time = new Unit("s", "second", Quantity.Time);
     unit.Mass = new Unit("kg", "kilogram", Quantity.Mass);
     unit.Current = new Unit("A", "Ampere", Quantity.Current);
     unit.Temperature = new Unit("K", "Kelvin", Quantity.Temperature);
     unit.LuminousIntensity = new Unit("cd", "candela", Quantity.LuminousIntensity);
     unit.AmountOfSubstance = new Unit("mol", "mole", Quantity.AmountOfSubstance);
     unit.Force = new Unit("N", "Newton", Quantity.Force);
     unit.Bit = new Unit("B", "byte", Quantity.Bit);

     //Util
     unit.Frequency = Unit.compose([], [unit.Time]);
     unit.Surface = Unit.compose([unit.Length, unit.Length]);
     unit.Volume = Unit.compose([unit.Length, unit.Length, unit.Length]);
     unit.Force = Unit.compose([unit.Length, unit.Mass], [unit.Time, unit.Time]);// m~kg/s2, N;
     unit.Energy = Unit.compose([unit.Force, unit.Length]);// J
     unit.Power = Unit.compose([unit.Energy, unit.Energy], [unit.Time]); //J/s, W
     unit.Pressure = Unit.compose([unit.Force], [unit.Surface])// N/m2, Pa


     unit.mm = unit.Length.factor(unit.milli);
     unit.cm = unit.Length.factor(unit.centi);
     unit.dm = unit.Length.factor(unit.deci);
     unit.m = unit.Length;
     unit.dam = unit.Length.factor(unit.deca);
     unit.hm = unit.Length.factor(unit.hecto);
     unit.km = unit.Length.factor(unit.kilo);
     */

    /**
     * Unit class
     */
    /*var Unit = (function (_super) {
     var __quantityUpdate = function (dest, src, inv) {
     var quantities, quantity, value;

     quantities = __keys(src);
     for (var i = 0, l = quantities.length; i < l; i++) {
     quantity = quantities[i];
     value = src[quantity];
     if (inv) {
     value = -value;
     }
     src[quantity] += value;
     }
     };
     var __mul = function (dest, srcs) {
     var destQuantity = dest.quantity;
     for (var i = 0, l = srcs.length; i < l; i++) {
     __quantityUpdate(destQuantity, srcs[i].quantity, false);
     }
     return returnValue;
     };
     var __div = function (dest, srcs) {
     var destQuantity = dest.quantity;
     for (var i = 0, l = srcs.length; i < l; i++) {
     __quantityUpdate(destQuantity, srcs[i].quantity, true);
     }
     return returnValue;
     };

     function Unit(abbr, name, opt_value, opt_quantity) {
     _super.call(this);
     this.abbr = name;
     this.name = name;
     this.value = opt_value === undefined ? 1 : opt_value;
     this.quantity = opt_quantity || Quantity.empty;
     }

     Unit.compose = function compose(muls, divs) {
     function getQuantity(u) { return u.quantity; };

     var quantity = Quantity.compose(muls.map(getQuantity), divs.map(getQuantity));
     var returnValue = new Unit();
     return returnValue;
     };

     Unit.prototype.multiply = function multiply(var_args) {
     return __mul(new Unit(), arguments);
     };

     Unit.prototype.divide = function divide(var_args) {
     return __div(new Unit(), arguments);
     };

     return Unit;
     }(Object));*/

    /**
     * Prefix class
     */
    var Prefix = (function (_super) {

      function Prefix(name, opt_value, opt_scientific) {
        _super.call(this);
        this.name = "" + name;
        this.value = opt_value === undefined ? 1 : +opt_value;
        this.scientific = opt_scientific === undefined ? true : !!opt_scientific;
      }

      Prefix.empty = new Prefix("");

      return Prefix;
    }(Object));

    /**
     * UnitBase class
     */
    var Unit = (function (_super) {

      function Unit(name, opt_quantity, opt_prefixes, opt_value, opt_offset) {
        if (this instanceof Unit) {
          _super.call(this);
          this.name = name;
          this.quantity = opt_quantity || Quantity.Empty;
          this.prefixes = opt_prefixes || Prefix.EMPTY;
          this.value = opt_value || 1;
          this.offset = opt_offset || 0;
        }
      }

      Unit.prototype.toString = function toString() {
        return this.name;
      };

      return Unit;
    }(Object));
    unit.Unit = Unit;

    /**
     * Measure class
     */
    var Measure = (function (_super) {
      var UNIT_EMPTY = Unit.empty;
      var PREFIX_EMPTY = Prefix.empty;
      var __parseUnit = function (str) {
        var unitDict = UNIT;
        var unitNames = __keys(unitDict);
        for (var i = 0, l = unitNames.length; i < l; i++) {
          var name = unitNames[i];
          var unit = unitDict[name];
          if (unit instanceof Unit && __strEndsWith(str, name)) {
            var prefixLen = (str.length - name.length);
            var prefixName = str.substring(0, prefixLen);
            var prefix = unit.prefixes[prefixName];
            if (prefix !== undefined) {
              // store unit, prefix, and value
              return {
                unit: unit,
                prefix: prefix
              };
            }
          }
        }
        return null;
      };

      var __prefixBest = function (valueObj) {
        var unit = valueObj.unit;

        // find the best prefix value (resulting in the value of which
        // the absolute value of the log10 is closest to zero,
        // though with a little offset of 1.2 for nicer values: you get a
        // sequence 1mm 100mm 500mm 0.6m 1m 10m 100m 500m 0.6km 1km ...
        var absValue = __abs(valueObj.value / unit.value);
        var bestPrefix = PREFIX_EMPTY;
        var bestDiff = __abs(__log(absValue / bestPrefix.value) / LN10 - 1.2);

        var prefixes = unit.prefixes;
        for (var p in prefixes) {
          if (prefixes.hasOwnProperty(p)) {
            var prefix = prefixes[p];
            if (prefix.scientific) {
              var diff = __abs(__log(absValue / prefix.value) / LN10 - 1.2);

              if (diff < bestDiff) {
                bestPrefix = prefix;
                bestDiff = diff;
              }
            }
          }
        }

        return bestPrefix;
      };
      var __normalize = function (n, unit, opt_prefix) {
        return (n + unit.offset) * unit.value * (opt_prefix ? opt_prefix.value : 1);
      };
      var __denormalize = function (n, unit, opt_prefix) {
        var prefixValue = (opt_prefix ? opt_prefix.value : 1);
        return n / unit.value / prefixValue - unit.offset;
      };

      function Measure(value, opt_unit) {
        if (this instanceof Measure) {
          _super.call(this);
          value = __num(value);

          var unit;
          var prefix;
          if (opt_unit === undefined) {
            unit = UNIT_EMPTY;
            prefix = PREFIX_EMPTY;
          }
          if (typeof opt_unit === "string") {
            var parsed = __parseUnit(opt_unit);
            unit = parsed.unit;
            prefix = parsed.prefix;
          } else if (opt_unit instanceof Unit) {
            unit = opt_unit;
            prefix = PREFIX_EMPTY;
          }

          __assertInstanceOf(unit, Unit);
          this.unit = unit;
          this.quantity = unit.quantity;//copy
          this.value = (value !== undefined) ? __normalize(value, unit, prefix) : null;
          this.prefix = prefix;
          this.fixPrefix = false; // if true, function format will not search for the
                                  // best prefix but leave it as initially provided.
                                  // fixPrefix is set true by the method Unit.to
        } else {
          return new Amount(value, opt_unit);
        }
      }

      //Measure.prototype = Object.create(_super.prototype);

      //Measure.prototype.constructor = Measure;

      Measure.prototype.equals = function equals(other) {
        return (
          (this.quantity === other.quantity) &&
          (this.value === other.value)
        );
      };

      Measure.prototype.format = function format(opt_options) {
        var options = opt_options;
        var unit = this.unit;
        var value = this.value;
        var prefix = !this.fixPrefix ? __prefixBest(this) : this.prefix;

        var displayValue = __denormalize(value, unit, prefix);
        var s = "";
        s += __numFormat(displayValue, options) + ' ';
        s += prefix.name + unit.name;
        return s;
      };

      Measure.prototype.to = function to(unitStr) {
        var returnValue;
        var quantity = this.quantity;
        var value = this.value;

        if (__isString(unitStr)) {
          var parsed = __parseUnit(unitStr);
          if (!parsed) {
            throw new TypeError('Unit not found');
          }
          var unitDest = parsed.unit;
          var prefixDest = parsed.prefix;

          if (quantity !== unitDest.quantity) {
            throw new TypeError('Quantity must be ' + quantity);
          }
          returnValue = new Measure(0, unitDest);
          returnValue.value = value;
          returnValue.prefix = prefixDest;
          returnValue.fixPrefix = true;
        } else {
          throw new TypeError('String or Unit expected as parameter');
        }
        return returnValue;
      };

      Measure.prototype.toNumber = function toNumber(opt_unit) {
        var other = opt_unit ? this.to(opt_unit) : this;
        return __denormalize(other.value, other.unit, other.prefix);
      };

      Measure.prototype.toString = function toString() {
        return this.format();
      };

      Measure.prototype.valueOf = function valueOf() {
        return this.toString();
      };
      return Measure;
    }(Object));
    unit.Measure = Measure;


    var PREFIX = {};
    var UNIT = {};



    function prefix(category, name, opt_value, opt_scientific) {
      var reg = PREFIX[category] || (PREFIX[category] = {});
      var p = reg[name];
      if (!p) {
        p = reg[name] = new Prefix(name, opt_value, opt_scientific);
      }
      return p;
    }

    unit.prefix = prefix;

    function _unit(name, opt_quantity, opt_prefixes, opt_value, opt_offset) {
      return UNIT[name] || (UNIT[name] = new Unit(
          name,
          opt_quantity,
          opt_prefixes,
          opt_value,
          opt_offset
        ));
    }

    unit.unit = _unit;

    function measure(value, opt_unit) {
      return new Measure(value, opt_unit);
    }

    unit.measure = measure;


    //DATA
    (function (PREFIX) {
      function pre(n, v, s) {
        return new Prefix(n, v, s);
      }

      PREFIX.EMPTY = {
        "": pre("", 1, true)
      };
      PREFIX.SHORT = {
        "": pre("", 1, true),

        "da": pre("da", 1e1, false),
        "h": pre("h", 1e2, false),
        "k": pre("k", 1e3, true),
        "M": pre("M", 1e6, true),
        "G": pre("G", 1e9, true),
        "T": pre("T", 1e12, true),
        "P": pre("P", 1e15, true),
        "E": pre("E", 1e18, true),
        "Z": pre("Z", 1e21, true),
        "Y": pre("Y", 1e24, true),

        "d": pre("d", 1e-1, false),
        "c": pre("c", 1e-2, false),
        "m": pre("m", 1e-3, true),
        "u": pre("u", 1e-6, true),
        "n": pre("n", 1e-9, true),
        "p": pre("p", 1e-12, true),
        "f": pre("f", 1e-15, true),
        "a": pre("a", 1e-18, true),
        "z": pre("z", 1e-21, true),
        "y": pre("y", 1e-24, true)
      };
      PREFIX.LONG = {
        "": pre("", 1, true),

        "deca": pre("deca", 1e1, false),
        "hecto": pre("hecto", 1e2, false),
        "kilo": pre("kilo", 1e3, true),
        "mega": pre("mega", 1e6, true),
        "giga": pre("giga", 1e9, true),
        "tera": pre("tera", 1e12, true),
        "peta": pre("peta", 1e15, true),
        "exa": pre("exa", 1e18, true),
        "zetta": pre("zetta", 1e21, true),
        "yotta": pre("yotta", 1e24, true),

        "deci": pre("deci", 1e-1, false),
        "centi": pre("centi", 1e-2, false),
        "milli": pre("milli", 1e-3, true),
        "micro": pre("micro", 1e-6, true),
        "nano": pre("nano", 1e-9, true),
        "pico": pre("pico", 1e-12, true),
        "femto": pre("femto", 1e-15, true),
        "atto": pre("atto", 1e-18, true),
        "zepto": pre("zepto", 1e-21, true),
        "yocto": pre("yocto", 1e-24, true)
      };
      PREFIX.SQUARED = {
        "": pre("", 1, true),

        "da": pre("da", 1e2, false),
        "h": pre("h", 1e4, false),
        "k": pre("k", 1e6, true),
        "M": pre("M", 1e12, true),
        "G": pre("G", 1e18, true),
        "T": pre("T", 1e24, true),
        "P": pre("P", 1e30, true),
        "E": pre("E", 1e36, true),
        "Z": pre("Z", 1e42, true),
        "Y": pre("Y", 1e48, true),

        "d": pre("d", 1e-2, false),
        "c": pre("c", 1e-4, false),
        "m": pre("m", 1e-6, true),
        "u": pre("u", 1e-12, true),
        "n": pre("n", 1e-18, true),
        "p": pre("p", 1e-24, true),
        "f": pre("f", 1e-30, true),
        "a": pre("a", 1e-36, true),
        "z": pre("z", 1e-42, true),
        "y": pre("y", 1e-42, true)
      };
      PREFIX.CUBIC = {
        "": pre("", 1, true),

        "da": pre("da", 1e3, false),
        "h": pre("h", 1e6, false),
        "k": pre("k", 1e9, true),
        "M": pre("M", 1e18, true),
        "G": pre("G", 1e27, true),
        "T": pre("T", 1e36, true),
        "P": pre("P", 1e45, true),
        "E": pre("E", 1e54, true),
        "Z": pre("Z", 1e63, true),
        "Y": pre("Y", 1e72, true),

        "d": pre("d", 1e-3, false),
        "c": pre("c", 1e-6, false),
        "m": pre("m", 1e-9, true),
        "u": pre("u", 1e-18, true),
        "n": pre("n", 1e-27, true),
        "p": pre("p", 1e-36, true),
        "f": pre("f", 1e-45, true),
        "a": pre("a", 1e-54, true),
        "z": pre("z", 1e-63, true),
        "y": pre("y", 1e-72, true)
      };
      PREFIX.BINARY_SHORT = {
        "": pre("", 1, true),
        "k": pre("k", 1e3, true),
        "M": pre("M", 1e6, true),
        "G": pre("G", 1e9, true),
        "T": pre("T", 1e12, true),
        "P": pre("P", 1e15, true),
        "E": pre("E", 1e18, true),
        "Z": pre("Z", 1e21, true),
        "Y": pre("Y", 1e24, true),

        "Ki": pre("Ki", 1024, true),
        "Mi": pre("Mi", __pow(1024, 2), true),
        "Gi": pre("Gi", __pow(1024, 3), true),
        "Ti": pre("Ti", __pow(1024, 4), true),
        "Pi": pre("Pi", __pow(1024, 5), true),
        "Ei": pre("Ei", __pow(1024, 6), true),
        "Zi": pre("Zi", __pow(1024, 7), true),
        "Yi": pre("Yi", __pow(1024, 8), true)
      };
      PREFIX.BINARY_LONG = {
        "": pre("", 1, true),
        "kilo": pre("kilo", 1e3, true),
        "mega": pre("mega", 1e6, true),
        "giga": pre("giga", 1e9, true),
        "tera": pre("tera", 1e12, true),
        "peta": pre("peta", 1e15, true),
        "exa": pre("exa", 1e18, true),
        "zetta": pre("zetta", 1e21, true),
        "yotta": pre("yotta", 1e24, true),

        "kibi": pre("kibi", 1024, true),
        "mebi": pre("mebi", __pow(1024, 2), true),
        "gibi": pre("gibi", __pow(1024, 3), true),
        "tebi": pre("tebi", __pow(1024, 4), true),
        "pebi": pre("pebi", __pow(1024, 5), true),
        "exi":  pre("exi", __pow(1024, 6), true),
        "zebi": pre("zebi", __pow(1024, 7), true),
        "yobi": pre("yobi", __pow(1024, 8), true)
      };
    }(PREFIX));

    (function (UNIT) {

      UNIT.empty = new Unit("", Quantity.Empty, PREFIX.EMPTY);

      UNIT.meter = new Unit("meter", Quantity.Length, PREFIX.LONG);

      // Binary
      UNIT.b = new Unit("b", Quantity.Bit, PREFIX.BINARY_SHORT);
      UNIT.bits = new Unit("bits", Quantity.Bit, PREFIX.BINARY_LONG);
      UNIT.B = new Unit("B", Quantity.Bit, PREFIX.BINARY_SHORT, 8);
      UNIT.bytes = new Unit("bytes", Quantity.Bit, PREFIX.BINARY_LONG, 8);

    }(UNIT));


  }(unit || (unit = {})));

  return unit;
});