define(["module", "require", "angular"], function (module, require, angular) {
  "use strict";

  return angular
    .module(module.id, [])

    .provider("googleVisualizationPromise", function () {

      this.$get = ["$q", function ($q) {
        return (
          typeof google !== "undefined" && google.visualization ? $q.when(google.visualization) :
          $q(function (resolve, reject) {
            require(["google/visualization"], function () { resolve(google.visualization); }, reject);
          })
        );
      }];

    })

    .controller("GoogleChartController", ["$$rAF", "$scope", "$element", "$window", "googleVisualizationPromise", function ($$rAF, $scope, $element, $window, googleVisualizationPromise) {
      var self = this;
      var googleVisualization = null;
      var _chartWrapper = null;
      var _draw = false;
      var _window = angular.element($window);

      self.chartType = "PieChart";
      //self.dataTable = null;
      self.view = null;
      //self.options = null;

      googleVisualizationPromise.then(function (api) {
        googleVisualization = api;
        _chartWrapper = new googleVisualization.ChartWrapper({
          chartType: getProp("chartType"),
          dataTable: getProp("dataTable"),
          view: self.view,
          options: getProp("options"),
          containerId: $element[0]
        });
        self.draw();
      });

      self.draw = function () {
        if (!_draw && _chartWrapper && getProp("dataTable")) {
          _draw = true;
          $$rAF(function () {
            _draw = false;
            _chartWrapper.draw();
          });
        }
      };

      function getProp(name) {
        var returnValue = self[name];
        if (typeof returnValue == "function") {
          returnValue = self[name](/*locals*/);
        }
        switch (name) {
          case "chartType":
            //lowercase value => find camelcase
            if (googleVisualization) {
              for (var prop in googleVisualization) {
                if (prop.toLowerCase() === returnValue) {
                  returnValue = prop;
                  break;
                }
              }
            }
            break;
          default:
            //do nothing
        }

        return returnValue;
      }

      function watch(prop) {
        var setter = "set" + prop[0].toUpperCase() + prop.slice(1);

        $scope.$watch(function () {
          return getProp(prop);
        }, function (v) {
          if (_chartWrapper) {
            _chartWrapper[setter](v);
            self.draw();
          }
        });
      }
      watch("chartType");
      watch("view");
      watch("options");
      watch("dataTable");

      _window.bind("resize", self.draw);

      $scope.$on("$destroy", function () {
        _window.unbind("resize", self.draw);
      });
    }])

  /**
   * Usage:
   *   <div google-chart type="..."
   *                     data="..."
   *                     [options=""]>
   *   </div>
   */
    .directive("googleChart", function () {
      return {
        restrict: "EA",
        controllerAs: "googleChart",
        controller: "GoogleChartController",
        bindToController: true,
        scope: {
          chartType: "@type",
          dataTable: "&data",
          options: "&"
        }
      };
    });
});