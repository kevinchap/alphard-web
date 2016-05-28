define(["module", "angular", "angular-material"], function (module, angular, ngMaterial) {
  "use strict";

  /**
   * Provide theme and palette for social network
   *
   * @usage
   * <md-button md-theme="facebook|twitter|..."
   *            class="md-primary">
   *   <!-- Text will be colored using color-->
   * </md-button>
   */

  /**
   * Social network colors constants
   */
  var MD_SOCIAL_COLOR = {
    blogger: "#fb8f3d",
    dribbble: "#ea4c89",
    facebook: "#3b5998",
    googleplus: "#dd4b39",
    flickr: "#ff0084",
    forrst: "#5B9A68",
    foursquare: "#0072b1",
    instagram: "#517fa4",
    linkedin: "#007bb6",
    pinterest: "#cb2027",
    quora: "#a82400",
    stumbleupon: "#EB4823",
    soundcloud: "#ff3a00",
    tumblr: "#32506d",
    twitter: "#00aced",
    vimeo: "#aad450",
    vk: "#45668e",
    wordpress: "#21759b",
    yahoo: "#7B0099",
    youtube: "#bb0000"
  };

  /**
   * Palette generator from hex code (ex: #ff00ff)
   */
  var $mdThemePaletteGenerate = (function () {
    //https://gist.github.com/epelc/57a0f42fbc0b7d916ac5
    var BASES = {
      //name: alpha
      "50": 0.13,
      "100": 0.31,
      "200": 0.50,
      "300": 0.7,
      "400": 0.85,
      "500": 1,
      "600": 0.91,
      "700": 0.81,
      "800": 0.71,
      "900": 0.52
    };

    function parseColor(hexString) {
      var r = hexString.slice(1, 3);
      var g = hexString.slice(3, 5);
      var b = hexString.slice(5, 7);
      var base = 16;
      return [parseInt(r, base), parseInt(g, base), parseInt(b, base)];
    }

    function $mdThemePaletteGenerate(hexString) {
      var rgb = parseColor(hexString);
      var r = rgb[0], g = rgb[1], b = rgb[2];
      var colors = {};
      angular.forEach(BASES, function (alpha, name) {
        colors[name] = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      });
      return colors;
    }

    return $mdThemePaletteGenerate;
  }());


  /**
   * ngModule
   */
  var ngModule = angular
    .module(module.id, [ngMaterial.name])
    .constant("MD_SOCIAL_COLOR", MD_SOCIAL_COLOR)
    .config(["$mdThemingProvider", "MD_SOCIAL_COLOR", function ($mdThemingProvider, MD_SOCIAL_COLOR) {
        angular.forEach(MD_SOCIAL_COLOR, function (color, name) {
          var palette = $mdThemingProvider.extendPalette('green', $mdThemePaletteGenerate(color));

          $mdThemingProvider
            .definePalette(name, palette);

          $mdThemingProvider
            .theme(name)
            .primaryPalette(name);
        });
      }
    ]);

  return ngModule;
});