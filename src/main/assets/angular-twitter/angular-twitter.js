define(["module", "angular"], function (module, angular) {
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

    .provider("ngTwitter", function () {

      this.$get = ["$q", "$http", function ($q, $http) {

        // TODO: Refactor facebook code to generalize Facebook API calls wrapping to promises

        function status() {
          return $q(function (resolve) {
            resolve({ status: 'unknown' });
          });
        }

        function login() {
          return $http({
            method: 'POST',
            url: 'https://api.twitter.com/oauth/request_token?oauth_callback=http%3A%2F%2Flocal.sportagraph.com%3A9080%2Ftwitter%2Fcallback'
          })
          .then(
            function (result) {
              console.log('RESULT', result);
              // TODO
            },
            function (error) {
              console.log('ERROR', error);
              // TODO
            });
        }

        function logout() {
          return $q(function (resolve) {
            resolve({status: 'unknown'});
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