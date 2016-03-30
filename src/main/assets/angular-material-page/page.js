define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * @usage
   * <md-pages [md-selected="..."]>
   *   <md-page [md-select="fn($index)"]
   *            [md-deselect="fn($index)"]
   *            [disabled]>
   *     One
   *   </md-page>
   *   <md-page>Two</md-page>
   *   <md-page>Three</md-page>
   * </md-pages>
   */

  var ngModule = angular
    .module(module.id, [])
    .directive("mdPages", MdPages)
    .directive("mdPage", MdPage);

  /**
   * Pages Directive
   *
   */
  function MdPages() {
    var STYLE =
      'md-pages {' +
      '  display: block;' +
      '  position: relative;' +
      '}' +
      'md-pages md-page {' +
      '  display: block;' +
      //'  position: absolute;' +
      //'  top: 0;' +
      //'  left: 0;' +
      //'  bottom: 0;' +
      //'  right: 0;' +
      //'  height: 100%;' +
      '}' +
      'md-pages md-page:not(.md-selected) {' +
      '  display: none !important;' +
      '}';

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    return {
      restrict: "E",
      bindToController: true,
      controller: MdPagesCtrl,
      controllerAs: "mdPages",
      scope: {
        selectedIndex: '=?mdSelected',
        selectedClass: '@mdSelectedClass'
      }
    };
  }

  /**
   * Pages Controller
   *
   */
  MdPagesCtrl.$inject = ["$scope", "$element", "$attrs", "$injector"];
  function MdPagesCtrl($scope, $element, $attrs, $injector) {
    var self = this;

    //this.$$dirty = false;
    this.items = [];
    this.lastSelectedIndex = -1;
    //this.selectedIndex = 0;
    this.selectedClass = this.selectedClass || "md-selected";

    this.select = select;
    this.indexOf = indexOf;
    this.add = add;
    this.remove = remove;
    this.notifyItemChange = notifyItemChange;


    $scope.$watch(
      function () { return self.selectedIndex; },
      onSelectedIndexChange
    );

    function select(index) {
      self.selectedIndex = getNearestSafeIndex(index);
    }

    function selectPrevious() {
      //TODO
    }

    function selectNext() {
      //TODO
    }

    function indexOf(pageCtrl) {
      return arrayIndexOf(self.items, pageCtrl);
    }

    function add(pageCtrl) {
      if (indexOf(pageCtrl) < 0) {
        self.items.push(pageCtrl);
        if (self.selectedIndex === undefined) {
          self.selectedIndex = 0;
        }
      }
    }

    function remove(pageCtrl) {
      var index = indexOf(pageCtrl);
      if (index >= 0) {
        self.items.splice(index, 1);
      }
    }

    function onSelectedIndexChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        self.selectedIndex = getNearestSafeIndex(newValue);
        self.lastSelectedIndex = oldValue;

        //adjustOffset(newValue);
        //$scope.$broadcast('$mdTabsChanged');
        var pages = self.items;
        var oldPage = pages[oldValue];
        var newPage = pages[newValue];
        if (oldPage) {
          oldPage.onDeselect();
        }
        if (newPage) {
          newPage.onSelect();
        }
      }
    }

    function notifyItemChange() {
      //sort pages
      self.items.sort(function (a, b) {
        return a.$$order() - b.$$order();
      });
      //safe index
      self.selectedIndex = getNearestSafeIndex(self.selectedIndex);
    }

    function getNearestSafeIndex(newIndex) {
      var safeIndex = -1;
      if (newIndex >= 0) {
        var pages = self.items;
        var maxOffset = Math.max(pages.length - newIndex, newIndex);
        for (var i = 0, page; i <= maxOffset; i++) {
          page = pages[newIndex + i];//next
          if (page && !page.disabled()) {
            safeIndex = page.index();
            break;
          }
          page = pages[newIndex - i];//previous
          if (page && !page.disabled()) {
            safeIndex = page.index();
            break;
          }
        }
        safeIndex = newIndex;
      }
      return safeIndex;
    }
  }

  /**
   * Page Directive
   *
   */
  function MdPage() {
    return {
      require: ["^mdPages"],
      restrict: "E",
      bindToController: true,
      controller: MdPageCtrl,
      controllerAs: "mdPage",
      scope: {
        _onSelect:   '&?mdOnSelect',
        _onDeselect: '&?mdOnDeselect'
      }
    };
  }

  /**
   * Page Controller
   *
   */
  MdPageCtrl.$inject = ["$scope", "$element", "$attrs", "$injector"];
  function MdPageCtrl($scope, $element, $attrs, $injector) {
    var self = this;
    var mdPages = $element.controller("mdPages");
    var $parentElement = $element.parent();
    var _order = null;

    this.$$order = $$order;
    this.disabled = disabled;
    this.selected = selected;
    this.index = index;
    this.onSelect = onSelect;
    this.onDeselect = onDeselect;

    //init
    mdPages.add(this);
    $scope.$watch(function () {
      var selectedClass = mdPages.selectedClass;

      //delete cache
      _order = null;

      $element
        .toggleClass(selectedClass, selected())
        .toggleClass(selectedClass + "--previous", isPrevious())
        .toggleClass(selectedClass + "--next", isNext());
    });
    $scope.$watch(disabled, function () {
      mdPages.notifyItemChange();
    });
    $scope.$on('$destroy', onDestroy);

    function disabled() {
      return "disabled" in $attrs;
    }

    function $$order() {
      return (
        _order === null ?
        _order = arrayIndexOf($parentElement[0].children, $element[0]) :
        _order
      );
    }

    function index() {
      return mdPages.indexOf(self);
    }

    function selected() {
      return mdPages.selectedIndex === index();
    }

    function isPrevious() {
      return index() < mdPages.selectedIndex;
    }

    function isNext() {
      return index() > mdPages.selectedIndex;
    }

    function onSelect() {
      if (self._onSelect) {
        self._onSelect({
          $index: index()
        });
      }
    }

    function onDeselect() {
      if (self._onDeselect) {
        self._onDeselect({
          $index: index()
        });
      }
    }

    function onDestroy() {
      mdPages.remove(self);
    }
  }

  //array like
  function arrayIndexOf(a, element) {
    var returnValue = -1;
    for (var i = 0, l = a.length; i < l; i++) {
      if (a[i] === element) {
        returnValue = i;
        break;
      }
    }
    return returnValue;
  }


  return ngModule;
});