// $state.$current.$data is the scope interpolated version of $state.$current.data
angular.module('edgefolio.common-components.routes.stateChangeLogging', []).run(function(GlobalConfig, $rootScope, $http, $state, $stateParams, $window) {
  if( _.get(GlobalConfig, 'features.global.stateTransitionAnalytics') ) {
    $rootScope.$on('$locationChangeSuccess', function(event, toUrl, fromUrl) {

      // NOTE: $state variables are not accessible to $locationChangeSuccess on initial page load
      //       $stateChangeSuccess will trigger on initial page load
      //       $state.go('', { notify: false }) will only trigger $locationChangeSuccess and not $stateChangeSuccess
      //       example of $state.go('', { notify: false }) is state transitions within the IA Watchlist page
      if( _.get($state, 'current.abstract') ) {

        $rootScope.$once('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
          var analysisData = {
            toUrl:       $window.location.href,
            fromUrl:     "",
            stateParams: $stateParams,
            state: {
              data:        _.get($state.current, '$data'),
              name:        _.get($state.current, 'name'),
              url:         _.get($state.current, 'url'),
              templateUrl: _.get($state.current, 'templateUrl'),
              controller:  _.get($state.current, 'controller')
            },
            eventName: '$stateChangeSuccess'
          };
          $http.post('/analytics/state-transition/', analysisData);
        });

      } else {

        var analysisData = {
          toUrl:       toUrl,
          fromUrl:     fromUrl,
          stateParams: $stateParams,
          state: {
            data:        _.get($state.current, '$data'),
            name:        _.get($state.current, 'name'),
            url:         _.get($state.current, 'url'),
            templateUrl: _.get($state.current, 'templateUrl'),
            controller:  _.get($state.current, 'controller')
          },
          eventName: '$locationChangeSuccess'
        };
        $http.post('/analytics/state-transition/', analysisData);
      }
    });
  }
});
