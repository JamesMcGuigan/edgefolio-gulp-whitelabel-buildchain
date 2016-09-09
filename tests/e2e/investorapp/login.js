/**
 *  @api      http://angular.github.io/protractor/#/api
 *  @tutorial http://ramonvictor.github.io/protractor/slides/
 */

var _          = require("lodash");
var protractor = require('protractor');
var config     = require('../../protractor.conf.js').config;
var ptor;

// Note that Protractor based end-to-end tests cannot use this angular.bootstrap to bootstrap manually. They must use ngApp.
describe('investor-app', function() {
  describe('login', function() {
    it( 'should login to investor app', function() {
      browser.driver.get(config.baseUrl + "/login/");
      expect(browser.driver.findElement(By.css('.formDescription')).getText()).toMatch(/Login to your Edgefolio account/);
      browser.driver.findElement(By.name('username')).sendKeys("investor@wiseinvestments.com");
      browser.driver.findElement(By.name('password')).sendKeys("investor");
      browser.driver.findElement(By.name('login')).click();
    });

    it('should automatically redirect to /account-setup/investment-company/ or #/search when location hash/fragment is empty', function() {
      // TODO: we need a way to create a new user, and then test both the new and existing user workflows
      // NOTE: landing page is not always angular driver,
      //       browser.driver.getCurrentUrl() gets the url from seleium
      //       browser.getLocationAbsUrl() gets url from angular $location and fails on non angular pages
      expect(browser.driver.getCurrentUrl()).toMatch(new RegExp("/account-setup/investment-company/|#/search"));
    });

    it( 'should show edgefolio logo on homepage', function() {
      browser.get('/investor-app/#/search');
      expect( browser.isElementPresent( by.css("header .header-logo img") ) ).toBe( true );
      expect( element(by.css("header .header-logo img")).getAttribute("src") ).toMatch('logo-header.png');
    });
  });
});
