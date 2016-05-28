(function (global, bootloaderHTML) {
  'use strict';

  /**
   * bootloader module
   */
  var bootloader = (function () {
    var DISABLED = 'disabled';
    var MIN_VALUE = 0;
    var MAX_VALUE = 1;

    var __value__ = 0;
    var __animateSpeed__ = 0;

    function __init__() {
      __draw__();
      __update__();
    }

    function __draw__() {
      var progressBarElement = getProgressBarElement();
      if (progressBarElement) {
        //change style
        var value = getValue();
        var percent = Math.round(value * 100 || 0) + '%';

        //set width
        if (progressBarElement.style.width != percent) {
          progressBarElement.setAttribute('aria-valuenow', value);

          progressBarElement.style.width = percent;

          //Set label
          progressBarElement
            .getElementsByTagName('span')[0]
            .innerHTML = percent;
        }
      }
      __rAF(__draw__);
    }

    var __updateDelay = 100;
    var __updateTimer = null;
    var __updated = __now();
    function __update__() {
      var currentTime = __now();
      var progressBarElement = getProgressBarElement();
      if (progressBarElement) {
        var elapsedTime = currentTime - __updated;
        var animateSpeed = __animateSpeed__;
        var value = (animateSpeed > 0 ?
            incrementValue(animateSpeed * elapsedTime) :
            getValue()
          );

        if (value === 1) {
          //_exports.pause();
        }
      }

      //schedule next
      __scheduleUpdate();
      __updated = currentTime;
    }

    function __scheduleUpdate() {
      if (!__updateTimer) {
        __updateTimer = setTimeout(__update__, __updateDelay);
      }
    }

    function __cancelUpdate() {
      if (__updateTimer) {
        clearTimeout(__updateTimer);
        __updateTimer = null;
      }
    }

    function getElement() {
      return document.getElementById('bootloader') || __byClass(document, 'bootloader');
    }

    function getProgressElement() {
      return __byClass(getElement(), 'bootloader__progress');
    }

    function getProgressBarElement() {
      var progressElement = getProgressElement();
      return progressElement && progressElement.children[0];
    }

    function getValue() {
      return __value__;
    }

    function setValue(val) {
      __value__ = __clamp(val, MIN_VALUE, MAX_VALUE);
      return /*jslint validthis:true*/this;
    }

    function incrementValue(i) {
      var value = (getValue() || MIN_VALUE) + i;
      setValue(value);
      return value;
    }

    function resetValue(opt_val) {
      var disabled = isDisabled();
      setDisabled(true);
      setValue(opt_val || MIN_VALUE);
      setDisabled(disabled);
      return /*jslint validthis:true*/this;
    }

    function isDisabled() {
      return getElement().hasAttribute(DISABLED);
    }

    function setDisabled(opt_val) {
      var val = opt_val === undefined || opt_val;
      var element = getElement();
      if (val) {
        element.setAttribute(DISABLED, '');
      } else {
        element.removeAttribute(DISABLED);
      }

      //cancel timer
      if (opt_val) {
        __scheduleUpdate();
      } else {
        __cancelUpdate();
      }
      return /*jslint validthis:true*/this;
    }

    function __byClass(el, c) {
      return el && el.getElementsByClassName(c)[0];
    }

    function __rAF(callback) {
      (
        global.requestAnimationFrame       ||
        global.webkitRequestAnimationFrame ||
        global.mozRequestAnimationFrame    ||
        global.setTimeout
      )(callback, 1000 / 60);
    }

    function __now() {
      return Date.now();
    }

    function __clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    /*
    function __rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function __body() {
      return (document.body || document.getElementsByTagName("body")[0]);
    }
    */

    __init__();
    //exports
    return {
      getElement: getElement,
      getProgressElement: getProgressElement,
      getValue: getValue,
      setValue: setValue,
      incrementValue: incrementValue,
      resetValue: resetValue,
      isDisabled: isDisabled,
      setDisabled: setDisabled
    };
  }());
  global.bootloader = bootloader;//export


}(this, ""));
