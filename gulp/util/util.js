var _    = require("lodash");
var fs   = require("fs");
var path = require("path");
var glob = require("glob");
var argv = require('yargs').argv;

/**
 * Takes a list of filenames,
 *   expands globs (requires file extension - /assets/common_components/v2/filters/*.js)
 *   extracts filenames out of includes.conf
 *   warns about non-existant filenames
 *   outputs array of relative filenames
 *
 * @param   {String|Array} inputFilenames   filename(s) to parse for extract includes
 * @param   {Object}       options
 * @returns {Array.<String>}                array of relative src/ filenames
 */
function extractIncludes(inputFilenames, options) {
  if( !inputFilenames ) { return []; }

  options = _.extend({
    withglobs: true,
    recursive: true,
    chain:     [],
    seen:      []
  }, options);

  var output = _([inputFilenames])
    .flatten(true)
    .filter()
    .map(function(filename) {
      filename = global.config.mappings.urlToFs(filename);
      filename = global.config.mappings.absoluteFsToRelativeFs(filename);
      return filename;
    })
    .filter(function(filename) {
      // Permit recursive includes
      if( _.contains(options.seen, filename) ) {
        return null;
      } else {
        options.seen.push(filename);
        return filename;
      }
    })
    .map(function(filename) {
      // Parse: /assets/common_components/v2/filters/*.js - globs still require a filename extension to be seen by gulp
      if( options.withglobs ) {
        var files = glob.sync(filename).sort(function(a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase()); // lowercase sort needed to ensure _module.js < Alpha.js
        });
        if( files.length === 0 && !_.contains(filename, '/_secret/') ) {
          console.error('util.js::extractIncludes() - invalid filename:', filename, "\n  <- ", _.clone(options.chain).reverse(), "\n");
        }
        //if( files.length > 1 ) {
        //  console.info('util.js::extractIncludes() - glob expansion:', filename, files, "\n  <- ", _.clone(options.chain).reverse(), "\n");
        //}
        return files;
      } else {
        if( !fs.existsSync(filename) ) {
          if( !_.contains(filename, '/_secret/') ) {
            console.error('util.js::extractIncludes() - invalid filename:', filename, "\n  <- ", _.clone(options.chain).reverse(), "\n");
          }
          return null;
        }
        return filename;
      }
    })
    .flatten(true)
    .filter()
    .unique()
    .reject(function(include) {
      return String(include).match(new RegExp('\\.(old|wip)\\.|[-_]old/')); // reject widgets-old/file.wip.js
    })
    .map(function(filepath) {
      if( !argv.whitelabel ) { return filepath; }

      return [
        filepath,
        _.map(global.config.whitelabel.includes.importerSearchFunctions, function(importerSearchFunction) {
          var clientFilepath = importerSearchFunction(filepath);
          if( fs.existsSync(clientFilepath) ) {
            return clientFilepath;
          } else {
            return null;
          }
        })
      ]
    })
    .flatten(true)
    .filter()
    .unique()
    .map(function(filename) {
      // Extract nested filepaths from file contents
      if( options.recursive ) {
        try {
          var fileText                = fs.readFileSync(filename, "utf8");
          var fileTextWithoutComments = "";
          var extensionsRegexp        = null;

          if( filename.match(/vendor|bower_components/) ) { return filename; } // don't recurse into library files

          if( filename.match(/\.html?$/) ) {
            fileTextWithoutComments = fileText
              .replace(/<!--[\s\S]*?-->/g, "\n")                     // remove <!-- --> comments over multiple lines
            ;
            extensionsRegexp = /(?:\/?(assets|src))\/[^\s"'+<>]+\.(jpeg|jpg|png|gif|svg|htm|html|md|hbs)(?!\/)\b/gm; // images + html
          }
          if( filename.match(/\.(js|css)$/) ) {
            fileTextWithoutComments = fileText
              .replace(/\/\/.*?$/gm, "")                             // remove // comments
              .replace(/(\/\*(^[\./]|\*\*\/)[\s\S]*?\*\/)/g, "\n")   // remove /* */ comments over multiple lines, ignoring /**/*.js
            ;
            extensionsRegexp = /(?:\/?(assets|src))\/[^\s"'+<>]+\.(jpeg|jpg|png|gif|svg|htm|html|md|hbs)(?!\/)\b/gm; // images + html
          }
          if( filename.match(/includes\.conf$/) ) {
            fileTextWithoutComments = fileText
              .replace(/\/\/.*?$/gm, "")                             // remove // comments
              .replace(/#.*?$/gm, "")                                // remove # comments
              .replace(/(\/\*(^[\./]|\*\*\/)[\s\S]*?\*\/)/g, "\n")   // remove /* */ comments over multiple lines, ignoring /**/*.js
              .replace(/<!--[\s\S]*?-->/g, "\n")                     // remove <!-- --> comments over multiple lines
              .replace(/(\s*\n)+/g, "\n")                            // remove empty lines
            ;
            extensionsRegexp = /(?:\/?(assets|src))\/[^\s"'+]+(\.(jpeg|jpg|png|gif|svg|htm|html|md|hbs|js|css|scss|sass)|includes.conf)(?!\/)\b/gm; // images + html + css + js + includes + wildcard
          }

          if( extensionsRegexp ) {
            var extractedFilenames = fileTextWithoutComments.match(extensionsRegexp);
            var chainOptions   = _.extend({}, options, { chain: _.flatten([options.chain, filename]) });
            var nestedIncludes = extractIncludes(extractedFilenames, chainOptions);
            return [filename, nestedIncludes];
          }
        } catch( exception ) {
          console.error('util.js::extractIncludes() - exception: ', filename, options, exception);
        }
      }
      return filename;
    })
    .flatten(true)
    .filter()
    .unique()
    .value()
  ;

  //console.info("util.js:84:extractIncludes", inputFilenames, ' -> ', output);
  return output;
}

/**
 *
 * @param filenames {Array} list of filenames,
 * @param options
 * @returns {{}}
 */
function mapIncludes(filenames, options) {
  var output = _.groupBy(filenames, function(file) { return file.replace(/^.*\./, ''); }); // extract js/css filetype extension
  //output.templates = _.filter(output.js, function(include) { return  include.match(/-templates\.js/); });
  //output.js        = _.filter(output.js, function(include) { return !include.match(/-templates\.js/); });

  output.libs = _.filter( output.js, function(include) { return include.match(/(bower_components|vendor|production|browserify)\//) });
  output.code = _(output.js).difference(output.libs).filter(function(include) { return !include.match('init.js') }).value();
  output.init = _(output.js).difference(output.libs).filter(function(include) { return  include.match('init.js') }).value();
  delete output.js;

  output.images = _([output.jpeg, output.jpg, output.png, output.gif, output.svg]).flatten().filter().value();
  delete output.jpeg;
  delete output.jpg;
  delete output.png;
  delete output.gif;
  delete output.svg;

  // Sort keys for prefered inject order
  output = _.extend({
    conf:      output.conf,
    libs:      output.libs,
    code:      output.code,
    init:      output.init,
    css:       output.css,
    images:    output.images,
    templates: output.templates,
    html:      output.html
  }, output);

  output = _.mapValues(output, function(list) { return _(list).unique().filter().value(); });

  //console.info("util.js:110:mapIncludes", "mapIncludes", filenames, options, output);
  return output;
}

function getAllWhitelabels() {
  var filepaths = glob.sync('src/_config/*');
  var whitelabels = _(filepaths)
    .filter(function(filepath) {
      return fs.lstatSync(filepath).isDirectory(); // don't symlink directories
    })
    .map(function(filepath) {
      return _(filepath).split('/').filter().last();
    })
    .reject(function(filepath) {
      return (filepath == '_autogenerated')
    })
    .value()
  ;
  return whitelabels;
}

function firstExistingFilepath(filepaths) {
  return _([filepaths])
    .flatten(true)
    .unique()
    .find(function(filepath) {
      try {
        fs.accessSync(filepath, fs.R_OK); // throws if file not exists
        return true;
      } catch(e) {
        return false;
      }
    })
  ;
}
function existingFilepaths(filepaths) {
  return _([filepaths])
    .flatten(true)
    .unique()
    .filter(function(filepath) {
      try {
        fs.accessSync(filepath, fs.R_OK); // throws if file not exists
        return true;
      } catch(e) {
        return false;
      }
    })
    .value()
  ;
}

module.exports = {
  extractIncludes:       extractIncludes,
  mapIncludes:           mapIncludes,
  firstExistingFilepath: firstExistingFilepath,
  existingFilepaths:     existingFilepaths,
  getAllWhitelabels:     _.memoize(getAllWhitelabels)
};
