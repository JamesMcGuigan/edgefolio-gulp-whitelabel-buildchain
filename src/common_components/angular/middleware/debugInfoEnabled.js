/**
 * NOTE: Angular 1.3+ only - Disables angular debugging information as a performance optimization
 *
 * If you wish to debug an application with this information then you should open up a debug console in the browser then call this method directly in this console:
 * angular.reloadWithDebugInfo();
 *
 * @docs https://docs.angularjs.org/guide/production
 */
angular.module('edgefolio.common-components.routes').config(function($compileProvider) {
  if( window.GulpConfig && window.GulpConfig.environment === 'production' ) {
    $compileProvider.debugInfoEnabled(false);
  }
});
