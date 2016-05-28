define(["module", "angular", "angular-translate-loader-partial"], function (module, angular, ngTranslateLoader) {
  "use strict";

  return angular
    .module(module.id, [ngTranslateLoader.name || ngTranslateLoader])

    .config(["$linkProvider", function ($linkProvider) {
      $linkProvider
        .rel("ng-stylesheet", [function () {

          return function loader($scope, $element, $attrs) {
            var href = $element.attr("href");
            if (href) {
              //var comment = ' require(css!' + href + ')';
              require(["css!" + href]);
              //$element.replaceWith(document.createComment(comment));
            }
          };
        }]);
    }]);
});