'use strict';

// bootstrap
angular.module('edgefolio.manager-app', [
  'edgefolio.whitelabel',
  'edgefolio.common-components',
  'edgefolio.common-components.routes',
  'ngResource'
])
.constant("AngularModuleName", "edgefolio.manager-app");

angular.module('edgefolio.manager-app.templates', []);
