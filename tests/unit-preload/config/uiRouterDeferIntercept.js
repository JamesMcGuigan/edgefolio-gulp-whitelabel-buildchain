// This file disables angular routing before all tests
// BUGFIX: $httpBackend.flush(); triggers ui-router routing logic, which attempts to navigate to the homepage
// ERROR: 'ApiDataService::getCompanyDetails()', 'missing queryParams.management_company_id', Object{}, undefined
// ERROR: 'ApiDataService::getCompanyDetails()', 'missing queryParams.management_company_id', Object{fund_id: ''}, undefined

angular.module("edgefolio.common-components").config(function($urlRouterProvider) {
  $urlRouterProvider.deferIntercept();
});

//// NOTE: To restore url routing in tests
//angular.module("edgefolio.common-components").run(function($urlRouter) {
//  $urlRouter.sync();   // sync current url to router
//  $urlRouter.listen(); // undo $urlRouterProvider.deferIntercept();
//});