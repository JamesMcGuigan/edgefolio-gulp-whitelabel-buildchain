'use strict';

// bootstrap
angular.module('edgefolio.investor-app', [
  'edgefolio.whitelabel',
  'edgefolio.common-components',
  'edgefolio.common-components.routes',
  'ngResource'
])
.constant("AngularModuleName", "edgefolio.investor-app");

angular.module('edgefolio.investor-app.templates', []);
