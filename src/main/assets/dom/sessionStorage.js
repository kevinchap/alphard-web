define(["dom/memoryStorage"], function (memoryStorage) {
  "use strict";

  var __global = typeof window !== "undefined" ? window : (function () {
    return this;
  }());
  var __storage = __global.sessionStorage;
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
  var SessionStorage = (function (_super) {
    function SessionStorage() {
      _super.call(this);
    }
    SessionStorage.prototype = Object.create(_super.prototype);
    SessionStorage.prototype.constructor = SessionStorage;
    return SessionStorage;
  }(memoryStorage.constructor));
  var sessionStorage = __supported ? __storage : new SessionStorage();
  return sessionStorage;
});