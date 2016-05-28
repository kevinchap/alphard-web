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
    var __setInterval = __global.setInterval;
    var __clearInterval = __global.clearInterval;
    var __setImmediate = __global.setImmediate ||
      __global.msSetImmediate ||
      __global.mozSetImmediate ||
      __global.webkitSetImmediate ||
      function (f, var_args) {
        var $s = 2, $l = arguments.length, $rest = new Array($l - $s);
        for (var $i = $s; $i < $l; ++$i) $rest[$i - $s] = arguments[$i];

        return __setTimeout($rest.length === 0 ? f : function () {
          f.apply(thisp, $rest);
        }, 0);
      };
    var __clearImmediate = __global.clearImmediate ||
      __global.msClearImmediate ||
      __global.mozClearImmediate ||
      __global.webkitClearImmediate ||
      function (id) {
        __clearTimeout(id);
      };
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


    /**
     *
     * @param {function()} f
     * @param {number} delay
     * @returns {number}
     */
    function setDelta(f, delay) {
      var t = new DeltaTimer(f, delay);
      var id = t.timerId;
      __deltaTimers[id] = t;
      return id;
    }

    timer.setDelta = setDelta;

    /**
     *
     * @param {number} id
     */
    function clearDelta(id) {
      if (__deltaTimers[id]) {
        __deltaTimers[id].cancel();
        __deltaTimers[id] = null;
      }
    }

    timer.clearDelta = clearDelta;

    /**
     *
     * @param {function()} f
     * @param {number} delay
     * @param {...any} var_args
     * @returns {number}
     */
    function setTimeout(f, delay, var_args) {
      var $s = 3, $l = arguments.length, $rest = new Array($l - $s);
      for (var $i = $s; $i < $l; ++$i) $rest[$i - $s] = arguments[$i];

      return __setTimeout($rest.length === 0 ? f : function () {
        f.apply(null, $rest);
      }, delay);
    }

    timer.setTimeout = setTimeout;

    /**
     *
     * @param {number} id
     * @returns {void}
     */
    function clearTimeout(id) {
      __clearTimeout(id);
    }

    timer.clearTimeout = clearTimeout;

    /**
     *
     * @param {function()} f
     * @param {number} delay
     * @param {...any} var_args
     * @returns {number}
     */
    function setInterval(f, delay, var_args) {
      var $s = 3, $l = arguments.length, $rest = new Array($l - $s);
      for (var $i = $s; $i < $l; ++$i) $rest[$i - $s] = arguments[$i];

      return __setInterval($rest.length === 0 ? f : function () {
        f.apply(null, $rest);
      }, delay);
    }

    timer.setInterval = setInterval;

    /**
     *
     * @param {number} id
     * @returns {void}
     */
    function clearInterval(id) {
      __clearInterval(id);
    }

    timer.clearInterval = clearInterval;

    /**
     *
     * @param {function()} f
     * @returns {number}
     */
    function setImmediate(f) {
      var $s = 2, $l = arguments.length, $rest = new Array($l - $s);
      for (var $i = $s; $i < $l; ++$i) $rest[$i - $s] = arguments[$i];

      return __setImmediate($rest.length === 0 ? f : function () {
        f.apply(null, $rest);
      });
    }

    timer.setImmediate = setImmediate;

    /**
     * Cancel Immediate
     *
     * @param {number} id
     * @returns {void}
     */
    function clearImmediate(id) {
      __clearImmediate(id);
    }

    timer.clearImmediate = clearImmediate;

  }(timer || (timer = {})));
  return timer;
});