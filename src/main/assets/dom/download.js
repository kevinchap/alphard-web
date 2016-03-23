define(["module"], function (module) {
  "use strict";


  var download;
  (function (download) {
    var LINK = 1;
    var IFRAME = 2;
    var WINDOW_OPEN = 3;
    var aElement = createElement('a');
    var hasDownloadAttr = 'download' in aElement;

    function getBodyElement() {
      return document.body;
    }

    function createElement(name, opt_attrs) {
      var returnValue = document.createElement(name);
      if (opt_attrs) {
        for (var key in opt_attrs) {
          returnValue.setAttribute(key, opt_attrs[key]);
        }
      }
      return returnValue;
    }

    function removeElement(element) {
      if (element.remove) {
        element.remove();
      } else if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }

    function hideElement(element) {
      element.style.visibility = "collapse";
      element.style.width = "0";
      element.style.height = "0";
    }

    function parseURL(url) {
      var a = aElement;
      a.href = url;
      var protocol = a.protocol;
      var hostname = a.hostname;
      var port = a.port;
      return {
        protocol: protocol,
        host: a.host,
        hostname: hostname,
        port: port,
        origin: protocol + "//" + hostname + (port ? ':' + port: ''),
        pathname: a.pathname,
        search: a.search
      };
    }

    function parseQuery(s) {
      s = s.slice(1);
      var params = [];
      var parts = s.split("&");
      for (var i = 0, l = parts.length; i < l; i++) {
        params.push(parts[i].split("="));
      }
      return params;
    }

    /**
     *
     * @param {string} url
     * @param { {fileName: string}=} opt_settings
     */
    function downloadURL(url, opt_settings) {
      var settings = opt_settings || {};
      switch (IFRAME) {
        case WINDOW_OPEN:
          return downloadURL_windowOpen(url, settings);
        case LINK:
          return downloadURL_link(url, settings);
        case IFRAME:
          return downloadURL_iframe(url, settings);
      }
    }

    download.downloadURL = downloadURL;

    function downloadURL_link(url, settings) {
      var bodyElement = getBodyElement();
      var a = createElement('a', {
        href: encodeURI(url),
        target: "_blank",
        download: settings.fileName || "download" // Set the file name.
      });
      hideElement(a);
      bodyElement.appendChild(a);
      a.click();
      setTimeout(function () {
        removeElement(a);
        a = null;
      }, 0);
    }

    function downloadURL_iframe(url, settings) {
      var bodyElement = getBodyElement();
      var iframeElement = createElement("iframe", {
        src: "about:blank"
      });
      hideElement(iframeElement);
      bodyElement.appendChild(iframeElement);

      var contentWindow = iframeElement.contentWindow;
      var doc = contentWindow.document;
      var urlObject = parseURL(url);
      var action = urlObject.origin + urlObject.pathname;
      var params = parseQuery(urlObject.search);
      var formHTML = '<form action="' + encodeURI(action) + '" method="GET">';
      for (var i = 0, l = params.length, param; i < l; i++) {
        param = params[i];
        formHTML += '<input type="hidden" name="' + param[0] + '" value="' + param[1] + '">';
      }
      formHTML += '</form>';
      doc.write(formHTML);
      var formElement = doc.getElementsByTagName("form")[0];
      formElement.submit();
      setTimeout(function () {
        removeElement(iframeElement);
        iframeElement = null;
      }, 10000);
    }

    //Simple/naive implementation (buggy because of popup blockers and browser tab settings)
    function downloadURL_windowOpen(url, settings) {
      window.open(url, settings.fileName || '_blank');
    }

  }(download || (download = {})));


  return download.downloadURL;
});