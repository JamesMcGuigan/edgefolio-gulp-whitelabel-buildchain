'use strict';

// bootstrap
angular.module('edgefolio.enterprise.documentation', [
  'edgefolio.whitelabel',
  'edgefolio.models',
  'edgefolio.enterprise.widgets',
  'edgefolio.enterprise.documentation.debugging',
  'edgefolio.enterprise.documentation.routes',
  'edgefolio.common-components.routes.apiRedirection' // needs to be in parent module for some reason in order to work ???
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
.config(function($locationProvider, $urlMatcherFactoryProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

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
