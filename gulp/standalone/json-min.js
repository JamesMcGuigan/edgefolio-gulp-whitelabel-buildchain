var _           = require('lodash');
var gulp        = require('gulp');
var jsonmin     = require('gulp-jsonmin');
var path        = require('path');
var plumber     = require('gulp-plumber');
var rename      = require('gulp-rename');
var newer       = require('gulp-newer');
var filter      = require('gulp-filter');
var tap         = require('gulp-tap');
var clean       = require('gulp-clean');


_.forIn( global.dest, function(config, appName) {
  gulp.task('json-min-'+appName, function () {
    return gulp.src(global.dest[appName].root + '/**/*.json')
      .pipe(plumber({ errorHandler: function(error) { console.log('ERROR json-min: ', this._transformState.writechunk.relative);  this.emit('end'); } }))
      .pipe(filter(['**/*', '!**/*.min.json']))
      .pipe(newer({ dest: global.dest[appName].root, ext: '.min.json' }))
      .pipe(jsonmin())
      .pipe(tap(function(file,t) { console.log('json-min: ', file && file.path); }))
      .pipe(rename({extname: '.min.json'}))
      .pipe(gulp.dest(global.dest[appName].root))
  });
  gulp.task('watch-json-min-'+appName, function() {
    return gulp.watch(global.dest[appName].root + '/**/*!(.min).json', ['json-min-'+appName]);
  });
  gulp.task('clean-json-min-'+appName, function () {
    return gulp.src(global.dest[appName].root + '/**/*.min.json', { read: false })
      .pipe(newer({ dest: global.dest[appName].root, map: function(file) { return file.replace(/(\.min)+\.json/, '.json')  }}))
      .pipe(tap(function(file,t) { console.log('clean-json-min: ', file.path); }))
      .pipe(clean({force: true }))
  });
});
gulp.task('json-min',       _(global.dest).keys().map(function(appName) { return 'json-min-'+appName;       }).value() );
gulp.task('watch-json-min', _(global.dest).keys().map(function(appName) { return 'watch-json-min-'+appName; }).value() );
gulp.task('clean-json-min', _(global.dest).keys().map(function(appName) { return 'clean-json-min-'+appName; }).value() );