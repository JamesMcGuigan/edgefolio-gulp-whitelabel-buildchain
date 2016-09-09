// $state.$current.$data is the scope interpolated version of $state.$current.data
angular.module('edgefolio.common-components.routes.interpolateScopeData', [
  'ui.router',
  'edgefolio.common-components.routes.interpolateObject'
]).run(function($rootScope, $state, interpolateObject) {
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    toState.$data = toState.$data || toState.data; // Avoid null pointer exceptions on $viewContentLoading
  });
  // resolve statements are processed after $stateChangeStart   and $viewContentLoading
  //                             but before $stateChangeSuccess and $viewContentLoaded
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    var data = getMergedScopeDataFromParents(toState);
    toState.$data = interpolateObject(data, event.targetScope); // $state.$current.$data.forEach($.compile(data)($scope))
  });

  // BUGFIX: $state.current.data contains merged data from parents, but $state.current.$data does not
  function getMergedScopeDataFromParents(toState) {
    var state = toState;
    var parents = [state];
    while( state.parent ) {
      parents.push(state.parent);
      state = state.parent
    }
    var mergedData = {};
    _.eachRight(parents, function(parent) { // start with root element and merge upwards
      _.merge(mergedData, parent.data);
    });
    return mergedData;
  }
});
