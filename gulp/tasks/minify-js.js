var _               = require('lodash');
var concat          = require('gulp-concat-util');
var path            = require('path');
var fs              = require('fs');
var gulp            = require('gulp');
var inject          = require('gulp-inject');
var ngAnnotate      = require('gulp-ng-annotate');
var rename          = require('gulp-rename');
var sourcemaps      = require('gulp-sourcemaps');
var tap             = require('gulp-tap');
var uglify          = require('gulp-uglify');
var expect          = require('gulp-expect-file');
var extractIncludes = require('../util/util.js').extractIncludes;
var mapIncludes     = require('../util/util.js').mapIncludes;


_.forIn( global.config["minify-js"], function(config, appName) {
  var includeTypes  = _.keys(config.output); // == ["libs","code","init"];


  _.each(includeTypes, function(includeType) {
    // task: concat-js-manager-app-libs
    // task: concat-js-manager-app-code
    // task: concat-js-manager-app-init
    // task: concat-js-investor-app-libs
    // task: concat-js-investor-app-code
    // task: concat-js-investor-app-init
    gulp.task('concat-js-'+appName+'-'+includeType, function () {
      var includeFiles = mapIncludes(extractIncludes(config.extractIncludes))[includeType];
      includeFiles = _.map(includeFiles, global.config.mappings.absoluteFsToRelativeFs); // needed to make gulp-expect work

      return gulp.src(includeFiles)
        .pipe(expect(includeFiles))
        //.pipe(tap(function(file,t) { console.info('concat-js-'+appName+'-'+includeType, file.path); }))
        //.pipe(sourcemaps.init())
        .pipe(concat.header("// start file: <%= file.path %>\n"))
        .pipe(concat.footer(";\n"))
        .pipe(ngAnnotate())
        .pipe(concat(config.output[includeType]))
        //.pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(global.dest[appName].production))
    });

    // task: minify-js-manager-app-libs
    // task: minify-js-manager-app-code
    // task: minify-js-manager-app-init
    // task: minify-js-investor-app-libs
    // task: minify-js-investor-app-code
    // task: minify-js-investor-app-init
    gulp.task('minify-js-'+appName+'-'+includeType, ['concat-js-'+appName+'-'+includeType], function () {
      var includeFiles = mapIncludes(extractIncludes(config.extractIncludes))[includeType];

      return gulp.src(path.join(global.dest[appName].production, config.output[includeType]))
        //.pipe(tap(function(file,t) { console.log('minify-js-'+key+'-'+includeType, file.path); }))
        //.pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify({mangle: false}))
        .pipe(rename({extname: '.min.js'}))
        //.pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(global.dest[appName].production))
    });

    // task: watch-concat-js-investor-app-libs
    // task: watch-concat-js-investor-app-code
    // task: watch-concat-js-investor-app-init
    // task: watch-concat-js-manager-app-libs
    // task: watch-concat-js-manager-app-code
    // task: watch-concat-js-manager-app-init
    // task: watch-minify-js-investor-app-libs
    // task: watch-minify-js-investor-app-code
    // task: watch-minify-js-investor-app-init
    // task: watch-minify-js-manager-app-libs
    // task: watch-minify-js-manager-app-code
    // task: watch-minify-js-manager-app-init
    _.each(["concat-js", "minify-js"], function(taskName) {
      gulp.task('watch-'+taskName+'-'+appName+'-'+includeType, function() {
        var includeFiles = mapIncludes(extractIncludes(config.extractIncludes))[includeType];
        var watchFiles   = _.flatten([config.extractIncludes, includeFiles])

        var watcher = gulp.watch(watchFiles, [taskName+'-'+appName+'-'+includeType]);

        // Add a dynamic watch for files in config.extractIncludes
        gulp.watch(config.extractIncludes, function() {
          var newIncludeFiles = mapIncludes(extractIncludes(config.extractIncludes))[includeType];
          var addedFiles      = _.difference(newIncludeFiles, includeFiles);
          var removedFiles    = _.difference(includeFiles, newIncludeFiles);
          includeFiles        = newIncludeFiles; //

          if( addedFiles.length || removedFiles.length ) {
            watcher.add(addedFiles);      // added files
            watcher.remove(removedFiles); // removed files
            gulp.start(taskName+'-'+appName+'-'+includeType); // manually trigger gulp task
          }
        });
      });
    });
  });

  // task:       concat-js-investor-app
  // task:       concat-js-manager-app
  // task:       minify-js-investor-app
  // task:       minify-js-manager-app
  // task: watch-concat-js-investor-app
  // task: watch-concat-js-manager-app
  // task: watch-minify-js-investor-app
  // task: watch-minify-js-manager-app
  gulp.task(      'concat-js-'+appName, _(includeTypes).map(function(includeType) { return       'concat-js-'+appName+'-'+includeType; }).value() );
  gulp.task(      'minify-js-'+appName, _(includeTypes).map(function(includeType) { return       'minify-js-'+appName+'-'+includeType; }).value() );
  gulp.task('watch-concat-js-'+appName, _(includeTypes).map(function(includeType) { return 'watch-concat-js-'+appName+'-'+includeType; }).value() );
  gulp.task('watch-minify-js-'+appName, _(includeTypes).map(function(includeType) { return 'watch-minify-js-'+appName+'-'+includeType; }).value() );
});

gulp.task(          'concat-js', _(global.config["minify-js"]).keys().map(function(key) { return           'concat-js-'+key }).value() );
gulp.task(          'minify-js', _(global.config["minify-js"]).keys().map(function(key) { return           'minify-js-'+key }).value() );
gulp.task(    'watch-concat-js', _(global.config["minify-js"]).keys().map(function(key) { return     'watch-concat-js-'+key }).value() );
gulp.task(    'watch-minify-js', _(global.config["minify-js"]).keys().map(function(key) { return     'watch-minify-js-'+key }).value() );
