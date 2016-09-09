angular.module('edgefolio.enterprise.documentation.routes.widgets', ['ui.router.stateHelper']).config(function(stateHelperProvider) {
  stateHelperProvider.state({
    name:    'root.examples.widgets',
    abstract: true,
    template: "<ui-view/>",  // required, creates nested view
    children: [
      {
        name: 'selectbox',
        url: '/selectbox',
        data: {
          title: "Selectbox"
        },
        templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.example.html'
      },
      {
        name: 'fundgroupMenu',
        url: '/fundgroupMenu',
        data: {
          title: "Fundgroup Menu"
        },
        templateUrl: '/assets/whitelabel/enterprise/widgets/fundgroupMenu/fundgroupMenu.example.html'
      },
      {
        name: 'baseWidget',
        url: '/baseWidget',
        data: {
          title: "Base Widget"
        },
        templateUrl: '/assets/whitelabel/enterprise/widgets/baseWidget/baseWidget.example.html'
      }
    ]
  }, { siblingTraversal: true });
})
.run(function($state) {
  // Fix .parent and .children links in all states
  _.each($state.get(), function(parentState) {
    _.each($state.get(), function(childState) {
      if( childState.name.match(new RegExp('^'+parentState.name+'\\.\\w+$')) ) {
        childState.parent    = parentState;
        parentState.children = _([parentState.children, childState]).flatten(true).unique().value();
      }
    })
  })
})
