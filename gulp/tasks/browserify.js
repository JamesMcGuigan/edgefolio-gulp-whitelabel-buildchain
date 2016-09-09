var _          = require('lodash');
var browserify = require('gulp-browserify');
var execSync   = require('child_process').execSync;
var file       = require('gulp-file');
var gulp       = require('gulp');
var mkdirp     = require('mkdirp');
var rename     = require('gulp-rename');
var replace    = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var tap        = require('gulp-tap');
var path       = require('path');
var uglify     = require('gulp-uglify');


// Basic usage
gulp.task('browserify', function() {
  // BUG: Ansible: v3.edgefolio.com has unknown issue with browserify includes, so checking them into git
  var directory = path.resolve(global.config.browserify.output_dir);
  mkdirp.sync(directory, { mode: 0755 });

  _.each(global.config.browserify.modules, function(package_name) {
    var output_file   = path.join(directory, package_name+'.js');
    var minified_file = path.join(directory, package_name+'.min.js');

    execSync("./node_modules/.bin/browserify -r " + package_name + " -o " + output_file + ";");
    //execSync("./node_modules/.bin/uglifyjs      " + output_file  + " -o " + minified_file + ";");
  });
});
gulp.task('watch-browserify', _.noop);
