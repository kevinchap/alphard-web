define(["module", "angular"], function (module, angular) {
  "use strict";

  //RequireJS Config
  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug || false;
  var CSS = config.css || "css!flag-icon-css/css/flag-icon";
  var isoAlpha3To2 = {
    "AND": "AD",
    "ARE": "AE",
    "ATG": "AG",
    "ARM": "AM",
    "AGO": "AO",
    "ATA": "AQ",
    "AUT": "AT",
    "ABW": "AW",
    "BIH": "BA",
    "BRB": "BB",
    "BGD": "BD",
    "BDI": "BI",
    "BEN": "BJ",
    "BRN": "BN",
    "BES": "BQ",
    "BHS": "BS",
    "BLR": "BY",
    "BLZ": "BZ",
    "COD": "CD",
    "CAF": "CF",
    "COG": "CG",
    "COK": "CK",
    "CHL": "CL",
    "CHN": "CN",
    "CPV": "CV",
    "CUW": "CW",
    "DNK": "DK",
    "EST": "EE",
    "ESH": "EH",
    "FLK": "FK",
    "FSM": "FM",
    "FRO": "FO",
    "GRD": "GD",
    "GUF": "GF",
    "GRL": "GL",
    "GIN": "GN",
    "GLP": "GP",
    "GNQ": "GQ",
    "SGS": "GS",
    "GNB": "GW",
    "GUY": "GY",
    "IRL": "IE",
    "ISR": "IL",
    "IRQ": "IQ",
    "JAM": "JM",
    "COM": "KM",
    "PRK": "KP",
    "KOR": "KR",
    "CYM": "KY",
    "KAZ": "KZ",
    "LBR": "LR",
    "LBY": "LY",
    "MNE": "ME",
    "MAF": "MF",
    "MDG": "MG",
    "MAC": "MO",
    "MNP": "MP",
    "MTQ": "MQ",
    "MLT": "MT",
    "MDV": "MV",
    "MEX": "MX",
    "MOZ": "MZ",
    "NIU": "NU",
    "PYF": "PF",
    "PNG": "PG",
    "PAK": "PK",
    "POL": "PL",
    "SPM": "PM",
    "PCN": "PN",
    "PRT": "PT",
    "PLW": "PW",
    "PRY": "PY",
    "SRB": "RS",
    "SLB": "SB",
    "SYC": "SC",
    "SWE": "SE",
    "SVN": "SI",
    "SVK": "SK",
    "SEN": "SN",
    "SUR": "SR",
    "SLV": "SV",
    "SWZ": "SZ",
    "TCD": "TD",
    "ATF": "TF",
    "TKM": "TM",
    "TUN": "TN",
    "TUR": "TR",
    "TUV": "TV",
    "UKR": "UA",
    "URY": "UY",
    "WLF": "WF",
    "MYT": "YT"
  };

  //Util
  function str(o) {
    return "" + o;
  }

  function bem(prefix, sep) {
    return function $bem(opt_suffix) {
      return prefix + (opt_suffix ? sep + str(opt_suffix).toLowerCase() : "");
    };
  }

  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  function isoAlpha2(s) {
    s = str(s).toUpperCase();
    var returnValue = s;
    if (isoAlpha3To2.hasOwnProperty(s)) {
      returnValue = isoAlpha3To2[s];
    } else {
      returnValue = s.slice(0, 2);//Take only first two letters
    }
    return returnValue.toLowerCase();
  }

  debug("config", config);

  //angular module
  return angular
    .module(module.id, [])

  /**
   * Flag directive
   *
   * Usage:
   *
   * <flag country="fr" [squared="true|false"]></flag>
   */
    .directive("flag", [function () {
      var $$class = "flag-icon";
      var $m = bem($$class, "-");

      return {
        restrict: "EA",
        scope: {},
        compile: function ($element, $attrs) {
          //lazy load CSS
          if (CSS) {
            require([CSS]);
          }
          return function link($scope, $element) {
            var countryCodeOld;

            function country() {
              return $attrs.country;
            }

            function countryCode() {
              return isoAlpha2(country());
            }

            function squared() {
              return ("squared" in $attrs) && ($attrs.squared !== false);
            }

            $scope.$watch(function () {
              $element.addClass($$class);
              $element.toggleClass($m("squared"), squared());

              var countryCodeNew = countryCode();
              if (countryCodeNew !== countryCodeOld) {
                $element
                  .removeClass($m(countryCodeOld))
                  .addClass($m(countryCodeNew));
                countryCodeOld = countryCodeNew;
              }
            });
          };
        }
      };
    }]);
});