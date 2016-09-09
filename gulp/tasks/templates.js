var _             = require('lodash');
var async         = require('async');
var gulp          = require('gulp');
var tap           = require('gulp-tap');
var templateCache = require('gulp-angular-templatecache');
//var minifyHTML    = require('gulp-minify-html');
var htmlMin       = require('gulp-htmlmin'); // https://github.com/kangax/html-minifier

_.forIn( global.config.templates, function(config, key) {
  gulp.task('templates-'+key, function(done) {
    //console.log('templates.js - ', key, config );
    return gulp.src(config.files)
      //.pipe(tap(function(file,t) { console.log('templates-'+key, file.path, config); }))

      // NOTE: htmlMin breaks self-closing <edgefolio-widget/> tags - don't minify
      //.pipe(minifyHTML({ empty: true, cdata: true, comments: false, conditionals: true, spare: true, quotes: false, loose: true }))
      //.pipe(htmlMin({ removeComments: true, collapseWhitespace: true, conservativeCollapse: true }))
      //.pipe(htmlMin({}))

      .pipe(templateCache({ standalone: config.standalone, module: config.module, root: config.root, filename: config.filename }))
      .pipe(gulp.dest(global.dest[key].production))
  });
  gulp.task('watch-templates-'+key, function() {
    gulp.watch(config.files, ['templates-'+key]);
  })
});
gulp.task('templates',       _(global.config.templates).keys().map(function(key) { return 'templates-'+key       }).value() );
gulp.task('watch-templates', _(global.config.templates).keys().map(function(key) { return 'watch-templates-'+key }).value() );
