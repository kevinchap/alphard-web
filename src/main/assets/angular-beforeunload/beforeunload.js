define(["module", "angular"], function (module, angular) {
  "use strict";
  
  //Util
  var EVENT_BEFOREUNLOAD = 'beforeunload';
  var __keys = Object.keys || function (o) {
    var keys = [];
    for (var key in o) {
      if (o.hasOwnProperty(key)) {
        keys.push(o);
      }
    }
    return keys;
  };

  /**
   * TaskManager class
   */
  var TaskManager = (function (_super) {

    function TaskManager() {
      _super.call(this);

      this.taskId = 1;
      this.tasks/* { [k: number]: { message: string} } */ = {};
    }

    TaskManager.prototype.taskId = NaN;
    TaskManager.prototype.tasks = null;
    TaskManager.prototype.$translate = function (s) {
      /*return undefined;*/
    };

    TaskManager.prototype.getCurrentTask = function getCurrentTask() {
      var tasks = this.tasks;
      var ids = __keys(tasks);
      for (var i = 0, l = ids.length; i < l; i++) {
        var id = ids[i];
        var task = tasks[id];
        if (task.check()) {
          return task;
        }
      }
      return null;
    };

    TaskManager.prototype.createTask = function createTask(o) {
      var id = this.taskId++;
      this.tasks[id] = o;
      return id;
    };

    TaskManager.prototype.removeTask = function removeTask(id) {
      delete this.tasks[id];
    };

    TaskManager.prototype.onBeforeUnload = function onBeforeUnload(event) {
      var currentTask = this.getCurrentTask();
      var messageLock;
      if (currentTask) {
        var taskTranslate = currentTask.translate;
        if (typeof taskTranslate === "function") {
          taskTranslate = taskTranslate();
        }
        messageLock = this.$translate(taskTranslate) ||
          currentTask.translateDefault ||
          taskTranslate;
        event.returnValue = messageLock; // Gecko and Trident
      }
      return messageLock;
    };

    return TaskManager;
  }(Object));

  /**
   *
   * @param $injector
   * @param $window
   * @returns {$beforeUnload}
   */
  function $beforeUnloadFactory($injector, $window) {
    var taskManager = new TaskManager();
    var $translate = $injectorGet("$translate");
    if ($translate) {
      taskManager.$translate = $translate.instant;
    }

    //init
    angular
      .element($window)
      .on(EVENT_BEFOREUNLOAD, function (event) {
        taskManager.onBeforeUnload(event);
      });

    function $injectorGet(name) {
      return $injector.has(name) ? $injector.get(name) : null;
    }

    function $beforeUnload(message, opt_default, opt_check) {
      var taskId = taskManager.createTask({
        translate: message,
        translateDefault: opt_default,
        check: opt_check || function () { return true; }
      });
      return function () {
        taskManager.removeTask(taskId);
      };
    }
    return $beforeUnload;
  }

  return angular
    .module(module.id, [])

  /**
   * $confirmUpload module
   *
   * Usage:
   *
   *   //task 1
   *   var handler1 = $beforeUnload('Task #1 is running');
   *   var task1Promise = new Promise(function () { ... });
   *   task1Promise.then(handler1, handler1);//unlock after task1Promise is resolved
   *
   *   //task 2
   *   var handler2 = $beforeUnload('Task #2 is running');
   *   setTimeout(handler2, 2000);//unlock after 2 seconds
   *
   */
    .provider("$beforeUnload", [function () {
      this.$get = ["$injector", "$window", $beforeUnloadFactory];
    }]);
});