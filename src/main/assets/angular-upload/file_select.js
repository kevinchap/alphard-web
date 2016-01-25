define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Module declaration
   */
  var ngModule = angular
    .module(module.id, [])
    .directive("ngFileSelect", NgFileSelect);


  /**
   * ngFileSelect directive
   *
   * Usage:
   *
   *  <input type="file"
   *         ng-file-select="callback($event, $files)"
   *         [multiple]>
   *   - OR -
   *  <button ng-file-select="callback($event, $files)">
   *
   *  </button>
   */
  NgFileSelect.$inject = ["$compile", "$log", "$parse"];
  function NgFileSelect($compile, $log, $parse) {
    var NAME = "ngFileSelect";
    var MULTIPLE = "multiple";

    function __toArray(o) {
      var i, l;
      var returnValue = o;
      if (o !== null && o !== undefined) {
        if (o.slice) {
          returnValue = o.slice();
        } else if (o.item) {
          returnValue = [];
          for (i = 0, l = o.length; i < l; i++) {
            returnValue.push(o.item(i));
          }
        } else {
          returnValue = [];
          for (i = 0, l = o.length; i < l; i++) {
            returnValue.push(o[i]);
          }
        }
      }
      return returnValue;
    }

    return {
      restrict: "A",
      compile: function () {

        return function link($scope, $element, $attrs) {
          var $inputElement = $element;
          var $inputElementChild = false;
          var nodeName = $element[0].nodeName;
          var ngFileSelect = $parse($attrs[NAME]);


          function initialize() {
            //Update DOM
            if (nodeName !== "INPUT") {
              //$inputScope = $scope.$new();
              $inputElement = $compile('<input type="file" ng-click="$event.stopPropagation();">')($scope);
              $inputElementChild = true;
              $element.append($inputElement);
              $scope.$watch(
                multiple,
                function (multiple) {
                  if (multiple) {
                    $inputElement.attr(MULTIPLE, "");
                  } else {
                    $inputElement.removeAttr(MULTIPLE);
                  }
                });
            } else {
              //check input type
              if ($attrs.type !== "file") {
                $log.warn($element[0], ' must be an input[type=file]');
              }
            }

            //Bind Change event
            $inputElement.bind("change", onChange);

            //Bind Destroy event
            $scope.$on("$destroy", onDestroy);
          }

          function multiple() {
            return MULTIPLE in $attrs;
          }

          function onChange($event) {
            var $files = __toArray($event.target.files);
            $scope.$apply(function () {
              ngFileSelect($scope, {
                $files: $files,
                $event: $event
              });
              $inputElement.prop("value", null);
            });
          }

          function onDestroy() {
            if ($inputElementChild) {
              $inputElement.remove();
            }
          }

          //startup
          initialize();
        };
      }
    };
  }

  return ngModule;
});