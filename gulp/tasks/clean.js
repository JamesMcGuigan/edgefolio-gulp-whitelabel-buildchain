var _      = require('lodash');
var gulp   = require('gulp');
var rimraf = require('gulp-rimraf');
var fs     = require('fs');


_.forIn( global.config.clean, function(files, key) {
  gulp.task('clean-'+key, function() {
    return gulp.src(_(files).flatten().value()).pipe(rimraf());
  })
});
gulp.task('clean', _(global.config.clean).keys().map(function(key) { return 'clean-'+key }).value() );

