var app = angular.module('edgefolio.investor-app.routes');

app.constant('StateDefaultParams', { fundgroup_id: null, fund_id: null, benchmark: null, timeframe: null, view: null });

app.config(function($provide, $urlRouterProvider, StateDefaultParams, GlobalConfig) {
  $provide.constant('InvestorAppStateConfigs', _.filter([
    {
      name: 'terms',
      url: '/terms',
      templateUrl: '/assets/whitelabel/common_components/angular/components/terms/terms.html',
      data: {
        'title': 'Terms and Conditions'
      }
    }
  ]))
});



// Configure root state, stateHelperProvider doesn't technically require parents to be declared first in execution order
// But $provide.constant() blocks do
app.config(function($provide, InvestorAppStateConfigs, StateDefaultParams) {
  // Auto-apply StateDefaultParams to all second level states
  _([InvestorAppStateConfigs]).flatten().each(function(state) {
    state.params = _.extend({}, StateDefaultParams, state.params);
  }).value();

  $provide.constant('RootStateConfig', {
    name:       'root',
    'abstract': true,
    resolve: {
      // userDetails is a cached duplicate from init.js
      userDetails: function(ApiDataService) {
        return ApiDataService.getUserDetails(); // Sets $rootScope.userDetails, ApiDataStore.userDetails
      }
    },
    data: {
    },
    views: {
      "":                   { template: "<ui-view/>"           },  // required, creates nested view
      "header-menu-top":    { template: "<menu-top-level/>"    }
    },
    children: _.flatten([
      InvestorAppStateConfigs
    ])
  });
});

// Configure root state, stateHelperProvider doesn't technically require parents to be declared first in execution order
app.config(function(stateHelperProvider, RootStateConfig) {
  stateHelperProvider.state(RootStateConfig, { siblingTraversal: true });
});
