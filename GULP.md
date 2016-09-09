## Gulp

#### Introduction

[Gulp](http://gulpjs.com/) is the primary taskrunner for the edgefolio webapps, and is able to run most tasks in parallel.

Gulp, if installed globally, can be run from either the Edgefolio/source/webapps/ directory or any subdirectory

The most simple usage of gulp is the default task
```sh
gulp
```

which internally runs ```gulp clean development watch-development``` thus deleting any existing compiled files,
compiles sass with autoprefixer into the */css directories, reads out the javascript includes from
[webapps/src/investor_app/index-gulp-includes-js.txt](https://github.com/Edgefolio/webapps/tree/master/src/investor_app/index-gulp-includes-js.txt)
and [webapps/src/manager_app/angular/includes.js](https://github.com/Edgefolio/webapps/tree/master/src/manager_app/angular/includes.js)
then injects them into ```webapps/src/production/edgefolio-investorapp-index.html``` and ```webapps/src/production/edgefolio-managerapp-index.html```
which are served by django.

Additionally it sets a watch script, such that if any of the relevant source files are changed, the appropriate gulp sub-task is rerun.

Growl: There is some limited support for Growl notifications, such as when compiling SASS - see [http://growl.info/](http://growl.info/) for more information


#### Gulp Task Listing  s

A runtime listing of available tasks [and dependencies] can be obtained using:
```
gulp help
gulp --tasks
```
Standalone Tasks
------------------------------
  icon-sass          [ icon-sass-common-components ]
  lint               [ lint-sass, lint-jshint, lint-js ]


Primary Tasks
------------------------------
    default          [ development, watch ]
    development      []
    production       []
    staging          []
    test             [ test-unit, test-e2e ]
    watch            [ watch-development ]

Main Tasks
------------------------------
    clean            [ clean-production, clean-css ]
    concat-js        [ concat-js-manager-app, concat-js-investor-app ]
    copy-index       [ copy-index-manager-app, copy-index-investor-app ]
    dev              [ development ]
    help             []
    image-precache   [ image-precache-manager-app, image-precache-investor-app ]
    includes-json    [ includes-json-manager-app, includes-json-investor-app ]
    inject           [ inject-development ]
    minify-js        [ minify-js-manager-app, minify-js-investor-app ]
    prod             [ production ]
    sass             [ sass-development ]
    templates        [ templates-manager-app, templates-investor-app, templates-common-components ]

Sub Tasks
------------------------------

NOTE: due to the use of runSequence() for ensuring the correct asyncronous codeflow, some task dependencies are not listed.
Inspect the code for a more detailed description of what each task does.

As a developer note, runSequence() needs to be used if specific task dependencies need to be run sequentually rather than in parallel.

Most gulp tasks are configured in terms of an optional code function and a set of asynchronous set of task dependencies.
The naming scheme should hopefully be intuitive, with parent tasks calling all child tasks with the same naming prefix.

Running ```gulp``` will run most child tasks containing the word development for both apps.
The console output for gulp will list the child tasks as it processes them.


- [webapps/gulp/index.js](https://github.com/Edgefolio/webapps/tree/master/gulp/index.js) - Top level tasks and dependencies
- [webapps/gulp/tasks/*.js](https://github.com/Edgefolio/webapps/tree/master/gulp/tasks) - Sub tasks with code
- [webapps/gulp/config.js](https://github.com/Edgefolio/webapps/tree/master/gulp/config.js) - Gulp configuration variables


Gulp Modes
------------------------------

There are three primary modes that the edgefolio website can be run in, changed by running one of the following primary gulp tasks:

**gulp development** - used for day-to-day development work
- javascript files are injected individually into the index.html page,
- css is compiled in uncompressed format
- ng-templates and css-image-precaching are not enabled
- ```GulpConfig.precache = false``` is set within angular
- aliased to ```gulp dev```


**gulp production** - run as part of the ansible scripts on: edgefolio.com, edgefolio-staging.com, edgefolio-development.com
- All javascript files are concatenated, and minified (without mangling)
- All non-libary javascript files are wrapped in a (function(){})() wrapper to prevent variables leaking into the global namespace.
- css is compiled in compressed format.
- minified files are injected into the html.
- ng-template caching is enabled
- css-image-precaching is enabled
- ```GulpConfig.precache = true``` is set within angular
- aliased to ```gulp prod```

**gulp staging** - like production, but uses unminimified source files for easier debugging
- All javascript files are concatenated, but not minified
- All non-libary javascript files are wrapped in a (function(){})() wrapper to prevent variables leaking into the global namespace.
- css is compiled in an uncompressed format.
- concatenated files are injected into the html.
- ng-template caching is enabled
- css-image-precaching is enabled
- ```GulpConfig.precache = true``` is set within angular


Additionally
- ```gulp watch-development```, ```gulp watch-staging``` and ```gulp watch-production``` watch for and update any generated files.
- ```gulp development-refresh```, ```gulp staging-refresh``` and ```gulp production-refresh``` will compile, but without running clean first
- ```gulp development-manager-app```, ```gulp development-investor-app``` will compile only for specific apps, also without clean

NOTE: while the gulp default task includes a watch task, ```gulp development```, ```gulp staging``` and ```gulp production``` do not.
You can however run ```gulp staging watch-staging``` to achieve this effect.


Gulp Clients/Themes
------------------------------

```
gulp --whitelabel=NameOfClient
```

HTML injects a id wrapper inside <body> into index.html:
```
<body><div id="client-NameOfClient" class="client-id"> ... </div></body>
```

Sets GulpConfig variable:
```
  <!-- START gulp-inject GulpConfig -->
  <script>
  window.GulpConfig = {
    client: 'NameOfClient'
  }
  </script>
  <!-- END gulp-inject GulpConfig -->
```

Applies an filename mapping for files mentioned in .includes.conf files
```
common.includes.conf
filename.js

injected -> [
'common.includes.conf',
'common.whitelabel.NameOfClient.includes.conf', // if exists
'filename.js',
'filename.whitelabel.NameOfClient.js'           // if exists
]
```


Gulp Tasks
------------------------------

```sh
gulp clean
gulp clean-sass
gulp clean-production
```
- Deletes ```webapps/src/production```, ```webapps/src/investor_app/css``` and ```webapps/src/manager_app/css```,
- run as part of```gulp development```, ```gulp staging```, and ```gulp production``` tasks.

```sh
gulp watch    # [ watch-development ]
gulp watch-development
gulp watch-staging
gulp watch-production
```
- gulp watch defaults to development mode
- sets watchers to ensure any generated files are updated when their dependencies change.
- most gulp tasks can be prefixed with ```watch-``` to set specific watch tasks,
- ```gulp watch``` runs all child watch tasks for a given development mode

```sh
gulp test     # [ test-unit test-e2e ]
gulp test-unit
gulp test-unit --chrome --firefox --opera --safari --ie
gulp test-unit-raw
gulp test-e2e
```
- runs the karma unit tests and the protractor/selenium e2e tests.
- by default the karma unit tests are only run on PhantomJS, but command line flags can be used to specify additional browsers
- does a partial rebuild of development files before running the tests
- ```gulp test-unit-raw``` triggers tests without doing a rebuild, this has a faster turnaround time, but assumes the correct development files are already in place
- ```karma start tests/karma.conf.js --single-run``` - run karma unit tests manually
- ```protractor tests/protractor.conf.js``` - run protractor e2e tests manually

Running karma directly in watch modes (startup suffers 60s timeout to detect browser if not in --single-run mode)
```
gulp                                          # manually run gulp in the background
karma start tests/karma.conf.js               # run in watch mode without coverage, interferes with Chrome debugging
karma start tests/karma.conf.js --single-run  # run once (fast) with PhantomJS and coverage
karma start tests/karma.conf.js --phantomjs --chrome --firefox --safari --opera --ie  # browser select, not all supported

karma start tests/karma.conf.js --ansible     # deployment mode: run with PhantomJS mode but text coverage output
karma start tests/karma.conf.js --teamcity    # single-run with teamcity output | QUESTION: how is this configured
karma start tests/karma.conf.js --production  # test against production javascript, currently broken
karma start tests/karma.conf.js --staging     # test against staging javascript, currently broken

karma start tests/karma.conf.js --failing     # additionally run *.spec.failing.js and *.spec.broken.js tests

# NOTE: minimum requirements: gulp includes-json # for running all tests
# NOTE: minimum requirements: gulp production OR gulp staging before running with --production or --staging flags
```


```sh
gulp sass
gulp sass-development
gulp sass-production
```
- Compiles ```webapps/src/investor/css-scss``` into ```webapps/src/investor_app/css-scss```
- Compiles ```webapps/src/manager_app/css-scss``` into ```webapps/src/manager_app/css-scss```
- Uses libsass and autoprefixer which is 10x faster than ruby compass (which means compass cannot be used as dependency)
- Autoprefixer config is defined in [webapps/gulp/config-autoprefixer.rb](https://github.com/Edgefolio/webapps/tree/master/gulp/config-autoprefixer.rb)
- libsass does not need ```gulp clean``` to be run before switching between development and production modes
- Generates inline comments for use with Firefox [FireCompass](https://addons.mozilla.org/en-us/firefox/addon/firecompass-for-firebug/)
- Generates .map files for use with Chrome, Safari and Opera developer tools

```sh
gulp watch-sass
gulp watch-sass-development-investor-app
gulp watch-sass-development-manager-app
gulp watch-sass-production-investor-app
gulp watch-sass-production-manager-app
```
- Watches for scss changes within
  - ```webapps/src/investor_app/ + webapps/src/common_components```
  - ```webapps/src/manager_app/ + webapps/src/common_components```
- Triggers the application specific sass task
- NOTE: in the investor_app, there are still a small number of files directly @import'ed from the manager_app.
- ```gulp watch sass``` does not watch for these files, meaning changing them will not trigger a rebuild for the investor_app.
- Files in common_components or the parent app are correctly watched.
- To fix, either rerun gulp, or make a sass change inside the desired watch directory.


```sh
gulp includes-json
```
- uses a regexp to parse [webapps/src/investor_app/index-gulp-includes-js.txt](https://github.com/Edgefolio/webapps/tree/master/src/investor_app/index-gulp-includes-js.txt)
  and [webapps/src/manager_app/angular/includes.js](https://github.com/Edgefolio/webapps/tree/master/src/manager_app/angular/includes.js)
- expected regexp is "/assets/\S*?\.(js|css|jpeg|jpg|png|gif|svg)\b", with preprocessing for multiple comment types: //, #, /* */, <!-- -->
- see [webapps/gulp/util/includes.js](https://github.com/Edgefolio/webapps/tree/master/gulp/util/includes.js) for regexp parsing code
- generates
  - ```webapps/src/production/edgefolio-investorapp-includes.json```
  - ```webapps/src/production/edgefolio-managerapp-includes.json```
- these includes.json files are used by ```gulp test-unit``` to for injecting code dependencies into the tests
- include files are split into three categories
  - libs:   third party libraries found in ```src/bower_components/``` or ```src/vendor/```
  - code:   code written by Edgefolio, excluding any initialization code
  - init:   files matching *init.js, which are included after all other files and excluded from unit tests
  - css:    css files (assumes development mode, but all modes use the same css files)
  - html:   html files to be included in any of the -template.js files
  - images: image files jpeg/jpg/png/gif/svg referenced within any of the above js/css/html files

```sh
gulp image-precache
gulp image-precache-manager-app
gulp image-precache-investor-app
```
- CSS: body:after { display: none;  content: url() url() url(); }
- Extracts image urls from jpeg/jpg/png/gif/svg referenced within any of the above includes-json js/css/html files
- Converts it into a CSS file that prefetches all images files into the web browser as an alterative to using sprites
- Image precache is injected into the index.html page 5 seconds after page load
- Generates:
  - webapps/src/production/edgefolio-investorapp-imageprecache.css
  - webapps/src/production/edgefolio-manager-imageprecache.css

```sh
gulp concat-js
gulp concat-js-manager-app
gulp concat-js-investor-app
```
- Concatenates, without minification all javascript files
- Javascript files are separated with a ;
- All non-libary javascript files are wrapped in a (function(){})() wrapper to prevent variables leaking into the global namespace.
- Generates:
  - webapps/src/production/edgefolio-investorapp-js-libs.js
  - webapps/src/production/edgefolio-investorapp-js-code.js
  - webapps/src/production/edgefolio-managerapp-js-libs.js
  - webapps/src/production/edgefolio-managerapp-js-code.js
  - webapps/src/production/edgefolio-managerapp-js-init.js

```sh
gulp minify-js
gulp minify-js-manager-app
gulp minify-js-investor-app
```
- Takes input files generated by ```gulp concat-js```
- Applies minification (without mangling), stripping comments and whitespace
- Generates:
  - webapps/src/production/edgefolio-investorapp-js-libs.min.js (38% of unmminifed filesize)
  - webapps/src/production/edgefolio-investorapp-js-code.min.js (55% of unmminifed filesize)
  - webapps/src/production/edgefolio-managerapp-js-libs.min.js  (42% of unmminifed filesize)
  - webapps/src/production/edgefolio-managerapp-js-code.min.js  (55% of unmminifed filesize)
  - webapps/src/production/edgefolio-managerapp-js-init.min.js  (23% of unmminifed filesize)

```sh
gulp templates
gulp templates-manager-app
gulp templates-investor-app
gulp templates-common-components
```
- Uses angular ng-template caching to generate a javascript file that avoids the need to make additional HTTP
  requests for fetching angular html templates
- Generates:
  - webapps/src/production/edgefolio-common-templates.js
  - webapps/src/production/edgefolio-investorapp-templates.js
  - webapps/src/production/edgefolio-managerapp-templates.js


```sh
gulp copy-index
gulp copy-index-manager-app
gulp copy-index-investor-app
```
- Copies investor_app/index.html and manager_app/index.html into the production/ directory
- Generates:
  - webapps/src/production/edgefolio-investorapp-index.html
  - webapps/src/production/edgefolio-managerapp-index.html

```sh
gulp inject
gulp inject-development
gulp inject-staging
gulp inject-production
```
- Injects javascript dependencies for the given mode into the production index.html files
- See [webapps/gulp/config.js](https://github.com/Edgefolio/webapps/tree/master/gulp/config.js) under inject: for specific files to be injected
- Only injects existent files, thus ```gulp sass templates concat-js minify-js templates image-precache copy-index``` needs to have been run since the last clean
- Should provide console warning if any injectable files are missing
- <!-- START gulp-inject css --><!-- END gulp-inject css --> is required in index.html to define where CSS is injected, all contents are overwritten
- <!-- START gulp-inject javascript --><!-- END gulp-inject javascript --> is required in index.html to define where javascript is injected, all contents are overwritten
- Also triggers ```gulp inject-gulpConfig```

```sh
gulp inject-gulpConfig
gulp inject-gulpConfig-development
gulp inject-gulpConfig-staging
gulp inject-gulpConfig-production
```
- <!-- START gulp-inject GulpConfig --><!-- END gulp-inject GulpConfig --> is required in index.html to define where gulpConfig is injected, all contents are overwritten
- Injects the following javascript variables into the index.html page,
```
  <!-- START gulp-inject GulpConfig -->
  <script>
    window.GulpConfig = {
     environment: 'production',
     appName:     'investor-app',
     buildDate:   'Wed Jul 08 2015 18:34:39 GMT+0100 (BST)',
     version:     '1dc6510bf6f310fb76152adbd92baf5e76284c7a'
    }
  </script>
  <!-- END gulp-inject GulpConfig -->
```
- window.GulpConfig.environment is used to the angular variable ```GulpConfig.precache```, true for 'production' or 'staging', false otherwise
- window.GulpConfig.appName is manager-app or investor-app - used by AnalyticsService.js to add prefixes to logging events
- window.GulpConfig.buildDate is the human readable timestamp for the build - useful for debugging server caching issues
- window.GulpConfig.version is the current git version hash - useful for debugging production environments

## Standalone Tasks
```sh
gulp icon-sass
```
- This task is run once as part of the default ```gulp``` or ```gulp development``` task, but not for the ```gulp staging``` or ```gulp production``` tasks
- Generated files are checked into git
- Reads: [src/common_components/images](src/common_components/images)
- Outputs: [src/homepage/css-scss/common/_autogenerated/icons-gulp.scss](src/homepage/css-scss/common/_autogenerated/icons-gulp.scss)
    - .image-{filename-without-extension} CSS classes
- Outputs: [src/homepage/css-scss/common/_autogenerated/icons-gulp-variables.scss](src/homepage/css-scss/common/_autogenerated/icons-gulp-variables.scss)
    - $image-{filename}-width, $image-{filename}-height, $image-{filename}-url SCSS variables

```sh
gulp lint
gulp lint-sass
gulp lint-jshint
gulp lint-js
```
- ```gulp lint-sass```   runs the scss-lint package, with config [.sass-lint.yml](.sass-lint.yml)
- ```gulp lint-jshint``` runs the jshint package, with config [.jshintrc](.jshintrc)
- ```gulp lint-js```     runs command line ```jsl``` [javascriptlint.com](http://www.javascriptlint.com/), with config [.jsl.conf](.jsl.conf)
  - lint-js produces the most useful output, but needs to be manually installed

## Other Command Line Tasks

- ```npm install```   - installs npm packages into webapps/node_modules - configured via [package.json](https://github.com/Edgefolio/webapps/tree/master/package.json)
- ```bower install``` - installs bower packages into webapps/src/bower_components - configured via [bower.json](https://github.com/Edgefolio/webapps/tree/master/bower.json) and [.bowerrc](https://github.com/Edgefolio/webapps/tree/master/.bowerrc)
