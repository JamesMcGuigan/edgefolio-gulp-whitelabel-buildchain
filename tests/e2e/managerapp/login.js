/**
 *  @api      http://angular.github.io/protractor/#/api
 *  @tutorial http://ramonvictor.github.io/protractor/slides/
 */

var _          = require("lodash");
var protractor = require('protractor');
var config     = require('../../protractor.conf.js').config;
var ptor;

// Note that Protractor based end-to-end tests cannot use this angular.bootstrap to bootstrap manually. They must use ngApp.
describe('manager-app', function() {
  describe('login', function() {
    it( 'should login to manager app', function() {
      browser.driver.get(config.baseUrl + "/login/");
      expect(browser.driver.findElement(By.css('.formDescription')).getText()).toMatch(/Login to your Edgefolio account/);
      browser.driver.findElement(By.name('username')).sendKeys("manager@wisemanagement.com");
      browser.driver.findElement(By.name('password')).sendKeys("manager");
      browser.driver.findElement(By.name('login')).click();
    });

    it('should automatically redirect to #/dashboard when location hash/fragment is empty', function() {
      // TODO: we need a way to create a new user, and then test both the new and existing user workflows
      expect(browser.getLocationAbsUrl()).toMatch(new RegExp("#/dashboard|#/account-setup/welcome"));
    });

    it( 'should show edgefolio logo on dashboard', function() {
      browser.get('/manager-app/#/dashboard');
      expect( browser.isElementPresent( by.css("header .header-logo img") ) ).toBe( true );
      expect( browser.isElementPresent( by.css("header .header-logo img invalid") ) ).toBe( false );
      expect( element(by.css("header .header-logo img")).getAttribute("src") ).toMatch('logo-header.png');
      expect( element(by.css("header .header-logo img")).getAttribute("alt") ).toMatch('Edgefolio');
    });
  });
});
