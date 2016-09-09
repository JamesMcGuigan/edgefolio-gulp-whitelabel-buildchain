# Angular Apps and Django View Templates

## Browser Support

- Formally we only support IE10+ inside the application + modern browsers: Firefox, Chrome, Safari
- Application is white page broken in IE8 - IE8 not supported by angular
- Application is partially buggy in IE9   - broken file uploads in Manager App
- Homepage fails to connect on IE6 - https SSL error, connection error
- Homepage should not break on IE8
-- Homepage Industry Distribution chart is disabled on IE8 and below


## HTML Page Loading

#### Common JS / CSS / HTML includes

In all base HTML files (plus any page specific includes):
- [src/homepage/public_profiles/hedge_fund.html](src/homepage/pages/base.html)
- [src/homepage/pages/base.html](src/homepage/pages/base.html)
- [src/manager_app/index.html](src/manager_app/index.html)
- [src/investor_app/index.html](src/investor_app/index.html)
```html
<!--[if lt IE 9]><p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p><![endif]-->
```
```html
<script type="text/javascript" src="//maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyAnrnyDTJtTFg32rh0bMLkjjsTIG1Aveec&sensor=false"></script>
<script type="text/javascript" src="/assets/common_components/services/Analytics/analytics-embed-codes.js"></script>
<script type="text/javascript" src="/assets/bower_components/cookiebanner/dist/cookiebanner.min.js" id="cookiebanner"></script>
```


Gulp inject application pages dynamically include edgefolio-pollyfills-js-libs.min.js.
Also as angular doesn't support IE8, we don't need conditional loading of jQuery
External pages however, do require manual injection of pollyfil and dynamic loading of jQuery
- [src/homepage/public_profiles/hedge_fund.html](src/homepage/pages/base.html)
- [src/homepage/pages/base.html](src/homepage/pages/base.html)
```
<!--[if gte IE 9]><!--><script type="text/javascript" src="/assets/bower_components/jquery/dist/jquery.min.js"></script><!--<![endif]-->
<!--[if lt  IE 9]>     <script type="text/javascript" src="/assets/bower_components/jquery-legacy/dist/jquery.min.js"></script><![endif]-->
<script type="text/javascript" src="/assets/production/edgefolio-pollyfills-js-libs.min.js"></script>
```

Application pages, plus anything that depends on the google maps API needs:
- [src/manager_app/index.html](src/manager_app/index.html)
- [src/investor_app/index.html](src/investor_app/index.html)
```
<script type="text/javascript" src="//maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyAnrnyDTJtTFg32rh0bMLkjjsTIG1Aveec&sensor=false"></script>
```

#### index.html - [src/manager_app/index.html](src/manager_app/index.html) + [src/investor_app/index.html](src/investor_app/index.html)

The index.html files contains:
- <header> html meta tags
- ng-controller tag
    - ```ng-controller="RootController"``` - manager_app
    - ```ng-controller="MainController"``` - investor_app
- the html required for the header, footer and a <ui-view> / <ng-view> tag for angular to inject the current page into.
- Gulp inject tags, which are overwritten by ```gulp inject```
    - ```<!-- START gulp-inject css --><!-- END gulp-inject css -->```
    - ```<!-- START gulp-inject GulpConfig --><!-- END gulp-inject GulpConfig -->```
    - ```<!-- START gulp-inject javascript --><!-- END gulp-inject javascript -->```
- Injected index.html files, used by uwsgi, are found in:
    - src/production/edgefolio-investorapp-index.html
    - src/production/edgefolio-manager-index.html
    - src/homepage/pages/index.html
    - src/homepage/public_profiles/hedge_fund.html


## Third Party Libraries

#### Pollyfills

