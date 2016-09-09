/**
 * Exposes several angular variables into $window for easier console debugging
 * Not all variables are guaranteed to be available in all apps, but this will simply result in an undefined
 */
angular.module('edgefolio.common-components').run(function($window, $timeout, $injector, $document, $rootScope) {
  $timeout(function() {
    $window.$injector = angular.element(document.body).injector();

    // Wrap in a function to enable better testing of missing includes
    $window.$injector.inject = function() {
      $window.$window           = $window;
      $window.$rootScope        = $rootScope;
      $window.$http             = $injector.get('$http');
      $window.$localStorage     = $injector.get('$localStorage');
      $window.$location         = $injector.get('$location');
      $window.$q                = $injector.get('$q');
      $window.$state            = $injector.get('$state');
      $window.$stateParams      = $injector.get('$stateParams');
      $window.AnalyticsService  = $injector.get('AnalyticsService');
      $window.API               = $injector.get('API');
      $window.ApiDataService    = $injector.get('ApiDataService');
      $window.ApiDataStore      = $injector.get('ApiDataStore');
      $window.ApiModal          = $injector.get('ApiModal');
      $window.ListService       = $injector.get('ListService');
      $window.CONST             = $injector.get('CONST');
      $window.GlobalConfig      = $injector.get('GlobalConfig');
      $window.Edgefolio         = $injector.get('Edgefolio');
    };
    $window.$injector.inject(); // TODO: remove and invoke manually

    ///**
    // * Searches through modules and loads and functions found in the _invokeQueue
    // * NOTE: Function doesn't find all DI includes, so is a bit useless
    // * @param rootModuleName
    // */
    //$window.$injector.injectAll = function(rootModuleName) {
    //  rootModuleName = rootModuleName || 'edgefolio.' + window.GulpConfig.appName;
    //
    //  var modulesNames  = _([rootModuleName])
    //                  .concat(angular.module(rootModuleName).requires)
    //                  .filter(function(module) { return _.startsWith(module, 'edgefolio.'); })
    //                  .value();
    //
    //  modulesNames = _(modulesNames).concat(
    //    _(modulesNames).map(angular.module)
    //                   .pluck('requires')
    //                   .filter(function(module) { return _.startsWith(module, 'edgefolio.'); })
    //                   .value()
    //  ).flatten().unique().value();
    //
    //  var modules = _(modulesNames).map(angular.module).value();
    //
    //  var injected = _(modules).map(function(module) {
    //    var injections = _(module._invokeQueue)
    //                      .flatten(true)
    //                      .filter(_.isString)
    //                      .sort()
    //                      .unique()
    //                      .value();
    //
    //    return _(injections).map(function(inject) {
    //      try {
    //        if( !$window[inject] ) {
    //          $window[inject] = $injector.get(inject);
    //          return module.name + '::' + inject;
    //        }
    //      } catch(e) {}
    //    }).filter().unique().value();
    //  }).flatten().unique().value();
    //
    //  console.info("window.debugging.js", "$injector.inject: \n", injected.join("\n"));
    //};
  });
});
