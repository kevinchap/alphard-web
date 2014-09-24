(function () {
    /*
     * http://stackoverflow.com/questions/7065120/calling-a-javascript-function-recursively
     * http://jsfiddle.net/D73ET/
     */
    var load_holder = function load_rec(dependencies, f) {
        if (!dependencies || dependencies.length === 0) {
          f();
        } else {
            var dependency = dependencies[0];
            var otherDependencies = dependencies.slice(1);
            console.log(dependency);
            $script(dependency, function () {
                load_rec(otherDependencies, f);
            });
        }
    };
    var load = load_holder;
    load_holder = null;

    function loadCss() {
      var head = document.head || document.getElementsByTagName('head')[0];
      var styles = $dependencies.styles;
      for (var style in styles) {
        if (styles.hasOwnProperty(style)) {
          var link = document.createElement("link");
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = styles[style];
          head.appendChild(link);
        }
      }
    }

    load($dependencies.scripts, function () {
      loadCss();
      angular.bootstrap(document, [ 'app' ]);
    });
})();
