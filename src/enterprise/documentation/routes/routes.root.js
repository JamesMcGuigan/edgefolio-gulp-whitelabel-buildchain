/**
 * Configure root state, stateHelperProvider don't technically require parents to be declared first in execution order
 * But $provide.constant() blocks do
 */

angular.module('edgefolio.enterprise.documentation.routes', [
  'ui.router', 'ui.router.stateHelper',
  'edgefolio.enterprise.documentation.routes.404',
  'edgefolio.enterprise.documentation.routes.widgets',
  'edgefolio.enterprise.documentation.routes.graphs'
])
.config(function(stateHelperProvider) {
  stateHelperProvider.state({
    name: 'root',
    abstract: true,
    data: {},
    views: {
      "":                { template: "<ui-view/>"        },  // required, creates nested view
      "header-menu-top": { template: "<menu-top-level/>" }
    },
    children: [
      {
        name: 'home',
        url: '',
        templateUrl: '/assets/whitelabel/enterprise/documentation/html/menu.html',
        data: {
          'title': 'Edgefolio Enterprise'
        }
      },
      {
        name: 'terms',
        url: '/terms',
        templateUrl: '/assets/whitelabel/common_components/angular/components/terms/terms.html',
        data: {
          'title': 'Terms and Conditions'
        }
      },
      {
        name: 'examples',
        url: '/examples',
        data: {
          'title': 'Examples'
        },
        onChange: function(options) {
          console.log("routes.examples: $state.$current.data.onChange::onChange()", arguments);
        },
        template: "" +
          "<div>" +
            "<div ng-include='\"/assets/whitelabel/enterprise/documentation/html/menu.html\"'/>" +
            "<br/>" +
            "<h2 ng-bind='$state.$current.data.title' style='margin-top:0'/>" +
            "<hr style='margin: 2em 0'/>" +
            "<ui-view/>" +
          "</div>",
        children: []
      }
    ]
  }, { siblingTraversal: true });
});
