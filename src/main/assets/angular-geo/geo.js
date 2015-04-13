define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * angle module
   */
  var angle = (function () {

    var DD = "DD";//decimal degrees
    var DMM = "DMM";//degree decimal minute
    var DMS = "DMS";//degrees, minutes, and seconds

    function stringify(dd, opt_format) {
      var format = opt_format || DD;
      var fixedLength = 5;
      var returnValue = dd;
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
      return isNaN(dd) ? String(dd) : [
        0 | dd,
        ' ',
        (ddAbs % 1 * 60).toFixed(fixedLength)
      ].join('');
    }

    function _stringifyDDToDMS(dd, fixedLength) {
      var ddAbs = dd < 0 ? -dd : dd;
      return isNaN(dd) ? String(dd) : [
        0 | dd,
        '°',
        0 | ddAbs % 1 * 60,
        "'",
        (ddAbs * 60 % 1 * 60).toFixed(fixedLength - 4),
        '"'
      ].join('');
    }

    
    //exports
    return {
      DD: DD,
      DMM: DMM,
      DMS: DMS,
      stringify: stringify
    };
  }());

  var __abs = Math.abs;
  var __isArray = angular.isArray;
  var __stringify = angle.stringify;

  
  return angular
    .module(module.id, [])

    .filter("geoLon", [function () {
      return function (coord, opt_format) {
        return __stringify(__abs(coord), opt_format) + (coord > 0 ? "E" : "W");
      };
    }])

    .filter("geoLat", [function () {
      return function (coord, opt_format) {
        return __stringify(__abs(coord), opt_format) + (coord > 0 ? "N" : "S");
      };
    }])

    .filter("geocoord", ["$filter", function ($filter) {
      var geoLon = $filter("geoLon");
      var geoLat = $filter("geoLat");

      return function (coord, opt_format) {
        var longitude, latitude;
        if (coord && ('latitude' in coord)) {
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
        return geoLat(latitude, opt_format) + ' ' + geoLon(longitude, opt_format);
      };
    }]);
});