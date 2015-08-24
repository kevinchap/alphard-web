define(["module"], function (module) {
  "use strict";

  /**
   * timer module
   */
  var timer;
  (function (timer) {
    var __global = typeof window !== "undefined" ? window : null;
    var __now = Date.now;
    var __setTimeout = __global.setTimeout;
    var __clearTimeout = __global.clearTimeout;

    var __deltaTimers = {};


    /**
     * DeltaTimer class
     */
    var DeltaTimer = (function (_super) {

      function DeltaTimer(f, milliseconds) {
        _super.call(this);

        var lastTime = __now();
        var timeout = __setTimeout(loop, 0);

        function loop() {
          var thisTime = __now();
          var deltaTime = thisTime - lastTime;
          var delay = milliseconds - deltaTime;
          if (delay < 0) {
            delay = 0;
          }
          timeout = __setTimeout(loop, delay);
          lastTime = thisTime + delay;
          f(thisTime);
        }

        this.timerId = timeout;

        this.cancel = function cancel() {
          clearTimeout(timeout);
          return lastTime;
        };
      }

      return DeltaTimer;
    }(Object));
    

    function setDelta(f, delay) {
      var t = new DeltaTimer(f, delay);
      var id = t.timerId;
      __deltaTimers[id] = t;
      return id;
    }
    timer.setDelta = setDelta;

    function clearDelta(id) {
      if (__deltaTimers[id]) {
        __deltaTimers[id].cancel();
        __deltaTimers[id] = null;
      }
    }
    timer.clearDelta = clearDelta;

    function setTimeout(f, delay, var_args) {
      var delayedFn = f;
      if (arguments.length >= 3) {
        var args = [];
        for (var i = 3, l = arguments.length; i < l; i++) {
          args[i] = arguments[i];
        }
        delayedFn = function () {
          f.apply(null, args);
        };
      }
      return __setTimeout(delayedFn, delay);
    }
    timer.setTimeout = setTimeout;

    function clearTimeout(id) {
      return __clearTimeout(id);
    }
    timer.clearTimeout = clearTimeout;


  }(timer || (timer = {})));
  return timer;
});