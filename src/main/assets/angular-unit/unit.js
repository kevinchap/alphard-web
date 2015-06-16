define(["module", "angular"], function (module, angular) {
  "use strict";

  //Util
  var __pow = Math.pow;
  var __isNaN = function (o) { return o !== o; };
  var __isFinite = isFinite;
  var __log = Math.log;
  var __floor = Math.floor;
  var __pow1024 = (function () {
    var __cache = {};
    return function (n) {
      var returnValue = NaN;
      if (n >= 0) {
        returnValue = __cache[n];
        if (returnValue === undefined) {
          returnValue = __cache[n] = __pow(1024, n);
        }
      }
      return returnValue;
    };
  }());

  var ByteUnit;
  //Enum values
  (function (ByteUnit) {
    ByteUnit[ByteUnit.B = 0] = "B";
    ByteUnit[ByteUnit.kB = 1] = "kB";
    ByteUnit[ByteUnit.MB = 2] = "MB";
    ByteUnit[ByteUnit.GB = 3] = "GB";
    ByteUnit[ByteUnit.TB = 4] = "TB";
    ByteUnit[ByteUnit.PB = 5] = "PB";
  })(ByteUnit || (ByteUnit = {}));

  //functions
  (function (ByteUnit) {
    var LN1024 = __log(1024);

    /**
     *
     * @param {*} o
     * @returns {number}
     */
    function parse(o) {
      switch (o.toUpperCase()) {
        case "B":
        case "BYTE":
          return ByteUnit.B;
        case "KB":
        case "KILOBYTE":
          return ByteUnit.kB;
        case "MB":
        case "MEGABYTE":
          return ByteUnit.MB;
        case "GB":
        case "GIGABYTE":
          return ByteUnit.GB;
        case "TB":
        case "TERABYTE":
          return ByteUnit.TB;
        case "PB":
        case "PETABYTE":
          return ByteUnit.PB;
        default:
          return NaN;
      }
    }
    ByteUnit.parse = parse;

    /**
     *
     * @param {number} n
     * @returns {string}
     */
    function stringify(n) {
      return ByteUnit[n >>> 0];
    }
    ByteUnit.stringify = stringify;

    /**
     *
     * @param {number} n
     * @param {number=} opt_precision
     * @param {string|number=} opt_unit
     * @returns {string}
     */
    function format(n, opt_precision, opt_unit) {
      var pow;
      if (opt_precision === undefined) {
        opt_precision = 1;
      }
      if (opt_unit === undefined) {
        pow = __floor(__log(n) / LN1024);//find biggest unit
      } else {
        pow = parse(opt_unit);
      }

      if (__isNaN(pow) || !__isFinite(pow)) {
        pow = 0;
      }

      return (
        (n / __pow1024(pow)).toFixed(opt_precision) +
        ' ' +
        stringify(pow)
      );
    }
    ByteUnit.format = format;


  })(ByteUnit || (ByteUnit = {}));

  return angular
    .module(module.id, [])

  /**
   * Filter byte formatting
   *
   * Usage:
   *   {{123|byte}}
   *
   */
    .filter("byte", [function () {

      function byte(amount, opt_precision, opt_unit) {
        return ByteUnit.format(amount, opt_precision, opt_unit);
      }
      return byte;
    }]);
});