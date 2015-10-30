define(["module", "angular"], function (module, angular) {
  "use strict";

  //@see https://github.com/leon/angular-upload
  /**
   * upload module
   */
  var upload;
  (function (upload) {
    var __toArray = function (o) {
      var i, l;
      var returnValue = o;
      if (o !== null && o !== undefined) {
        if (o.slice) {
          returnValue = o.slice();
        } else if (o.item) {
          returnValue = [];
          for (i = 0, l = o.length; i < l; i++) {
            returnValue.push(o.item(i));
          }
        } else {
          returnValue = [];
          for (i = 0, l = o.length; i < l; i++) {
            returnValue.push(o[i]);
          }
        }
      }
      return returnValue;
    };

    /**
     * FileCommon class
     */
    var FileCommon = (function (_super) {

      function FileCommon($element) {
        _super.call(this);
        //var self = this;
        var _events = {};

        this.bind = function (eventName, f) {
          $element.bind(eventName, f);
          var fns = _events[eventName] || (_events[eventName] = []);
          fns.push(f);
          return this;
        };

        this.isMultiple = function () {
          var multiple = $element.attr("multiple");
          return multiple !== undefined && multiple !== "false";
        };

        $element.bind("$destroy", function () {
          for (var eventName in _events) {
            var fns = _events[eventName];
            for (var i = 0, l = fns.length; i < l; i++) {
              $element.unbind(eventName, fns[i]);
            }
          }
        });
      }

      return FileCommon;
    }(Object));

    /**
     * FileSelect class
     */
    var FileSelect = (function (_super) {

      function FileSelect($element) {
        _super.call(this, $element);
        var self = this;

        this.onFileSelect = null;

        this.onChange = function ($event) {
          var $files = __toArray($event.target.files);
          if (self.onFileSelect) {
            self.onFileSelect({
              $files: $files,
              $event: $event
            });
          }
        };

        this.bind("change", this.onChange);
      }
      FileSelect.$inject = ["$element"];
      return FileSelect;
    }(FileCommon));
    upload.FileSelect = FileSelect;

    /**
     * FileDrop class
     */
    var FileDrop = (function (_super) {
      var DROP = "drop";
      var DRAGOVER = "dragover";
      var DRAGLEAVE = "dragleave";
      var __eventPreventAndStop = function (event) {
        event.preventDefault();
        event.stopPropagation();
      };
      var __eventDataTransfer = function (event) {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
      };
      var __contains = function (a, element) {
        var returnValue = false;
        if (a) {
          if (a.indexOf) {
            returnValue = a.indexOf(element) !== -1;
          } else if (a.contains) {
            returnValue = a.contains(element);
          }
        }
        return returnValue;
      };



      function FileDrop($element) {
        _super.call(this, $element);
        var self = this;


        this.activeClass = null;// active class when drag over

        this.onFileDrop = null;

        this.onDrop = function ($event) {
          var transfer = __eventDataTransfer($event);

          if (transfer) {
            __eventPreventAndStop($event);
            this.$setActive(false);
            var $files = __toArray(transfer.files);
            if (self.onFileDrop) {
              self.onFileDrop({
                $event: $event,
                $files: $files
              });
            }
          }
        };

        this.onDragOver = function ($event) {
          var transfer = __eventDataTransfer($event);
          if (transfer) {
            if (__contains(transfer.types, "Files")) {
              transfer.dropEffect = 'copy';
              this.$setActive(true);
              __eventPreventAndStop($event);
            }
          }
        };

        this.onDragLeave = function ($event) {
          if ($event.currentTarget === $element[0]) {
            this.$setActive(false);
            __eventPreventAndStop($event);
          }
        };

        this.$setActive = function (v) {
          if (this.activeClass) {
            $element.toggleClass(this.activeClass, v);
          }
        };

        this
          .bind(DROP, function ($event) { self.onDrop($event); })
          .bind(DRAGOVER, function ($event) { self.onDragOver($event); })
          .bind(DRAGLEAVE, function ($event) { self.onDragLeave($event); });
      }
      FileDrop.$inject = ["$element"];

      return FileDrop;
    }(FileCommon));
    upload.FileDrop = FileDrop;

  }(upload || (upload = {})));


  return angular
    .module(module.id, [])

    .provider("$upload", [function () {
      var settings = {
        debug: false,
        adapter: "auto"//'formData|iframe'
      };

      this.config = function config(data) {
        if (arguments.length) {
          angular.extend(settings, data);
          return this;
        } else {
          return angular.copy(settings);
        }
      };

      this.$get = ["$uploadFactory", function ($uploadFactory) {
        return $uploadFactory(settings.adapter);
      }];

    }])

    .provider("$uploadFactory", [function () {

      this.$get = ['$log', '$uploadFormData', '$uploadIFrame', '$window',
        function ($log, $uploadFormData, $uploadIFrame, $window) {


          function upload(adapter) {
            adapter = adapter || "auto";
            var support = upload.support;
            switch (adapter) {
              case "formData":
                if (!support.formData) {
                  $log.warn("FormData is not supported");
                  return $uploadIFrame;
                }
                return $uploadFormData;
              case "iframe":
                return $uploadIFrame;
              case "auto":
                return support.formData ? $uploadFormData : $uploadIFrame;
              default: //auto
                throw new Error(adapter + " is not a valid adapter");
            }
          }

          upload.support = {
            // Detect file input support, based on
            // http://viljamis.com/blog/2012/file-upload-support-on-mobile/
            // Handle devices which give false positives for the feature detection:
            fileInput: !(
              new RegExp(
                '(Android (1\\.[0156]|2\\.[01]))' +
                '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
                '|(w(eb)?OSBrowser)|(webOS)' +
                '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
              ).test($window.navigator.userAgent) || angular.element('<input type="file">').prop('disabled')
            ),

            // The FileReader API is not actually used, but works as feature detection,
            // as e.g. Safari supports XHR file uploads via the FormData API,
            // but not non-multipart XHR file uploads:
            fileUpload: !!($window.XMLHttpRequestUpload && $window.FileReader),
            formData: !!$window.FormData
          };

          return upload;
        }];
    }])

    .provider("$uploadFormData", [function () {

      this.$get = ["$http", "$q", "$timeout", "$window", function ($http, $q, $timeout, $window) {

        if ($window.XMLHttpRequest) {
          $window.XMLHttpRequest.prototype.setRequestHeader = (function (orig) {
            return function (header, value) {
              if (header === '__setXHR__') {
                value.call(this, this);
              } else {
                orig.call(this, header, value);
              }
            };
          }($window.XMLHttpRequest.prototype.setRequestHeader));
        }

        var ArrayBuffer = $window.ArrayBuffer;
        var forEach = angular.forEach;
        var isElement = angular.isElement;

        function send(config) {
          var deferred = $q.defer();
          var promise = deferred.promise;
          var httpConfig = angular.extend({
            method: 'POST',
            headers: {},
            transformRequest: transformRequestDefault
          }, config);
          httpConfig.headers.__setXHR__ = function () {
            return function (xhr) {
              if (!xhr) return;
              httpConfig.__xhr__ = xhr;
              if (httpConfig.xhrFn) {
                httpConfig.xhrFn(xhr);
              }
              xhr.upload.addEventListener('progress', function (e) {
                e.config = httpConfig;
                deferred.notify(e);
              }, false);

              //fix for firefox not firing upload progress end, also IE8-9
              xhr.upload.addEventListener('load', function (e) {
                if (e.lengthComputable) {
                  e.config = httpConfig;
                  deferred.notify(e);
                }
              }, false);
            };
          };
          $http(httpConfig)
            .then(deferred.resolve, deferred.reject);

          promise.abort = function () {
            if (httpConfig.__xhr__) {
              $timeout(function () {
                httpConfig.__xhr__.abort();
              });
            }
            return this;
          };

          promise.progress = function (f) {
            this.then(null, null, f);
            return this;
          };

          promise.success = function (f) {
            this.then(function (response) {
              f(response.data, response.status, response.headers, config);
            });
            return this;
          };

          promise.error = function (f) {
            this.then(null, function (response) {
              f(response.data, response.status, response.headers, config);
            });
            return this;
          };

          return promise;
        }

        function transformRequestDefault(data, headersGetter) {
          return (
            ArrayBuffer && data instanceof ArrayBuffer ?
              data :
              $http.defaults.transformRequest[0](data, headersGetter)
          );
        }

        function transformRequest(data) {
          var formData = new FormData();

          function append(key, value) {
            if (angular.isArray(value) && value.length > 1) {
              forEach(value, function (val, index) {
                formData.append(key + '[' + index + ']', val);
              });
            } else {
              formData.append(key, value[0]);
            }
          }

          forEach(data, function (value, key) {
            var val = value;
            if (isElement(value)) {
              val = [];
              forEach(value, function (el) {
                forEach(el.files, function (file) {
                  val.push(file);
                });
              });
            }
            append(key, val);
          });
          return formData;
        }

        /**
         *
         * @param config
         *  - url
         *  - data
         *  - method
         *
         * @returns {*}
         */
        function upload(config) {
          config = angular.extend({}, config);
          config.headers = {'Content-Type': undefined};
          config.transformRequest = transformRequest;
          return send(config);
        }

        return upload;
      }];
    }])

    .provider("$uploadIFrame", [function () {

      this.$get = ['$q', '$http', '$document', '$rootElement',
        function ($q, $http, $document, $rootElement) {
          var id = 0;
          var forEach = angular.forEach;
          var isElement = angular.isElement;
          var $ = angular.element;

          function uniqueName() {
            return 'iframe-transport-' + (id++);
          }

          /**
           *
           * @param config
           *  - url
           *  - data
           *  - method
           *
           * @returns {*}
           */
          function upload(config) {
            var
              method = config.method.toUpperCase() || 'POST',
              iframeName = uniqueName(),
              $iframe = angular.element('<iframe name="' + iframeName + '" src="javascript:false;"></iframe>'),
              $form = angular.element('<form></form>'),
              files = [],
              fileClones = [],
              deferred = $q.defer(),
              promise = deferred.promise,
              addParamChar;

            // Extract Files from
            forEach(config.data || {}, function (value, key) {
              if (isElement(value)) {
                delete config.data[key];
                value.attr('name', key);
                files.push(value);
              }
            });

            // If the method is something else than POST append the _method parameter
            addParamChar = /\?/.test(config.url) ? '&' : '?';
            // XDomainRequest only supports GET and POST:
            switch (method) {
              case 'DELETE':
              case 'PUT':
              case 'PATCH':
                config.url = config.url + addParamChar + '_method=' + method;
                config.method = 'POST';
                break;
            }

            $form
              .attr('target', iframeName)
              .attr('action', config.url)
              .attr('method', method)
              .css('display', 'none');

            if (files.length) {
              $form
                .attr('enctype', 'multipart/form-data')// enctype must be set as encoding for IE:
                .attr('encoding', 'multipart/form-data');
            }

            // Add iframe that we will post to
            $iframe.bind('load', function () {
              $iframe
                .unbind('load')
                .bind('load', function () {
                  var response = "", doc;

                  // Wrap in a try/catch block to catch exceptions thrown
                  // when trying to access cross-domain iframe contents:
                  try {
                    doc = this.contentWindow ? this.contentWindow.document : this.contentDocument;
                    response = angular.element(doc.body).text();
                  } catch (e) {
                    return onError(e);
                  }

                  // Google Chrome and Firefox do not throw an
                  // exception when calling iframe.contents() on
                  // cross-domain requests, so we unify the response:
                  if (!response.length) {
                    return onError(new Error());
                    //throw new Error();
                  }

                  // Fix for IE endless progress bar activity bug
                  // (happens on form submits to iframe targets):
                  $form.append(angular.element('<iframe src="javascript:false;"></iframe>'));

                  // Convert response into JSON
                  try {
                    response = transformData(response, $http.defaults.transformResponse);
                  } catch (e) {
                    return onError(e);
                  }

                  deferred.resolve({
                    data: response,
                    status: 200,
                    headers: [],
                    config: config
                  });
                });

              // Add all existing data as hidden variables
              forEach(config.data, function (value, name) {
                $form.append(
                  angular.element('<input type="hidden" />').attr('name', name).val(value)
                );
              });

              // Move file inputs to hidden form
              forEach(files, function ($input) {
                var $clone = $input.clone();

                // Save clones so that we can put them back later
                fileClones.push($clone);

                // @fix Workaround intil jqLite can handle .after with cloned elements
                //$rootElement.append(clone);

                $input.after($clone);

                // move original input to hidden form
                $form.append($input);
              });


              config.$iframeTransportForm = $form;

              // Add the config to the $http pending requests to indicate that we are doing a request via the iframe
              $http.pendingRequests.push(config);

              // Transform data using $http.defaults.response
              function transformData(data, fns) {
                // An iframe doesn't support headers :(
                var headers = [];
                if (angular.isFunction(fns)) {
                  return fns(data, headers);
                }

                forEach(fns, function (fn) {
                  data = fn(data, headers);
                });

                return data;
              }

              // Remove everything when we are done
              function removePendingReq() {
                var idx = $http.pendingRequests.indexOf(config);
                if (idx >= 0) {
                  $http.pendingRequests.splice(idx, 1);
                  config.$iframeTransportForm.remove();
                  delete config.$iframeTransportForm;
                }
              }

              function onError(e) {
                deferred.reject(e);
              }

              // submit the form and wait for a response
              $form[0].submit();

              // Put original inputs back
              if (fileClones.length) {
                forEach(files, function (input, index) {
                  fileClones[index].replaceWith(input);
                });
              }

              promise.then(removePendingReq, removePendingReq);
            });

            $form.append($iframe);
            $rootElement.append($form);

            return promise;
          }

          return upload;
        }];
    }])

  /**
   * ngFileSelect directive
   *
   * Usage:
   *
   *  <input type="file"
   *         ng-file-select="callback($event, $files)"
   *         [multiple]>
   *   - OR -
   *  <button ng-file-select="callback($event, $files)">
   *
   *  </button>
   */
    .directive("ngFileSelect", ["$compile", "$log", "$parse", function ($compile, $log, $parse) {
      var MULTIPLE = "multiple";
      return {
        //controller: upload.FileSelect,
        //controllerAs: "ngFileSelect",
        //require: ["ngFileSelect"],
        restrict: "A",
        compile: function () {

          return function link($scope, $element, $attrs) {
            var $inputElement = $element;
            var nodeName = $element[0].nodeName;
            var onFileSelect = $parse($attrs.ngFileSelect);

            $element.addClass("ng-file-select");

            if (nodeName !== "INPUT") {
              //$inputScope = $scope.$new();
              $inputElement = $compile('<input type="file" ng-click="$event.stopPropagation();">')($scope);
              $element.append($inputElement);

              $scope.$watch(
                function () { return $element[0].hasAttribute(MULTIPLE); },
                function (multiple) {
                  if (multiple) {
                    $inputElement.attr(MULTIPLE, "multiple");
                  } else {
                    $inputElement.removeAttr(MULTIPLE);
                  }
                });
            } else {
              //check input type
              if ($attrs.type !== "file") {
                $log.warn($element[0], ' must be an input[type=file]');
              }
            }

            var ngFileSelect = new upload.FileSelect($inputElement);
            ngFileSelect.onFileSelect = function (context) {
              $scope.$apply(function () {
                onFileSelect($scope, context);
                $inputElement.prop("value", null);
              });
            };
          };
        }
      };
    }])

  /**
   * ngFileDrop directive
   *
   * Usage:
   *
   * <tag ng-file-drop="callback($event, $files)"
   *      [multiple]></tag>
   */
    .directive("ngFileDrop", ["$parse", function ($parse) {
      var $$name = 'ngFileDrop';
      var $$block = 'ng-file-upload';

      return {
        controller: upload.FileDrop,
        controllerAs: "ngFileDrop",
        require: ["ngFileDrop"],
        restrict: "EA",
        compile: function () {
          return function link($scope, $element, $attrs, $ctrls) {
            var ngFileDrop = $ctrls[0];
            var onFileDrop = $parse($attrs[$$name]);

            $element.addClass($$block);
            ngFileDrop.activeClass = $$block + "--active";

            ngFileDrop.onFileDrop = function (context) {
              $scope.$apply(function () {
                onFileDrop($scope, context);
              });
            };
          };
        }
      };
    }])

  /**
   * ngFileUpload directive
   *
   * Usage:
   *
   *   <input type="file">
   */
    .directive("ngFileUpload", ["$uploadFactory", function ($uploadFactory) {
      var $$name = 'ngFileUpload';
      var $$block = 'ng-file-upload';

      return {
        restrict: 'EA',
        scope: {
          ngFileUpload: '=',
          multiple: '=?',
          url: '@',
          method: '@',
          resolve: '&onSuccess',
          reject: '&onError'
        },
        compile: function compile($element) {
          $element.addClass($$block);

          return function link($scope, $element) {
            var $fileInput = angular.element('<input type="file" />');
            var $upload = $uploadFactory(adapter());

            function opts(name) {
              return $scope[$$name] && $scope[$$name][name];
            }

            function method() {
              return $scope.method || opts('method') || 'POST';
            }

            function adapter() {
              return $scope.adapter || 'formData';
            }

            function paramName() {
              return opts('paramName') || 'file';
            }

            function resolve(val) {
              $scope.resolve(val);
            }

            function reject(e) {
              $scope.reject(e);
            }

            function isFrame() {
              return adapter() === "iframe";
            }

            function onFileInputChange() {
              var ngFileUpload = angular.copy($scope[$$name]);
              var httpConfig = {
                url: $scope.url,
                method: method(),
                data: {}
              };

              //data
              angular.extend(httpConfig.data, ngFileUpload.data);
              httpConfig.data[paramName()] = $fileInput;

              $upload(httpConfig).then(
                function (response) {
                  resolve(locals(response));
                },
                function (response) {
                  $log.error(String(response));//TODO log error
                  reject(locals(response));
                }
              );

              function locals(response) {
                return {$response: response};
              }
            }

            $fileInput.bind('change', onFileInputChange);
            $element.append($fileInput);

            $scope.$on("$destroy", function () {
              $fileInput.remove();
              $fileInput.unbind('change', onFileInputChange);
            });

            //watchers
            if ($uploadFactory.support.formData) {
              $scope.$watch('multiple', function (value) {
                $fileInput.attr('multiple', !!(value && !isFrame()));
              });
            }
          };
        }
      };
    }]);
});

