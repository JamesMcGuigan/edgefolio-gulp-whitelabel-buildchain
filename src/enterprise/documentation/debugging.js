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
