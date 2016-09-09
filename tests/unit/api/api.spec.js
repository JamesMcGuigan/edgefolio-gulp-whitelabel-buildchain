describe('api module definition', function() {

  var $q, $http, $rootScope, $timeout, $httpBackend, $state;
  beforeEach(module('edgefolio.investor-app'));
  beforeEach(inject(function($injector) {
    $q           = $injector.get('$q');
    $http        = $injector.get('$http');
    $rootScope   = $injector.get('$rootScope');
    $timeout     = $injector.get('$timeout');
    $httpBackend = $injector.get('$httpBackend');
    $state       = $injector.get('$state');
  }));

  it("module definition should work", function(done) {
    $httpBackend.when('GET', '/api/user/').respond(200, readJSON('tests/json/ApiDataStore.v2.json').userDetails);
    $http.get("/api/user/").then(function(response) {
      expect(response.data).to.deep.equal(readJSON('tests/json/ApiDataStore.v2.json').userDetails);
      expect(response.data).to.deep.equal({
        country_code: null,
        last_login: '2015-07-10T11:05:49.136669Z',
        management_company_id: '110',
        city: null,
        redirect_url: '/dashboard/',
        date_joined: '2015-06-29T16:19:00.250973Z',
        company_name: 'Clairinvest',
        email: 'manager@wisemanagement.com',
        last_name: 'Manager',
        first_name: 'Wiser'
      });
      done();
    });
    $httpBackend.flush();
  });
});
