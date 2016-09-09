//var child_process   = require('child_process'); // requires node v0.12
var _               = require('lodash');
var expect          = require('gulp-expect-file');
var file            = require('gulp-file');
var util            = require('../util/util.js');
var gulp            = require('gulp');
var inject          = require('gulp-inject');
var insert          = require('gulp-insert');
var path            = require('path');
var plumber         = require('gulp-plumber');
var runSequence     = require('run-sequence').use(gulp);
var sh              = require('shelljs');
var argv            = require('yargs').argv;


function transform(filepath, file, i, length) {
  var url = global.config.mappings.fsToUrl(filepath);
  if( url.match(/imageprecache\.css/) ) {
    return [
      "<script> // Wait for initial page to load before image precaching",
      "  $ && $(document).ready(function() {",
      "    var imageprecache = document.createElement('link');",
      "    imageprecache.setAttribute('rel',  'stylesheet');",
      "    imageprecache.setAttribute('href', '"+url+"');",
      "    document.head.appendChild(imageprecache);",
      "  }, 10000);", // 10 seconds should be enough to allow the investor app search page to fully load
      "</script>"
    ].join("\n");
  } else {
    switch (_.last(url.split('.'))) {
      case "scss": return "<link type='text/css' rel='stylesheet' href='" + url.replace(/css-scss/,'css').replace(/scss/, 'css') + "'/>";
      case "sass": return "<link type='text/css' rel='stylesheet' href='" + url.replace(/css-scss/,'css').replace(/sass/, 'css') + "'/>";
      case "css":  return "<link type='text/css' rel='stylesheet' href='" + url + "'/>";
      case "js":   return "<script type='text/javascript' src='" + url + "'></script>";
      case "conf": return "<!-- " + url + " -->";

      case "htm":
      case "html":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
      break;

      default:     console.warn("gulp-inject: unknown file extension: ", url); return "";
    }
  }
}



var injectConfig = {
  js: {
    starttag: "<!-- START gulp-inject javascript -->",
    endtag:   "<!-- END gulp-inject javascript -->",
    transform: transform
  },
  css: {
    starttag: "<!-- START gulp-inject css -->",
    endtag:   "<!-- END gulp-inject css -->",
    transform: transform
  }
};

