var app = angular.module('edgefolio.common-components.routes');

// Configure 404 controller
app.config(function($urlRouterProvider, stateHelperProvider) {
  stateHelperProvider.state({
    name:        'root.404',
    url:         '/404',
    templateUrl: '/assets/whitelabel/common_components/angular/components/404/404.html',
    data:        { message: 'Page Not Found: {{$location.path()}}' },
    children: [
      {
        name: 'fund_id',
        url:  '/fund_id',
        params: { 'fund_id': null },
        data: { message: "Invalid Hedge Fund ID: {{$stateParams.fund_id || 'null'}}" }
      },
      {
        name: 'management_company_id',
        url:  '/management_company_id',
        params: { 'management_company_id': null },
        data: { message: "Invalid Management Company ID: {{$stateParams.management_company_id || 'null'}}" }
      }
    ]
  });

  // @source https://www.snip2code.com/Snippet/151390/Show-Not-Found-%28404%29-page-without-changi
  $urlRouterProvider.otherwise(function($injector, $location) {
    $injector.invoke(['$state', function ($state) { $state.go('root.404', {}, { location: false }); }]);
    return true;
  });
});
