var _      = require('lodash');
var gulp   = require('gulp');
var path   = require('path');
var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');


_.forIn( global.config["copy-index"], function(config, key) {
  gulp.task('copy-index-'+key, function() {
    var stream;
    if( config.output ) {
      stream = gulp.src(config.source).pipe(rename(config.output)).pipe(gulp.dest(global.dest[key].production));
    }
    return stream || gulp.src(config.source);
  });
  // Copies an fully compiled version of the index file to the debug location
  // This is for production only, called after inject, so no watch statement here
  gulp.task('copy-index-unoptimized-'+key, function() {
    var stream;
    if( config.output && config.unoptimized ) {
      stream = gulp.src(path.join(global.dest[key].production, config.output))
                   .pipe(rename(config.unoptimized))
                   .pipe(gulp.dest(global.dest[key].production));
    }
    return stream || gulp.src(config.source);
  });
  gulp.task('watch-copy-index-'+key, function() {
    return gulp.watch(global.dest[key].root+"/index.html", ['copy-index-'+key]);
  });
  gulp.task('clean-index-'+key, function() {
    var outputHtml = path.join(global.dest[key].production, config.output);
    return gulp.src(outputHtml).pipe(rimraf());
  });
});
gulp.task('clean-index',            _(global.config["copy-index"]).keys().map(function(key) { return 'clean-index-'+key            }).value() );
gulp.task('copy-index',             _(global.config["copy-index"]).keys().map(function(key) { return 'copy-index-'+key             }).value() );
gulp.task('copy-index-unoptimized', _(global.config["copy-index"]).keys().map(function(key) { return 'copy-index-unoptimized-'+key }).value() );
gulp.task('watch-copy-index',       _(global.config["copy-index"]).keys().map(function(key) { return 'watch-copy-index-'+key       }).value() );
