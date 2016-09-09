describe('testKarma', function() {
  var $q, $rootScope, $http, $timeout, $httpBackend, $state, $stateParams;

  describe('Maths', function() {
    it('1 + 1 = 2', function() {
      expect(1+1).to.equal(2);
    });
  });

  describe("async", function() {
    beforeEach(module('edgefolio.investor-app'));
    beforeEach(inject(function(_$rootScope_, _$http_, _$timeout_, _$httpBackend_, _$state_) {
      $rootScope   = _$rootScope_;
      $http        = _$http_;
      $timeout     = _$timeout_;
      $httpBackend = _$httpBackend_;
      $state       = _$state_;
    }));

    it("$timeout should work", function(done) {
      $timeout(function() {
        expect(2+2).equal(4);
        done();
      }, 100);
      $timeout.flush();
    });

    it("$http should work", function(done) {
      $httpBackend.whenGET("/api/user/testKarma/async").respond(200, { "user_id": "123" });
      $http.get("/api/user/testKarma/async").then(function(response) {
        expect(response.data.user_id).equal("123");
        done();
      }, 100);
      $httpBackend.flush();
    });
  });


  describe("$injector syntax", function() {
    beforeEach(module('edgefolio.investor-app'));
    beforeEach(inject(function($injector) {
      $q           = $injector.get('$q');
      $http        = $injector.get('$http');
      $rootScope   = $injector.get('$rootScope');
      $timeout     = $injector.get('$timeout');
      $httpBackend = $injector.get('$httpBackend');
      $state       = $injector.get('$state');
    }));

    it("$timeout should work", function(done) {
      $timeout(function() {
        expect(2+2).equal(4);
        done();
      }, 100);
      $timeout.flush();
    });

    it("$http should work", function(done) {
      $httpBackend.whenGET("/api/user/testKarma/$injector").respond(200, { "user_id": "123" });
      $http.get("/api/user/testKarma/$injector").then(function(response) {
        expect(response.data.user_id).equal("123");
        done();
      }, 100);
      $httpBackend.flush();
    });
  });

  describe("$stateParams should reset after test", function() {
    beforeEach(module('edgefolio.investor-app'));
    beforeEach(inject(function(_$stateParams_) {
      $stateParams = _$stateParams_;
    }));

    it("$stateParams should reset on beforeEach - setup", function() {
      $stateParams.fund_id    = 1;
      $stateParams.manager_id = 2;
    });

    it("$stateParams should reset on beforeEach - test", function() {
      expect(_.keys($stateParams).length).to.equal(0);
    });
  })
});
