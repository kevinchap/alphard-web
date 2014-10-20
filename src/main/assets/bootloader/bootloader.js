(function (global, bootloaderHTML) {
  'use strict';

  var bootloader;
  (function (bootloader) {
    var DISABLED = 'disabled';
    var MIN_VALUE = 0;
    var MAX_VALUE = 1;

    bootloader.__value__ = 0;
    bootloader.__animateSpeed__ = 0;

    function __init__() {
      __draw__();
      __update__();
    }

    function __draw__() {
      var progressBarElement = bootloader.getProgressBarElement();
      if (progressBarElement) {
        //change style
        var value = bootloader.getValue();
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
    var __updated = __now();
    function __update__() {
      var currentTime = __now();
      var progressBarElement = bootloader.getProgressBarElement();
      if (progressBarElement) {
        var elapsedTime = currentTime - __updated;
        var animateSpeed = bootloader.__animateSpeed__;
        var value = (animateSpeed > 0 ?
            bootloader.incrementValue(animateSpeed * elapsedTime) :
            bootloader.getValue()
          );

        if (value === 1) {
          //_exports.pause();
        }
      }

      //schedule next
      setTimeout(__update__, __updateDelay);
      __updated = currentTime;
    }

    function getElement() {
      return document.getElementById('bootloader') || __byClass(document, 'bootloader');
    }
    bootloader.getElement = getElement;

    function getProgressElement() {
      return __byClass(getElement(), 'bootloader__progress');
    }
    bootloader.getProgressElement = getProgressElement;

    function getProgressBarElement() {
      var progressElement = getProgressElement();
      return progressElement && progressElement.children[0];
    }
    bootloader.getProgressBarElement = getProgressBarElement;

    function getValue() {
      return bootloader.__value__;
    }
    bootloader.getValue = getValue;

    function setValue(val) {
      bootloader.__value__ = __clamp(val, MIN_VALUE, MAX_VALUE);
      return bootloader;
    }
    bootloader.setValue = setValue;

    function incrementValue(i) {
      var value = (bootloader.getValue() || MIN_VALUE) + i;
      bootloader.setValue(value);
      return value;
    }
    bootloader.incrementValue = incrementValue;

    function resetValue(opt_val) {
      var disabled = bootloader.isDisabled();
      bootloader
        .setDisabled(true)
        .setValue(opt_val || MIN_VALUE)
        .setDisabled(disabled);
      return bootloader;
    }
    bootloader.resetValue = resetValue;

    function isDisabled() {
      return getElement().hasAttribute(DISABLED);
    }
    bootloader.isDisabled = isDisabled;

    function setDisabled(opt_val) {
      var val = opt_val === undefined || opt_val;
      var element = getElement();
      if (val) {
        element.setAttribute(DISABLED, '');
      } else {
        element.removeAttribute(DISABLED);
      }
      return bootloader;
    }
    bootloader.setDisabled = setDisabled;

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

    function __rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function __body() {
      return (document.body || document.getElementsByTagName("body")[0]);
    }

    __init__();
  }(bootloader || (bootloader = {})));
  global.bootloader = bootloader;//export


  return bootloader;
}(this, ""));
