var _             = require('lodash');
var concat        = require('gulp-concat-util');
var file          = require('gulp-file');
var glob          = require("glob");
var gulp          = require('gulp');
var inject        = require('gulp-inject');
var path          = require('path');
var replace       = require('gulp-regex-replace');
var tap           = require('gulp-tap');
var util          = require('../util/util.js');


_.forIn( global.config["image-precache"], function(config, appName) {
  // https://stackoverflow.com/questions/819336/how-to-preload-images-without-javascript
  // body:before {
  //    content: url(image-1.jpg) url(image-2.jpg);
  //    display: none;
  // }
  var starttag = "body:after {\n  display: none;\n  content:";
  var endtag   = ";\n}";

  gulp.task('image-precache-'+appName, function() {
    // COPYPASTE: includes-json.js, image-precache.js
    var filenames = _.flatten([
      util.extractIncludes(global.config["minify-js"][appName].extractIncludes),
      util.extractIncludes(global.config["inject"][appName].development.css),
      glob.sync(global.config.templates[appName].files)
    ]);
    var images = util.mapIncludes(util.extractIncludes(filenames)).images;

    // BUGFIX: for some reason "return file()" causes gulp to hang - solved by adding { src: true }
    file(config.filename, starttag + endtag, { src: true })
      .pipe(inject(gulp.src(images, {read: false}), {
        starttag: starttag,
        endtag:   endtag,
        transform: function (filepath, file, i, length) {
          var imageurl = global.config.mappings.fsToUrl(filepath);
          return " url('" + imageurl + "')";
        }
      }))
      .pipe(replace({regex:'content:;', replace:'content: "";'})) // failsafe for zero images
      .pipe(gulp.dest(global.dest[appName].production))
    ;
  });

  gulp.task('watch-image-precache-'+appName, function() {
    gulp.watch(_.flatten(config.files), ['image-precache-'+appName]);
  })
});
gulp.task('image-precache',       _(global.config["image-precache"]).keys().map(function(key) { return 'image-precache-'+key       }).value() );
gulp.task('watch-image-precache', _(global.config["image-precache"]).keys().map(function(key) { return 'watch-image-precache-'+key }).value() );