- [Core.js](https://github.com/zloirock/core-js)                  - major polyfill for cross-browser EMCA6
- [Placeholder](https://github.com/UmbraEngineering/Placeholder)  - pollyfil for \<input placeholder=""\> in IE9
- [json3](https://bestiejs.github.io/json3/)           - polyfill for JSON for IE9 (industry distribution chart imports this in index.html)
- [html5shiv.js](https://github.com/aFarkas/html5shiv) - polyfill for HTML5 element tags for IE8
- [respond.js](https://github.com/scottjehl/Respond)   - polyfill for min/max-width CSS3 Media Queries for IE8
- firebugx                                             - prevents console.log() statements throwing exceptions in IE
- [Modernizr](https://modernizr.com/)                  - JS, HTML and CSS feature detection, adds classes to \<html\> tag
- [Detectizr](https://github.com/barisaydinoglu/Detectizr) - A Modernizr extension to detect device, screen size, OS, and browser.

Note: Pollyfill libraries are included without IE conditional tags as the each use feature detect

#### Javascript
- [Angular](https://angularjs.org/) - Major structural library and dynamic HTML templates
 - [UI Router](https://github.com/angular-ui/ui-router) - Stateful view routing
- [jsclass](http://jsclass.jcoglan.com/) - Ruby like classes in javascript
- [jQuery](https://jquery.com/)     - Standard DOM manipulation library
 - NOTE: v1 supports IE6+ whereas v2 only supports IE9+ - loaded using IE conditional tags in html
- [D3](http://d3js.org/)            - Dynamic SVG chart generation
- [Lodash](https://lodash.com/)     - Awesome functional programming and utility library
- [Datejs](www.datejs.com)          - extends window.Date() with additional functions

NOTE: list is incomplete see [bower.json](bower.json) for complete list

#### CSS
- [SASS](http://sass-lang.com/) - CSS precompiler, adds nested rules, variables, functions and import statements
- [Twitter Bootstrap](https://getbootstrap.com/) - CSS framework including a grid system

#### Build Chain
- [Node](https://nodejs.org/)   - Server side javascript, used by gulp and various script file
- [Gulp](http://sass-lang.com/) - Used to precompile HTML, CSS and Javascript see [Gulp README](gulp/README.md)



## Angular Bootstrapping

#### App.js

[src/common_components/angular/app.js](src/common_components/angular/app.js)
- ```angular.module('edgefolio.common-components')``` module is defined
- ```angular.module('edgefolio.common-components.filters', [])``` module is defined
- ```angular.module('edgefolio.common-components.routes', ['ui.router', 'ui.router.stateHelper', 'ngResource'])``` module is defined
- ```angular.module('edgefolio.common-components.profiles', [])``` module is defined
- ```angular.module('edgefolio.common-components.templates', [])``` module is defined
    - allows src/production/edgefolio-managerapp-templates.js to be an optional include file
- includes: all edgefolio.common-components.* modules as dependencies
- includes: btford.markdown, tableSort, Showdown, ngAnimate, ngCookies, ngResource, ngSanitize, ngStorage


#### RootController - [src/common_components/RootController.js](src/common_components/RootController.js)

This is the parent page controller within which all other controllers are nested.

Its primary purpose is to expose commonly used variables into the $rootScope namespace,
allowing for easy referencing into angular templates. The currently variables exposed are:
- ```$rootScope._```            - lodash
- ```$rootScope.$```            - jQuery
- ```$rootScope.$state```       - ui-router
- ```$rootScope.$stateParams``` - ui-router
- ```$rootScope.$location```
- ```$rootScope.GulpConfig```   - window.GulpConfig;
- ```$rootScope.ApiModal```
- ```$rootScope.ApiDataStore```

#### window.debugging.js - [src/common_components/window.debugging.js](src/common_components/window.debugging.js)

Exposes several angular variables into $window for easier console debugging - after a $timeout()
- ```$window.$window```
- ```$window.$rootScope```
- ```$window.$injector = angular.element(document.body).injector();```
- ```$window.$http```
- ```$window.$localStorage```
- ```$window.$location```
- ```$window.$q```
- ```$window.$state```
- ```$window.$stateParams```
- ```$window.AnalyticsService```
- ```$window.API```
- ```$window.ApiDataService```
- ```$window.ApiDataStore```
- ```$window.ApiModal```
- ```$window.CONST```
- ```$window.GlobalConfig```
- ```$window.MANAGER_APP_CONST```
