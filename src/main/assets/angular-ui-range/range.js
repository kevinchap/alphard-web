define(["module", 'text!./range.html'], function (module, rangeHTML) {
  "use strict";

  //RequireJS config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = true || moduleConfig.debug;
  var MIN = "min";
  var MAX = "max";
  var MIN_VALUE = 0;
  var MAX_VALUE = 100;
  var VERTICAL = "vertical";
  var HORIZONTAL = "horizontal";
  var $$range = "range";

  // Util
  function isDefined(o) { return o !== null && o !== undefined; }
  function isNaN(o) { return o !== o; }
  function isBoolean(o) { return o === true || o === false; }
  function isNumber(o) { return !isNaN(parseFloat(o)) && isFinite(o); }
  function assertBoolean(o, message) {
    if (!isBoolean(o)) {
      throw new TypeError(message || (o + ' is not a boolean'));
    }
    return !!o;
  }
  function assertNumber(o, message) {
    if (isDefined(o) && !isNumber(o)) {
      throw new TypeError(message || (o + ' is not a number'));
    }
    return parseFloat(o);
  }
  function assertEnum(o, values) {
    var found = false;
    for (var i = 0, l = values.length; i < l; i++) {
      if (o === values[i]) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw new TypeError(o + " must be " + values.join("|"));
    }
    return o;
  }

  function clamp(n, min, max) { return (n < min ? min : (n > max ? max : n)); }
  function percent(n) { return clamp(n, 0, 100); }
  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      return console.debug.apply(console, args);
    }
  }
  debug("config", moduleConfig);

  return angular
    .module(module.id, [])

    .directive("range", ["$document", "$filter", "$log", "$window",
      function ($document, $filter, $log, $window) {
      /** @const */
      var ACTIONS = $window.navigator.pointerEnabled ? {
        start: 'pointerdown',
        move: 'pointermove',
        end: 'pointerup',
        over: 'pointerdown',
        out: 'mouseout'
      } : $window.navigator.msPointerEnabled ? {
        start: 'MSPointerDown',
        move: 'MSPointerMove',
        end: 'MSPointerUp',
        over: 'MSPointerDown',
        out: 'mouseout'
      } : {
        start: 'mousedown touchstart',
        move: 'mousemove touchmove',
        end: 'mouseup touchend',
        over: 'mouseover touchstart',
        out: 'mouseout'
      };

      var $$class = $$range;
      var $$event = function (e) { return (e || '') + '.' + $$range; };
      var $$eventMouseStart = $$event(ACTIONS.start);
      var $$eventMouseMove = $$event(ACTIONS.move);
      var $$eventMouseEnd = $$event(ACTIONS.end);
      var $$eventMouseOver = $$event(ACTIONS.over);
      var $$eventMouseOut = $$event(ACTIONS.out);
      var $$eventSelectStart = $$event("selectstart");

      var isDefined = angular.isDefined;
      var $body = angular.element(document.getElementsByTagName("body")[0]);

      var __warn = function (m) { $log.warn(m); };
      var defaults = {
        disabled: false,
        step: 0,
        decimalPlaces: 0,
        showValues: true,
        preventEqualMinMax: false,
        attachHandleValues: false
      };

      function client(f) {
        var orginalEvent = f.originalEvent;
        try {
          return [
            (f.clientX || orginalEvent.clientX || orginalEvent.touches[0].clientX),
            (f.clientY || orginalEvent.clientY || orginalEvent.touches[0].clientY)
          ];
        } catch (e) {
          return ['x', 'y'];
        }
      }


      return {
        restrict: 'EA',
        template: rangeHTML,
        //replace: true,
        scope: {
          disabled: '=?',
          min: '=',
          max: '=',
          modelMin: '=?',
          modelMax: '=?',
          onHandleDown: '&', // calls optional function when handle is grabbed
          onHandleUp: '&', // calls optional function when handle is released
          orientation: '@', // options: horizontal | vertical | vertical left | vertical right
          step: '@',
          decimalPlaces: '@',
          filter: '@',
          filterOptions: '@',
          showValues: '@',
          pinHandle: '@',
          preventEqualMinMax: '@',
          attachHandleValues: '@'
        },
        controller: [function () {
          var self = this;
          var pinHandle = null;
          var disabled = false;
          var orientation = HORIZONTAL;
          var min = MIN_VALUE;
          var max = MAX_VALUE;
          var modelMin = min;
          var modelMax = max;

          self.$$join = null;
          self.$$valueMin = null;
          self.$$valueMax = null;
          self.$$handleMin = null;
          self.$$handleMax = null;

          self.orientation = function (opt_val) {
            if (arguments.length) {
              var val = assertEnum(opt_val, [HORIZONTAL, VERTICAL]);
              if (orientation !== val) {
                orientation = val;
              }
              return self;
            } else {
              return orientation;
            }
          };

          self.disabled = function (opt_val) {
            if (arguments.length) {
              var val = assertBoolean(opt_val);
              if (disabled !== val) {
                disabled = val;
              }
              return self;
            } else {
              return disabled;
            }
          };

          self.bounds = function (opt_val) {
            if (arguments.length) {
              var _min = assertNumber(opt_val.min, "min must be a number");
              var _max = assertNumber(opt_val.max, "max must be a number");
              min = _min;
              max = _max;
              _onBoundsChange();
              return self;
            } else {
              return { min: min, max: max };
            }
          };

          self.model = function (opt_val) {
            if (arguments.length) {
              var changed = false;
              var _min = clamp(assertNumber(opt_val.min, "min must be a number"), min, max);
              if (modelMin !== _min) {
                modelMin = _min;
                changed = true;
              }

              var _max = clamp(assertNumber(opt_val.max, "max must be a number"), min, max);
              if (modelMax !== _max) {
                modelMax = _max;
                changed = true;
              }

              if (changed) {
                _onModelChange();
              }
              return self;
            } else {
              return { min: modelMin, max: modelMax };
            }
          };

          self.pinHandle = function (opt_val) {
            if (arguments.length) {
              if (pinHandle != opt_val) {
                pinHandle = opt_val;
                self.$$handleMin.visible = opt_val !== MIN;
                self.$$handleMax.visible = opt_val !== MAX;
              }
              return self;
            } else {
              return pinHandle;
            }
          };

          function _onBoundsChange() {
            self.model(self.model());//update bounds
          }

          function _onModelChange() {

          }

          return self;
        }],
        compile: function () {
          return function ($scope, $element, $attrs, range) {
            $scope.$$class = $$class;

            require(["css!angular-ui-range/range"]);

            var
            pos = 'left',
            posOpp = 'right',
            orientation = 0,
            //range = 0,
            down = false;

            function init() {
              $scope.$on('$destroy', onDestroy);

              $scope.$watch(onApply);

              // filtered
              $scope.filteredModelMin = $scope.modelMin;
              $scope.filteredModelMax = $scope.modelMax;

              $element
                // disable selection
                .bind($$eventSelectStart, onSelectStart)
                // stop propagation
                .bind('click', onClick);
            }

            function onDestroy() {
              $element
                // unbind event from slider
                .unbind($$event())

                //.unbind($$event('selectstart'), onSelectorStart)
                .unbind("click", onClick);

              // unbind from body
              $body.unbind($$event());

              // unbind from document
              $document.unbind($$event());

              // unbind from handles
              /*for (var i = 0, l = handles.length; i < l; i++) {
                var handle = handles[i];
                handle.unbind($$event());
                handle.unbind($$event() + 'X');
              }*/
            }

            function onApply() {
              console.warn($scope.disabled);

              range
                .disabled(isDefined($scope.disabled));

              $element.addClass($$class);
            }

            function onSelectStart() {
              return false;
            }

            function onClick($event) {
              $event.stopPropagation();
            }

            $attrs.$observe('orientation', function(val) {
              if (!isDefined(val)) {
                $scope.orientation = defaults.orientation;
              }

              var classNames = $scope.orientation.split(' ');
              var useClass;

              for (var i = 0, l = classNames.length; i < l; i++) {
                classNames[i] = 'ngrs-' + classNames[i];
              }

              useClass = classNames.join(' ');

              // add class to element
              $element.addClass(useClass);

              // update pos
              if ($scope.orientation === 'vertical' || $scope.orientation === 'vertical left' || $scope.orientation === 'vertical right') {
                pos = 'top';
                posOpp = 'bottom';
                orientation = 1;
              }
            });

/*
            function throwError(message) {
              $scope.disabled = true;
              throw new Error('RangeSlider: ' + message);
            }

            function setDisabled(val) {
              $element.toggleClass($$class + "--disabled", val);
            }
*/

/*
            $attrs.$observe('disabled', function(val) {
              if (!isDefined(val)) {
                $scope.disabled = defaults.disabled;
              }


            });



            $attrs.$observe('step', function (val) {
              if (!isDefined(val)) {
                $scope.step = defaults.step;
              }
            });

            $attrs.$observe('decimalPlaces', function(val) {
              if (!isDefined(val)) {
                $scope.decimalPlaces = defaults.decimalPlaces;
              }
            });

            $attrs.$observe('showValues', function(val) {
              if (!isDefined(val)) {
                $scope.showValues = defaults.showValues;
              } else if (val === 'false') {
                $scope.showValues = false;
              } else {
                $scope.showValues = true;
              }
            });

            $attrs.$observe('pinHandle', function(val) {
              if (!isDefined(val)) {
                $scope.pinHandle = null;
              } else if (val === MIN || val === MAX) {
                $scope.pinHandle = val;
              } else {
                $scope.pinHandle = null;
              }
              $scope.$watch('pinHandle', range.setPinHandle);
            });

            $attrs.$observe('preventEqualMinMax', function(val) {
              if (!isDefined(val)) {
                $scope.preventEqualMinMax = defaults.preventEqualMinMax;
              } else if (val === 'false') {
                $scope.preventEqualMinMax = false;
              } else {
                $scope.preventEqualMinMax = true;
              }
            });

            $attrs.$observe('attachHandleValues', function(val) {
              if (!angular.isDefined(val)) {
                $scope.attachHandleValues = defaults.attachHandleValues;
              } else {
                if (val === 'true' || val === '') {
                  // flag as true
                  $scope.attachHandleValues = true;
                  // add class to runner
                  //$element.find('.ngrs-value-runner').addClass('ngrs-attached-handles');
                } else {
                  $scope.attachHandleValues = false;
                }
              }
            });*/

            /**
             * HANDLE CHANGES
             */



            function setModelMinMax() {
              var handleMin = self.$$handleMin;
              var handleMax = self.$$handleMax;
              var pinHandle = $scope.pinHandle;
              var modelMin = $scope.modelMin;
              var modelMax = $scope.modelMax;

              if (modelMin > modelMax) {
                __warn('modelMin must be less than or equal to modelMax');
                // reset values to correct
                modelMin = modelMax;
              }

              // only do stuff when both values are ready
              if (
                (isDefined(modelMin) || pinHandle === 'min') &&
                (isDefined(modelMax) || pinHandle === 'max')
              ) {

                // make sure they are numbers
                if (!isNumber(modelMin)) {
                  if (pinHandle !== 'min') {
                    __warn('modelMin must be a number');
                  }
                  modelMin = $scope.modelMin = $scope.min;
                }

                if (!isNumber(modelMax)) {
                  if (pinHandle !== 'max') {
                    __warn('modelMax must be a number');
                  }
                  modelMax = $scope.modelMax = $scope.max;
                }

                var handle1pos = percent((($scope.modelMin - $scope.min) / range) * 100),
                  handle2pos = percent((($scope.modelMax - $scope.min) / range) * 100),
                  value1pos,
                  value2pos;

                if ($scope.attachHandleValues) {
                  value1pos = handle1pos;
                  value2pos = handle2pos;
                }

                // make sure the model values are within the allowed range
                $scope.modelMin = Math.max($scope.min, $scope.modelMin);
                $scope.modelMax = Math.min($scope.max, $scope.modelMax);

                if ($scope.filter && $scope.filterOptions) {
                  $scope.filteredModelMin = $filter($scope.filter)($scope.modelMin, $scope.filterOptions);
                  $scope.filteredModelMax = $filter($scope.filter)($scope.modelMax, $scope.filterOptions);
                } else if ($scope.filter) {

                  var filterTokens = $scope.filter.split(':'),
                    filterName = $scope.filter.split(':')[0],
                    filterOptions = filterTokens.slice().slice(1),
                    modelMinOptions,
                    modelMaxOptions;

                  // properly parse string and number args
                  filterOptions = filterOptions.map(function (arg) {
                    if (isNumber(arg)) {
                      return +arg;
                    } else if ((arg[0] == "\"" && arg[arg.length-1] == "\"") || (arg[0] == "\'" && arg[arg.length-1] == "\'")) {
                      return arg.slice(1, -1);
                    }
                  });

                  modelMinOptions = filterOptions.slice();
                  modelMaxOptions = filterOptions.slice();
                  modelMinOptions.unshift($scope.modelMin);
                  modelMaxOptions.unshift($scope.modelMax);

                  $scope.filteredModelMin = $filter(filterName).apply(null, modelMinOptions);
                  $scope.filteredModelMax = $filter(filterName).apply(null, modelMaxOptions);
                } else {
                  $scope.filteredModelMin = $scope.modelMin;
                  $scope.filteredModelMax = $scope.modelMax;
                }

                // check for no range
                if ($scope.min === $scope.max && $scope.modelMin == $scope.modelMax) {

                  // reposition handles
                  range.handleMin.value = 0;
                  range.handleMax.value = 100;

                  if ($scope.attachHandleValues) {
                    // reposition values
                    angular.element(values[0]).css(pos, '0%');
                    angular.element(values[1]).css(pos, '100%');
                  }

                  // reposition join
                  angular.element(join).css(pos, '0%').css(posOpp, '0%');

                } else {

                  // reposition handles
                  range.handleMin.value = handle1pos;
                  range.handleMax.value = handle2pos;

                  if ($scope.attachHandleValues) {
                    // reposition values
                    angular.element(values[0]).css(pos, value1pos + '%');
                    angular.element(values[1]).css(pos, value2pos + '%');
                    angular.element(values[1]).css(posOpp, 'auto');
                  }

                  // reposition join
                  angular.element(join).css(pos, handle1pos + '%').css(posOpp, (100 - handle2pos) + '%');

                  // ensure min handle can't be hidden behind max handle
                  if (handle1pos > 95) {
                    //angular.element(handles[0]).css('z-index', 3);
                  }
                }

              }

            }

            function handleMove(index) {

              var $handle = handles[index];

              // on mousedown / touchstart
              $handle.bind($$eventMouseStart + 'X', function(event) {

                var handleDownClass = (index === 0 ? 'ngrs-handle-min' : 'ngrs-handle-max') + '-down',
                //unbind = $handle.add($document).add('body'),
                  modelValue = (index === 0 ? $scope.modelMin : $scope.modelMax) - $scope.min,
                  originalPosition = (modelValue / range) * 100,
                  originalClick = client(event),
                  previousClick = originalClick,
                  previousProposal = false;

                if (angular.isFunction($scope.onHandleDown)) {
                  $scope.onHandleDown();
                }

                // stop user accidentally selecting stuff
                $body.bind($$eventSelectStart, function () {
                  return false;
                });

                // only do stuff if we are disabled
                if (!$scope.disabled) {

                  // flag as down
                  down = true;

                  // add down class
                  $handle.addClass('ngrs-down');

                  $element.addClass('ngrs-focus ' + handleDownClass);

                  // add touch class for MS styling
                  $body.addClass('ngrs-touching');

                  // listen for mousemove / touchmove document events
                  $document.bind($$eventMouseMove, function(e) {
                    // prevent default
                    e.preventDefault();

                    var currentClick = client(e),
                      movement,
                      proposal,
                      other,
                      per = ($scope.step / range) * 100,
                      otherModelPosition = (((index === 0 ? $scope.modelMax : $scope.modelMin) - $scope.min) / range) * 100;

                    if (currentClick[0] === "x") {
                      return;
                    }

                    // calculate deltas
                    currentClick[0] -= originalClick[0];
                    currentClick[1] -= originalClick[1];

                    // has movement occurred on either axis?
                    movement = [
                      (previousClick[0] !== currentClick[0]), (previousClick[1] !== currentClick[1])
                    ];

                    // propose a movement
                    proposal = originalPosition + ((currentClick[orientation] * 100) / (orientation ? $element.height() : $element.width()));

                    // normalize so it can't move out of bounds
                    proposal = clamp(proposal, 0, 100);

                    if ($scope.preventEqualMinMax) {

                      if (per === 0) {
                        per = (1 / range) * 100; // restrict to 1
                      }

                      if (index === 0) {
                        otherModelPosition = otherModelPosition - per;
                      } else if (index === 1) {
                        otherModelPosition = otherModelPosition + per;
                      }
                    }

                    // check which handle is being moved and add / remove margin
                    if (index === 0) {
                      proposal = proposal > otherModelPosition ? otherModelPosition : proposal;
                    } else if (index === 1) {
                      proposal = proposal < otherModelPosition ? otherModelPosition : proposal;
                    }

                    if ($scope.step > 0) {
                      // only change if we are within the extremes, otherwise we get strange rounding
                      if (proposal < 100 && proposal > 0) {
                        proposal = Math.round(proposal / per) * per;
                      }
                    }

                    if (proposal > 95 && index === 0) {
                      $handle.css('z-index', 3);
                    } else {
                      $handle.css('z-index', '');
                    }

                    if (movement[orientation] && proposal != previousProposal) {

                      if (index === 0) {

                        // update model as we slide
                        $scope.modelMin = parseFloat(parseFloat((((proposal * range) / 100) + $scope.min)).toFixed($scope.decimalPlaces));

                      } else if (index === 1) {

                        $scope.modelMax = parseFloat(parseFloat((((proposal * range) / 100) + $scope.min)).toFixed($scope.decimalPlaces));
                      }

                      // update angular
                      $scope.$apply();

                      previousProposal = proposal;

                    }

                    previousClick = currentClick;

                  }).bind($$eventMouseEnd, function() {

                    if (angular.isFunction($scope.onHandleUp)) {
                      $scope.onHandleUp();
                    }

                    // unbind listeners
                    $document.off($$eventMouseMove);
                    $document.off($$eventMouseEnd);

                    $body.removeClass('ngrs-touching');

                    // cancel down flag
                    down = false;

                    // remove down and over class
                    $handle.removeClass('ngrs-down');
                    $handle.removeClass('ngrs-over');

                    // remove active class
                    $element.removeClass('ngrs-focus ' + handleDownClass);

                  });
                }

              }).on($$eventMouseOver, function () {
                $handle.addClass('ngrs-over');
              }).on($$eventMouseOut, function () {
                if (!down) {
                  $handle.removeClass('ngrs-over');
                }
              });
            }

            // listen for changes to values
            //$scope.$watch('min', range.bounds);
            //$scope.$watch('max', range.bounds);

            //$scope.$watch('modelMin', setModelMinMax);
            //$scope.$watch('modelMax', setModelMinMax);

            // bind events to each handle
            //handleMove(0);
            //handleMove(1);

            init();
          };
        }
      };
    }])

    .directive("rangeHandle", [function () {
      return {
        restrict: "EA",
        require: ["^range"],
        scope: {
          kind: "@"
        },
        compile: function () {
          return function ($scope, $element, $attrs, ctrl) {
            var $$class = $$range + "__handle";
            var range = ctrl[0];

            $scope.visible = true;
            $scope.value = NaN;

            $attrs.$observe("rangeHandle", function (kind) {
              $scope.kind = $scope.kind || kind;
            });

            $scope.$watch(function () { $element.addClass($$class); });
            $scope.$watch("kind", function (kind) {
              $element.addClass($$class + '--' + kind);

              if (kind == MIN) {
                range.$$handleMin = $scope;
              } else if (kind === MAX) {
                range.$$handleMax = $scope;
              } else {
                //TODO: warn or error
              }
            });
            $scope.$watch("visible", function (v) {
              $element.toggleClass('ng-hide', !v);
            });
            $scope.$watch("value", function (v) {
              var prop = range.orientation() === VERTICAL ? "top" : "left";
              $element.css(prop, v +'%');
            });

          };
        }
      };
    }])

    .directive("rangeJoin", [function () {
      return {
        restrict: "EA",
        require: ["^range"],
        scope: {
        },
        compile: function () {
          return function ($scope, $element, $attrs, ctrl) {
            var $$class = $$range + "__join";
            var range = ctrl[0];

            $scope.$watch(function () { $element.addClass($$class); });
            $scope.$watch("value", function (v) {
              //var prop = range.orientation() === VERTICAL ? "top" : "left";
              //$element.css(prop, v +'%');
            });

          };
        }
      };
    }])

    .directive("rangeValue", [function () {
      return {
        restrict: "EA",
        require: ["^range"],
        scope: {
          kind: "@"
        },
        compile: function () {
          return function ($scope, $element, $attrs, ctrl) {
            var $$class = $$range + "__value";
            var range = ctrl[0];

            $scope.visible = true;
            $scope.value = NaN;

            $attrs.$observe("rangeValue", function (kind) {
              $scope.kind = $scope.kind || kind;
            });

            $scope.$watch(function () { $element.addClass($$class); });
            $scope.$watch("kind", function (kind) {
              $element.addClass($$class + '--' + kind);

              if (kind == MIN) {
                range.$$valueMin = $scope;
              } else if (kind === MAX) {
                range.$$valueMax = $scope;
              } else {
                //TODO: warn or error
              }
            });
            /*$scope.$watch("visible", function (v) {
              $element.toggleClass('ng-hide', v);
            });
            */
            $scope.$watch("value", function (v) {
              //var prop = range.orientation() === VERTICAL ? "top" : "left";
              //$element.css(prop, v +'%');
            });

          };
        }
      };
    }]);
});
