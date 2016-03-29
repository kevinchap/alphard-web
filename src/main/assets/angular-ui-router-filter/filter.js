define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [])
    .provider("$stateFilter", StateFilterProvider);

  /**
   * Filter error class
   */
  var FilterError = (function (_super) {
    function FilterError(message, opt_filter) {
      if (this instanceof Error) {
        this.message = message;
        this.filter = opt_filter || null;
      } else {
        return new FilterError(message, opt_filter);
      }
    }
    FilterError.prototype = Object.create(_super.prototype);
    FilterError.prototype.constructor = FilterError;
    FilterError.prototype.name = "FilterError";
    return FilterError;
  }(Error));

  /**
   *
   * @usage
   *
   * $stateFilter(function ($event, toState, toParams, fromState, fromParams) {
   *   return $q(function (resolve, reject) {
   *
   *     // resolve(true) to continue
   *     // resolve(false) to abort
   *     // reject(e) to abort with error
   *
   *   });
   * }, $scope);//$scope is optional
   */
  function StateFilterProvider() {
    var $$stateChangeStart = "$stateChangeStart";
    var $$stateChangeSuccess = "$stateChangeSuccess";
    var $$stateChangeError = "$stateChangeError";

    this.$get = $get;

    $get.$inject = ["$exceptionHandler", "$q", "$rootScope", "$state"];
    function $get($exceptionHandler, $q, $rootScope, $state) {
      var stateFilters = [
        // ($event, toState, toParams, fromState, fromParams) => boolean|Promise<boolean>
      ];

      /**
       *
       * @param {() => boolean|Promise<boolean>} predicate
       * @param {ng.Scope=}
       * @returns {unwatch}
       */
      function $stateFilter(predicate, opt_scope) {
        addFilter(predicate);
        function unwatch() {
          if (predicate) {
            removeFilter(predicate);
            predicate = null;
          }
        }

        if (opt_scope) {
          opt_scope.$on("$destroy", unwatch);
        }
        return unwatch;
      }

      function addFilter(predicate) {
        //if (stateFilters.indexOf(predicate) < 0) {
          stateFilters.push(predicate);
        //}
      }

      function removeFilter(predicate) {
        stateFilters.splice(stateFilters.indexOf(predicate), 1);
      }

      function applyFilters(predicates, args) {
        function applyFilter(predicate, args) {
          try {
            return $q.when(predicate.apply(null, args));
          } catch (e) {
            return $q.reject(e);
          }
        }

        return $q(function (resolve, reject) {
          var filters = predicates.slice();//make copy
          var pending = filters.length;
          var done = false;

          function tryResolve(value) {
            if (!done) {
              done = true;
              resolve(value);
            }
          }

          function tryReject(error) {
            if (!done) {
              done = true;
              reject(error);
            }
          }

          angular.forEach(filters, function (filter) {
            if (!done) {
              applyFilter(filter, args)
                .then(
                  function (result) {
                    if (result === false) {
                      tryReject(new FilterError("Filter rejection", filter));
                    } else {
                      pending--;
                      if (pending === 0) {
                        tryResolve(true);
                      }
                    }
                  }, function (e) {
                    if (e) {
                      $exceptionHandler(e);
                    }
                    tryReject(e);
                  });
            }
          });
        });
      }

      //Watcher
      $rootScope.$on($$stateChangeStart, function($event, toState, toParams, fromState, fromParams) {
        if (stateFilters.length > 0) {
          $event.preventDefault();

          applyFilters(stateFilters, [$event, toState, toParams, fromState, fromParams])
          .then(
            function () {
              $state
                .go(toState.name, toParams, { notify: false })
                .then(function() {
                  // line 907 state.js
                  $rootScope.$broadcast($$stateChangeSuccess, toState, toParams, fromState, fromParams);
                });
            },
            function (error) {
              $rootScope.$broadcast($$stateChangeError, toState, toParams, fromState, fromParams, error);
            });
        }
      });

      return $stateFilter;
    }
  }

  return ngModule;
});