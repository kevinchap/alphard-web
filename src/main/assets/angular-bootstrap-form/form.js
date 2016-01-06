define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * <form name="library">
   *   <div bs-form-group="name" [nolabel]>
   *       < ... ng-model="...">
   *       <div bs-form-messages></div>
   *   </div>
   * </form>
   */
  var TTranslate = (function () {

    function $translateKey(k) {
      return this.$form.$name + "_" + this.$name + "_" + k;
    }

    function $translate(k) {
      var key = this.$translateKey(k);
      return this.$$translate.instant(key) || key;
    }

    return function TTranslate($injector) {

      this.$$translate = $injector.has("$translate") ?
        $injector.get("$translate") :
        { instant: function () {} };

      this.$translateKey = $translateKey;

      this.$translate = $translate;
    };
  }());

  var TFormError = (function () {
    var _empty = {};

    function $errors() {
      var form = this.$form;
      var name = this.$name;
      return form && name && form[name] && form[name].$error || _empty;
    }

    function $errorCount() {
      return Object.keys(this.$errors()).length;
    }

    return function TFormError() {
      this.$errors = $errors;
      this.$errorCount = $errorCount;
    };
  }());

  return angular
    .module(module.id, [])

    /**
     * <div bs-form-group="{{formGroupName}}">
     * </div>
     */
    .directive("bsFormGroup", function () {
      return {
        require: ["bsFormGroup", '^form'],
        bindToController: true,
        controllerAs: "bsFormGroup",
        controller: (function () {

          function FormGroup($scope, $element, $attrs, $injector) {
            var self = this;
            TTranslate.call(this, $injector);//mixin
            TFormError.call(this);

            self.$form = null;
            self.$name = "";

            self.hasLabel = function () {
              return !("nolabel" in $attrs);
            };

            function updateName() {
              self.$name = $attrs.name || $attrs.bsFormGroup;
            }

            $scope.$watch(function () {
              updateName();
              $element
                .addClass("form-group")
                .toggleClass("has-error", self.$errorCount() > 0);
            });
            updateName();
          }
          FormGroup.$inject = ["$scope", "$element", "$attrs", "$injector"];

          return FormGroup;
        }()),
        scope: {},
        transclude: true,
        template:
          '<label bs-control-label ng-if="bsFormGroup.hasLabel()"></label>' +
          '<div bs-control-container ng-transclude>' +
          '</div>',
        link: {
          pre: function ($scope, $element, $attrs, $ctrls) {
            var bsFormGroup = $ctrls[0];
            var form = $ctrls[1];
            bsFormGroup.$form = form;
          }
        }
      };
    })

    .directive("bsControlLabel", function () {

      return {
        require: ["bsControlLabel", '^bsFormGroup'],
        controllerAs: "bsControlLabel",
        controller: (function () {
          var LABEL = "label";

          function ControlLabel($scope, $element) {
            var self = this;

            self.$field = null;

            self.getKey = function () {
              return self.$field.$translateKey(LABEL);
            };

            self.getLabel = function () {
              return self.$field.$translate(LABEL);
            };

            $scope.$watch(function () {
              $element.addClass("control-label");
            });
          }
          ControlLabel.$inject = ["$scope", "$element"];

          return ControlLabel;
        }()),
        scope: true,
        template: '<span translate="{{bsControlLabel.getKey()}}" translate-default="{{bsControlLabel.getLabel()}}">{{bsControlLabel.getLabel()}}</span>',
        link: {
          pre: function ($scope, $element, $attrs, $ctrls) {
            var bsControlLabel = $ctrls[0];
            var bsFormGroup = $ctrls[1];
            bsControlLabel.$field = bsFormGroup;
          }
        }
      };
    })

    .directive("bsControlContainer", function () {
      return {
        controllerAs: "bsControlContainer",
        controller: (function () {

          function ControlContainer($scope, $element) {
            $scope.$watch(function () {
              $element.addClass("control-container clearfix");
            });
          }
          ControlContainer.$inject = ["$scope", "$element"];

          return ControlContainer;
        }(Object))
      };
    })

    .directive("bsFormControl", function () {
      return {
        require: ["bsFormControl", '^form', '?ngModel', '^bsFormGroup'],
        restrict: "EA",
        controllerAs: "bsFormControl",
        controller: (function () {
          var PLACEHOLDER = "placeholder";
          var inputTag = {
            "input": true,
            "textarea": true,
            "select": true
          };

          function FormControl($scope, $element, $attrs) {
            var self = this;
            var nodeName = $element[0].tagName.toLowerCase();

            self.$field = null;

            function _isInput() {
              return inputTag[nodeName];
            }

            function _isStatic() {
              return true;
            }

            $scope.$watch(function () {
              if (_isInput()) {
                $element.addClass("form-control");
              } else if (_isStatic()) {
                $element.addClass("form-control-static");
              }

              if (nodeName !== "select") {
                $attrs.$set(PLACEHOLDER, self.$field.$translate(PLACEHOLDER));
              }
            });
          }
          FormControl.$inject = ["$scope", "$element", "$attrs"];



          return FormControl;
        }(Object)),
        link: {
          pre: function ($scope, $element, $attrs, $ctrls) {
            var bsFormControl = $ctrls[0];
            var form = $ctrls[1];
            var ngModel = $ctrls[2];
            var bsFormGroup = $ctrls[3] || {};
            bsFormControl.$field = bsFormGroup;

            if (form && bsFormGroup) {
              var newName = bsFormGroup.$name;
              form.$$renameControl(ngModel, newName);
            }
          }
        }
      };
    })

  /**
   * Usage:
   *
   * <div bs-form-messages [name="field_name"]></div>
   */
    .directive("bsFormMessages", function () {

      return {
        require: ["bsFormMessages", '^?form', '^?ngModel', '^?bsFormGroup'],
        restrict: "EA",
        controllerAs: "bsFormMessages",
        controller: (function () {

          function FormMessages($injector) {
            var self = this;
            TTranslate.call(this, $injector);//mixin
            TFormError.call(this);

            self.$name = "";
            self.$form = null;
          }
          FormMessages.$inject = ["$injector"];

          return FormMessages;
        }()),
        template:
          '<div class="bs-form-message" ng-repeat="(key, _) in bsFormMessages.$errors()" ng-bind="bsFormMessages.$translate(key)">' +
          '</div>',
        link: {
          pre: function ($scope, $element, $attrs, $ctrls) {
            var bsFormMessages = $ctrls[0];
            var form = $ctrls[1];
            var ngModel = $ctrls[2] || {};
            var bsFormGroup = $ctrls[3] || {};
            bsFormMessages.$form = form;

            function updateName() {
              bsFormMessages.$name = (
                $attrs.name ||
                (ngModel && ngModel.$name) ||
                (bsFormGroup.$name)
              );
            }

            $scope.$watch(function () {
              $element.addClass("bs-form-messages help-block");
              updateName();
            });
            updateName();
          }
        }
      };
    });
});