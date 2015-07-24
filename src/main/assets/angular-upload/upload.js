define(["module", "angular"], function (module, angular) {
  "use strict";

  //@see https://github.com/leon/angular-upload

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
              ).test($window.navigator.userAgent) || $('<input type="file">').prop('disabled')
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
              $iframe = $('<iframe name="' + iframeName + '" src="javascript:false;"></iframe>'),
              $form = $('<form></form>'),
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
                    response = $(doc.body).text();
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
                  $form.append($('<iframe src="javascript:false;"></iframe>'));

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
                  $('<input type="hidden" />').attr('name', name).val(value)
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
   * Usage:
   *   <input type="file" ng-file-select="callback($event, $files)">
   */
    .directive("ngFileSelect", ['$parse', '$timeout', function ($parse, $timeout) {
      var FILE = "file";
      var $$name = 'ngFileSelect';

      return {
        restrict: 'A',
        compile: function () {

          return function link($scope, $element, $attrs) {
            var element = $element[0];
            var onFileSelect = $parse($attrs[$$name]);
            //var log = logger($element[0]);

            //check input type
            if ($attrs.type !== FILE) {
              console.warn(element,  ' must be an input[type=' + FILE + ']');
            }

            (function init() {
              //events
              $element.bind('change', onChange);
              $element.bind('click', onClick);
              $scope.$on("$destroy", onDestroy);
            }());

            function onDestroy() {
              $element.unbind('change', onChange);
              $element.unbind('click', onClick);
            }

            function onChange(event) {
              var files = [];
              var fileList = event.target.files;
              if (fileList !== null && fileList !== undefined) {
                for (var i = 0, l = fileList.length; i < l; i++) {
                  files.push(fileList.item(i));
                }
              }
              $timeout(function () {
                onFileSelect($scope, {
                  $files: files,
                  $event: event
                });
              }, 0);
            }

            function onClick() {
              element.value = null;
            }
          };
        }
      };
    }])

    .directive("ngFileUpload", ["$uploadFactory", function ($uploadFactory) {
      var $$name = 'ngFileUpload';
      var $$block = 'ng-file-upload';
      var $ = angular.element;

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
            var $fileInput = $('<input type="file" />');
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

