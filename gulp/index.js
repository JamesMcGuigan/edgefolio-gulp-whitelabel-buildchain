'use strict';
var yargs            = require('yargs').default('whitelabel', 'edgefolio');
var argv             = require('yargs').argv;

var _                = require('lodash');
var gulp             = require('gulp');
var runSequence      = require('run-sequence').use(gulp);
var taskListing      = require('gulp-task-listing');
var fs               = require('fs');
var tasks            = fs.readdirSync('./gulp/tasks/');
var standalone_tasks = fs.readdirSync('./gulp/standalone/');

require('./config');

// --release flag when executing a task - @unused
global.release = argv.release;

tasks.forEach(function (task) {
  if( task.match(/\.(wip|broken)\./) ) { return; }
  require('./tasks/' + task);
});
standalone_tasks.forEach(function (task) {
  if( task.match(/\.(wip|broken)\./) ) { return; }
  require('./standalone/' + task);
});

function appendAppName(dependencies, appName) {
  return _.map(dependencies, function(taskName) {
    return ( taskName instanceof Array ) ? appendAppName(taskName, appName) : taskName + appName;
  })
}

// Run "gulp help" for full task listing
gulp.task('help', taskListing.configure({
  showDependencies: true,
  primaryTasks: ['default', 'development', 'staging', 'production', 'test', 'watch']
})); // Listing of all available tasks

// Main tasks
gulp.task('default',     function(callback) { return runSequence('development', 'watch',         callback); }); // delay watch until after compilation
gulp.task('development', function(callback) { return runSequence('clean', 'development-refresh', callback); });
gulp.task('staging',     function(callback) { return runSequence('clean', 'staging-refresh',     callback); });
gulp.task('production',  function(callback) { return runSequence('clean', 'production-refresh',  callback); });
gulp.task('test',        function(callback) { return runSequence('test-unit', 'test-e2e',        callback); }); // Additional browsers via: gulp test       --chrome --firefox --opera --safari --ie
gulp.task('watch-test',  ['watch-test-unit', 'watch-test-e2e']); // Additional browsers via: gulp watch-test --chrome --firefox --opera --safari --ie

gulp.task('whitelabel',       ['whitelabel-json',       'whitelabel-filesystem',       'whitelabel-css'      ]);
gulp.task('watch-whitelabel', ['watch-whitelabel-json', 'watch-whitelabel-filesystem', 'watch-whitelabel-css']);

_.forIn({
    // Nested arrays indicate parallelization blocks
    // minify-js-pollyfills needed due to statically imported edgefolio-pollyfills-js-libs.min.js on homepage and public profile
    // BUG: Ansible: v3.edgefolio.com has unknown issue with browserify, so checking them into git
    'development': [['whitelabel', 'browserify', 'minify-js-pollyfills'], ['icon-sass'], ['sass-development'                          ], ['includes-json'],                       ['inject-development'] ],
    'staging':     [['whitelabel', 'browserify', 'minify-js-pollyfills'], ['icon-sass'], ['sass-development', 'concat-js', 'templates'], ['includes-json', 'image-precache'],     ['inject-staging']     ],
    'production':  [['whitelabel', 'browserify'                        ], ['icon-sass'], ['sass-production',  'minify-js', 'templates'], ['includes-json', 'image-precache'],     ['inject-production']  ]
  },
  function(dependencies,environment) {
    _.forEach([ "", "-manager-app", "-investor-app"], function(appName) {
      // NOTE: development, staging, production tasks defined above
      // production-investor-app
      // production-manager-app
      appName && gulp.task(environment+appName, function(callback) {
        return runSequence('clean', environment+appName+'-refresh', callback);
      });

      // production-refresh
      // production-investor-app-refresh
      // production-manager-app-refresh
      gulp.task(environment+appName+'-refresh', function(callback) {
        return runSequence.apply(this, appendAppName(dependencies, appName).concat(callback) );
      });

      // watch-production               [ watch-sass-production, watch-minify-js, watch-templates, watch-image-precache, watch-inject-production ]
      // watch-production-investor-app  [ watch-sass-production-investor-app, watch-minify-js-investor-app, watch-templates-investor-app, watch-image-precache-investor-app, watch-inject-production-investor-app ]
      // watch-production-manager-app   [ watch-sass-production-manager-app, watch-minify-js-manager-app, watch-templates-manager-app, watch-image-precache-manager-app, watch-inject-production-manager-app ]
      gulp.task('watch-'+environment+appName,
        _(appendAppName(dependencies, appName)).flatten().map(function(taskName) { return "watch-"+taskName; }).value()
      );
    });
});

// Aliases
gulp.task('watch',        ['watch-development']);
gulp.task('dev',          ['development']);
gulp.task('prod',         ['production']);
gulp.task('sass',         ['sass-development']);
gulp.task('clean-sass',   ['clean-css']);
gulp.task('inject',       ['inject-development']);
gulp.task('watch-inject', ['watch-inject-development']);
gulp.task('watch-sass',   ['watch-sass-development']);
gulp.task('watch-dev',    ['watch-development']);
gulp.task('watch-prod',   ['watch-production']);
