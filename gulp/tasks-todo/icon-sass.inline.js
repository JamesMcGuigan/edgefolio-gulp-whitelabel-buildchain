var _             = require('lodash');
var path          = require('path');
var concat        = require('gulp-concat-util');
var file          = require('gulp-file');
var glob          = require("glob");
var gulp          = require('gulp');
var inject        = require('gulp-inject');
var path          = require('path');
var replace       = require('gulp-regex-replace');
var tap           = require('gulp-tap');
var getImageSize  = require('image-size');
var util          = require('../util/util.js');

_.forIn( global.config["icon-sass"], function(config, appName) {
  var starttag = "//***** START autogenerated 'gulp icon-sass' *****//\n";
  var endtag   = "\n//***** END autogenerated 'gulp icon-sass' *****//";

  gulp.task('icon-sass-'+appName, function() {
    var images = config.files;

    return file(path.basename(config.output), starttag + endtag, { src: true })
      .pipe(inject(gulp.src(images, {read: true}), {
        starttag: starttag,
        endtag:   endtag,
        transform: function (filepath, file, i, length) {
          var url  = global.config.mappings.fsToUrl(filepath);
          filepath = global.config.mappings.urlToFs(url);

          var filebase = filepath.replace(/^.*\//, '').replace(/(-active|-inactive)?\.\w+$/, '');
          var rulename = ('image-' + filebase);

          var url  = global.config.mappings.fsToUrl(filepath);
          var dim  = getImageSize(filepath); // { height: 32, width: 32 }
          var cssrules = [
             "z-index: 1; display: inline-block;",
             "background-size: (" + dim.width  + 'px/2) (' + dim.height + 'px/2);',
             "width: (" + dim.width  + 'px/2); ' + "height: (" + dim.height + 'px/2);',
             "background-image: url("+url+");"
          ];
          if(      url.match(/-active\.\w+$/)   ) { return ""; }
          else if( url.match(/-inactive\.\w+$/) ) {
            cssrules.push("&:hover, &.selected { background-image: url("+ url.replace(/-inactive\./, '-active.') +"); }")
          }
          return "$"+rulename+"-width:  (" + dim.width  + "px/2);\n" +
                 "$"+rulename+"-height: (" + dim.height + "px/2);\n" +
                 '.'+rulename + " {\n  " + cssrules.join("\n  ") + "\n}\n\n";
        }
      }))
      .pipe(gulp.dest(path.dirname(config.output)))
    ;
  });

  // Need to restart gulp if new images are added
  gulp.task('watch-icon-sass-'+appName, function() {
    gulp.watch(_.flatten(config.files), ['icon-sass-'+appName]);
  });
});
gulp.task('icon-sass',       _(global.config["icon-sass"]).keys().map(function(key) { return 'icon-sass-'+key }).value() );
gulp.task('watch-icon-sass', _(global.config["icon-sass"]).keys().map(function(key) { return 'watch-icon-sass-'+key }).value() );