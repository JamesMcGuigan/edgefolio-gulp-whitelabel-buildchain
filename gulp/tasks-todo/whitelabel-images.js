var _         = require('lodash');
var fs        = require('fs-extra');
var copy      = require('gulp-copy');
var gulp      = require('gulp');
var path      = require('path');
var rename    = require('gulp-rename');
var replace   = require('gulp-replace');
var rimraf    = require('gulp-rimraf');
var tap       = require('gulp-tap');
var path      = require('path');
var mkdirp    = require('mkdirp');
var intercept = require('gulp-intercept');
var argv      = require('yargs').argv;

/**
 * Hard link merges ```src/images/_default/ + src/images/'+argv.whitelabel+'/ -> src/whitelabel/images/```
 * TODO: convert to symlinks and update nginx { location assets/whitelabel/images { disable_symlinks off }}
 *
 * @param {Array|String} global.config.whitelabel.images.input_glob - ordered glob argument to copy
 * @param {String}       global.config.whitelabel.images.output_dir - destination directory
 */
gulp.task('whitelabel-images', function() {
  return gulp.src(global.config.whitelabel.images.input_glob, { read: false })
    .pipe(intercept(function(file) {
      var dest_file = file.path.replace(file.base, String(global.config.whitelabel.images.output_dir));
      var dest_dir  = path.resolve(path.dirname(dest_file));

      if( fs.lstatSync(file.path).isFile() ) { // don't symlink directories
        fs.ensureDirSync(dest_dir);
        try { fs.unlinkSync(dest_file); } catch( e ) {} // throws if dest_file doesn't exist
        fs.linkSync(file.path, dest_file); // Needs hard link - nginx doesn't resolve symlinks
      }
    }));
});

gulp.task('watch-whitelabel-images', function() {
  gulp.watch(global.config.whitelabel.input_glob, ['whitelabel-images']);
});
