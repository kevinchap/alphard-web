define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * angle module
   */
  var angle = (function () {
    var __str = function (o) { return "" + o; };
    var __isNaN = function (o) { return o !== o; };

    var DD = "DD";//decimal degrees
    var DMM = "DMM";//degree decimal minute
    var DMS = "DMS";//degrees, minutes, and seconds

    function stringify(dd, opt_format) {
      var format = opt_format || DD;
      var fixedLength = 5;
      var returnValue;
      switch (format) {
        case DD:
          //do nothing
          returnValue = dd.toFixed(fixedLength);
          break;
        case DMM:
          returnValue = _stringifyDDToDMM(dd, fixedLength);
          break;
        case DMS:
          returnValue = _stringifyDDToDMS(dd, fixedLength);
          break;
        default:
          throw new Error(format + " is not a valid format");
      }
      return returnValue;
    }

    function _stringifyDDToDMM(dd, fixedLength) {
      var ddAbs = dd < 0 ? -dd : dd;
      return __isNaN(dd) ? __str(dd) : "" +
        __str(0 | dd) +
        ' ' +
        (ddAbs % 1 * 60).toFixed(fixedLength);
    }

    function _stringifyDDToDMS(dd, fixedLength) {
      var ddAbs = dd < 0 ? -dd : dd;
      return __isNaN(dd) ? __str(dd) : "" +
        __str(0 | dd) +
        '°' +
        __str(0 | ddAbs % 1 * 60) +
        "'" +
        (ddAbs * 60 % 1 * 60).toFixed(fixedLength - 4) +
        '"';
    }

    
    //exports
    return {
      DD: DD,
      DMM: DMM,
      DMS: DMS,
      stringify: stringify
    };
  }());

  return angular
    .module(module.id, [])

  /**
   * geoLon(longitude, format)
   *
   * @param {number} longitude
   * @param {string} format DD|DM|DMS
   *
   * Usage:
   *   {{ longitude |geoLon:format }}
   */
    .filter("geoLon", [function () {
      var __abs = Math.abs;
      var __stringify = angle.stringify;
      return function (coord, opt_format) {
        return __stringify(__abs(coord), opt_format) + (coord > 0 ? "E" : "W");
      };
    }])

  /**
   * geoLat(latitude, format)
   *
   * @param {number} latitude
   * @param {string} format DD|DM|DMS
   *
   * Usage:
   *   {{ latitude |geoLat:format }}
   */
    .filter("geoLat", [function () {
      var __abs = Math.abs;
      var __stringify = angle.stringify;
      return function (coord, opt_format) {
        return __stringify(__abs(coord), opt_format) + (coord > 0 ? "N" : "S");
      };
    }])

  /**
   * geoCoord(coord, format)
   *
   * @param {[number, number]|{longitude:number, latitude:number}} coord
   * @param {string} format DD|DM|DMS
   *
   * Usage:
   *   {{ [ longitude, latitude ] |geoCoord:format }}
   *   {{ { longitude: ..., latitude: ... } |geoCoord:format }}
   */
    .filter("geoCoord", ["$filter", function ($filter) {
      var __isArray = angular.isArray;
      var __isObject = angular.isObject;
      var geoLon = $filter("geoLon");
      var geoLat = $filter("geoLat");

      return function (coord, opt_format) {
        var returnValue = "";
        if (coord !== undefined && coord !== null) {
          var longitude, latitude;
          if (__isObject(coord) && ('latitude' in coord)) {
            latitude = coord.latitude;
            longitude = coord.longitude;
          } else if (__isArray(coord)) {
            //[longitude, latitude] when array (cf GeoJSON)
            latitude = coord[1];
            longitude = coord[0];
          } else {
            latitude = NaN;
            longitude = NaN;
          }
          returnValue = geoLat(latitude, opt_format) + ' ' + geoLon(longitude, opt_format);
        }

        return returnValue;
      };
    }]);
});