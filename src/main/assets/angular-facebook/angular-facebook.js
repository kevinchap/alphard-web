define(["module", "angular", "facebook"], function (module, angular, facebook) {
  "use strict";

  var config = (module.config && module.config()) || {};

  function debug(var_args) {
    if (config.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      return console.debug.apply(console, args);
    }
  }

  debug("config", config);

  return angular
    .module(module.id, [])

    .provider("ngFacebook", function () {

      this.$get = ["$q", function ($q) {

        // TODO: Refactor facebook code to generalize Facebook API calls wrapping to promises

        function status() {
          return $q(function (resolve, reject) {
            facebook.getLoginStatus(function (response) {
              if (!response || response.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            });
          });
        }

        function login() {
          return $q(function (resolve, reject) {
            facebook.login(function (response) {
              if (!response || response.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            });
          });
        }

        function logout() {
          return $q(function (resolve, reject) {
            facebook.logout(function (response) {
              if (!response || response.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            });
          });
        }

        return {
          status: status,
          login: login,
          logout: logout
        };
      }];
    });
});