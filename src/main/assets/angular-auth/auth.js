define(['module', 'angular'], function (module, angular) {
  'use strict';

  function exports() {
    return angular
      .module(module.id, [ ])
      .provider({
        $auth: $authProvider
      });
  }

  function $authProvider() {

    this.$get = [function () {
      var $auth = {};

      var _userId = null;
      var _userInfo = null;

      function login(identifier, userInfo) {
        _userId = identifier;
        _userInfo = userInfo;
      }
      $auth.login = login;

      function isLogged(userInfo) {
        return !!_userInfo;
      }
      $auth.isLogged = isLogged;

      function user() {
        return _userInfo;
      }
      $auth.user = user;

      function logout() {
        _userId = null;
        _userInfo = null;
      }
      $auth.logout = logout;

      return $auth;
    }];

  }


  return exports();
});
