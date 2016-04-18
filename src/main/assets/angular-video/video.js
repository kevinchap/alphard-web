define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * @usage
   *
   */
  var ngModule = angular
    .module(module.id, [])
    .directive("video", VideoDirective)
    .directive("ngPlaying", videoAttributeDirective("ngPlaying", NgPlayingCtrl))
    .directive("ngLoading", videoAttributeDirective("ngLoading", NgLoadingCtrl));

  /**
   * @usage
   * <video [ng-playing="{=boolean}"]
   *        [ng-loading="{=boolean}"]>
   */
  function VideoDirective() {
    return {
      restrict: "E",
      controllerAs: ["video"],
      controller: VideoCtrl
    };
  }

  VideoCtrl.$inject = ["$scope", "$element"];
  function VideoCtrl($scope, $element) {
    var PLAY = "play";
    var PAUSE = "pause";
    var LOADSTART = "loadstart";
    var LOADEDDATA = "loadeddata";
    var _loading = false;

    $element
      .bind(PLAY, onPlay)
      .bind(PAUSE, onPause)
      .bind(LOADSTART, onLoadStart)
      .bind(LOADEDDATA, onLoadedData);
    $scope.$on("$destroy", onDestroy);

    //Public
    this.loading = loading;
    this.playing = playing;

    function onPlay($event) {
      $scope.$apply();
    }

    function onPause($event) {
      $scope.$apply();
    }

    function onLoadStart($event) {
      $scope.$apply(function () {
        _loading = true;
      });
    }

    function onLoadedData($event) {
      $scope.$apply(function () {
        _loading = false;
      });
    }

    function onDestroy($event) {
      $element
        .unbind(PLAY, onPlay)
        .unbind(PAUSE, onPause)
        .unbind(LOADSTART, onLoadStart)
        .unbind(LOADEDDATA, onLoadedData);
    }

    function loading() {
      return _loading;
    }

    function playing(opt_val) {
      var element = $element[0];
      if (arguments.length) {
        if (opt_val) {
          element.play();
        } else {
          element.pause();
        }
      } else {
        return !element.paused;
      }
    }
  }

  function videoAttributeDirective(attrName, ctrl) {
    videoAttribute.$inject = ["$injector", "$parse"];
    function videoAttribute($injector, $parse) {
      return {
        restrict: "A",
        require: ["?video"],
        compile: function ($element, $attrs) {
          var ngVideoAttr = $parse($attrs[attrName]);
          return function link($scope, $element, $attrs, $ctrls) {
            var videoCtrl = $ctrls[0];
            if (videoCtrl) {
              $injector.invoke(ctrl, this, {
                $scope: $scope,
                $element: $element,
                $attrs: $attrs,
                videoAttr: {
                  get: function () {
                    return ngVideoAttr($scope);
                  },
                  set: function (value) {
                    ngVideoAttr.assign($scope, value);
                  }
                },
                video: videoCtrl
              });
            }
          };
        }
      };
    }

    return videoAttribute;
  }


  function NgPlayingCtrl($scope, $element, $attrs, videoAttr, video) {
    var _value;//undefined for initialization

    $scope.$watch(
      function () {
        var newValue;

        // check changes from controller
        newValue = video.playing();
        if (newValue !== _value) {
          _value = newValue;
          videoAttr.set(_value);
        } else {
          // Check changes from attributes
          newValue = !!videoAttr.get();
          if (newValue !== _value) {
            _value = newValue;
            video.playing(_value);
          }
        }
      });

  }

  function NgLoadingCtrl($scope, videoAttr, video) {
    $scope.$watch(video.loading, videoAttr.set);
  }


  return ngModule;
});