angular.module('tableSort').config(function($provide) {
  $provide.decorator('tsWrapperDirective', function($delegate, $state) {
    var directive = $delegate[0];

    var controller = directive.controller[directive.controller.length-1];
    directive.controller[directive.controller.length-1] = function($scope) {
      controller.apply(this, arguments);

      // Persist $scope.sortExpression to $state.$current.data
      if( $state.$current.data.sortExpression ) {
        $scope.sortExpression = $state.$current.data.sortExpression;
      }
      $scope.$watch('sortExpression', function(sortExpression, oldSortExpression) {
        if( !_.matches(sortExpression)(oldSortExpression) ) {
          $state.$current.data.sortExpression = $scope.sortExpression;
        }
      });
      $scope.$watch(function() { return $state.$current.data.sortExpression }, function(sortExpression, oldSortExpression) {
        if( !_.matches(sortExpression)(oldSortExpression) ) {
          $scope.sortExpression = $state.$current.data.sortExpression;
        }
      });

      //// @unused
      //var addSortField = this.addSortField;
      //var setSortField = this.setSortField;
      //this.addSortField = function( sortexpr, element ) {
      //  var output = addSortField.apply(this, arguments);
      //  console.log("angular-tablesort-decorator.js:21:addSortField", "$scope.sortExpression", $scope.sortExpression);
      //  return output;
      //};
      //this.setSortField = function( sortexpr, element ) {
      //  var output = setSortField.apply(this, arguments);
      //  console.log("angular-tablesort-decorator.js:27:setSortField", "$scope.sortExpression", $scope.sortExpression);
      //  return output;
      //};
    };
    return $delegate;
  });
});