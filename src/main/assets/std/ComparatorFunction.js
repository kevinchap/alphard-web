define(["module"], function (module) {
  "use strict";

  var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function C() {
      this.constructor = d;
    }

    C.prototype = b.prototype;
    d.prototype = new C();
  };
  var __proto = this.__proto || function (o, opt_val) {
    /* jshint proto: true */
    if (opt_val === undefined) {
      //getter
      return Object.getPrototypeOf ? Object.getPrototypeOf(o) : o.__proto__;
    } else {
      //setter
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(o, opt_val);
      } else {
        o.__proto__ = opt_val;
      }
    }
  };

  /**
   * This callback is displayed as part of the Requester
   *
   * @callback ComparatorFunction~compare
   * @param {T} lhs
   * @param {T} rhs
   * @return {number}
   * @template T
   */

  /**
   * ComparatorFunction class
   */
  var ComparatorFunction = (function (_super) {

    /**
     *
     * @usage
     * var cmp = new ComparatorFunction(function (lhs, rhs) {
     *   return lhs === rhs ? 0 : lhs < rhs ? -1 : 1;
     * });
     * ['foo', 'bar', 'baz'].sort(cmp); // -> ['bar', 'baz', 'foo']
     * ['foo', 'bar', 'baz'].sort(cmp.reverse()); // -> [ foo', 'baz', 'bar']
     *
     * @param {ComparatorFunction~compare<T>} exec
     * @constructor
     * @extends {Function}
     * @template T
     */
    function ComparatorFunction(exec) {
      return _fromCallable(function comparatorFunction(l, r) {
        return exec.call(comparatorFunction, l, r);
      });
    }

    __extends(ComparatorFunction, _super);

    /**
     *
     * @param {...ComparatorFunction<T>} var_args
     * @returns {ComparatorFunction<T>}
     */
    ComparatorFunction.prototype.concat = function concat(var_args) {
      var args = [this];
      for (var argi = 0, argc = arguments.length; argi < argc; argi++) {
        args.push(arguments[argi]);
      }
      return _concat(args);
    };

    /**
     *
     * @param {function(): number} f
     * @returns {ComparatorFunction}
     */
    ComparatorFunction.prototype.map = function map(f) {
      return _map(this, f);
    };

    /**
     * Reverse ordering
     *
     * @returns {ComparatorFunction<T>}
     */
    ComparatorFunction.prototype.reverse = function reverse() {
      return _reverse(this);
    };

    /**
     * Return a new comparator on `getter(anyObject)`
     *
     * @param {function(o: any):T} getter
     * @param {ComparatorFunction<T>=} opt_comparator
     * @returns {ComparatorFunction<T>}
     * @template T
     */
    ComparatorFunction.comparing = function comparing(getter, opt_comparator) {
      return _map(opt_comparator || ComparatorFunction.natural, getter);
    };

    /**
     * Create a new comparator that applies sequentially
     * every comparators while result is 0
     *
     * @param {...ComparatorFunction<S>} var_args
     * @returns {ComparatorFunction<S>}
     * @template S
     */
    ComparatorFunction.concat = function concat(var_args) {
      return _concat(arguments);
    };

    /**
     * Create a new comparator comparing position of the object in the array
     *
     * @param {Array<S>} array
     * @returns {ComparatorFunction<S>}
     * @template S
     */
    ComparatorFunction.fromArray = function (array) {
      return _fromArray(array);
    };

    ComparatorFunction.natural = _fromCallable(function compareNatural(l, r) {
      return l === r ? 0 : l < r ? -1 : 1;
    });

    /**
     * @param {ComparatorFunction<S>} comparator
     * @returns {ComparatorFunction<S>}
     * @template S
     */
    ComparatorFunction.reverse = function (comparator) {
      return _reverse(comparator);
    };

    function _fromArray(array) {
      return _fromCallable(function compareArray(l, r) {
        var li = array.indexOf(l);
        var ri = array.indexOf(r);
        return (
          li === ri ? 0 :
          li < 0 ? 1 :
          ri < 0 ? -1 :
          li - ri
        );
      });
    }

    function _fromCallable(callable) {
      return _enhance(_assertCallable(callable));
    }

    function _enhance(o) {
      var proto = ComparatorFunction.prototype;
      if (__proto(o) !== proto) {
        __proto(o, proto);
      }
      return o;
    }

    function _map(comparatorLike, mapFn) {
      _assertCallable(comparatorLike);
      _assertCallable(mapFn);
      return _fromCallable(function comparatorMap(l, r) {
        return comparatorLike(mapFn(l), mapFn(r));
      });
    }

    function _concat(comparators) {
      var comparatorc = comparators.length;
      return _fromCallable(function comparatorConcat(l, r) {
        var returnValue = 0;
        for (var i = 0, cmp; i < comparatorc; i++) {
          cmp = comparators[i](l, r);
          if (cmp !== 0 || cmp !== cmp/*NaN*/) {
            returnValue = cmp;
            break;
          }
        }
        return returnValue;
      });
    }

    function _reverse(comparatorLike) {
      _assertCallable(comparatorLike);
      return _fromCallable(function comparatorReverse(l, r) {
        return -comparatorLike(l, r);
      });
    }

    function _assertCallable(o) {
      if (!o || typeof o.call !== "function") {
        throw new TypeError(o + " is not a valid callable");
      }
      return o;
    }

    return ComparatorFunction;
  }(Function));

  return ComparatorFunction;
});