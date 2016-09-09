/**
 *  Runs e2e selenium tests
 *  TODO: Convert e2e tests to karma/mocha/chai rather than jasmine to match unit tests
 *
 *  Command Line:
 *    gulp test     --host=https://edgefolio-development.com
 *    gulp test-e2e --chrome=0 --firefox
 */
var _          = require("lodash");
var fs         = require("fs");
var path       = require("path");
var yargs      = require('yargs');
var protractor = require('protractor');
var jasmineReporters = require('jasmine-reporters');

// gulp command line args imported via protractor({ args: _.filter(process.argv, function(arg) { return _.startsWith(arg, '-'); }) }))
// TODO: Switch to --browsers=chrome,firefox,safari,opera
yargs.default('host', 'http://edgefolio-local.com');
yargs.default('chrome',    true);  // gulp test --chrome=0 to disable
yargs.default('firefox',   false); // works!
//yargs.default('safari',    false); // browserName (safari) is not supported with directConnect.
//yargs.default('opera',     false); // browserName (opera) is not supported with directConnect.
//yargs.default('ie',        false); // Can not load "Internet Explorer", it is not registered!
//yargs.default('phantomjs', false); // browserName (phantomjs) is not supported with directConnect.
console.info("protractor.conf.js", "argv", yargs.argv);


exports.config = {
  debug:   false,
  baseUrl: yargs.argv['host'],
  //seleniumAddress:   'http://localhost:4444/wd/hub',  // assumes "webdriver-manager start" running in a seperate process
  chromeDriver: _.find([                // need to use OS specific global chromedriver on PATH
    '/usr/bin/chromedriver',            // ubuntu / vagrant
    '/usr/local/bin/chromedriver'       // OSX
    // TODO: Add windows paths
    //'../node_modules/.bin/chromedriver' // npm - recompiled to the last OS to run npm install
  ], fs.existsSync),
  seleniumServerJar: '../node_modules/selenium/lib/runner/selenium-server-standalone-2.20.0.jar',

  directConnect:     true,  // if true, connect directly to chrome, without selenium (new alias for chromeOnly)
  allScriptsTimeout: 60000, // max 60s per test, running e2e tests in vagrant is slow

  specs: [
    'e2e/preload/**/*.js',
    'e2e/**/*.js'
  ],
  exclude: [],
  multiCapabilities: _.filter([
    yargs.argv['chrome']  && { 'browserName': 'chrome'  }, // 'chromeOptions': { 'args': ['show-fps-counter=true'] }  },
    yargs.argv['firefox'] && { 'browserName': 'firefox' }, // Firefox partially crashes during execution
    yargs.argv['safari']  && { 'browserName': 'safari'  }, // browserName (safari) is not supported with directConnect.
    yargs.argv['opera']   && { 'browserName': 'opera'   }, // browserName (opera) is not supported with directConnect.
    yargs.argv['ie']      && { 'browserName': 'internet explorer' }, // Can not load "Internet Explorer", it is not registered!
    yargs.argv['phantomjs'] && {
      // All tests run but fail when using phantomjs
      'browserName': 'phantomjs',
      'phantomjs.binary.path': require('phantomjs').path,
      'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
    }
  ]),
  framework: 'jasmine2',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000, // needs to be larger than config.allScriptsTimeout and jasmine.DEFAULT_TIMEOUT_INTERVAL
    showColors: true,
    isVerbose:  true,
    includeStackTrace: true,
    print: function () {} // remove default dot reporter
  },
  onPrepare: function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 75000; // needs to be larger than config.allScriptsTimeout

    var SpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));

    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      filePrefix: 'e2e-test',
      savePath:   'tests/_output/jenkins/'
    }));

    var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
    jasmine.getEnv().addReporter(new Jasmine2HtmlReporter({
      savePath: __dirname + '/_output/screenshots/',
      screenshotsFolder: 'images',
      takeScreenshots: true,
      takeScreenshotsOnlyOnFailures: false,
      filePrefix: 'e2e-report'
    }));

    // Unused options
    //browser.manage().timeouts().pageLoadTimeout(40000);
    //browser.manage().timeouts().implicitlyWait(25000);
    //browser.ignoreSynchronization = true;     // for non-angular page
  }
};
if( !exports.config.chromeDriver ) {
  console.error("protractor.conf.js", "exports.config.chromeDriver not found: sudo npm install --global chromedriver");
}

process.on('exit', function(code) {
  try {
    browser.quit()
  } catch(e) {}
});
