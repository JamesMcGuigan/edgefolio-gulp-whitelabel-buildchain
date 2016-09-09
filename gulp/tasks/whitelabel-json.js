var _                 = require('lodash');
var argv              = require('yargs').argv;
var fs                = require('fs-extra');
var gulp              = require('gulp');
var intercept         = require('gulp-intercept');
var path              = require('path');
var notifier          = require('node-notifier');
var stripJsonComments = require('strip-json-comments');

var WhitelabelJSON = {

  //***** Utility Functions *****//

  /**
   * Returns a filtered array of filepaths, but only the ones that exist on the filesystem
   * @param   {Array|String} filepaths
   * @returns {Array}
   */
  filterFileExists: function(filepaths) {
    return _([filepaths])
      .flatten(true)
      .unique()
      .filter(function(filepath) {
        try { return fs.lstatSync(filepath).isFile(); } catch(e) { return false; }
      })
      .value()
    ;
  },
  sortKeysBy: function(object, comparator, context) {
    comparator = comparator || _.identity;
    context    = context    || null;

    var keys = _(object).keys().sortBy(comparator, context).value();
    var output = {};
    for( var i=0, n=keys.length; i<n; i++ ) {
      output[keys[i]] = object[keys[i]];
    }
    return output;
  },

  /**
   * @param   {Array<String>} filepaths   list of filepaths to read and _.merge
   * @returns {Object}                    the json _.merge() of all filepath contents
   */
  extractMergedJson: function(filepaths) {
    var merged_json = {};
    filepaths = WhitelabelJSON.filterFileExists(filepaths);
    _.forEach(filepaths, function(filepath) {
      try {
        var contents = fs.readFileSync(filepath, "utf8");
        var json     = JSON.parse(stripJsonComments(contents));
        _.merge(merged_json, json);
      } catch(exception) {
        console.error("whitelabel-json.js - invalid json: ", filepath, exception);
        console.error(contents);
        notifier.notify({
          'title': "invalid json: " + filepath,
          'message': exception
        });
      }
    });
    return merged_json;
  },



  //***** Interpolate Functions *****//

  /**
   * Converts { "$blue-light": "#6C9FA2", "$blue": "$blue-light" } -> { "$blue-light": "#6C9FA2", "$blue": "#6C9FA2" }
   * NOTE: Only replaces top level keys with string values that are prefixed with .interpolatePrefix
   *
   * @destructive
   * @param   {Object} json
   * @returns {Object}
   */
  interpolateJson: function(json) {
    var lookup = WhitelabelJSON.interpolateLookupTable(json);
    json       = WhitelabelJSON.interpolateNestedValue(json, lookup);
    json.CSS   = WhitelabelJSON.interpolateNestedValue(WhitelabelJSON.jsonToFlatCSSObject(json, '-'), lookup);
    json.CSS   = _.pick(json.CSS, WhitelabelJSON.scssJsonPick, WhitelabelJSON);
    return json;
  },
  interpolateLookupTable: function(json) {
    var lookup = _.extend({},
      WhitelabelJSON.jsonToFlatCSSObject(json, '-'),
      WhitelabelJSON.jsonToFlatCSSObject(json, '.')
    );

    lookup = WhitelabelJSON.sortKeysBy(lookup, function(key) { return -1 * _.size(key); });
    do {
      // Loop until no more interpolated values are found and interpolateNestedValue is a noop
      var prev_lookup = _.cloneDeep(lookup);
      lookup = WhitelabelJSON.interpolateNestedValue(lookup, lookup);
    } while( !_.isEqual(lookup, prev_lookup) );

    return lookup;
  },
  interpolateNestedValue: function(value, lookup) {
    lookup = lookup || WhitelabelJSON.interpolateLookupTable(value);

    if( _.isString(value) ) {
      if( _.contains(value, global.config.whitelabel.json.interpolatePrefix) ) {
        if( lookup[value] ) {
          return lookup[value];
        }
        var filtered_lookup = _.pick(lookup, function(value_lookup, key_lookup) { return _.contains(value, key_lookup); });
        if( _.size(filtered_lookup) === 0 ) {
          console.error("whitelabel-json.js:103:interpolateNestedValue(",value,")", "not in:", _.keys(lookup));
        } else {
          _.forIn(filtered_lookup, function(value_lookup, key_lookup) {
            if( _.contains(value, key_lookup) ) {
              value = value.split(key_lookup).join(value_lookup); // global replace
            }
          });
          value = value.replace(/\s\s+/g, ' '); // Strip excess whitespace
        }
      }
      return value;
    }
    else if( _.isArray(value) ) {
      return _.map(value, function(value_inner, key_inner) {
        return WhitelabelJSON.interpolateNestedValue(value_inner, lookup);
      })
    }
    else if( _.isObject(value) ) {
      return _.mapValues(value, function(value_inner, key_inner) {
        return WhitelabelJSON.interpolateNestedValue(value_inner, lookup);
      })
    }
    return value;
  },

  //***** JSON Mapping Functions *****//

  /**
   * Creates a flat object, suitable for injecting into SASS - non-destructive
   * Maps: { "$foo": { "bar": "value1", "baz": "value2" } } } -> { "$foo-bar": "value1", "$foo-baz": "value2" }
   *
   * @param   {Object} object
   * @returns {Object}
   */
  jsonToFlatObject: function(object, seperator) {
    var object = _.cloneDeep(object);        // avoid modifying original arguments
    while( _.any(object, _.isObject) ) {     // _.isObject() includes Arrays
      _.forIn(object, function(value, key) {
        if( _.isObject(object[key]) ) {
          _.forIn(object[key], function(value_inner, key_inner) {
            object[ key + seperator + key_inner ] = value_inner;
          });
          delete object[key];
        }
      })
    }
    return object;
  },
  jsonToFlatCSSObject: function(object, seperator) {
    object = WhitelabelJSON.jsonToFlatObject(object, seperator);
    object = _.mapKeys(object, function(value, key) {
      if( _.startsWith(key, global.config.whitelabel.json.interpolatePrefix) ) {
        return key;
      } else {
        return global.config.whitelabel.json.interpolatePrefix + key;
      }
    });
    return object;
  },


  //***** JSON Conversion Functions *****//

  /**
   * @param   {Array<String>} filepaths
   * @returns {String}
   */
  autogeneratedHeaders: function(filepaths) {
    return _([
      "// AUTOGENERATED: gulp whitelabel-json --whitelabel=" + argv.whitelabel,
      _.map(filepaths, function(filepath) {
        return "// AUTOGENERATED: " + filepath;
      }),
      "// AUTOGENERATED: " + Date().toString(),
      ""
    ]).flatten().join("\n");
  },

  /**
   * @param   {Object}        json
   * @param   {Array<String>} filepaths
   * @returns {String}
   */
  jsonToScss: function(json, filepaths) {
    var json_css = json.CSS;

    var max_key_length = _(json_css).keys().map(_.size).max();
    var output = [
      WhitelabelJSON.autogeneratedHeaders(filepaths),
      _.map(json_css, function(value, key) {
        var padding = Array(max_key_length - _.size(key) + 2).join(' ');
        return [ key, ':', padding, String(value), ';' ].join('');
      }),
      ""
    ];
    return _(output).flatten().join("\n")
  },
  scssJsonPick: function(value, key) {
    return !_.startsWith(key, '$_');
  },

  /**
   * @param   {Object}        json
   * @param   {Array<String>} filepaths
   * @returns {String}
   */
  jsonToJavascript: function(json, filepaths) {
    var file_basename = _(_(filepaths[0]).split('/').last()).split('.').first();

    var output = [
      WhitelabelJSON.autogeneratedHeaders(filepaths),
      "if( typeof window.Whitelabel === 'undefined' ) { window.Whitelabel = {}; }",
      "",
      "window.Whitelabel."+file_basename+" = " + JSON.stringify(json, null, 2) + ";",
      "",
      "if( typeof angular !== 'undefined' ) {",
      "  try      { angular.module('"+global.config.whitelabel.json.angularModule+"')     }",
      "  catch(e) { angular.module('"+global.config.whitelabel.json.angularModule+"', []) }",
      "  angular.module('"+global.config.whitelabel.json.angularModule+"').constant('"+file_basename+"', window.Whitelabel."+file_basename+");",
      "}",
      ""
    ];
    return _(output).flatten().join("\n")
  }
};

