var _      = require('lodash');
var file   = require('gulp-file');
var fs     = require('fs');
var gulp   = require('gulp');
var mkdirp = require('mkdirp');
var path   = require('path');
var util   = require('../util/util');
var argv   = require('yargs').argv;

gulp.task('whitelabel-css', function() {
  var data = {
    vars: {
      filepath: global.config.whitelabel.css.vars_file,
      basename: path.basename(global.config.whitelabel.css.vars_file),
      dirname:  path.dirname( global.config.whitelabel.css.vars_file)
    },
    rules: {
      filepath: global.config.whitelabel.css.rules_file,
      basename: path.basename(global.config.whitelabel.css.rules_file),
      dirname:  path.dirname( global.config.whitelabel.css.rules_file)
    }
  };
  data.vars.content = [
    '$whitelabel:  "' + argv.whitelabel + '";'
  ].join("\n");

  var whitelabels = util.getAllWhitelabels();
  data.rules.content = _([
    '@import "' + data.vars.basename + '";',
    _.map(whitelabels, function(whitelabel) {
      if( whitelabel === '_default' ) { return []; }
      return [
        '@if $whitelabel == "' + whitelabel + '" {',
        '  .show-whitelabel-'  + whitelabel + ' { display: block; }',
        '}',
        '@if $whitelabel != "' + whitelabel + '" {',
        '  .hide-whitelabel-'  + whitelabel + ' { display: none;  }',
        '}'
      ]
    })
  ])
  .flatten(true)
  .join("\n");

  _.forIn(data, function(config) {
    mkdirp.sync(config.dirname, { mode: 0755 });
    fs.writeFileSync(config.filepath, config.content, 'utf8');
  });
});
gulp.task('watch-whitelabel-css', _.noop); // NOTE: Required namespace as part of index.js loop
