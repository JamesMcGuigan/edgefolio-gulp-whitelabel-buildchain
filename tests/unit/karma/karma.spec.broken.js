//describe('testKarma: broken tests', function() {
//
//  // Broken Tests - due to ngMockE2E
//  describe("$httpBackend.passThrough", function() {
//    beforeEach(module('edgefolio.investor-app'));
//    beforeEach(module('ngMockE2E'));
//    beforeEach(inject(function(_$rootScope_, _$http_, _$timeout_, _$httpBackend_) {
//      $rootScope   = _$rootScope_;
//      $http        = _$http_;
//      $timeout     = _$timeout_;
//      $httpBackend = _$httpBackend_;
//    }));
//
//    it("$http.whenGET should work", function(done) {
//      $httpBackend.whenGET("/api/user/").respond(200, { "user_id": "123" });
//      $http.get("/api/user/").then(function(response) {
//        expect(response.data.user_id).equal("123");
//        done();
//      }, 100);
//      $httpBackend.flush();
//    });
//
//    it("$http.passThrough should work", function(done) {
//      $httpBackend.whenGET('/api/user/').passThrough();
//      $http.get("/api/user/").then(function(response) {
//        expect(response.data.user_id).equal("123");
//        done();
//      }, 100);
//      $httpBackend.flush();
//    });
//  });
//});
