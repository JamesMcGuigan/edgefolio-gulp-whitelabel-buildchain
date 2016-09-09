var _               = require('lodash');
var concat          = require('gulp-concat-util');
var path            = require('path');
var gulp            = require('gulp');
var tap             = require('gulp-tap');
var file            = require('gulp-file');
var util            = require('../util/util.js');
var glob            = require("glob");


_.forIn( global.config["includes-json"], function(config, appName) {
  // task:       includes-json-investor-app
  // task:       includes-json-manager-app
  var lastFilenames = [];
  gulp.task('includes-json-'+appName, function () {
    // COPYPASTE: includes-json.js, image-precache.js
    var extractIncludes  = _.get(global.config, ["minify-js", appName, "extractIncludes"]);
    var extractCSS       = _.get(global.config, ["inject",    appName, "development.css"]);
    var extractTemplates = _.get(global.config, ["templates", appName, "files"]);

    var filenames = _.filter(_.flatten([
      extractIncludes  && util.extractIncludes(extractIncludes),
      extractCSS       && util.extractIncludes(extractCSS),
      extractTemplates && glob.sync(extractTemplates)
    ]));
    var images = util.mapIncludes(util.extractIncludes(filenames)).images;
    filenames = filenames.concat(images);

    if( lastFilenames.toString() === filenames.toString() ) {
      return; // same files do nothing
    } else {
      if( lastFilenames.length ) {
        console.info('includes-json-'+appName,
          '-', _.difference(lastFilenames, filenames),
          '+', _.difference(filenames,     lastFilenames));
      }
      lastFilenames = filenames;
      return file(config.output, JSON.stringify(util.mapIncludes(filenames), null, 2), { src: true })
        .pipe(gulp.dest(global.dest[appName].production));
    }
  });

  // task: watch-includes-json-investor-app
  // task: watch-includes-json-manager-app
  gulp.task('watch-includes-json-'+appName, function() {
    //[ 'src/common_components/common.includes.conf',
    //  'src/_secret/secret.includes.conf',
    //  'src/investor_app/investorapp.includes.conf',
    //  'src/css/common/edgefolio-libs.css',
    //  'src/css/common/edgefolio-base.css',
    //  'src/css/investor_app/edgefolio-investor-app.css' ]

    var watchFiles = _([
        _.get(global.config, ["minify-js", appName, "extractIncludes"]),
        _.get(global.config, ["inject",    appName, "development", "css"])
      ])
      .filter()
      .filter(function(filename) { return _.endsWith(filename, '.conf') || _.endsWith(filename, '.html'); })
      .value()
    ;
    gulp.watch( watchFiles, ['includes-json-'+appName]);
  });
});
gulp.task(      'includes-json', _(global.config["includes-json"]).keys().map(function(appName) { return       'includes-json-'+appName }).value() );
gulp.task('watch-includes-json', _(global.config["includes-json"]).keys().map(function(appName) { return 'watch-includes-json-'+appName }).value() );
