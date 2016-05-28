define(["dom/memoryStorage"], function (memoryStorage) {
  "use strict";

  //Util
  var __global = typeof window !== "undefined" ? window : (function () {
    return this;
  }());
  var __storage = __global.localStorage;
  var __check = function (storage) {
    var testKey = 'storageTest' + Math.random();
    var returnValue = false;
    try {
      //Safari in private mode can throw error
      storage.setItem(testKey, 1);
      storage.removeItem(testKey);
      returnValue = true;
    } catch (e) {
    }
    return returnValue;
  };
  var __supported = __check(__storage);
  var LocalStorage = (function (_super) {
    function LocalStorage() {
      _super.call(this);
    }
    LocalStorage.prototype = Object.create(_super.prototype);
    LocalStorage.prototype.constructor = LocalStorage;
    return LocalStorage;
  }(memoryStorage.constructor));
  var localStorage = __supported ? __storage : new LocalStorage();
  return localStorage;
});