/**
 * Hard link merges ```src/images/_default/ + src/images/'+argv.whitelabel+'/ -> src/whitelabel/images/```
 * TODO: convert to symlinks and update nginx { location assets/whitelabel/images { disable_symlinks off }}
 *
 * @param {Array|String} global.config.whitelabel.images.input_glob - ordered glob argument to copy
 * @param {String}       global.config.whitelabel.images.output_dir - destination directory
 */
gulp.task('whitelabel-json', function() {
  return gulp.src(global.config.whitelabel.json.input_glob, { read: false })
    .pipe(intercept(function(file) {
      if( _.contains(file.path, '/_default/') ) {
        var file_basename = _(_(file.path).split('/').last()).split('.').first();

        var possible_filepaths  = [
          file.path,
          file.path.replace('/_default/', '/' + argv.whitelabel + '/')
        ];
        var extracted_filepaths = WhitelabelJSON.filterFileExists(possible_filepaths);

        var json = WhitelabelJSON.extractMergedJson(extracted_filepaths);
        json     = WhitelabelJSON.interpolateJson(json);

        fs.ensureDirSync(path.dirname(path.join(global.config.whitelabel.json.output_dir, file_basename)));

        var json_filepath    = path.join(global.config.whitelabel.json.output_dir, file_basename + '.json');
        var scss_filepath    = path.join(global.config.whitelabel.json.output_dir, file_basename + '.scss');
        var angular_filepath = path.join(global.config.whitelabel.json.output_dir, file_basename + '.js');

        fs.writeFileSync(json_filepath,    JSON.stringify(json, null, 2),   'utf8');
        fs.writeFileSync(scss_filepath,    WhitelabelJSON.jsonToScss(      json, extracted_filepaths), 'utf8');
        fs.writeFileSync(angular_filepath, WhitelabelJSON.jsonToJavascript(json, extracted_filepaths), 'utf8');
      }
    }))
  ;
});

gulp.task('watch-whitelabel-json', function() {
  gulp.watch(global.config.whitelabel.json.input_glob, ['whitelabel-json']);
});
