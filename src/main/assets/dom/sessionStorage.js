define(["dom/memoryStorage"], function (memoryStorage) {
  "use strict";

  var __global = typeof window !== "undefined" ? window : (function () {
    return this;
  }());
  var __supported = (function () {
    var testKey = 'storageTest' + Math.random();
    var storage = __global.sessionStorage;
    var returnValue = false;
    try {
      //Safari in private mode can throw error
      storage.setItem(testKey, 1);
      storage.removeItem(testKey);
      returnValue = true;
    } catch (e) {
    }
    return returnValue;
  }());
  var MemoryStorage = memoryStorage.constructor;
  var sessionStorage = __supported ? __global.sessionStorage : new MemoryStorage();
  return sessionStorage;
});