_.forIn( global.config["inject"], function(environmentConfigs, appName) {
  var appNames     = _.keys(global.config["inject"]);
  var environments = _.keys(environmentConfigs);
  _.forIn( environmentConfigs, function(config, environment) {
    var fileTypes  = _(config).keys();
    var sourceHtml = global.config["copy-index"][appName].source;
    var outputHtml = path.join(global.dest[appName].production, global.config["copy-index"][appName].output);
    _.forIn( config, function(includeFiles, fileType) {
      var lastFiles = [];
      gulp.task('inject-'+environment+'-'+appName+'-'+fileType, function() {
        var files = util.extractIncludes(includeFiles);
        //files   = _.filter(files, function(filename) { return _.endsWith(filename, '.'+fileType); }); // shouldn't need to extension filter incoming list
        files     = _.map(files, global.config.mappings.absoluteFsToRelativeFs); // needed to make gulp-expect work

        files = _(util.mapIncludes(files)).values().flatten(true).value(); // sort files in [libs, code, init] order
        if( environment === 'production' ) {
          delete files.conf;
        }

        if( lastFiles.length && lastFiles.toString() !== files.toString() ) {
          console.info(
            'inject-'+environment+'-'+appName+'-'+fileType+': \t',
            '-removed ', _.difference(lastFiles, files),
            '+added ',   _.difference(files,lastFiles)
          );
        }
        lastFiles = files;
        return gulp.src(outputHtml)
                   .pipe(inject(
                     gulp.src(files, {read: false }).pipe(expect(files)),
                     injectConfig[fileType]
                   ))
                   .pipe(gulp.dest(global.dest[appName].production))
      });
      gulp.task( 'inject-'+environment+'-'+appName, function(callback) {
        // copy index.html, inject debug/development sources, then copy to index-unoptimized.html copy-index-unoptimized
        // runSequence prevents a race condition with copy-index and inject-*
        // _.uniq is valid as we don't need to reinject sources after copy-index-unoptimized if we are in development mode
        var tasks = _.uniq( _.flatten([
          "includes-json-"+appName,
          "copy-index-"+appName,

          // inject development sources into original index.html, then copy to index-unoptimized.html copy-index-unoptimized
          _(fileTypes).map(function(fileType) { return "inject-development-"+appName+"-"+fileType }).value(),
          "inject-gulpConfig-development-"+appName, // keep the gulpConfig timestamps the same
          "inject-whitelabel-html-development-"+appName,
          "copy-index-unoptimized-"+appName,

          // reinject environment mode sources back into the original index.html
          "inject-gulpConfig-"+environment+"-"+appName,
          "inject-whitelabel-html-"+environment+"-"+appName,
          _(fileTypes).map(function(fileType) { return "inject-"+environment+"-"+appName+"-"+fileType }).value(),
          callback
        ]));
        return runSequence.apply(this, tasks);
      });


      gulp.task('inject-gulpConfig-'+environment+'-'+appName, function() {
        var gulpConfig = [
          "window.GulpConfig = {",
          "  environment:  '" + environment + "',",
          "  appName:      '" + appName + "',",
          "  whitelabel:   '" + (argv.whitelabel) + "',",
          "  buildDate:    '" + (new Date()).toString() + "',",
          "  branch:       '" + sh.exec('git rev-parse --abbrev-ref HEAD', {silent:true}).output.toString().replace(/\s+/g,'') + "',",
          "  version:      '" + sh.exec('git rev-parse HEAD', {silent:true}).output.toString().replace(/\s+/g,'') + "'",
          "}"
        ];
        file('edgefolio-gulpConfig-'+appName+'.js', gulpConfig.join("\n"), { src: true })
            .pipe(gulp.dest(global.dest[appName].production))
        ;

        return gulp.src(outputHtml)
          .pipe(insert.transform(function(contents) {
            var output = contents.replace(
              /([ \t]*)(<!-- START gulp-inject GulpConfig -->)[\s\S]*?(<!-- END gulp-inject GulpConfig -->)/g,
              _.flatten([ "$1$2", "<script>", gulpConfig, "</script>", "$3" ]).join("\n$1")
            );
            return output;
          }))
          .pipe(gulp.dest(global.dest[appName].production))
        ;
      });

      gulp.task('inject-whitelabel-html-'+environment+'-'+appName, function() {
        if( argv.whitelabel ) {
          return gulp.src(outputHtml)
            .pipe(insert.transform(function(contents) {
              var output = contents.replace(
                /(<body.*?>)([\s\S]*)(<\/body>)/,
                '$1<div id="'+global.config.whitelabel.html.idName+'" class="'+global.config.whitelabel.html.className+'">$2</div>$3'
              );
              return output;
            }))
            .pipe(gulp.dest(global.dest[appName].production))
          ;
        }
      });
    });

    gulp.task('inject-gulpConfig-'+environment,       _(appNames).map(function(appName) { return 'inject-gulpConfig-'+environment+'-'+appName      }).value() );
    gulp.task('inject-whitelabel-html-'+environment,  _(appNames).map(function(appName) { return 'inject-whitelabel-html-'+environment+'-'+appName }).value() );
    gulp.task('inject-'+environment,                  _(appNames).map(function(appName) { return 'inject-'+environment+'-'+appName                 }).value() );

    gulp.task('watch-inject-'+environment, function() {
      // NOTE: You still need to restart gulp if you add a new includes.conf file and start editing it
      var files         = util.extractIncludes(_.values(config));
      var includesFiles = _(util.mapIncludes(files)).get('conf'); // watch for nested includes.conf files

      var watchFiles = _([
          global.config.gulpConfig,
          _.values(config),
          includesFiles,
          sourceHtml
        ])
        .flatten()
        .filter()
        .filter(function(filename) { return String(filename).match(/config|\.conf$|\.html$/, ''); })
        .unique()
        .value()
      ;
      gulp.watch(watchFiles, _.debounce(function() {
        return runSequence(['inject-'+environment]);
      }, 1000));
    });
  });
});
