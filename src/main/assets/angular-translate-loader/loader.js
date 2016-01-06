define(["module", "angular", "angular-translate-loader-partial"], function (module, angular, ngTranslateLoader) {
  "use strict";

  return angular
    .module(module.id, [ngTranslateLoader.name || ngTranslateLoader])

    .config(["$linkProvider", function ($linkProvider) {
      $linkProvider.set("ng-stylesheet", "$linkStylesheet");
    }])
    .factory("$linkStylesheet", [function () {

      return function loader($scope, $element, $attrs) {
        var href = $element.attr("href");
        if (href) {
          var comment = ' require(css!' + href + ')';
          require(["css!" + href]);
          $element.replaceWith(document.createComment(comment));
        }
      };
    }])

    .config(["$linkProvider", function ($linkProvider) {
      $linkProvider.set("ng-translate", "$linkTranslate");
    }])
    .factory("$linkTranslate", ["$translate", "$translatePartialLoader", function ($translate, $translatePartialLoader) {

      return function loader($scope, $element, $attrs) {
        var href = $element.attr("href");
        if (href) {
          var comment = ' $translatePartialLoader.addPart(' + href + ')';
          $translatePartialLoader.addPart(href);
          $translate.refresh();
          $element.replaceWith(document.createComment(comment));
        }
      };
    }]);
});