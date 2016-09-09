//var compass       = require('gulp-compass');
var _               = require('lodash');
var asyncQ          = require('async-q');
var autoprefixer    = require('gulp-autoprefixer');
var cached          = require('gulp-cached');
var filter          = require('gulp-filter');
var fs              = require('fs');
var glob            = require('glob');
var cssDeduplicator = require('../util/css-deduplicator.js');
var gulp            = require('gulp');
var gulpForeach     = require('gulp-foreach');
var gulpif          = require('gulp-if');
var intercept       = require('gulp-intercept');
var merge           = require('merge-stream');
var mkdirp          = require('mkdirp');
var notify          = require('gulp-notify');
var path            = require('path');
var plumber         = require('gulp-plumber');
var rename          = require('gulp-rename');
var replace         = require('gulp-regex-replace');
var sass            = require('gulp-sass');
var sassImporter    = require('../util/sass-importer.js');
var sassInheritance = require('gulp-sass-inheritance');
var sourcemaps      = require('gulp-sourcemaps');
var tap             = require('gulp-tap');
var touch           = require("touch");
var watch           = require('gulp-watch');
var argv            = require('yargs').argv;



// ruby-compass clean compile times:           ~1min
// libsass (written in C) clean compile times: ~10s - order of magnitude faster, but requires removing compass as a dependency
var compileSass = function(files, environment, options) {
  options = _.extend({
    cached:          false,
    sassInheritance: false,
    log:             false
  }, options);

  try { mkdirp.sync(global.config.sass.cssDir, { mode: 0755 }); } catch(e) {}


  return gulp.src(files)
    .pipe(gulpif(options.cached, cached('sass')))
    .pipe(filter(function(file) { return !file.path.match(/\.old\./); }))
    // BUG: sassInheritance fails to detect dependencies of common_components/angular/components/notifications/notifications-dropdown.scss - fixed by safareli/gulp-sass-inheritance#patch-1
    // BUG: sassInheritance fails to detect changes in sassImporter.getExistingFilepaths() - fixed by gulp.task('watch-sass-'+environment+'-whitelabel')
    .pipe(gulpif(options.sassInheritance, sassInheritance({
      loadPaths: _.pluck(global.dest, 'sass'), // runs faster without loadPaths
      dir: global.config.sass.sassDir,
      debug: true
    })))
    // .pipe(dedupe()) // sassInheritance may return duplicates - fixed by safareli/gulp-sass-inheritance#patch-1
    //.pipe(tap(function(file,t) { options.log && console.info('SASS:', file.path) }))
    //.pipe(tap(function(file,t) { options.log && console.info('SASS:', file.contents.toString()) }))
    .pipe(plumber({
      errorHandler: function() {
        try {
          // Send error to growl notification center with gulp-notify
          var args = Array.prototype.slice.call(arguments);
          notify.onError({
            title:   "SASS Compile Error",
            message: "<%= error.message %>"
          }).apply(this, args);
        } catch(e) {}

        // Keep gulp from hanging on this task
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpForeach(function(stream, file){
      return stream.pipe(sass({
          debugInfo:       false,
          errLogToConsole: true,
          includePaths:    global.config.sass.sassDir,
          outputStyle:     ( environment === "production" ) ? "compressed" : "expanded",
          sourceComments:  ( environment === "production" ) ? false : true, // sourceComments for Firefox FireCompass in development and staging modes only

          // TODO: sassInheritance doesn't currently trigger watches for non-standard injected files
          // NOTE: importer required in order to get sass variables to correctly inject
          importer: sassImporter.importer(global.config.whitelabel.sass.importerOptions, file)
      }))
    }))
    .pipe(autoprefixer({
      browsers: global.config.autoprefixer,
      cascade:  ( environment === "production" ) ? false : false
    }))
    //// STATUS: Currently Disabled - custom code doesn't handle @media queries, potentually leading to subtle bugs
    ////                            - also seems to have no effect on production compressed css filesize
    //.pipe(intercept(function(file) {
    //  return cssDeduplicator(file);
    //}))
    .pipe(sourcemaps.write("./", {}))
    .pipe(gulp.dest(function(file) {
      if( file.base.match(global.config.sass.sassDir) ) {
        return file.base.replace(global.config.sass.sassDir, global.config.sass.cssDir);
      } else {
        file.base = global.config.sass.sassDir;
        return global.config.sass.cssDir;
      }
    }));
};



_.each(["development", "staging", "production"], function(environment) {
  gulp.task('sass-'+environment, ['whitelabel-css'], function() {
    // cached: false reduces initial build time from about 21s to 17s
    return compileSass(global.config.sass.files, environment, { cached: false, sassInheritance: false });
  });

  var watchedFilePaths = [];
  gulp.task('watch-sass-'+environment+'-whitelabel', function() {
    _(global.config.sass.files)
      .map(function(glob_pattern) {
        return glob.sync(glob_pattern, { read: false });
      })
      .flatten(true)
      .unique()
      .each(function(filepath) {
        var watchpaths = sassImporter.getExistingFilepaths(filepath);
        watchpaths = _.reject(watchpaths, function(watchpath) {
          return _.endsWith(watchpath, filepath); // remove self to prevent infinite loop
        });
        if( watchpaths.length ) {
          gulp.watch(watchpaths, function() {
            // sassInheritance doesn't catch whitelabel injections,
            // if any watchpaths is edited, touch filepath to trigger gulp.watch(global.config.sass.files) and compile
            touch.sync(filepath);
          });
        }
      })
      .value()
    ;
  });

  gulp.task('watch-sass-'+environment, ['watch-sass-'+environment+'-whitelabel'], function() {
    gulp.watch(global.config.sass.files, function(file) {
      watchedFilePaths.push(file.path);
      return gulp.start('watch-sass-'+environment+'-compile'); // Add a task wrapper to get sass compile timings
    });
  });

  gulp.task('watch-sass-'+environment+'-compile', function() {
    // NOTE: safareli/gulp-sass-inheritance#patch-1 outputs input files as well
    watchedFilePaths = _(watchedFilePaths).flatten().unique().value();
    var output = compileSass(watchedFilePaths, environment, { cached: false, sassInheritance: true,  log: true })
    watchedFilePaths.length = 0;
    return output;
  });
});

