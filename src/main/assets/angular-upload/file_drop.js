define(["module", "angular"], function (module, angular) {
  "use strict";

  var ngModule = angular
      .module(module.id, [])
      .directive("ngFileDrop", NgFileDrop);

  /**
   * ngFileDrop directive
   *
   *
   * @usage
   *
   * <tag ng-file-drop="callback($event, $files)"
   *      [multiple]></tag>
   *
   * <!-- class="ng-file-drop--active" is toggled -->
   */
  NgFileDrop.$inject = ["$parse"];
  function NgFileDrop($parse) {
    var DROP = "drop";
    var DRAGOVER = "dragover";
    var DRAGLEAVE = "dragleave";
    var NAME = 'ngFileDrop';
    var $$block = 'ng-file-drop';
    var $$blockActive = $$block + "--active";

    function __eventPreventAndStop(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function __eventDataTransfer(event) {
      return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
    }

    function __contains(a, element) {
      var returnValue = false;
      if (a) {
        if (a.indexOf) {
          returnValue = a.indexOf(element) !== -1;
        } else if (a.contains) {
          returnValue = a.contains(element);
        }
      }
      return returnValue;
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


    return {
      restrict: "EA",
      compile: function () {
        return function link($scope, $element, $attrs) {
          var ngFileDrop = $parse($attrs[NAME]);

          function initialize() {
            $element
              .bind(DROP, onDrop)
              .bind(DRAGOVER, onDragOver)
              .bind(DRAGLEAVE, onDragLeave);
            $element.addClass($$block);
            $scope.$on("$destroy", onDestroy);
          }

          function onDestroy() {
            $element
              .unbind(DROP, onDrop)
              .unbind(DRAGOVER, onDragOver)
              .unbind(DRAGLEAVE, onDragLeave);
          }

          function onDrop($event) {
            var transfer = __eventDataTransfer($event);
            if (transfer) {
              __eventPreventAndStop($event);
              $setActive(false);
              var $files = __toArray(transfer.files);
              $scope.$apply(function () {
                ngFileDrop($scope, {
                  $event: $event,
                  $files: $files,
                  $file: $files[0]//convenience in case of non multiple
                });
              });
            }
          }

          function onDragOver($event) {
            var transfer = __eventDataTransfer($event);
            if (transfer) {
              if (__contains(transfer.types, "Files")) {
                transfer.dropEffect = 'copy';
                $setActive(true);
                __eventPreventAndStop($event);
              }
            }
          }

          function onDragLeave($event) {
            if ($event.currentTarget === $element[0]) {
              $setActive(false);
              __eventPreventAndStop($event);
            }
          }

          function $setActive(v) {
            $element.toggleClass($$blockActive, v);
          }
          initialize();
        };
      }
    };
  }


  return ngModule;
});