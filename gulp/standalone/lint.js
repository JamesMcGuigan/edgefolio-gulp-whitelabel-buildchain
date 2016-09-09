var _        = require('lodash');
var gulp     = require('gulp');
var tap      = require('gulp-tap');
var jshint   = require('gulp-jshint');
var eslint   = require('gulp-eslint');
var sassLint = require('gulp-sass-lint');
var stylish  = require('jshint-stylish');
var plumber  = require('gulp-plumber');
var util     = require('../util/util.js');
var sh       = require('shelljs');
var path     = require('path');
var yargs    = require('yargs');
var runSequence = require('run-sequence').use(gulp);

/**
 * Lint SCSS files
 * @conf webapps/.sass-lint.jsl
 */
gulp.task('lint-sass', function() {
  console.info("lint.js:20:", "global.config[\"sass\"].files", global.config["sass"].files);

  return gulp.src(global.config["sass"].files)
    .pipe(plumber({
      errorHandler: function() {
        try {
          // Send error to growl notification center with gulp-notify
          var args = Array.prototype.slice.call(arguments);
          notify.onError({
            title:   "SASS Lint Error",
            message: "<%= error.message %>"
          }).apply(this, args);
        } catch(e) {}

        // Keep gulp from hanging on this task
        this.emit('end');
      }
    }))
    .pipe(sassLint({
      'config': path.join(__dirname, '../../.sass-lint.yml')
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

/**
 * Check JavaScript sytax with JSHint
 * @conf webapps/.jshintrc
 */
gulp.task('lint-jshint', ['jshint']);
gulp.task('jshint', function() {
  var include_files = _(global.config["minify-js"]).values().pluck('extractIncludes').flatten().value();
  var includes = util.mapIncludes(util.extractIncludes(include_files));
  var jsFiles = _.flatten([includes.code, includes.init]);

  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

/**
 * Requires /usr/local/bin/jsl installed - http://www.javascriptlint.com/
 * This is the preferred version of javascript lint
 *
 * @conf webapps/.jsl.conf
 */
gulp.task('lint-js', ['jsl']);
gulp.task('jsl', function() {
  var include_files = _(global.config["minify-js"]).values().pluck('extractIncludes').flatten().value();
  var includes = util.mapIncludes(util.extractIncludes(include_files));
  var jsFiles = _.flatten([includes.code, includes.init]);
  jsFiles = _.reject(jsFiles, function(filename) { return filename.match(/production|vendor|browserify/); });

  if( !sh.which('jsl') ) {
    console.error([
      "#### ERROR: jsl dependency is not installed locally - please run the following code to download and install:",
      "```",
      "cd ~/Downloads/",
      "wget http://www.javascriptlint.com/download/jsl-0.3.0-mac.tar.gz",
      "tar -xvzf jsl-0.3.0-mac.tar.gz",
      "cp jsl-0.3.0-mac/jsl /usr/local/bin/",
      "chmod a+x /usr/local/bin/jsl",
      "```"
    ].join("\n"))
  } else {
    return gulp.src(jsFiles)
      .pipe(tap(function(file,t) {
        var command = "jsl -conf " + path.join(__dirname, '../../.jsl.conf') + " -process '" + file.path + "'";

        console.info(command);
        var output = sh.exec(command, {silent: true}).output.toString() + "\n";
        if( !_.contains(output, "0 error(s), 0 warning(s)")) {
          console.info(output);
        }
      }))
  }
});

gulp.task('lint-eslint', ['eslint']);
gulp.task('eslint', function () {
  var include_files = _(global.config["minify-js"]).values().pluck('extractIncludes').flatten().value();
  var includes = util.mapIncludes(util.extractIncludes(include_files));
  var jsFiles = _.flatten([includes.code, includes.init]);


  return gulp.src(jsFiles)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint({
      fix:   !!yargs.argv.fix,
      quiet: !!yargs.argv.quiet
    }))
    .pipe(eslint.result(function (result) {
      // Called for each ESLint result.
      if( yargs.argv.log ) {
        console.log(result.errorCount + 'e:' + result.warningCount + 'w - ' + result.filePath);
      }
    }))
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())

});



gulp.task('lint', function(callback) { runSequence('lint-sass', 'lint-jshint', 'lint-js', 'eslint', callback); });
