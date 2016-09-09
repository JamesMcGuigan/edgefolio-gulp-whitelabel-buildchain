var _              = require('lodash');
var gulp           = require('gulp');
var gulpIgnore     = require('gulp-ignore');
var karmaServer    = require('karma').Server;
var path           = require('path');
var runSequence    = require('run-sequence').use(gulp);
var tap            = require('gulp-tap');
var getKarmaConfig = require(path.resolve(global.config.test.config.unit)).getKarmaConfig;

/**
 *  NOTES:
 *  - karma() executes a separate node process
 *  - _.extend(karmaConfig, {}) is required to to preserve process.argv flags from gulp
 *  - getKarmaConfig() reads production/edgefolio-managerapp-includes.json, thus must be called after includes-jsob task
 *  - path.resolve() makes filepath relative to webapps directory where gulp is run, returning absolute path
 *
 * RUN:
 *   Runs headless phantomjs by default
 *   Opera Browser needs to be manually closed before tests are run,
 *         also set startup options to "Open the start page" rather "continue where I left off" to avoid multiple test tabs
 *
 *  Additional browsers via:
 *    gulp test            --chrome --firefox --opera --safari --ie
 *    gulp test-unit       --chrome --firefox --opera --safari --ie
 *    gulp watch-test-unit --chrome --firefox --opera --safari --ie
 *
 *  Available Server Modes/Outputs:
 *    gulp test-unit       --ansible
 *    gulp test-unit       --teamcity
 */
gulp.task('test-unit-raw', function(done) {
  var karmaConfig = getKarmaConfig();

  new karmaServer({
    configFile: global.config.mappings.relativeFsToAbsoluteFs(global.config.test.config.unit),
    singleRun:  true
  }, done).start();
});

gulp.task('watch-test-unit-raw', function(done) {
  var karmaConfig = getKarmaConfig();

  new karmaServer({
    configFile: global.config.mappings.relativeFsToAbsoluteFs(global.config.test.config.unit),
    singleRun:  false
  }, done).start();
});

gulp.task(      'test-unit', function(callback) { runSequence('development', 'templates', 'inject-test', 'test-unit-raw', callback); });
gulp.task('watch-test-unit', function(callback) { runSequence('test-unit', 'watch-development', 'watch-templates', 'watch-inject-test', 'watch-test-unit-raw', callback); });


//// includes-json doesn't list staging or production includes
//gulp.task(      'test-unit', ['test-unit-development']);
//gulp.task('watch-test-unit', ['watch-test-unit-development']);
//
//gulp.task(      'test-unit-staging',     function(callback) { runSequence( 'staging',          'test-unit-raw',        callback); });
//gulp.task('watch-test-unit-staging',     function(callback) { runSequence(['watch-staging',    'watch-test-unit-raw'], callback); });
//
//gulp.task(      'test-unit-production',  function(callback) { runSequence( 'production',       'test-unit-raw',        callback); });
//gulp.task('watch-test-unit-production',  function(callback) { runSequence(['watch-production', 'watch-test-unit-raw'], callback); });

