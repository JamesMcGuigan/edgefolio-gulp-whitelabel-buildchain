var _             = require('lodash');
var fs            = require('fs');
var autoprefixer  = require('gulp-autoprefixer');
var compass       = require('gulp-compass');
var gulp          = require('gulp');
var notify        = require('gulp-notify');
var path          = require('path');
var plumber       = require('gulp-plumber');
var rename        = require('gulp-rename');
var replace       = require('gulp-regex-replace');
var sass          = require('gulp-sass');
var sourcemaps    = require('gulp-sourcemaps');
var tap           = require('gulp-tap');
var gulpFilter    = require('gulp-filter');

var watch           = require('gulp-watch');
var sassInheritance = require('gulp-sass-inheritance');
var cached          = require('gulp-cached');
var gulpif          = require('gulp-if');
var filter          = require('gulp-filter');
var merge           = require('merge-stream');
var runSequence     = require('run-sequence').use(gulp);


// ruby-compass clean compile times:           ~1min
// libsass (written in C) clean compile times: ~10s - order of magnitude faster, but requires removing compass as a dependency

var compileSassIsWatching = false;
var compileSass = function(config, key, environment, options) {
  options = _.extend({
    cached:       false,
    sassInheritance: false
  },options);

  if( global.dest[key].css && !fs.existsSync(global.dest[key].css) ) { fs.mkdirSync(global.dest[key].css); }

  return gulp.src(config.files)
    .pipe(gulpFilter(['**/*', '!**/*.old.scss']))// ignore .old.scss files
    .pipe(gulpif(options.cached,          cached('sass')))
    .pipe(gulpif(options.sassInheritance, sassInheritance({ dir: './src/', debug: true })))
    .pipe(filter(function(file) { return !/\/_/.test(file.path) || !/^_/.test(file.relative); })) // filter out internal imports (folders and files starting with "_" )
    .pipe(tap(function(file,t) { console.log('sass-'+environment+'-'+key, file.path); }))
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
    .pipe(sass({
      includePaths:   [global.dest[key].sass],
      outputStyle:    ( environment === "production" ) ? "compressed" : "expanded",
      sourceComments: ( environment === "production" ) ? false : true // sourceComments for Firefox FireCompass in development and staging modes only
    }))
    .pipe(autoprefixer({
      browsers:       global.config.autoprefixer,
      cascade:        ( environment === "production" ) ? false : false
    }))
//    .pipe(sourcemaps.write("./_sourcemaps/", {}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(function(file) {
//      if( String(file.base).match(/css-scss/) ) {
        return String(file.base).replace(/css-scss/,'css');
//      } else {
//        return null
//      }
    }));
//     .pipe(gulp.dest(global.dest[key].css))
};

//// @unused - using libsass written in C, rather than ruby-compass which is much slower to compile
//var compileCompass = function(config, key, environment) {
//  config = _.clone(config);
//  if (environment === "production") {
//    config.files = _([config.files]).flatten().map(function (path) { return path.replace('/\*\*/', '/') }).value(); // top level css only
//  }
//  var compassConfig = {
//    config_file:  path.join(__dirname, '..', '..', 'config-autoprefixer.rb'),
//    css:          global.dest[key].css,
//    sass:         global.dest[key].sass,
//    style:        ( environment === "production" ) ? "compressed" : "expanded",
//    comments:     ( environment === "production" ) ? false : true,
//    lineComments: ( environment === "production" ) ? false : true,  // firecompass support
//    sourcemap:    true                                              // chrome developer tools support
//  };
//  return gulp.src(config.files)
//    //.pipe(tap(function(file,t) { console.log('sass-production-'+key, file.path); }))
//    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
//    //.pipe(sass({ compass: true,  outputStyle: 'nested', sourceComments: null }))  // sourceComments: 'normal' for Firefox FireCompass, sourceComments: 'map' for Chrome
//    .pipe(compass(compassConfig))
//    .pipe(gulp.dest(global.dest[key].css))
//};



_.each(["development", "staging", "production"], function(environment) {
  _.forIn( global.config["sass"], function(config, key) {
    gulp.task('sass-'+environment+'-'+key, function() {
      return compileSass(config, key, environment);
    });
    gulp.task('sass-'+environment+'-'+key+'-cached', function() {
      return compileSass(config, key, environment, { cached: true });
    });
    gulp.task('sass-'+environment+'-'+key+'-sassInheritance', function() {
      return compileSass(config, key, environment, { sassInheritance: true });
    });
    gulp.task('watch-sass-'+environment+'-'+key, function() {
      watch(config.files, function() {
        runSequence([
          'sass-'+environment+'-'+key+'-cached',
          'sass-'+environment+'-'+key+'-sassInheritance'
        ]);
      });
//      gulp.watch(_.flatten([global.config["watch-sass"][key], global.config["gulpConfig"]]), ['sass-'+environment+'-'+key]);
    });
  });
  gulp.task(      'sass-'+environment, _(global.config["sass"]).keys().map(function(key) { return       'sass-'+environment+'-'+key }).value() );
  gulp.task('watch-sass-'+environment, _(global.config["sass"]).keys().map(function(key) { return 'watch-sass-'+environment+'-'+key }).value() );
});
