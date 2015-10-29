define(["module", "angular", "keen"], function (module, angular, Keen) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};

  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", moduleConfig);

  return angular
    .module(module.id, [])

  /**
   * Usage:
   *
   */
    .provider("$keen", [function () {
      this.$get = [function () {
        return Keen;
      }];
    }])

  /**
   * Usage:
   *
   *  var keenClient = $keenFactory({
   *    projectId: ...,
   *    writeKey: ...,
   *    readKey: ...,
   *    masterKey: ...,
   *    requestType: ...,
   *    host: ...,
   *    protocol: ...,
   *    globalProperties: ...
   *  })
   */
    .provider("$keenFactory", [function () {
      this.$get = [function () {
        return function $keenFactory(opt_settings) {
          return new Keen(opt_settings || {});
        };
      }];
    }])

    .provider("$keenClient", [function () {
      var settings = angular.extend({}, moduleConfig);
      /*{
        projectId: moduleConfig.projectId,
        masterKey: moduleConfig.masterKey,
        readKey: moduleConfig.readKey,
        writeKey: moduleConfig.writeKey,
        requestType: moduleConfig.requestType,
        host: moduleConfig.host,
        protocol: moduleConfig.protocol,
        globalProperties: moduleConfig.globalProperties
      };*/

      this.config = function config(data) {
        angular.extend(settings, data);
      };

      this.$get = ["$keenFactory", function ($keenFactory) {
        return $keenFactory(settings);
      }];
    }])

  /**
   * Usage:
   *
   * <div keen-input-interval
   *      ng-model="...">
   * </div>
   */
    .directive('keenInputInterval', [function () {
      var $$class = "keen-input-interval";
      var INTERVAL = [
        'minutely',
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'yearly'
      ];

      return {
        require: ['keenInputInterval', 'ngModel'],
        restrict: 'EA',
        controllerAs: "keenInputInterval",
        controller: ["$element", function ($element) {
          var self = this;
          var ngModel = $element.controller("ngModel");
          self.intervalOptions = INTERVAL;

          self.format = function (value) {
            return value;
          };
          ngModel.$formatters.push(self.format);

          self.parse = function (value) {
            return value;
          };
          ngModel.$parsers.push(self.parse);

          self.render = function () {
          };
          ngModel.$render = self.render;

          self.interval = function (opt_val) {
            if (arguments.length) {
              ngModel.$setViewValue(opt_val);
            } else {
              return ngModel.$viewValue;
            }
          };

          $element.addClass($$class);
        }],
        template: '<select class="' + $$class + '__value" ' +
        'ng-model="keenInputInterval.interval" ' +
        'ng-model-options="{getterSetter: true}" ' +
        'ng-options="interval as (interval| translate) for interval in keenInputInterval.intervalOptions" >' +
        '</select>'
      };
    }])

  /**
   * Usage:
   *
   * <div keen-input-timeframe
   *      ng-model="...">
   * </div>
   */
    .directive('keenInputTimeframe', [function () {
      var $$class = "keen-input-timeframe";
      var REFERENCE = ['previous', 'this'];
      var UNIT = ['minutes', 'hours', 'days', 'months', 'years'];

      return {
        require: ['keenInputTimeframe', 'ngModel'],
        restrict: 'EA',
        controllerAs: "keenInputTimeframe",
        controller: ["$element", function ($element) {
          var self = this;
          var ngModel = $element.controller("ngModel");

          self.referenceOptions = REFERENCE;
          self.unitOptions = UNIT;

          self.format = function (s) {
            //value ex: "this_14_minutes"
            var model;
            if (!ngModel.$isEmpty(s)) {
              var parts = s.split("_");
              model = {
                reference: parts[0],
                amount: parseInt(parts[1]),
                unit: parts[2]
              };
            } else {
              model = {
                reference: null,
                amount: NaN,
                unit: null
              };
            }
            return model;
          };
          ngModel.$formatters.push(self.format);

          self.parse = function (o) {
            var isEmpty = ngModel.$isEmpty;
            var returnValue = null;
            if (typeof o === "object") {
              var reference = o.reference;
              var amount = parseInt(o.amount);
              var unit = o.unit;

              returnValue = (
                !isEmpty(reference) && !isEmpty(amount) && !isEmpty(unit) ?
                  [reference, amount, unit].join("_") :
                  null
              );
            }
            return returnValue;
          };
          ngModel.$parsers.push(self.parse);

          self.validate = function (modelValue, viewValue) {
            var returnValue = true;
            var value = modelValue || viewValue;
            if (!ngModel.$isEmpty(value)) {
              //var parsed = self.parse(value);
              returnValue = true;//Put validation here
            }
            return returnValue;
          };
          ngModel.$validators.timeFrame = self.validate;

          self.render = function () {
          };
          ngModel.$render = self.render;

          self.reference = getterSetter("reference");

          self.amount = getterSetter("amount");

          self.unit = getterSetter("unit");

          function getterSetter(name) {
            return function (opt_val) {
              if (arguments.length) {
                var value = angular.copy(ngModel.$viewValue);
                value[name] = opt_val;
                ngModel.$setViewValue(value);
              } else {
                return ngModel.$viewValue[name];
              }
            };
          }

          $element.addClass($$class);
        }],
        template: (
          '<select class="' + $$class + '__reference" ng-options="ref as ref for ref in keenInputTimeframe.referenceOptions" ng-model="keenInputTimeframe.reference" ng-model-options="{ getterSetter: true }" >' +
          '</select>' +
          '<input type="number" class="' + $$class + '__amount" ng-model="keenInputTimeframe.amount" ng-model-options="{ getterSetter: true }" >' +
          '<select class="' + $$class + '__unit" ng-options="unit as unit for unit in keenInputTimeframe.unitOptions" ng-model="keenInputTimeframe.unit" ng-model-options="{ getterSetter: true }" >' +
          '</select>'
        )
      };
    }]);
});