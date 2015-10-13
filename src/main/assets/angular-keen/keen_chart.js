define(["module", "angular"], function (module, angular) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};
  var LIBRARY = "angular";

  return angular
    .module(module.id, [])

  /**
   * Usage:
   *   $keenDataviz.artifact("myName", "<div>...</div>")
   */
    .provider("$keenDataviz", [function () {
      var artifacts = {};
      //add sportagraph library
      var dataTypes = {
        // dataType            : // chartTypes
        'singular': [],
        'categorical': [],
        'cat-interval': [],
        'cat-ordinal': [],
        'chronological': [],
        'cat-chronological': [],
        'nominal': [],
        'extraction': []
      };

      this.$get = ["$compile", "$keen", function ($compile, $keen) {
        var isRegistered = false;

        function artifact(artifactName, template, opt_dataTypes) {
          var $ = angular.element;
          var $templateCompiled = null;

          function _element(self) {
            return $(self.el());
          }

          function _ngTemplate(self) {
            return $templateCompiled || ($templateCompiled = $compile(template));
          }

          function _ngScope(self) {
            return self._scope || (self._scope = _element(self).scope().$new());
          }

          artifacts[artifactName] = {
            initialize: function () {
            },

            update: function () {
              var self = this;
              var $scope = _ngScope(self);
              $scope.$title = self.title();
              $scope.$data = self.data();
              $scope.$applyAsync();
            },

            render: function () {
              var self = this;
              var $scope = _ngScope(self);
              _ngTemplate(self)($scope, function ($clonedElement) {
                //append
                self.view._artifacts[artifactName] = $clonedElement[0];
                _element(self).append($clonedElement);
              });
              this.update();
            },

            destroy: function () {
              var artifacts = this.view._artifacts;
              var artifact = artifacts[artifactName];
              if (artifact) {
                $(artifact).remove();
                artifacts[artifactName] = null;
              }
            }
          };
          if (opt_dataTypes) {
            for (var i = 0, l = opt_dataTypes.length; i < l; i++) {
              var dataType = opt_dataTypes[i];
              var chartTypes = dataTypes[dataType] || (dataTypes[dataType] = []);
              if (chartTypes.indexOf(artifactName) < 0) {
                chartTypes.push(artifactName);
              }
            }
          }
        }

        function create() {
          register();
          return new $keen.Dataviz();
        }

        function register() {
          if (!isRegistered) {
            isRegistered = true;
            $keen.Dataviz.register(
              LIBRARY,
              artifacts,
              {
                capabilities: dataTypes
              });
          }
        }

        return {
          artifact: artifact,
          create: create
        };
      }];
    }])


  /**
   * Usage:
   *
   * <div keen-chart-spinner>
   * </div>
   */
    .directive('keenChartSpinner', function () {
      return {
        replace: true,
        template: '<spinner variant="rect"></spinner>'
      };
    })
  /**
   * Usage:
   *
   * <keen-chart [query=""]
   *             [data=""]
   *             type=""
   *             [library=""]
   *             [title="My Title"]>
   * </keen-chart>
   */
    .directive('keenChart', [function () {
      return {
        restrict: 'EA',
        scope: {
          options: "&",
          query: "&",
          data: "&",
          title: "@",
          type: "@",
          library: "@"
        },
        bindToController: true,
        controllerAs: 'keenChart',
        controller: ['$keenDataviz', "$keenClient", '$scope', '$element', '$q', function ($keenDataviz, $keenClient, $scope, $element, $q) {
          var self = this;
          var chart = $keenDataviz.create();
          var _rev = 1;

          //lazy load CSS
          //require(["css!" + module.id]);

          //Link to element
          chart.el($element[0]);

          chart.view.loader = {
            library: LIBRARY,
            chartType: 'spinner'
          };

          self.refreshCommon = function () {
            chart
              .chartType(self.type)
              .chartOptions(self.options())
              .title(self.title)
              .library(self.library);
          };

          self.refreshData = function (dataOrPromise) {
            self.refreshCommon();
            chart.prepare();
            var currentRev = ++_rev;
            if (dataOrPromise) {
              $q
                .when(dataOrPromise)
                .then(function (data) {
                  if (currentRev === _rev) {
                    chart.parseRawData(data).render();
                  }
                });
            }
          };

          self.refreshQuery = function (query) {
            self.refreshCommon();
            chart.prepare();
            var currentRev = ++_rev;
            $keenClient.run(query, function (error, result) {
              if (currentRev === _rev) {
                if (error) {
                  chart.error(error.message);
                } else {
                  chart.parseRequest(this).render();
                }
                $scope.$apply();
              }
            });
          };

          $scope.$watchGroup([
              function () {
                return self.type;
              },
              function () {
                return self.title;
              },
              function () {
                return self.library;
              },
              self.options
            ],
            function () {
              self.refreshCommon();
            });

          $scope.$watchGroup([self.data, self.query], function (val) {
            var data = val[0];
            var query = val[1];

            if (query) {
              self.refreshQuery(query);
            } else if (data) {
              self.refreshData(data);
            } else {
              //no data nor query
            }
          });

          $scope.$on("$destroy", function () {
            chart.destroy();
          });

          return self;
        }]
      };
    }])

    .run(["$keenDataviz", function ($keenDataviz) {
      $keenDataviz.artifact(
        "spinner",
        '<div keen-chart-spinner></div>'
      );
    }]);
});