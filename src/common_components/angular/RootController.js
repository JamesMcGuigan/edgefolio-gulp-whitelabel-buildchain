'use strict';
// NOTE: Controller not re-initiated on page transitions beteween forms
// Mostly provides services to the apiForm directive
angular.module('edgefolio.common-components.RootController', [
  'edgefolio.whitelabel',
  'edgefolio.models',
  //'edgefolio.common-components.constants',
  //'edgefolio.common-components.services.api.data'
])
.controller('RootController', function(
  $rootScope, $scope, $state, $stateParams, $location,
  GlobalConfig, WhitelabelText,
  ApiFormHistory, ApiModal, ApiDataService, ApiDataStore, Edgefolio
)
  {
    $rootScope.console        = console;
    $rootScope.JSON           = JSON;
    $rootScope._              = _;
    $rootScope.$              = $;
    $rootScope.GulpConfig     = window.GulpConfig;
    $rootScope.GlobalConfig   = GlobalConfig;
    $rootScope.WhitelabelText = WhitelabelText;
    $rootScope.$state         = $state;
    $rootScope.$stateParams   = $stateParams;
    $rootScope.$location      = $location;
    $rootScope.ApiModal       = ApiModal;
    $rootScope.ApiDataStore   = ApiDataStore;
    $rootScope.Edgefolio      = Edgefolio;

  });
