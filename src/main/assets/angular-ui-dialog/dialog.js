define(["module", "angular"], function (module, angular) {
  "use strict";

  var __moduleId = module.id;
  var __dirname = __moduleId.lastIndexOf("/") >= 0 ? __moduleId.slice(0, __moduleId.lastIndexOf("/")) : __moduleId;

  var DialogType;
  (function (DialogType) {
    DialogType[DialogType.Alert = 0] = "Alert";
    DialogType[DialogType.Confirm = 1] = "Confirm";
    DialogType[DialogType.Prompt = 2] = "Prompt";
  }(DialogType || (DialogType = {})));

  /**
   * DialogController class
   */
  var DialogController = (function (_super) {

    function DialogController($exceptionHandler, $modalInstance, $q, callback) {
      var self = this;
      _super.call(this);

      self.isLocked = false;

      function __close(result) {
        self.isLocked = false;
        $modalInstance.close(result);
      }

      this.close = function (result) {
        function onsuccess() {
          __close(result);
        }

        function onfailure(e) {
          if ($exceptionHandler) {
            $exceptionHandler(e);//handle error
          } else {
            throw e;
          }
          __close(result);
        }

        //Lock dialog
        if (!self.isLocked) {
          self.isLocked = true;

          if (callback) {
            try {
              $q.when(callback(result))
                .then(onsuccess, onfailure);
            } catch (e) {
              onfailure(e);
            }
          } else {
            onsuccess();
          }
        }
      };
    }

    return DialogController;
  }(Object));

  /**
   * DialogAlertController class
   */
  var DialogAlertController = (function (_super) {

    function DialogAlertController($exceptionHandler, $modalInstance, $q, message, callback) {
      _super.call(this, $exceptionHandler, $modalInstance, $q, callback);

      this.message = message;

      this.ok = function ok() {
        this.close(true);
      };
    }
    DialogAlertController.$inject = ["$exceptionHandler", "$modalInstance", "$q", "message", "callback"];

    return DialogAlertController;
  }(DialogController));

  /**
   * DialogConfirmController class
   */
  var DialogConfirmController = (function (_super) {

    function DialogConfirmController($exceptionHandler, $modalInstance, $q, message, callback) {
      _super.call(this, $exceptionHandler, $modalInstance, $q, callback);

      this.message = message;

      this.ok = function ok() {
        this.close(true);
      };

      this.cancel = function cancel() {
        this.close(false);
      };
    }
    DialogConfirmController.$inject = ["$exceptionHandler", "$modalInstance", "$q", "message", "callback"];

    return DialogConfirmController;
  }(DialogController));

  /**
   * DialogPromptController class
   */
  var DialogPromptController = (function (_super) {

    function DialogPromptController($exceptionHandler, $modalInstance, $q, message, defaultValue, callback) {
      _super.call(this, $exceptionHandler, $modalInstance, $q, callback);

      this.message = message;
      this.input = defaultValue || "";

      this.ok = function ok() {
        this.close(this.input);
      };

      this.cancel = function cancel() {
        this.close(undefined);
      };
    }
    DialogPromptController.$inject = [ "$exceptionHandler", "$modalInstance", "$q", "message", "defaultValue", "callback" ];

    return DialogPromptController;
  }(DialogController));
  
  return angular
    .module(module.id, [])

    .controller("DialogAlertController", DialogAlertController)

    .controller("DialogConfirmController", DialogConfirmController)

    .controller("DialogPromptController", DialogPromptController)

  /**
   * Dialog service (internal)
   *
   */
    .provider("$$dialog", [function () {
      var settings = {
        animation: true,
        backdrop: 'static',
        keyboard: true,
        size: 'md'
      };

      this.config = function (opt_config) {
        angular.extend(settings, opt_config);
      };

      this.$get = ["$injector", "$log", "$q", "$timeout", "$window", function ($injector, $log, $q, $timeout, $window) {
        var $$dialog = {};

        //translate is optional
        var $translate = $injectorOptional("$translate") || function (k) {
          return k;
        };

        //Modal is optional dependency
        var $modal = $injectorOptional("$modal");

        if (!$modal) {
          $log.info("$modal not found");
        }

        function $injectorOptional(name) {
          return $injector.has(name) ? $injector.get(name) : null;
        }

        function openNative(type, args, opt_callback) {
          var openFn;
          switch (type) {
            case DialogType.Alert:
              openFn = $window.alert;
              break;
            case DialogType.Confirm:
              openFn = $window.confirm;
              break;
            case DialogType.Prompt:
              openFn = $window.prompt;
              break;
            default:
              throw new Error();
          }

          return $q(function (resolve) {
            $timeout(function () {
              var result = openFn.apply(null, args);

              function onsuccess() {
                resolve(result);
              }

              function onfailure(e) {
                //$exceptionHandler(e);
                resolve(result);
              }

              if (opt_callback) {
                try {
                  $q.when(opt_callback(result))
                    .then(onsuccess, onfailure);
                } catch (e) {
                  onfailure(e);
                }
              } else {
                onsuccess();
              }
            });
          });
        }

        function openModal(type, args, opt_callback) {
          var typeName = DialogType[type];

          return $modal
            .open({
              templateUrl: __dirname + '/' + typeName.toLowerCase() + '.html',
              controllerAs: "$" + typeName.toLowerCase(),
              controller: "Dialog" + typeName + "Controller",
              animation: settings.animation,
              backdrop: settings.backdrop,
              keyboard: settings.keyboard,
              size: settings.size,
              resolve: {
                message: function () {
                  return args[0];
                },
                defaultValue: function () {
                  return args[1];
                },
                callback: function () {
                  return opt_callback;
                }
              }
            })
            .result;
        }

        /**
         * Open an alert dialog
         *
         * @param {string} message
         * @param {function (): void} opt_callback
         * @returns {*}
         */
        function $alert(message, opt_callback) {
          var type = DialogType.Alert;
          var args = [ message ];
          return ($modal ?
              openModal(type, args, opt_callback) :
              openNative(type, args, opt_callback)
          );
        }
        $$dialog.$alert = $alert;

        /**
         * Open a confirm dialog
         *
         * @param {string} message
         * @param {function(boolean): void} opt_callback
         * @returns {*}
         */
        function $confirm(message, opt_callback) {
          var type = DialogType.Confirm;
          var args = [ message ];
          return ($modal ?
              openModal(type, args, opt_callback) :
              openNative(type, args, opt_callback)
          );
        }
        $$dialog.$confirm = $confirm;

        /**
         * Open a prompt dialog
         *
         * @param {string} text
         * @param {string=} opt_defaultText
         * @param {function(string): void} opt_callback
         */
        function $prompt(text, opt_defaultText, opt_callback) {
          var type = DialogType.Prompt;
          var args = [ text, opt_defaultText ];
          return ($modal ?
              openModal(type, args, opt_callback) :
              openNative(type, args, opt_callback)
          );
        }
        $$dialog.$prompt = $prompt;

        return $$dialog;
      }];

    }])

  /**
   * Alert service
   *
   * Usage:
   *
   * $alert("foo bar", function (result) {
   *   //Processing (dialog is not closed)
   *   return $q.when(true);
   * })
   * .then(function () {
   *   //Called when dialog is closed
   * })
   */
    .provider("$alert", [function () {

      this.$get = ["$$dialog", function ($$dialog) {
        return $$dialog.$alert;
      }];

    }])

  /**
   * Confirm service
   *
   * Usage:
   *
   * $confirm("foo bar", function (result) {
   *   //Processing (dialog is not closed)
   *   return $q.when(true);
   * })
   * .then(function (result) {
   *   // result: true|false correspond to the button pressed
   * })
   */
    .provider("$confirm", [function () {

      this.$get = ["$$dialog", function ($$dialog) {
        return $$dialog.$confirm;
      }];

    }])

  /**
   * Prompt service
   *
   * Usage:
   *
   * $prompt("Please enter your name", "Harry Potter", function (result) {
   *   return $q.when(true);
   * })
   * .then(function (result) {
   *   // result: true|false correspond to the button pressed
   * })
   */
    .provider("$prompt", [function () {

      this.$get = ["$$dialog", function ($$dialog) {
        return $$dialog.$prompt;
      }];

    }]);
});



