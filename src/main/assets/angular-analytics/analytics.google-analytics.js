/**
 * -trackingId: "UA-..."
 * -anonymizeIp: true|false
 */
define(['module', 'angular', './analytics'], function (module, angular, ngAnalytics) {
  'use strict';

  //util
  var __throw = function (o) { throw o; };
  var __required = function (o, name) {
    return o[name] || __throw(new Error('object must have [' + name + ']'));
  };

  return angular
    .module(module.id, [ ngAnalytics.name ])
    .config(['$analyticsProvider', function ($analyticsProvider) {
      $analyticsProvider.register("google-analytics", "$analyticsGoogle");
    }])
    .provider("$analyticsGoogle", function $analyticsGoogleProvider() {
      this.$get = ['$document', '$rootElement', '$window',
      function ($document, $rootElement, $window) {

        (function __init__() {
          //prepare ga
          $window.GoogleAnalyticsObject = 'ga';
          var ga = $window.ga || ($window.ga = function () {
            ga.q.push(arguments);
          });
          ga.q = ga.q || [];
        }());

        //api
        function config(conf) {
          var isLocalhost = $window.location.hostname == 'localhost';
          var domain = isLocalhost ? 'none' : conf.domain || 'auto';

          ga.l = conf.timeInit;
          ga('create', __required(conf, 'trackingId'), {
            cookieDomain: domain,
            allowLinker: true
          });

          // display advertising
          if (conf.doubleClick) {
            ga('require', 'displayfeatures');
          }

          if (conf.anonymizeIp) {
            ga('set', 'anonymizeIp', true);
          }
          _load(conf.debug);
        }

        function alias(newId, originalId) {

        }

        function identify(userId, traits) {
          if (userId) {
            ga('set', 'userId', userId);
          }

          // custom dimensions & metrics
          /*var custom = metrics(traits, opts);
          if (length(custom)) {
            ga('set', custom);
          }*/
        }

        function pageview(url, properties) {
          //var category = page.category();
          //var name = page.fullName();
          //var campaign = page.proxy('context.campaign') || {};
          var data = {
            //page: path(properties, this.options),
            title: /*name || */properties.title,
            location: url
          };

          //this._category = category; // store for later

          /*
          if (campaign.name) pageview.campaignName = '(' + campaign.name + ')';
          if (campaign.source) pageview.campaignSource = '(' + campaign.source + ')';
          if (campaign.medium) pageview.campaignMedium = campaign.medium;
          if (campaign.content) pageview.campaignContent = campaign.content;
          if (campaign.term) pageview.campaignKeyword = campaign.term;
          */

          // send
          ga('send', 'pageview', data);

          // categorized pages
          /*if (category && this.options.trackCategorizedPages) {
            track = page.track(category);
            this.track(track, { nonInteraction: 1 });
          }

          // named pages
          if (name && this.options.trackNamedPages) {
            track = page.track(name);
            this.track(track, { nonInteraction: 1 });
          }*/
        }

        function track(event, properties) {
          //var contextOpts = track.options(this.name);
          //var interfaceOpts = this.options;
          var opts = {};//defaults(options || {}, contextOpts);
          //opts = defaults(opts, interfaceOpts);
          //var campaign = track.proxy('context.campaign') || {};

          var payload = {
            eventAction: event,
            eventCategory: properties.category /*|| this._category*/ || 'All',
            eventLabel: properties.label,
            eventValue: formatValue(properties.value/* || track.revenue()*/),
            nonInteraction: !!(properties.nonInteraction || opts.nonInteraction)
          };

          /*
          if (campaign.name) payload.campaignName = '(' + campaign.name + ')';
          if (campaign.source) payload.campaignSource = '(' + campaign.source + ')';
          if (campaign.medium) payload.campaignMedium = campaign.medium;
          if (campaign.content) payload.campaignContent = campaign.content;
          if (campaign.term) payload.campaignKeyword = campaign.term;
          */

          ga('send', 'event', payload);
        }

        function _load(debug) {
          var isSecured = 'https:' == $window.location.protocol;
          var document = $document[0];
          var scriptElement = document.createElement('script');
          scriptElement.async = true;
          scriptElement.type = 'text/javascript';
          scriptElement.src =
            (isSecured ? 'https://ssl' : 'http://www') +
            '.google-analytics.com/' +
            (debug ? 'analytics_debug' : 'analytics') +
            '.js';
          var parentElement = $rootElement[0];
          if (parentElement == document) {
            parentElement = document.getElementsByTagName('head')[0];
          }
          parentElement.appendChild(scriptElement);
        }

        return {
          config: config,
          alias: alias,
          identify: identify,
          pageview: pageview,
          track: track
        };
      }];
    });
});
