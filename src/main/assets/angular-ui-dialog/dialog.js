define(["module", "angular"], function (module, angular) {
  "use strict";

  var __moduleId = module.id;


  /*
  var $dialogAlert = {
    title: "",
    textContent: "",
    htmlContent: "",
    ok: "OK",
    theme: "",
    targetEvent: null
  };
  var $dialogConfirm = {
    title: "",
    textContent: "",
    htmlContent: "",
    ok: "OK",
    cancel: "Cancel",
    theme: "",
    targetEvent: null
  };*/

  function $$dialogDefaultProvider() {
    var _optionsDefault = {
      ok: "OK",
      cancel: "Cancel"
    };

    this.$get = $get;

    $get.$inject = ["$q", "$window"];
    function $get($q, $window) {
      var divElement = document.createElement("div");

      function assertObject(o) {
        if (!angular.isObject(o)) {
          throw new TypeError(o + " must be an object");
        }
        return o;
      }

      function htmlStrip(html) {
        divElement.innerHTML = html;
        return divElement.textContent || divElement.innerText || "";
      }

      function resolveOptions(options) {
        options = options || {};
        assertObject(options);
        var attrs = [
          "title",
          "textContent",
          "htmlContent",
          "ok",
          "cancel"
        ];
        return $q.all(attrs.map(function (attr) {
          return $q.when(options[attr]);
        }))
        .then(function (d) {
          var resolved = {};
          angular.extend(resolved, options);
          angular.forEach(attrs, function (attr, $index) {
            resolved[attr] = d[$index] || _optionsDefault[attr];
          });
          return resolved;
        });
      }

      function whenContent(options) {
        return resolveOptions(options)
          .then(function (resolved) {
            var title = resolved.title;
            var textContent = resolved.textContent;
            var htmlContent = resolved.htmlContent;

            var content = "";
            if (title) {
              content += title + "\n";
            }
            if (htmlContent) {
              content += htmlStrip(htmlContent);
            } else if (textContent) {
              content += textContent;
            }
            return {
              content: content
            };
          });
      }

      function $alert(options) {
        return whenContent(options)
          .then(function (resolved) {
            $window.alert(resolved.content);
            return true;
          });
      }

      function $confirm(options) {
        return whenContent(options)
          .then(function (resolved) {
            var returnValue = $window.confirm(resolved.content);
            return returnValue;
          });
      }

      function $prompt(options) {
        return whenContent(options)
          .then(function (resolved) {
            var text = $window.prompt(resolved.content);
            return text;
          });
      }

      return {
        $options: resolveOptions,
        $alert: $alert,
        $confirm: $confirm,
        $prompt: $prompt
      };
    }
  }

  function $$dialogProvider() {
    var _settings = {
      adapter: "$$dialogDefault"
    };
    this.config = config;
    this.$get = $get;

    function config(opt_config) {
      angular.extend(_settings, opt_config);
    }

    $get.$inject = ["$injector"];
    function $get($injector) {
      return $injector.get(_settings.adapter);
    }
  }
  
  return angular
    .module(module.id, [])

    .provider("$$dialogDefault", $$dialogDefaultProvider)
    .provider("$$dialog", $$dialogProvider)


  /**
   * Alert service
   *
   * Usage:
   *
   * $alert("foo bar")
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
   *   // result: string correspond to the button pressed
   * })
   */
    .provider("$prompt", [function () {

      this.$get = ["$$dialog", function ($$dialog) {
        return $$dialog.$prompt;
      }];

    }])

    /**
     * <tag ng-click-confirm="callback($event)"
     *      [ng-click-confirm-message="My message"]>
     * </tag>
     *
     */
    .directive("ngClickConfirm", ["$parse", "$$dialog", "$q", function ($parse, $$dialog, $q) {
      var $$name = "ngClickConfirm";
      var $$eventName = "click";
      return {
        restrict: 'A',
        compile: function($element, $attrs) {
          var fn = $parse($attrs[$$name], /* interceptorFn */ null, /* expensiveChecks */ true);
          return function ngEventHandler($scope, $element, $attrs) {

            function isDisabled() {
              return $element.attr("disabled");
            }

            function getMessage() {
              return $attrs[$$name + "Message"];
            }

            function apply(f) {
              if ($scope.$root.$$phase) {
                $scope.$evalAsync(f);
              } else {
                $scope.$apply(f);
              }
            }

            $element.bind($$eventName, function ($event) {
              if (!isDisabled()) {
                $$dialog.$confirm({
                  textContent: getMessage(),
                  targetEvent: $event
                })
                .then(function (confirmed) {
                  if (confirmed) {
                    return $q(function (resolve, reject) {
                      apply(function () {
                        try {
                          resolve(fn($scope, { $event: $event }));
                        } catch (e) {
                          reject(e);
                        }
                      });
                    });
                  }
                });
              }
            });
          };
        }
      };
    }]);
});



