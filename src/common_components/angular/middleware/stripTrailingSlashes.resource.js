// High level routing configuration parameters
angular.module('edgefolio.common-components.routes.stripTrailingSlashes.resource', ['ngResource']).config(function($resourceProvider) {
  //$locationProvider.html5Mode(true).hashPrefix('!');
  $resourceProvider.defaults.stripTrailingSlashes = false;
});
