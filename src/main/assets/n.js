define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Mixin approach attempt to angular directives for easier component/behavior
   *
   * @type {number}
   */

  //util
  var symId = 0;
  function __symbol(k) {
    /*jshint newcap:false */
    return typeof Symbol !== "undefined" ? Symbol(k) : "@@" + k + symId++;
  }

  function __def(o, name, desc) {
    Object.defineProperty(o, name, desc);
  }

  function __keys(o) {
    return Object.keys(o);
  }

  function __assign(dest, src) {
    var keys = __keys(src);
    for (var i = 0, l = keys.length, prop, desc; i < l; i++) {
      prop = keys[i];
      desc = Object.getOwnPropertyDescriptor(src, prop);
      __def(dest, prop, desc);
    }
  }

  /**
   * ng module
   */
  var ng;
  (function (ng) {

    function mixin(opt_properties, opt_staticProperties) {
      var typeTag = __symbol("typeTag");
      var properties = opt_properties || {};
      var staticProperties = opt_staticProperties || {};
      var constructor = properties.constructor;
      delete properties.constructor;

      function Mixin(var_args) {
        var self = this;
        if (constructor) {
          switch (arguments.length) {
            case 0: constructor.call(self); break;
            case 1: constructor.call(self, arguments[1]); break;
            default: constructor.apply(self, arguments);
          }
        }
      }
      /*
      __assign(Mixin.prototype, properties);
      __def(Mixin.prototype, typeTag, {
        value: {}
      });
      */

      Mixin.extend = function (clazz, opt_params) {
        // mix prototype
        var proto = clazz.prototype;
        __assign(proto, properties);
        __def(proto, typeTag, {
          value: opt_params || {}
        });

        //mix static
        __assign(clazz, staticProperties);
        if (staticProperties.onextend) {
          staticProperties.onextend.call(Mixin, clazz);
        }
      };
      Mixin.params = function (o) {
        return o[typeTag];
      };
      Mixin.instanceOf = function (o) {
        return (o instanceof Mixin) || !!o[typeTag];
      };
      Mixin.assert = function (o) {
        if (!Mixin.instanceOf(o)) {
          throw new TypeError(o, "must instanceof", Mixin);
        }
        return o;
      };
      /*__def(Mixin, Symbol.hasInstance, {
          value: (i) => !!i[typeTag]
        });*/
      return Mixin;
    }
    ng.mixin = mixin;

    var TInject = (function () {

      return mixin({
        $inject: function (name, opt_optional) {
          var $injector = this.$$injector;
          if ($injector.has(name) || !opt_optional) {
            return $injector.get(name);
          }
        },

        get $injector() {
          return this.$$injector;
        },
        set $injector(val) {
          var $injector = this.$$injector = val;
          var params = TInject.params(this);
          if (Array.isArray(params)) {
            for (var i = 0, l = params.length; i < l; i++) {
              var serviceName = params[i];
              this[serviceName] = $injector.get(serviceName);
            }
          }
        }
      });
    }());
    ng.TInject = TInject;

    /**
     * TDirective mixin
     */
    var TDirective = (function () {
      var $$preLink = "$$preLink";
      var $$postLink = "$$postLink";

      //Util
      function __add(self, name, f) {
        var callbacks = self[name] || (self[name] = []);
        if (callbacks.indexOf(f) < 0) {
          callbacks.push(f);
        }
      }
      function __trigger(self, name) {
        var callbacks = self[name];
        if (callbacks) {
          for (var i = 0, l = callbacks.length; i < l; i++) {
            callbacks[i].call(self);
          }
        }
      }

      return mixin({
        constructor: function ($element) {
          if ($element) {
            this.$element = $element;
          }
        },

        get $element() {
          return this.$$element;
        },
        set $element(val) {
          var $element = this.$$element = val;
          if (!this.$injector) {
            this.$injector = $element.injector();
          }
          //this.$scope = $element.scope();
        },

        $controller: function (name) {
          var ctrl = this.$element.controller(name);
          if (!ctrl) {
            throw new Error(name + " controller is required");
          }
          return ctrl;
        },

        preLink: function preLink(opt_fn) {
          if (arguments.length) {
            __add(this, $$preLink, opt_fn);
          } else {
            __trigger(this, $$preLink);
          }
        },
        postLink: function postLink(opt_fn) {
          if (arguments.length) {
            __add(this, $$postLink, opt_fn);
          } else {
            __trigger(this, $$postLink);
          }
        }
      });
    }());
    ng.TDirective = TDirective;

    /**
     * TFormControl mixin
     */
    var TFormControl = (function () {
      function __element(self) {
        var $element = self.$element;
        if (!$element) {
          throw new TypeError("$element is required");
        }
        return $element[0];
      }

      return mixin({
        required: function required() {
          return !!__element(this).hasAttribute("required");
        },
        readonly: function readonly() {
          return !!__element(this).hasAttribute("readonly");
        },
        disabled: function disabled() {
          return !!__element(this).hasAttribute("disabled");
        }
      });
    }());
    ng.TFormControl = TFormControl;

    /**
     * TIntl mixin
     */
    var TIntl = (function () {
      var $$translate = "$$translate";

      return mixin({
        constructor: function () {
          this.intl();//load
        },

        intl: function () {
          var $translate = this[$$translate];
          if (!$translate) {
            var params = TIntl.params(this);
            var parts = params;
            if (parts.length) {
              var $injector = this.$injector;
              $translate = this[$$translate] = $injector.get("$translate");
              var $translatePartialLoader = $injector.get("$translatePartialLoader");
              for (var i = 0, l = parts.length; i < l; i++) {
                $translatePartialLoader.addPart(parts[i]);
              }
              $translate.refresh();
            }
          }
          return $translate;
        }
      });
    }());
    ng.TIntl = TIntl;

    /**
     * TNgModel mixin
     */
    var TNgModel = (function () {

      return mixin({
        constructor: function () {
          TDirective.assert(this);
          this.ngModel = this.$controller("ngModel");
        },

        get ngModel() {
          return this.$$ngModel;
        },
        set ngModel(val) {
          var self = this;
          var ngModel = self.$$ngModel = val;
          ngModel.$formatters.push(function (value) {
            //From model
            return self.format(value);
          });
          ngModel.$parsers.push(function (value) {
            //From DOM
            return self.parse(value);
          });
          ngModel.$render = function () {
            return self.render();
          };
        },

        viewValue: function viewValue(opt_val) {
          var ngModel = this.ngModel;
          if (arguments.length) {
            ngModel.$setViewValue(opt_val);
          } else {
            return ngModel.$viewValue;
          }
        },
        format: function format(value) {
          return value;
        },
        parse: function parse(value) {
          return value;
        },
        render: function render() {
        }
      });
    }());
    ng.TNgModel = TNgModel;


    var TNgModelSave = (function () {

      return mixin({
        constructor: function() {
          this.reset();
        },
        get docId() {
          return this.$$doc && this.$$doc.id;
        },
        set docId(val) {},
        get doc() {
          return this.$$doc;
        },
        set doc(val) {},
        get docDefault() {
          return this.viewValue();//saved copy before changes
        },
        set docDefault(val) {},
        reset: function () {
          var docDefault = this.docDefault;
          if (docDefault) {
            this.$$doc = angular.copy(docDefault);
          } else {
            this.$$doc = null;
          }
        },
        commit: function (opt_val) {
          var doc = this.$$doc;
          var docDefault = this.docDefault;
          var val = angular.copy(opt_val || doc);
          angular.copy(val, doc);
          angular.copy(val, docDefault);
          this.viewValue(val);
        }
      });
    }());
    ng.TNgModelSave = TNgModelSave;

    /**
     *
     * @param {function} clazz
     * @param {object} opt_settings
     * @returns {object}
     */
    function directive(clazz, opt_settings) {
      var settings = opt_settings || {};
      var name = settings.name;
      var returnValue = {};
      if (!name) {
        throw new Error("name is required");
      }
      angular.extend(returnValue, settings);
      returnValue.controller = clazz;
      returnValue.controllerAs = name;
      returnValue.link = {
        pre: function ($scope, $element) {
          var ctrl = $element.controller(name);
          ctrl.$element = $element;
          ctrl.preLink();
        },
        post: function ($scope, $element) {
          var ctrl = $element.controller(name);
          ctrl.postLink();
        }
      };
      return returnValue;
    }
    ng.directive = directive;
  }(ng || (ng = {})));

  return ng;
});