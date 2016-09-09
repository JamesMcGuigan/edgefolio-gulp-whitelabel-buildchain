var _         = require('lodash');
var copy      = require('gulp-copy');
var fs        = require('fs-extra');
var glob      = require('glob');
var gulp      = require('gulp');
var intercept = require('gulp-intercept');
var mkdirp    = require('mkdirp');
var path      = require('path');
var rename    = require('gulp-rename');
var replace   = require('gulp-replace');
var rimraf    = require('gulp-rimraf');
var tap       = require('gulp-tap');
var touch     = require('gulp-touch');
var util      = require('../util/util');
var argv      = require('yargs').argv;


var WhitelabelFilesystem = {
  task: function(input_glob) {
    var dest_src_mapping = WhitelabelFilesystem.mapGlobToDest(input_glob);
    WhitelabelFilesystem.createHardlinks(dest_src_mapping);
    WhitelabelFilesystem.updateMappingFile(dest_src_mapping);
    return dest_src_mapping;
  },
  mapGlobToDest: function(input_glob) {
    var input_filepaths = _([input_glob])
      .flatten(true)
      .filter()
      .map(function(input_glob) {
        return glob.sync(input_glob, { read: false })
      })
      .flatten()
      .unique()
      .filter(function(filepath) {
        return fs.lstatSync(filepath).isFile(); // don't symlink directories
      })
      .value()
    ;
    var src_filepaths = _(input_filepaths)
      .groupBy(function(filepath) {
        var filepath_mappings = global.config.whitelabel.filesystem.src_mapping(filepath);
        var src_filepath      = util.firstExistingFilepath(filepath_mappings);
        return src_filepath;
      })
      .keys()
      .value()
    ;
    var dest_src_mapping = _(src_filepaths)
      .indexBy()
      .mapKeys(function(filepath) {
        filepath = global.config.whitelabel.filesystem.dest_mapping(filepath);
        filepath = filepath.replace(
          global.config.whitelabel.filesystem.input_dir,
          global.config.whitelabel.filesystem.output_dir
        );
        return filepath;
      })
      .omit(function(src_filepath, dest_filepath) {
        return global.config.whitelabel.filesystem.dest_reject(dest_filepath);
      })
      .value()
    ;
    return dest_src_mapping;
  },
  createHardlinks: function(dest_src_mapping) {
    _.forIn(dest_src_mapping, function(src_filepath, dest_filepath) {
      fs.ensureDirSync(path.dirname(dest_filepath));
      try { fs.unlinkSync(dest_filepath); } catch( e ) {} // throws if dest_file doesn't exist
      fs.linkSync(src_filepath, dest_filepath);           // Needs hard link - nginx doesn't resolve symlinks
    });
  },
  updateMappingFile: function(dest_src_mapping) {
    fs.ensureDirSync(path.dirname(global.config.whitelabel.filesystem.mapping_file));

    try {
      var mapping_file_json = JSON.parse(fs.readFileSync(global.config.whitelabel.filesystem.mapping_file, 'utf8'));
    } catch(e) {}

    var output_json = _.extend({}, mapping_file_json, dest_src_mapping);
    fs.writeFileSync(global.config.whitelabel.filesystem.mapping_file, JSON.stringify(output_json, null, 2), 'utf8');
  }
};

/**
 * Hard link merges ```src/images/_default/ + src/images/'+argv.whitelabel+'/ -> src/whitelabel/images/```
 * TODO: convert to symlinks and update nginx { location assets/whitelabel/images { disable_symlinks off }}
 *
 * @param {Array|String} global.config.whitelabel.images.input_glob - ordered glob argument to copy
 * @param {String}       global.config.whitelabel.images.output_dir - destination directory
 */
gulp.task('whitelabel-filesystem', function() {
  WhitelabelFilesystem.task(global.config.whitelabel.filesystem.input_glob);
});

// Nginx etags need a filesystem level touch after each update for new file to be pushed to browser
gulp.task('watch-whitelabel-filesystem', function() {
  return gulp.watch(global.config.whitelabel.filesystem.input_glob, function(file) {
    var dest_src_mapping = WhitelabelFilesystem.task(file.path);

    // If dest_src_mapping is empty, rerun the entire task
    if( !_.size(dest_src_mapping) ) {
      dest_src_mapping = WhitelabelFilesystem.task(global.config.whitelabel.filesystem.input_glob);
    }
    //console.info("whitelabel-filesystem.js:24:task", "input_glob, dest_src_mapping", file.path, dest_src_mapping);
  })
});

//// TODO: Remove: Old watch implementation
//gulp.task('watch-whitelabel-filesystem', function() {
//  // Only rerun whitelabel-filesystem if new files have been added
//  var seen = _(global.config.whitelabel.filesystem.input_glob)
//    .map(function(pattern) {
//      return glob.sync(pattern);
//    })
//    .flatten(true)
//    .map(function(filepath) {
//      return path.resolve(filepath);
//    })
//    .unique()
//    .indexBy()
//    .mapValues(_.constant(true))
//    .value()
//  ;
//  gulp.watch(global.config.whitelabel.filesystem.input_glob, function(file) {
//    if( !util.firstExistingFilepath([file.path]) ) {
//      seen[file.path] = false;
//    }
//    if( !seen[file.path] ) {
//      seen[file.path] = true;
//      return gulp.start('whitelabel-filesystem'); // Add a task wrapper to get sass compile timings
//    }
//  });
//});
