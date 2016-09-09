/**
 *  Recursively interpolates/$compile's an object, returning a copy rather than modifying inplace
 *
 *  // Correct way to interpolate a ui-router $state object, within a run block
 *  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
 *   toState.$data = interpolateObject(toState.data, event.targetScope); // $state.$current.$data.forEach($.compile(data)($scope))
 *  });
 *
 *  @param  {Object} data   data to be interpolated
 *  @param  {Object} scope  angular scope object
 *  @return {Object}        cloned copy of data, with all nested values interpolated
 */
angular.module('edgefolio.common-components.routes.interpolateObject', []).factory('interpolateObject', function($interpolate) {
  var interpolateObject = function(data, scope) {
    var clone = _.clone(data); // _.deepClone not required as clone will be called on each recursion
    _.forIn(clone, function(value, key) {
      // NOTE: interpolateObject requires '{{', 'ng-' or 'ui-' for variable interpoleration to trigger
      if( typeof value === "string" && value.match(/\{\{|\bng-|\bui-/) ) {
        try {
          clone[key] = $interpolate(value)(scope)
        } catch(e) {
          console.error("interpolateObject():", e, ", value: ",value, ", key: ", key, ", clone: ", clone, " scope: ", scope);
        }
      }
      if( typeof value === "object" ) {
        clone[key] = interpolateObject(clone[key], scope)
      }
    });
    return clone;
  };
  return interpolateObject;
});
