/**
 * -trackingId: "UA-..."
 * -anonymizeIp: true|false
 */
define(['module', 'angular', './analytics', 'google/analytics'],
function (module, angular, ngAnalytics, ga) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * GoogleAnalytics class
   */
  var GoogleAnalytics = (function (_super) {

    function GoogleAnalytics(opt_conf) {
      _super.call(this);
      if (opt_conf) {
        for (var name in opt_conf) {
          if (name in this) {
            this[name] = opt_conf[name];
          }
        }
      }

      //init
      var $window = this.$window;
      var $ga = this.$ga;
      var isLocalhost = $window.location.hostname == 'localhost';
      var domain = this.domain = isLocalhost ? 'none' : this.domain;

      $ga('create', __required(opt_conf, 'trackingId'), {
        cookieDomain: domain,
        allowLinker: true
      });

      // display advertising
      if (this.doubleClick) {
        $ga('require', 'displayfeatures');
      }

      if (this.anonymizeIp) {
        $ga('set', 'anonymizeIp', true);
      }
    }

    GoogleAnalytics.prototype = Object.create(_super.prototype);

    GoogleAnalytics.prototype.constructor = GoogleAnalytics;

    GoogleAnalytics.prototype.debug = false;

    GoogleAnalytics.prototype.doubleClick = false;

    GoogleAnalytics.prototype.anonymizeIp = false;

    GoogleAnalytics.prototype.domain = 'auto';

    GoogleAnalytics.prototype.$ga = ga;

    GoogleAnalytics.prototype.$window = window;

    GoogleAnalytics.prototype.alias = function alias(newId, originalId) {

    };

    GoogleAnalytics.prototype.identify = function identify(userId, traits) {
      if (userId) {
        this.$ga('set', 'userId', userId);
      }

      // custom dimensions & metrics
      /*var custom = metrics(traits, opts);
      if (length(custom)) {
        ga('set', custom);
      }*/
    };

    GoogleAnalytics.prototype.pageview = function pageview(url, properties) {
      //var category = page.category();
      //var name = page.fullName();
      //var campaign = page.proxy('context.campaign') || {};
      var data = {
        page: properties.page//,
        //title: /*name || */properties.title
      };
      //this._category = category; // store for later

      /*
      if (campaign.name) data.campaignName = '(' + campaign.name + ')';
      if (campaign.source) data.campaignSource = '(' + campaign.source + ')';
      if (campaign.medium) data.campaignMedium = campaign.medium;
      if (campaign.content) data.campaignContent = campaign.content;
      if (campaign.term) data.campaignKeyword = campaign.term;
      */
      // send
      this.$ga('send', 'pageview', data);

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
    };

    GoogleAnalytics.prototype.track = function track(event, properties) {
      //var contextOpts = track.options(this.name);
      //var interfaceOpts = this.options;
      var opts = {};//defaults(options || {}, contextOpts);
      //opts = defaults(opts, interfaceOpts);
      //var campaign = track.proxy('context.campaign') || {};

      var data = {
        eventAction: event,
        eventCategory: properties.category /*|| this._category*/ || 'All',
        eventLabel: properties.label,
        eventValue: formatValue(properties.value/* || track.revenue()*/),
        nonInteraction: !!(properties.nonInteraction || opts.nonInteraction)
      };

      /*
      if (campaign.name) data.campaignName = '(' + campaign.name + ')';
      if (campaign.source) data.campaignSource = '(' + campaign.source + ')';
      if (campaign.medium) data.campaignMedium = campaign.medium;
      if (campaign.content) data.campaignContent = campaign.content;
      if (campaign.term) data.campaignKeyword = campaign.term;
      */

      this.$ga('send', 'event', data);
    };

    function __throw(o) {
      throw o;
    }

    function __required(o, name) {
      return (name in o) ? o[name] : __throw(new Error('object must have [' + name + ']'));
    }

    return GoogleAnalytics;
  }(Object));


  return angular
    .module(module.id, [ ngAnalytics.name ])
    .config(['$analyticsProvider', function ($analyticsProvider) {
      $analyticsProvider.register("google-analytics", "$analyticsGoogle");
    }])
    .provider("$ga", function $gaProvider() {
      this.$get = [function () {
        return ga;
      }];
    })
    .provider("$analyticsGoogle", function $analyticsGoogleProvider() {
      this.$get = [function () {
        return GoogleAnalytics;
      }];
    });
});
