# Edgefolio Gulp Whitelabel Buildchain

Whitelabel gulp buildchain for Edgefolio's production angular apps  

(c) 2016 Edgefolio AS

## Other README.md Files

- [README.md](README.md)           - This file
- [GULP.md](GULP.md)               - Documentation for Individual Gulp Tasks
- [WHITELABEL.md](WHITELABEL.md)   - Whitelabel Buildchain Tutorial 
- [WEBAPPS.md](WEBAPPS.md)         - Main Angular/HTML Application Boostrapping 
- [STANDALONE.md](STANDALONE.md)   - Standalone Documentation Application  
- [TESTING.md](TESTING.md)         - Unit Test Instruction
- [MODEL_LAYER.md](MODEL_LAYER.md) - Enterprise ORM Model Layer -> https://github.com/JamesMcGuigan/edgefolio-orm


## Overview 

#### Installation
```
npm install
bower install
typings install
```

#### Top level build commands
```
gulp icon-sass                       # autogenerate sass variables/classes from image directory

gulp clean                           # remove generated files
gulp test-unit                       # compile test resources and run karma tests   
gulp production                      # default production build (--whitelabel=edgefolio)
gulp production --whitelabel=thales  # whitelabel production build
gulp staging                         # staging build - concatinated but not minified assets
gulp development                     # development build - one HTTP request per file and no template caching or CSS image preloading
gulp watch-development               # run file watchers to recompile any generated assets when file dependancies change
gulp                                 # default task: gulp development watch-development               
```

#### Lint support
```
gulp lint-jsl 
gulp lint-eslint
gulp lint-jshint
gulp lint-sass
```

## Generated Code

#### Generated code in .gitignore

- ```/src/whitelabel/``` - hardlink virtual filesystem for whitelabel assets 
- ```/src/production/``` - compiled javascript and html assets generated by gulp
- ```/src/css/```        - compiled css generated from [/src/css-scss](/src/css-scss)
- ```/tests/_output/```  - output reports for karma and protractor tests

#### Generated files

- ```/src/css-scss/_autogenerated/icons-gulp.scss``` - autogenerated SASS variables via ```gulp icon-sass```
- ```/src/whitelabel/_whitelabel_filesystem.json```  - filesystem mappings for /whitelabel/ virtual filesystem

#### Generated files in /src/production/

- ```(.*).includes.conf```          - text based includes files that can be recursively referenced
- ```(.*)-includes.json```          - list of files to injected or bundled
- ```(.*)-gulpConfig-(.*).ks```     - gulp build information
- ```(.*)-templates.js```           - gulp-angular-templatecache output 
- ```(.*)-imageprecache.css```      - css image precaching 
- ```(.*)-js-code.min.js```         - production bundled javascript code - in-house code
- ```(.*)-js-libs.min.js```         - production bundled javascript code - third party libraries  
- ```(.*)-index.html```             - HTML injected with production bundles   
- ```(.*)-index-unoptimized.html``` - HTML injected with individual javascript files for easier debugging
 
## Project Structure
 
#### Directories

- [/src/](/src)                  - web directory exposed via django under https://edgefolio.com/assets/
- [/gulp/](/gulp)                - gulp task configuration
- [/tests/](/tests)              - skeleton karma unit tests and protractor e2e tests

#### Gulp Files:

- [/gulp/config.js](/gulp/config.js)     - Main gulp configuration
- [/gulp/index.js](/gulp/index.js)       - Top level gulp tasks  
- [/gulp/tasks/](/gulp/tasks/)           - Gulp main task sequence 
- [/gulp/standalone/](/gulp/standalone/) - Gulp standalone tasks

#### Whitelabel Source Directories

- [/src/_config/](/src/_config/) - Whitelabel JSON -> JS + CSS + JSON configuration -> ```/src/_config/_autogenerated```
- [/src/images/](/src/images/)   - Whitelabel image asset directory

#### Placeholder Applications

- [/src/enterprise/documentation](/src/enterprise/documentation) - standalone documentation website
- [/src/investor_app/](/src/investor_app)           - placeholder application source code
- [/src/manager_app/](/src/manager_app)             - placeholder application source code 
- [/src/common_components/](/src/common_components) - generic angular middleware
- [/src/_global/](/src/_global/)                    - javascript code affecting the global namespace

#### Root .includes.conf files

- [/src/common_components/pollyfills.includes.conf](/src/common_components/pollyfills.includes.conf)
- [/src/common_components/common.includes.conf](/src/common_components/common.includes.conf)
- [/src/manager_app/managerapp.includes.conf](/src/manager_app/managerapp.includes.conf)
- [/src/investor_app/investorapp.includes.conf](/src/investor_app/investorapp.includes.conf)
- [/src/enterprise/documentation/_enterprise-documentation.includes.conf](/src/enterprise/documentation/_enterprise-documentation.includes.conf)
