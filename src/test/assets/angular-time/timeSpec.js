/*global: define*/
console.warn("nanana");
define([
  'angular',
  'angular-mocks',
  'angular-time/time'
],
function (
  ng,
  ngMock,
  ngTime
) {
  'use strict';
console.warn("blahhh");
  beforeEach(module(ngTime.name, function () {

  }));

  describe("$time", inject(function ($time) {

    describe(".now()", function () {

      it("should be function", function () {
        expect(typeof $time.now).toBe("function");
        expect(typeof $time.now.length).toBe(0);
      });

      it("should return current date", function () {
        var expected = Date.now();
        var actual = $time.now();
        expect(actual).toBe(expected);
      });

    });

  }));
});
