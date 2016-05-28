define(["module", "angular"], function (module, angular) {
  "use strict";

  //RequireJS Config
  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug || false;
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
  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }


  debug("config", config);

  //angular module
  var ngModule = angular
    .module(module.id, [])
    .provider("$flagIcon", $flagIconProvider)
    .directive("flag", FlagDirective);

  function $flagIconProvider() {
    this.$get = $get;

    function $get() {

      function isoAlpha2(s) {
        s = ("" + s).toUpperCase();
        var returnValue = s;
        if (isoAlpha3To2.hasOwnProperty(s)) {
          returnValue = isoAlpha3To2[s];
        } else {
          returnValue = s.slice(0, 2);//Take only first two letters
        }
        return returnValue.toLowerCase();
      }

      function url(code, opt_squared) {
        return require.toUrl(
          [
            "flag-icon-css",
            "flags",
            opt_squared ? "1x1" : "4x3",
            isoAlpha2(code).toLowerCase() + ".svg"
          ].join("/")
        );
      }

      return {
        isoAlpha2: isoAlpha2,
        url: url
      };
    }

  }


  /**
   * Flag directive
   *
   * Usage:
   *
   * <flag country="fr" [squared="true|false"]></flag>
   */
  function FlagDirective() {
    var STYLE =
        '.flag-icon {' +
        '  background-size: contain;' +
        '  background-position: 50%;' +
        '  background-repeat: no-repeat;' +
        '  display: inline-block;' +
        '  width: 1.3333333333333333em;' +
        '  line-height: 1em;' +
        '}' +
        '.flag-icon:before {' +
        '  content: "\\00a0";' +
        '}' +
        '.flag-icon.flag-icon-squared {' +
        '  width: 1em;' +
        '}'
      ;

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    return {
      restrict: "EA",
      scope: {},
      controller: FlagCtrl
    };
  }

  FlagCtrl.$inject = ["$scope", "$element", "$attrs", "$flagIcon"];
  function FlagCtrl($scope, $element, $attrs, $flagIcon) {

    //init
    $element.addClass("flag-icon");

    function country() {
      return $attrs.country;
    }

    function squared() {
      return ("squared" in $attrs) && ($attrs.squared !== false);
    }

    function getImageUrl() {
      return $flagIcon.url(country(), squared());
    }

    $scope.$watch(getImageUrl,
      function (imageUrl) {
        $element
          .toggleClass("flag-icon-squared", squared())
          .css(
            "background-image", "url(" + imageUrl + ")"
          );
      });
  }

  return ngModule;
});