define([], function () {
  "use strict";

  //Util
  var __keys = Object.keys || function (o) {
      var keys = [];
      for (var key in o) {
        if (o.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys;
    };
  var __str = function (o) {
    return "" + o;
  };
  var __defineGetter = Object.defineProperty ?
    function (o, name, getter) {
      Object.defineProperty(o, name, {get: getter});
    } :
    function (o, name, getter) {
      o.__defineGetter__(name, getter);
    };


  /**
   * MemoryStorage class
   *
   * Description:
   *  Follows exact same API than localStorage and sessionStorage
   */
  var MemoryStorage = (function () {

    var getLength = function () {
      return __keys(this).length;
    };

    function MemoryStorage() {
      __defineGetter(this, "length", getLength);
    }

    MemoryStorage.prototype.clear = function clear() {
      var keys = __keys(this);
      for (var i = 0, l = keys.length; i < l; ++i) {
        delete this[keys[i]];
      }
    };

    MemoryStorage.prototype.key = function key(index) {
      return __keys(this)[index];
    };

    MemoryStorage.prototype.getItem = function getItem(key) {
      return this[key];
    };

    MemoryStorage.prototype.setItem = function setItem(key, val) {
      this[key] = __str(val);
    };

    MemoryStorage.prototype.removeItem = function removeItem(key) {
      delete this[key];
    };

    return MemoryStorage;
  }());

  var memoryStorage = new MemoryStorage();
  return memoryStorage;
});