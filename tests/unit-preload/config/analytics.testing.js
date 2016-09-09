// Disable Analytics for tests
window.__insp = [];
window.ga     = function() {};

if( angular.module('angulartics') ) {
  angular.module('angulartics').config(function($analyticsProvider) {
    $analyticsProvider.developerMode(true);
  });
}

try {
  if( angular.module('edgefolio.common-components.analytics') ) {
    angular.module('edgefolio.common-components.analytics').requires = ['angulartics']; // disable analytics
  }
} catch(e) {}
