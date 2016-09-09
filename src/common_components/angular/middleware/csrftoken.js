/**
 * @doc https://docs.angularjs.org/api/ngCookies/service/$cookies
 *      Up until Angular 1.3, $cookies exposed properties that represented the current browser cookie values.
 *      In version 1.4, this behavior has changed, and $cookies now provides a standard api of getters, setters etc.
 */
angular.module('edgefolio.common-components.routes.csrftoken', ['ngCookies']).run(function($http, $cookies) {
  $http.defaults.headers.common['X-CSRFToken'] = $cookies.get('csrftoken');
});
