var _              = require('lodash');
var gulp           = require('gulp');
var gulpIgnore     = require('gulp-ignore');
var tap            = require('gulp-tap');
var path           = require('path');
var protractor     = require("gulp-protractor").protractor;

gulp.task('test-e2e', ['includes-json'], function() {
  // path.resolve() makes filepath relative to webapps directory where gulp is run, returning absolute path
  var protractorConfig = require(path.resolve(global.config.test.config.e2e)).config;
  var baseDir     = path.resolve(path.dirname(global.config.test.config.e2e)); // path
  var specs       = _.map(protractorConfig.specs,   function(file) { return path.join(baseDir, file); } );
  var exclude     = _.map(protractorConfig.exclude, function(file) { return path.join(baseDir, file); } );
  var files       = _.flatten(specs, _.map(exclude, function(s) { return '!'+String(s); }));

  return gulp.src(files)
    .pipe(tap(function(file,t) { console.log('test-e2e', file.path); }))
    .pipe(protractor({
      configFile: global.config.test.config.e2e,
      args: _.filter(process.argv, function(arg) { return _.startsWith(arg, '-'); })
    }))
    .on('error', function(e) { throw e; })
});

gulp.task('watch-test-e2e', ['includes-json'], function() {
  var protractorConfig = require(path.resolve(global.config.test.config.e2e)).config;
  var baseDir     = path.resolve(path.dirname(global.config.test.config.e2e)); // path
  var specs       = _.map(protractorConfig.specs,   function(file) { return path.join(baseDir, file); } )
  var exclude     = _.map(protractorConfig.exclude, function(file) { return path.join(baseDir, file); } )

  var files = _.flatten(specs, _.map(exclude, function(s) { return '!'+String(s); }));

  return gulp.watch(files, ['test-e2e']);
});
