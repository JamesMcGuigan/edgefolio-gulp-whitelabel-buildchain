// Event Debug Logging
var app = angular.module('edgefolio.common-components.routes.eventConsoleLogging', ['ui.router']);
app.run(function($window, $rootScope, $state, $exceptionHandler, GlobalConfig) {
  var events = [
    '$stateChangeStart',      '$stateChangeSuccess', '$stateChangeError', // $rootScope events
    '$viewContentLoading',    '$viewContentLoaded',                       // $rootScope events
    '$locationChangeStart',   '$locationChangeSuccess'                    // $rootScope events
  ];
  events.forEach(function(eventName) {
    $rootScope.$on(eventName, function(event) {
      if( GlobalConfig.log.logEventNames ) {
        console.info(eventName); // just log names
      }
      if( GlobalConfig.log.logEvents ) {
        var params = _(arguments).indexBy(function(x,i){ return (i==0) ? "AccountSetupController - event: " : ", arg"+(i+1)+": "; }).pairs().flatten().value().concat("$state: ", $state.$current.name, ":", $state, ", event: ", event );
        console.info.apply(console, params);
      }
    });
  });

  // Render ui-router exceptions to console
  // @src https://github.com/bendrucker/angular-router-exception-handler/blob/master/src/forward.js
  $rootScope.$on('$routeChangeError', function (event, to, from, err) {
    $exceptionHandler(err, {
      to: to,
      from: from
    });
  });
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, err) {
    $exceptionHandler(err, {
      to: {
        state: toState,
        params: toParams
      },
      from: {
        state: fromState,
        params: fromParams
      }
    });
  });
});
