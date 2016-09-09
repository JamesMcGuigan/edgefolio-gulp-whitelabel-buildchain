"use strict";

/**
 * Inspired by https://github.com/FlyingDR/node-sass-importer/blob/master/src/node-sass-importer.js
 *
 * Implicitly maps SASS @import statements
 * TODO: sassInheritance doesn't currently trigger watches for non-standard injected files -
 */
var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var asyncQ = require('async-q');
var Q      = require('q');
var argv   = require('yargs').argv;


var sassImporter = module.exports = {
  defaultImporterOptions: {
    options: {
      excludedPaths: [ // @deprecated
        '/assets/',
        '/vendor/',
        '/bower_components/'
      ],
      roots: [],
      paths: [
        '{url}'
      ],
      filePrefixes: [
        '',
        '_'
      ],
      fileExtensions: [
        '',
        '.scss'
      ]
    },
    stacks: [],
    loaded: []
  },

  /**
   * // NOTE: importOnceFilter() needs new instance of importer() + seen variable for every root file
   * .pipe(gulpForeach(function(stream, file) {
   *   return stream.sass({
   *     importer: require('../util/sass-importer.js').importer)(global.config.whitelabel.sass.importerOptions)
   *   }))
   * })
   */
  importer: function(options, rootFile) {
    options = _.cloneDeep(options);
    var seen = {};

    /**
     * @param {String}   url    @import path as defined in scss file
     * @param {String}   prev   filepath where @import statement is defined
     * @param {Function} done   callback when done: { file: 'filepath' } | { content: 'importContents' }
     */
    return function importer(url, prev, done) {
      var runtime = _.merge({}, sassImporter.defaultImporterOptions, { options: options });
      var possibleFilepaths = sassImporter.getPossibleFilepaths(url, prev, runtime);
      var filteredFilepaths = sassImporter.importOnceFilter(possibleFilepaths, seen, prev);
      filteredFilepaths = possibleFilepaths;

      sassImporter.importFiles(filteredFilepaths, function(importFiles) {
        done(importFiles);
      });
    }
  },
  /**
   * Removes any values in importFiles that exist as keys in seen, and updates seen
   * @param {Array<String>}    importFiles
   * @param {Object.<Boolean>} seen
   */
  importOnceFilter: function(importFiles, seen, prev) {
    seen = seen || {};

    var importOnceFiles = _.reject(importFiles, function(importFile) {
      return !!seen[importFile];
    });
    _.forEach(importOnceFiles, function(importFile) {
      seen[importFile] = true;
    });
    return importOnceFiles;
  },


  /**
   * @param {String}  url      @import path as defined in scss file
   * @param {String}  prev     filepath where @import statement is defined
   * @param {Object}  runtime  _.merge({}, sassImporter.defaultImporterOptions, { options: this.options.importerOptions });
   */
  getPossibleFilepaths: function(url, prev, runtime) {
    runtime = runtime || { options: global.config.whitelabel.sass.importerOptions };

    var filepaths = [];

    runtime.options.paths.forEach(function(urlReplacement) { // runtime.options.paths as outer loop
      runtime.options.roots.forEach(function(rootDir) {
        runtime.options.filePrefixes.forEach(function(filePrefix) {
          runtime.options.fileExtensions.forEach(function(fileExtension) {
            var urlReplaced = url;

            if( _.isString(urlReplacement) ) {
              urlReplaced = urlReplacement.replace(/\{url\}/g, url);
            }

            var urlComponents = urlReplaced.split('/');
            var urlFilename   = urlComponents.pop();
            if( !_.startsWith(urlFilename, filePrefix) ) {
              urlFilename = filePrefix + urlFilename;
            }
            // BUGFIX: remove fileExtension if it ends up in middle of string after mutliple replacements
            if( _.contains(urlFilename, fileExtension) && !_.endsWith(urlFilename, fileExtension) ) {
              urlFilename = urlFilename.replace(fileExtension, ''); // remove fileextension if already exists
            }
            if( !_.endsWith(urlFilename, fileExtension) ) {
              urlFilename = urlFilename + fileExtension;
            }
            var urlDir  = urlComponents.join('/');
            var prevDir = prev && path.dirname(prev).replace(new RegExp('^('+process.cwd()+')?/?('+rootDir+')/?'), '') || '';

            var resolveComponents = [ process.cwd(), rootDir, prevDir, urlDir, urlFilename ];
            var resolveNormalized = path.normalize( path.join.apply(path, resolveComponents));

            if( _.isFunction(urlReplacement) ) {
              resolveNormalized = urlReplacement(resolveNormalized);
            }

            filepaths.push(resolveNormalized);
          });
        });
      });
    });
    return _.unique(filepaths);
  },
  getExistingFilepaths: function(url, prev, runtime) {
    runtime = runtime || { options: global.config.whitelabel.sass.importerOptions };

    var possibleFilepaths = sassImporter.getPossibleFilepaths(url, prev, runtime);
    var existingFilepaths = _.filter(possibleFilepaths, function(filepath) {
      try {
        fs.accessSync(filepath, fs.R_OK); // throws if file not exists
        return true;
      } catch(e) {
        return false;
      }
    });
    return existingFilepaths;
  },

  /**
   * @deprecated - unused
   * rewrites file.contents to auto-inject @import statements, much like includes.conf
   * NOTE: sassInheritance() doesn't trigger watches even if this code has been injected beforehand in tasks/sass.js
   * NOTE: watch fixed by gulp.task('watch-sass-'+environment+'-whitelabel')
   *
   * .pipe(intercept(function(file) {
   *   file.originalContents = file.contents;
   *   file = sassImporter.sassInheritanceFileRewrite(file);
   *   return file;
   * }))
   * @param   {File} file
   * @returns {File}
   */
  rewriteFileImports: function(file) {
    var contents = file.contents.toString();

    if( _.contains(contents, '@import') ) {
      contents = contents
        .replace(/\/\/\s*@import\b.*$/gm, "")  // remove @import comments
        .replace(/@import\s*['"]([^'"]+?)['"];/mg, function() {
          var url     = arguments[1];
          var prev    = file.path;
          var runtime = { options: global.config.whitelabel.sass.importerOptions };

          var imports = sassImporter.getExistingFilepaths(url, prev, runtime);

          var replacement = arguments[0];
          if( sassImporter.isExcludedPath(url, prev, runtime) ) {
            _.noop();
          }
          else if( imports.length === 0 ) {
            console.error("sass.js:49:", "invalid sass @import: ", prev, "@import", arguments);
            console.error("sass.js:49:", "possibleFilepaths", imports);
          }
          else {
            replacement = _(imports)
              .map(function(url) {
                return sassImporter.resolveRelativePath(url, prev); // SASS understands absolute file paths
              })
              .map(function(url) {
                return '@import "' + url + '";'
              })
              .join(' ')
            ;
          }
          return replacement;
        })
      ;
    }
    file.contents = new Buffer(contents);
    return file;
  },
  /**
   * @deprecated - only used by rewriteFileImports
   */
  resolveRelativePath: function(url, prev) {
    url  = path.resolve(url).split('/');
    prev = path.dirname(path.resolve(prev)).split('/');

    var output = [];
    for( var i=0, n=prev.length; i<n; i++ ) {
      if( url[i] === prev[i] ) { continue; }
      output.push('..');
    }
    for( var i=0, n=url.length; i<n; i++ ) {
      if( url[i] === prev[i] ) { continue; }
      output.push(url[i]);
    }
    output = output.join('/');
    return output;
  },
  /**
   * @deprecated - only used by rewriteFileImports
   */
  isExcludedPath: function(url, prev, runtime) {
    return _.any(runtime.options.excludedPaths, function(excludedPath) {
      return _.contains(url, excludedPath);
    });
  },


  /**
   * @param {Array<String>} filepaths   list of filepaths to concatinate
   * @param {Function}      done        concatenated file contents: [{ file: filepath }, ...]
   */
  importFiles: function(filepaths, done) {
    if( _.size(filepaths) === 0 ) { done([]); }

    var fileHash = _(filepaths).indexBy().mapValues(_.constant(null)).value();
    filepaths.forEach(function(filepath) {
      fs.access(filepath, fs.R_OK, function(isError) {
        fileHash[filepath] = !isError;     // make boolean not null

        if( !_.any(fileHash, _.isNull) ) { // On last iteration
          var output = _(fileHash).pick(_.identity).keys().value();
          output     = _.map(output, function(file) { return { file: file }; });
          done(output);
        }
      })
    })
  },

  /**
   * @param {Array<String>} filepaths   list of filepaths to concatinate
   * @param {Function}      done        concatenated file contents: { contents: output }
   */
  importContents: function(filepaths, done) {
    var fileHash = _(filepaths).indexBy().mapValues(_.constant(null)).value();

    filepaths.forEach(function(filepath) {
      fs.readFile(filepath, function(isError, data) {
        if( isError ) {
          fileHash[filepath] = '';
        } else {
          fileHash[filepath] = data.toString();
        }
        if( !_.any(fileHash, _.isNull) ) {
          var output = _(fileHash)
            .mapValues(function(value, key) {
              return [
                "//***** START: " + key + " *****//",
                value,
                "//***** END:   " + key + " *****//"
              ]
            })
            .values()
            .flatten(true)
            .join('\n')
          ;
          done({ contents: output });
        }
      });
    });
  }
};
