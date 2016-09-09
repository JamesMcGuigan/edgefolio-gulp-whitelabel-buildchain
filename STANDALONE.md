# Standalone Website Documentation


## /documentation/

Each widget should be given a page accessible via the following urls: 
 
- [https://edgefolio.com/documentation/](https://edgefolio.com/documentation/)
- [https://edgefolio-local.com/documentation/](https://edgefolio-local.com/documentation/)

Examples should be given of the range of possible states, the use or absence of optional attributes, as well as 
examples of how the widget renders given empty or invalid configuration data.    

These pages should serve both as technical documentation, as well as providing a minimalist testbed for manual and automated tests.

NOTE: ```/documentation/``` is world-visible on the public/client website via non-password-protected nginx route. 
However ```/api/``` calls require an existing sessionid cookie login in order to return client data. 
Thus without an current user login, most widgets will render as ```No Data...``` 


## Nginx Configuration

**[roles/web/templates/edgefolio.com.j2](roles/web/templates/edgefolio.com.j2)**
```
server {
  server_name {{ domain_name }};
  location /documentation/ {
    rewrite ^/documentation/.*$ /assets/production/enterprise-documentation-index.html;
  }
}
```

## Gulp Configuration

**[gulp/config.js](gulp/config.js)**
```
global.dest["enterprise-documentation"] = _.cloneDeep(global.dest.default);
_.merge(global.config, {
  "copy-index": {
    "enterprise-documentation": {
      source:      "src/enterprise/documentation/html/index.html",
      output:      "enterprise-documentation-index.html",
      unoptimized: "enterprise-documentation-unoptimized.html"
    }
  },
  "includes-json": {
    "enterprise-documentation":  { output: "enterprise-documentation.json" }
  },
  templates: {
    "enterprise-documentation": {
      standalone: false,
      files:     "src/enterprise/documentation/html/**/!(index).html",
      root:      "/assets/src/enterprise/documentation/html/",
      filename:  "enterprise-documentation-templates.js",
      module:    "edgefolio.enterprise.templates"
    }
  },
  inject: {
    "enterprise-documentation": {
      default: {
        css: _.flatten([
          global.dest["common-scss"].css + 'edgefolio-libs.css',
          global.dest["common-scss"].css + 'edgefolio-base.css'
        ]),
        js: _.flatten([
          'src/enterprise/models/_models.includes.conf',
          'src/enterprise/documentation/_enterprise-documentation.includes.conf',
          'src/_secret/secret.includes.conf'
        ])
      }
    }
  }
});
_.merge(global.config.inject, {
  "enterprise-documentation": {
    test:        _.cloneDeep(global.config.inject["enterprise-documentation"].default),
    development: _.cloneDeep(global.config.inject["enterprise-documentation"].default),
    staging:     _.cloneDeep(global.config.inject["enterprise-documentation"].default),
    production:  _.cloneDeep(global.config.inject["enterprise-documentation"].default)
  }
});
```

## gulp inject
 
Output is injected into the following files    

```
src/production/enterprise-documentation.json
src/production/enterprise-documentation-index.html
src/production/enterprise-documentation-templates.js
src/production/enterprise-documentation-unoptimized.html
src/production/edgefolio-gulpConfig-enterprise-documentation.js
```


## .includes.conf

All .includes.conf files are parsed by ```extractIncludes(filenames, options)``` in [gulp/util/util.js](gulp/util/util.js).
- ```#``` ```//``` ```<!-- -->``` are striped out as comments
- ```.includes.conf``` files can be recursively referenced inside each other
 - ideally one ```.includes.conf``` should be defined per angular module 
- glob wildcards are allowed: ```src/directory/**/*.js```
 - glob expressions must contain a filename extension
 - newly created/deleted wildcard matches do not trigger watch without restarting ```gulp```
- ```extractIncludes()``` will additionally recurse through ```.html``` and ```.scss``` files looking for implicit image and html template references


**[src/enterprise/documentation/_enterprise-documentation.includes.conf](src/enterprise/documentation/_enterprise-documentation.includes.conf)**
```
src/enterprise/documentation/_enterprise-documentation-libs.includes.conf

src/enterprise/models/_models.includes.conf
src/enterprise/widgets/_widgets.includes.conf

src/enterprise/documentation/app.js
src/enterprise/documentation/debugging.js

src/enterprise/documentation/routes/routes.root.js
src/enterprise/documentation/routes/routes.404.js
src/enterprise/documentation/routes/routes.graphs.js
src/enterprise/documentation/routes/routes.widgets.js
```

**[src/enterprise/documentation/_enterprise-documentation-libs.includes.conf](src/enterprise/documentation/_enterprise-documentation-libs.includes.conf)**
```
src/bower_components/angular-ui-router/release/angular-ui-router.js
src/bower_components/angular-ui-router.stateHelper/statehelper.js
src/bower_components/angular-cookies/angular-cookies.js

src/common_components/angular/middleware/csrftoken.js
src/common_components/angular/middleware/apiRedirection.js
src/common_components/angular/middleware/interpolateObject.js
src/common_components/angular/middleware/interpolateScopeData.js
src/common_components/angular/middleware/optionalTrailingSlashes.ui-router.js
src/common_components/angular/middleware/eventConsoleLogging.js
#src/common_components/angular/middleware/stripTrailingSlashes.resource.js
#src/common_components/angular/middleware/analyticsStateChangeLogging.js
```


# Angular

## Modules

A child module requires both: 
- an entry in ```.includes.conf``` to physically send the code to the browser
- an entry in ```angular.module('', [])``` for angular to register this object as a dependency injection

@docs:
- [https://docs.angularjs.org/guide/module](https://docs.angularjs.org/guide/module)


**[src/enterprise/documentation/app.js](src/enterprise/documentation/app.js)**
```
angular.module('edgefolio.enterprise.documentation', [
  'edgefolio.whitelabel',
  'edgefolio.models',
  'edgefolio.enterprise.graphs',
  'edgefolio.enterprise.widgets',
  'edgefolio.enterprise.documentation.debugging',
  'edgefolio.enterprise.documentation.routes',
  'edgefolio.common-components.routes.apiRedirection'
]);
angular.module('edgefolio.enterprise.documentation.templates', []);
angular.module('edgefolio.enterprise.documentation.routes', [
  'ui.router', 'ui.router.stateHelper',

  'edgefolio.common-components.routes.apiRedirection',
  'edgefolio.common-components.routes.csrftoken',
  'edgefolio.common-components.routes.interpolateScopeData',
  'edgefolio.common-components.routes.optionalTrailingSlashes.ui-router'
  //'edgefolio.common-components.routes.cacheInvalidation',
  //'edgefolio.common-components.routes.eventConsoleLogging',
  //'edgefolio.common-components.routes.stateChangeLogging',
  //'edgefolio.common-components.routes.stripTrailingSlashes.resource'
])
```

## $rootScope

Anything in ```$rootScope``` can be implicitly referenced within any html template 

**[src/enterprise/documentation/app.js](src/enterprise/documentation/app.js)**
```
angular.module('edgefolio.enterprise.documentation')
  .constant("AngularModuleName", "edgefolio.enterprise.documentation")
  .constant("_",      window._)
  .constant("$",      window.$)
  .constant("moment", window.moment)
  .constant("d3",     window.d3)
  .controller("RootController", function(_, $, d3, moment, $rootScope, $state, $stateParams, $location) {
    $rootScope._      = _;
    $rootScope.$      = $;
    $rootScope.d3     = d3;
    $rootScope.moment = moment;
    $rootScope.$location    = $location;
    $rootScope.$location    = $location;
    $rootScope.$state       = $state;
    $rootScope.$stateParams = $stateParams;
  });
```

**[src/enterprise/documentation/html/menu.html](src/enterprise/documentation/html/menu.html)**
```
<ol ng-repeat="parentState in $state.get('root.examples').children">
```


## $window

Anything attached ```$window``` (the angular name for javascript ```window```) can be accessed directly via the javascript console for debugging purposes.

**[src/enterprise/documentation/debugging.js](src/enterprise/documentation/debugging.js)**
```
/**
 * Exposes several angular variables into $window for easier console debugging
 * Not all variables are guaranteed to be available in all apps, but this will simply result in an undefined
 */
angular.module('edgefolio.enterprise.documentation.debugging', ['ui.router']).run(function($window, $timeout, $injector, $document, $rootScope) {
  $timeout(function() {
    $window.$injector = angular.element(document.body).injector();

    // Wrap in a function to enable better testing of missing includes
    $window.$injector.inject = function() {
      $window.$window      = $window;
      $window.$document    = $document;
      $window.$timeout     = $timeout;
      $window.$rootScope   = $rootScope;
      $window.$state       = $injector.get('$state');
      $window.$stateParams = $injector.get('$stateParams');
      $window.$cookies     = $injector.get('$cookies');
      $window.$compile     = $injector.get('$compile');
      $window.$interpolate = $injector.get('$interpolate');
      $window.Edgefolio    = $injector.get('Edgefolio');
    };
    $window.$injector.inject(); // TODO: remove and invoke manually
  });
});
```

## ui-router

#### Templates

ui-router treats routing as a state-machine with nested ```<ui-view>``` templates.

@docs:
- [https://github.com/angular-ui/ui-router](https://github.com/angular-ui/ui-router)
- [https://github.com/marklagendijk/ui-router.stateHelper](https://github.com/marklagendijk/ui-router.stateHelper)

**[src/enterprise/documentation/routes/routes.root.js](src/enterprise/documentation/routes/routes.root.js)**
```
angular.module('edgefolio.enterprise.documentation.routes', [
  'ui.router', 'ui.router.stateHelper',
  'edgefolio.enterprise.documentation.routes.404',
  'edgefolio.enterprise.documentation.routes.widgets',
  'edgefolio.enterprise.documentation.routes.graphs'
])
.config(function(stateHelperProvider) {
  stateHelperProvider.state({
    name: 'root',
    abstract: true,
    data: {},
    views: {
      "":                { template: "<ui-view/>"        },  // required, creates nested view
      "header-menu-top": { template: "<menu-top-level/>" }
    },
    children: [
      {
        name: 'home',
        url: '',
        templateUrl: '/assets/whitelabel/enterprise/documentation/html/menu.html',
        data: {
          'title': 'Edgefolio Enterprise'
        }
      },
      ...
    ]
  }, { siblingTraversal: true });
});
```

**[src/enterprise/documentation/html/index.html](src/enterprise/documentation/html/index.html)**
```
<html ng-app="edgefolio.enterprise.documentation">
  <head ng-controller="RootController">
  </head>
  <body ng-cloak ng-controller="RootController">
    <header class="header-edgefolio">
      <nav ui-view="header-menu-top"></nav>
    </header>
    <main class="container" ui-view ng-cloak></main>
    <footer>
      <nav ui-view="footer-menu"></nav>
    </footer>
  </body>
</html>
```


#### Individual Routes

Each new widget needs a route to be hardcoded for it, but once the route is defined it will automatically
be added to the menu.


**[src/enterprise/documentation/html/menu.html](src/enterprise/documentation/html/menu.html)**
```html
<h1 style='margin-top: 0'>Edgefolio Enterprise Demonstrations</h1>

<section>
  <ol style="float: left;" ng-repeat="parentState in $state.get('root.examples').children">
    <li ng-repeat="state in parentState.children">
      <a ui-sref="{{state.name}}"
         ui-sref-active="bold"
         ng-bind="state.data.title"></a>
    </li>
  </ol>
</section>
```


**[src/enterprise/documentation/routes/routes.graphs.js](src/enterprise/documentation/routes/routes.graphs.js)**
```js
angular.module('edgefolio.enterprise.documentation.routes.graphs', ['ui.router.stateHelper']).config(function(stateHelperProvider) {
  stateHelperProvider.state({
    name:    'root.examples.graphs',
    abstract: true,
    template: "<ui-view/>",  // required, creates nested view
    children: [
      {
        name: 'graphPerformance',
        url: '/graphPerformance',
        data: {
          title: "Graph Performance"
        },
        templateUrl: '/assets/whitelabel/enterprise/graphs/graphPerformance/graphPerformance.example.html'
      },
      ...
    ]
  }, { siblingTraversal: true });
});      
```

**[src/enterprise/documentation/routes/routes.widgets.js](src/enterprise/documentation/routes/routes.widgets.js)**
```js
angular.module('edgefolio.enterprise.documentation.routes.widgets', ['ui.router.stateHelper']).config(function(stateHelperProvider) {
  stateHelperProvider.state({
    name:    'root.examples.widgets',
    abstract: true,
    template: "<ui-view/>",  // required, creates nested view
    children: [
      {
        name: 'selectbox',
        url: '/selectbox',
        data: {
          title: "Selectbox"
        },
        templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.example.html'
      },
      ...
    ]
  }, { siblingTraversal: true });
});
```


Bugfix to permit ```$state.$current.parent``` and ```$state.$current.children``` on all states
**[src/enterprise/documentation/routes/routes.widgets.js](src/enterprise/documentation/routes/routes.widgets.js)**
```js
.run(function($state) {
  // Fix .parent and .children links in all states
  _.each($state.get(), function(parentState) {
    _.each($state.get(), function(childState) {
      if( childState.name.match(new RegExp('^'+parentState.name+'\\.\\w+$')) ) {
        childState.parent    = parentState;
        parentState.children = _([parentState.children, childState]).flatten(true).unique().value();
      }
    })
  })
})
```

## Widget Sources

By convention, the documentation html for each widget lives inside the widget source directory with the extension ```.example.html```
```
src/enterprise/widgets/statisticsTable/_statisticsTable.includes.conf
src/enterprise/widgets/statisticsTable/statisticsTable.example.html
src/enterprise/widgets/statisticsTable/statisticsTable.html
src/enterprise/widgets/statisticsTable/statisticsTable.js
```

The ```<edgefolio-documentation>``` directive is defined in [src/enterprise/widgets/documentation/documentation.js](src/enterprise/widgets/documentation/documentation.js)
and attempts to autogenerate ```<pre>``` tag source documentation and inline angular controls.

**[src/enterprise/widgets/statisticsTable/statisticsTable.example.html](src/enterprise/widgets/statisticsTable/statisticsTable.example.html)**
```
<edgefolio-documentation>
  <edgefolio-statistics-table items="[1,2,3]" config={showLinks:true,showNumbers:true}/>
</edgefolio-documentation>

<edgefolio-documentation>
  <edgefolio-statistics-table items="['Fund:1','Index:1']"/>
</edgefolio-documentation>


<edgefolio-documentation>
  <edgefolio-selectbox-benchmark selected-id="$state.$current.data.benchmarkId"/>
  <edgefolio-timeframe-selector  selected-id="$state.$current.data.timeframeId"/>
  <edgefolio-statistics-table    items="['Fund:1','Index:'+$state.$current.data.benchmarkId]" timeframe-id="$state.$current.data.timeframeId"/>
</edgefolio-documentation>

<edgefolio-documentation>
  <edgefolio-selectbox-fundgroup selected-id="$state.$current.data.fundgroupId"/>
  <edgefolio-timeframe-selector  selected-id="$state.$current.data.timeframeId"/>
  <edgefolio-statistics-table    fundgroup-id="$state.$current.data.fundgroupId" timeframe-id="$state.$current.data.timeframeId"/>
</edgefolio-documentation>
```
