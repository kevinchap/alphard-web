define(["module", "angular"], function (module, angular) {
  "use strict";

  return angular
    .module(module.id, [])

    .config(["$provide", function ($provide) {
      $provide.decorator("$templateRequest", ["$templateRequestRequire", function ($templateRequestRequire) {
        return $templateRequestRequire;//override
      }]);
    }])

  /**
   * Generic `require` provider
   */
    .provider("$require", [function () {

      this.$get = ["$window", function ($window) {
        return $window.require;
      }];

    }])

  /**
   * TemplateRequest service implemented with require
   */
    .provider("$templateRequestRequire", [function () {

      this.$get = ["$q", "$require", "$sce", "$templateCache", function ($q, $require, $sce, $templateCache) {
        var isString = angular.isString;

        function $templateRequestRequire(url, ignoreRequestError) {
          return $q(function (resolve, reject) {
            $templateRequestRequire.totalPendingRequests += 1;

            if (!isString(url)) {
              url = $sce.getTrustedResourceUrl(url);
            }

            var templateContent = $templateCache.get(url);
            if (isString(templateContent)) {
              resolve(templateContent);
            } else {
              $require([ "text!" + url ],
                function (content) {
                  $templateCache.put(url, content);
                  $templateRequestRequire.totalPendingRequests -= 1;
                  resolve(content);
                },
                function (error) {
                  $templateRequestRequire.totalPendingRequests -= 1;
                  if (!ignoreRequestError) {
                    throw error;
                    /*throw $compileMinErr('tpload',
                     'Failed to load template: {0} (HTTP status: {1} {2})',
                     tpl, resp.status, resp.statusText);*/
                  }
                  reject(error);
                });
            }
          });
        }

        $templateRequestRequire.totalPendingRequests = 0;

        return $templateRequestRequire;
      }];

    }]);
});