define(["module", "angular", "angular-translate", "angular-material"], function (module, angular, ngTranslate, ngMaterial) {
  "use strict";


  /**
   * Material Design element with ngTranslate
   *
   */
  var ngModule = angular
    .module(module.id, [ngMaterial.name, ngTranslate && ngTranslate.name || ngTranslate])
    .config(config)
    .provider("$mdTranslateLanguage", MdTranslateLanguageProvider)
    .provider("$mdTranslateSelectDialog", MdTranslateSelectDialogProvider)
    .directive("mdTranslateSelect", MdTranslateSelect);


  //Patch on the fly $translate
  config.$inject = ["$provide", "$injector"];
  function config($provide, $injector) {

    //https://github.com/angular-translate/angular-translate/issues/566
    var LOCALES = [
      //"de_DE",
      //"en_GB",
      "en_US"//,
      //"es_ES",
      //"fr_FR"//,
      //"fr_CA",
      //"it_IT",
      //"pt_BR"
    ];
    $injector.invoke(["$translateProvider", function ($translateProvider) {
      var registerAvailableLanguageKeys = $translateProvider.registerAvailableLanguageKeys;
      $translateProvider.registerAvailableLanguageKeys = function (languages) {
        registerAvailableLanguageKeys.apply(this, arguments);
        LOCALES = languages.slice();
      };
    }]);

    $provide.decorator("$translate", ["$delegate", function ($translate) {
      if (!$translate.getAvailableLanguageKeys) {
        $translate.getAvailableLanguageKeys = function () {
          return LOCALES;
        };
      } else {
        console.warn('$translate.getAvailableLanguageKeys is present, patch not needed');
      }
      return $translate;
    }]);
  }

  /**
   * Directive
   *
   * @usage
   *
   * <md-translate-select>
   * </md-translate-select>
   */
  MdTranslateSelect.$inject = ["$translate"];
  function MdTranslateSelect($translate) {
    var TEMPLATE_BUTTON = '<div class="md-translate-select"><md-button ng-click="mdTranslateSelect.onButtonClick($event);">{{mdTranslateSelect.displayName(mdTranslateSelect.current())}}</md-button></div>';
    var TEMPLATE_SELECT = '<md-select ' +
      'ng-model="mdTranslateSelect.current" ' +
      'ng-model-options="{getterSetter: true}">' +
      '<md-option ng-repeat="langKey in mdTranslateSelect.getOptions()" ng-value="langKey">' +
      '  {{mdTranslateSelect.displayName(langKey)}}' +
      '</md-option>' +
    '</md-select>';


    function availableLanguages() {
      return $translate.getAvailableLanguageKeys();
    }

    return {
      restrict: "EA",
      replace: true,
      template: function ($element, $attrs) {
        var MODAL_LIMIT = 5;//TODO make configurable
        var limit = parseInt($attrs.limit) || MODAL_LIMIT;
        return availableLanguages().length > limit ? TEMPLATE_BUTTON : TEMPLATE_SELECT;
      },
      controllerAs: "mdTranslateSelect",
      controller: MdTranslateSelectCtrl
    };
  }

  /**
   * Controller
   *
   */
  MdTranslateSelectCtrl.$inject = ["$scope", "$element", "$attrs", "$injector"];
  function MdTranslateSelectCtrl($scope, $element, $attrs, $injector) {
    var self = this;
    var $inject = $injector.get;
    var $mdDialog = $inject("$mdDialog");
    var $mdTheming = $inject("$mdTheming");
    var $translate = $inject("$translate");
    var $mdTranslateLanguage = $inject("$mdTranslateLanguage");
    var $mdTranslateSelectDialog = $inject("$mdTranslateSelectDialog");

    this.getOptions = getOptions;
    this.current = current;
    this.displayName = displayName;
    this.onButtonClick = onButtonClick;

    //Init theme
    $mdTheming($element);

    function getOptions() {
      return $translate.getAvailableLanguageKeys();
    }

    function current(opt_key) {
      if (arguments.length) {
        $translate.use(opt_key);
      } else {
        return $translate.proposedLanguage() || $translate.use();
      }
    }

    function displayName(key) {
      return $mdTranslateLanguage(key);
    }

    function onButtonClick($event) {
      $mdDialog.show($mdTranslateSelectDialog({
        targetEvent: $event
      }));
    }

    $scope.$watch(getOptions, function (val) {
      $attrs.$set("disabled", !val || val.length <= 1);
    });
  }

  function MdTranslateLanguageProvider() {
    var LOCALE_LABEL = {
      "fr_FR": "Français",
      "en_GB": "English (UK)",
      "en_US": "English (USA)",
      "es_ES": "Español",
      "it_IT": "Italiano",
      "de_DE": "Deutsch",
      "pt_PT": "Português",
      "pt_BR": "Português (Brasil)"
    };

    this.$get = function () {
      function $translateLanguage(key) {
        return LOCALE_LABEL[key];
      }
      return $translateLanguage;
    };
  }

  function MdTranslateSelectDialogProvider() {
    this.$get = function () {
      function $mdTranslateSelectDialog(opt_settings) {
        var settings = {
          templateUrl: module.id + "_modal.html",
          controller: MdTranslateSelectDialogCtrl,
          controllerAs: "mdTranslateSelectDialog",
          clickOutsideToClose: true
        };
        if (opt_settings) {
          angular.extend(settings, opt_settings);
        }
        return settings;
      }

      return $mdTranslateSelectDialog;
    };
  }

  MdTranslateSelectDialogCtrl.$inject = ["$scope", "$injector"];
  function MdTranslateSelectDialogCtrl($scope, $injector) {
    var SEARCH_THRESHOLD = 1;//TODO make configurable
    var self = this;
    var $inject = $injector.get;
    var $translate = $inject("$translate");
    var $mdTranslateLanguage = $inject("$mdTranslateLanguage");
    var $mdDialog = $inject("$mdDialog");
    this.search = {
      query: '',
      enabled: getOptions().length > SEARCH_THRESHOLD
    };
    this.searchResult = [];

    this.selected = $translate.use();//init with current
    this.displayName = displayName;
    this.getOptions = getOptions;
    this.select = select;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;

    function displayName(key) {
      return $translateLanguage(key);
    }

    function searchKey(key) {
      return $mdTranslateLanguage(key).toUpperCase();
    }

    function select(localeCode) {
      self.selected = localeCode;
    }

    function getOptions() {
      return $translate.getAvailableLanguageKeys();
    }

    function onConfirm() {
      $translate.use(self.selected);
      $mdDialog.hide();
    }

    function onCancel() {
      $mdDialog.cancel();
    }

    $scope.$watchGroup([
      function () {
        return self.selected;
      },
      function () {
        return self.search.query;
      }
    ], localesUpdate);


    function localesUpdate() {
      var query = self.search.query.toUpperCase();
      var localeNew = self.selected;
      self.searchResult = getOptions()
      //exclude current locale
        .filter(function (localeCode) {
          return localeCode !== localeNew;
        })

        //filter search
        .filter(function (locale) {
          return (
            (query.length === 0) ||
            (searchKey(locale).indexOf(query) >= 0)
          );
        })

        //sort result
        .sort(function (l, r) {
          return (
            searchKey(l) > searchKey(r) ? 1 :
              searchKey(l) < searchKey(r) ? -1 :
                0
          );
        });
    }
  }

  return ngModule;
});