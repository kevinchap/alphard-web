define(["dom/memoryStorage"], function (memoryStorage) {
  "use strict";

  //Util
  var __global = typeof window !== "undefined" ? window : (function () {
    return this;
  }());
  var __supported = (function () {
    var testKey = 'storageTest' + Math.random();
    var storage = __global.localStorage;
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
  var localStorage = __supported ? __global.localStorage : new MemoryStorage();
  return localStorage;
});