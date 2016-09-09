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

// ruby-compass clean compile times:           ~1min
// libsass (written in C) clean compile times: ~10s - order of magnitude faster, but requires removing compass as a dependency
var compileSass = function(config, key, environment) {
  if( !fs.existsSync(global.dest[key].css) ) { fs.mkdirSync(global.dest[key].css); }

  return gulp.src(config.files)
    .pipe(gulpFilter(['**/*', '!**/*.old.scss']))// ignore .old.scss files
    //.pipe(tap(function(file,t) { console.log('sass-'+environment+'-'+key, file.path); }))
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
    .pipe(sourcemaps.write("./_sourcemaps/", {}))
    .pipe(gulp.dest(global.dest[key].css))
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
    gulp.task('watch-sass-'+environment+'-'+key, ['watch-sass-'+environment]);
  });
  gulp.task('sass-'+environment, _(global.config["sass"]).keys().map(function(key) { return 'sass-'+environment+'-'+key }).value() );

//  //  gulp.task('watch-sass-'+environment, _(global.config["sass"]).keys().map(function(key) { return 'watch-sass-'+environment+'-'+key }).value() );
//  gulp.task('watch-sass-'+environment, function() {
//    var watch     = require('gulp-watch');
//    var sassGraph = require('gulp-sass-graph');
//    var glob = _(global.config["sass"]).values().pluck('files').value();
//    console.log("sass.js:94:", "glob", glob);
//
//
//    return watch(glob, {emitOnGlob: false, name: "sass"})
//                .pipe(tap(function(file,t) { console.log('sass-'+environment, file.path); }))
//                .pipe(sassGraph('src/'))
//                .pipe(tap(function(file,t) { console.log('sassGraph-'+environment, file.path); }))
//                .pipe(sass({loadPath: 'src/'}))
//                .pipe(notify('Sass compiled <%= file.relative %>'))
//                .pipe(gulp.dest('src/production/css/'))
//  });
  gulp.task('watch-sass-'+environment, function() {
    var glob = _(global.config["sass"]).values().pluck('files').value();
    var watch     = require('gulp-watch');
    return gulp.watch(glob, ['watch-sass-'+environment+'-compile']);
  });
  gulp.task('watch-sass-'+environment+'-compile', function() {
    global.isWatching = true;
    var glob = _(global.config["sass"]).values().pluck('files').value();
    var watch     = require('gulp-watch');
    var gulp            = require('gulp');
    var sassInheritance = require('gulp-sass-inheritance');
    var sass            = require('gulp-sass');
    var cached          = require('gulp-cached');
    var gulpif          = require('gulp-if');
    var filter          = require('gulp-filter');

    console.log("sass.js:118:", "__dirname", path.join(__dirname, '../../src/'));

    if( !fs.existsSync('src/production/css/') ) { fs.mkdirSync('src/production/css/'); }
      return gulp.src(glob)
       //filter out unchanged scss files, only works when watching
       .pipe(gulpif(global.isWatching, cached('sass')))

       //find files that depend on the files that have changed
       .pipe(tap(function(file,t) { console.log('BEFORE: sassGraph-'+environment, file.path); }))
       .pipe(sassInheritance({ dir: 'src/', debug: true }))


       //filter out internal imports (folders and files starting with "_" )
       .pipe(gulpFilter(['**/*', '!**/*.old.scss']))// ignore .old.scss files
       .pipe(filter(function(file) {
         return !/\/_/.test(file.path) || !/^_/.test(file.relative);
       }))
       .pipe(tap(function(file,t) { console.log('AFTER: sassGraph-'+environment, file.path); }))

       //process scss files
       .pipe(sass())

       //save all the files
       .pipe(sourcemaps.init())
       .pipe(sass({
         includePaths:   _.pluck(global.dest, 'sass'),
         outputStyle:    ( environment === "production" ) ? "compressed" : "expanded",
         sourceComments: ( environment === "production" ) ? false : true // sourceComments for Firefox FireCompass in development and staging modes only
       }))
       .pipe(autoprefixer({
         browsers:       global.config.autoprefixer,
         cascade:        ( environment === "production" ) ? false : false
       }))
       .pipe(sourcemaps.write("./_sourcemaps/", {}))
       .pipe(gulp.dest(function(file) {
         console.log("sass.js:157:", "String(file.base).replace(/css-scss/,'css')", String(file.base).replace(/css-scss/, 'css'));

         return String(file.base).replace(/css-scss/,'css');
       }))
  })
});



