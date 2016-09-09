/**
 *  Remove any trailing slashes from ui-router URLs
 */
angular.module('edgefolio.common-components.routes.optionalTrailingSlashes.ui-router', ['ui.router']).config(function($urlMatcherFactoryProvider) {
  $urlMatcherFactoryProvider.strictMode(false);
});
