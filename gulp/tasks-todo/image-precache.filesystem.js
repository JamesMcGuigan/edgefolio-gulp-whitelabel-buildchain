var _             = require('lodash');
var file          = require('gulp-file');
var gulp          = require('gulp');
var inject        = require('gulp-inject');
var path          = require('path');
var replace       = require('gulp-regex-replace');
var tap           = require('gulp-tap');


_.forIn( global.config["image-precache"], function(config, key) {
  // https://stackoverflow.com/questions/819336/how-to-preload-images-without-javascript
  // body:before {
  //    content: url(image-1.jpg) url(image-2.jpg);
  //    display: none;
  // }
  var starttag = "body:after {\n  display: none;\n  content:";
  var endtag   = ";\n}";

  gulp.task('image-precache-'+key, function() {
    return file(config.filename, starttag + endtag, { src: true })
      .pipe(inject(gulp.src(_.flatten(config.files), {read: false}), {
        starttag: starttag,
        endtag:   endtag,
        transform: function (filepath, file, i, length) {
          var imageurl = global.config.mappings.fsToUrl(filepath);
          return " url('" + imageurl + "')";
        }
      }))
      .pipe(replace({regex:'content:;', replace:'content: "";'})) // failsafe for zero images
      .pipe(gulp.dest(global.dest[key].production))
    ;
  })

  gulp.task('watch-image-precache-'+key, function() {
    gulp.watch(_.flatten(config.files), ['image-precache-'+key]);
  })
});
gulp.task('image-precache',       _(global.config["image-precache"]).keys().map(function(key) { return 'image-precache-'+key       }).value() );
gulp.task('watch-image-precache', _(global.config["image-precache"]).keys().map(function(key) { return 'watch-image-precache-'+key }).value() );

