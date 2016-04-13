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
   *         ng-file-select="callback($event, $files, $file)"
   *         [accept="..."]
   *         [multiple]
   *         [ng-multiple="fn()"]
   *         [disabled]
   *         [ng-disabled="..."]>
   *   - OR -
   *  <button ng-file-select="callback($event, $files, $file)"
   *          [ng-file-select-accept="..."]
   *          [ng-file-select-multiple]
   *          [ng-file-select-disabled]>
   *
   *  </button>
   */
  NgFileSelect.$inject = ["$compile", "$document", "$log", "$parse"];
  function NgFileSelect($compile, $document, $log, $parse) {
    var NAME = "ngFileSelect";
    var CLICK = "click";
    var MULTIPLE = "multiple";
    var DISABLED = "disabled";
    var INPUT_TEMPLATE = '<input type="file" class="ng-file-select__input">';
    var STYLE =
      //Styling the parent element
      '.ng-file-select, [ng-file-select] {' +
      '  position: relative; ' +
      '  overflow: hidden; ' +
      '}\n' +

        //Hide the input overlay element
      '.ng-file-select__input {' +
      '  cursor: pointer;' +
      '  display: block;' +
      '  position: absolute;' +
      '  top: 0;' +
      '  left: 0;' +
      '  width: 100%;' +
      '  height: 100%;' +
      '  opacity: 0;' +
      '  filter: "~alpha(opacity=0)";' +
      '  z-index: 99;' +
      '  outline: 0;' +
      '}\n' +
      '.ng-file-select__input::-webkit-file-upload-button {' +
      '  cursor: pointer;' +
      '}\n';

    function boolAttr($element, attr, val) {
      if (val) {
        $element.attr(attr, attr);
      } else {
        $element.removeAttr(attr);
      }
    }

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

    function includeStyle($document, style) {
      //Small snippet that set an input file element as overlay
      return angular
        .element($document)
        .find("head")
        .prepend('<style type="text/css">' + style + '</style>');
    }

    includeStyle($document, STYLE);

    return {
      priority: 5,
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
              $inputElement =
                ($compile(INPUT_TEMPLATE)($scope))
                .bind(CLICK, function ($event) {
                  $event.stopPropagation();
                });
              $inputElementChild = true;

              $element
                .append($inputElement)
                .bind(CLICK, function onClick($event) {
                  $inputElement[0].focus();
                  $inputElement[0].click();
                });

              $scope.$watch(function () {
                //sync disabled
                boolAttr($inputElement, DISABLED, disabled());

                //sync multiple
                $inputElement.attr("accept", accept());

                //sync multiple
                boolAttr($inputElement, MULTIPLE, multiple());
              });

            } else {
              //check input type
              if ($attrs.type !== "file") {
                $log.warn($element[0], ' must be an input[type=file]');
              }
            }

            //Bind Change event
            $inputElement
              .bind("change", onChange);

            //Bind Destroy event
            $scope.$on("$destroy", onDestroy);
          }

          function accept() {
            return $attrs.ngFileSelectAccept || $attrs.accept;
          }

          function disabled() {
            return (
              ((DISABLED in $attrs) && $attrs.disabled !== false) ||
              ("ngFileSelectDisabled" in $attrs)
            );
          }

          function multiple() {
            return (
              (MULTIPLE in $attrs) ||
              ("ngFileSelectMultiple" in $attrs) ||
              (("ngMultiple" in $attrs) && $scope.$eval($attrs.ngMultiple))
            );
          }

          function onChange($event) {
            var $files = __toArray($event.target.files);
            $scope.$apply(function () {
              ngFileSelect($scope, {
                $files: $files,
                $file: $files[0],//first file in case on non multiple
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