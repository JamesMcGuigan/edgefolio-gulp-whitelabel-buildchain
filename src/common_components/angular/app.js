'use strict';

angular.module('edgefolio.common-components', [
  'edgefolio.common-components.RootController',

  //'edgefolio.common-components.constants',
  'edgefolio.common-components.routes',

  'edgefolio.whitelabel',
  'edgefolio.models',
  'edgefolio.enterprise.widgets',

  'btford.markdown',
  'tableSort',
  'Showdown',
  'ngAnimate',
  'ngCookies', // $cookies
  'ngResource',
  'ngSanitize',
  'ngStorage',
  'ngOnce',
  'taiPlaceholder' // https://github.com/tests-always-included/angular-placeholder
]);

angular.module('edgefolio.common-components.templates', []);
angular.module('edgefolio.common-components.profiles', []);
angular.module('edgefolio.common-components.routes', [
  'ui.router',
  'ui.router.stateHelper',
  'edgefolio.common-components.routes.stateChangeLogging',
  'edgefolio.common-components.routes.apiRedirection',
  //'edgefolio.common-components.routes.cacheInvalidation',
  'edgefolio.common-components.routes.eventConsoleLogging',
  'edgefolio.common-components.routes.csrftoken',
  'edgefolio.common-components.routes.interpolateScopeData',
  'edgefolio.common-components.routes.stripTrailingSlashes.resource',
  'edgefolio.common-components.routes.optionalTrailingSlashes.ui-router',
  'edgefolio.common-components.routes.stateParamsWatcher'
]);
