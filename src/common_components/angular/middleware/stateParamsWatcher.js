/**
 *  Remove any trailing slashes from ui-router URLs
 */
angular.module('edgefolio.common-components.routes.stateParamsWatcher', ['ui.router']).run(function(
  $timeout, $rootScope, $state, $stateParams
) {

  var lastStateParams = {};
  $rootScope.$watch(function() { return [$state.params, $stateParams]; }, _.debounce(function() {
    if( !$state.$current['abstract'] ) {
      var newStateParams = _({}).extend($state.params, $stateParams)
        .mapValues(function(value) { return _.isNumber(value) ? String(value) : value; }) // 456 !== "456"
        .value();

      if( !_.isEqual(newStateParams, lastStateParams) ) {
        $state.go('.', {}, { notify: false })
      }
      lastStateParams = newStateParams;
    }
  }, 100), true); // 100ms should be long enough for any setTimeouts to complete
});
