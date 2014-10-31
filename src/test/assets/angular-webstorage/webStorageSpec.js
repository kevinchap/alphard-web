/*global: define*/
define([
  'angular',
  'angular-mocks',
  'angular-webstorage'
],
function (
  ng,
  ngMock,
  ngWebStorage
) {
  'use strict';

  beforeEach(module(ngWebStorage.name, function () {

  }));

  describe("$localStorage", inject(function ($localStorage, $window) {
    it("should be window.localStorage", function () {
      expect($localStorage).toBe($window.localStorage);
    });
  }));

  describe("$sessionStorage", inject(function ($sessionStorage, $window) {
    it("should be window.sessionStorage", function () {
      expect($sessionStorage).toBe($window.sessionStorage);
    });
  }));

  describe("$memoryStorage", inject(function ($memoryStorage) {

    describe("clear()", function () {
      it("should be function", function () {
        expect(typeof $memoryStorage.clear).toBe("function");
        expect($memoryStorage.clear.length).toBe(0);
      });
    });

    describe("getItem()", function () {
      it("should be function", function () {
        expect(typeof $memoryStorage.getItem).toBe("function");
        expect($memoryStorage.getItem.length).toBe(1);
      });
    });

    describe("key()", function () {
      it("should be function", function () {
        expect(typeof $memoryStorage.key).toBe("function");
        expect($memoryStorage.key.length).toBe(0);
      });
    });

    describe("setItem()", function () {
      it("should be function", function () {
        expect(typeof $memoryStorage.setItem).toBe("function");
        expect($memoryStorage.setItem.length).toBe(2);
      });
    });

  }));

});
