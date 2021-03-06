# Whitelabel
### The lazy man's way to build a website

Whitelabel is a language for cleanly communicating the configuration differences between versions of the Edgefolio platform.

A good language should make it easy to say commonly used concepts, make it possible to say complex and nuanced concepts
when they occasionally needed. It should be able to infer implicit information from the environment and avoid the need
to repeat previously communicated information. Proper abstraction allows complex concepts to be expressed with the
minimum of effort, thus freeing up attention units that can be better spent solving higher level problems.



# Gulp

To switch between whitelabel configurations, rerun gulp passing in a single --whitelabel flag.
If no flag is specified, the default whitelabel is "edgefolio".
```
gulp --whitelabel=edgefolio
gulp production --whitelabel=edgefolio
```

Specific configuration settings can be found in [gulp/config.js](gulp/config.js) under ```global.config.whitelabel.*```


[gulp/tasks/inject.js](gulp/tasks/inject.js) includes the task "inject-GulpConfig" which generated the following
block of code into the ```<head>``` of every index.html page which is visible by viewing the html source of the webapp 
inside your browser

[src/production/edgefolio-investorapp-index.html](src/production/edgefolio-investorapp-index.html)
```
window.GulpConfig = {
  environment:  'production',
  appName:      'investor-app',
  client:       'edgefolio',
  buildDate:    'Sun May 01 2016 11:29:48 GMT+0100 (BST)',
  branch:       'feature/cssThemes',
  version:      'b2fcb0c679ad2c4a71b935d77b2114759f3a2d5f'
}
```

A wrapper ```<div>``` is also injected just inside the ```<body>``` tag, providing a whitelable id and className which can be used in stylesheets
that could potentually be used as a hook inside SCSS rules. If overused, this method may eventually become hard to maintain.

[src/production/edgefolio-investorapp-index.html](src/production/edgefolio-investorapp-index.html)
```html
<body id="investor-app" ng-cloak ng-controller="RootController"><div id="whitelabel-example" class="whitelabel-example">
</div></body>
```



# Images, Templates and Filesystem Assets

Whitelabel uses a series of filesystem naming conventions to dynamically create a filesystem view mapping (using hard-links)
for how the directory tree "should" look if the codebase was configured for only a single client

Code organization can be done either by having multiple files in the same directory with different extensions,
or by inserting an extra level of directory tree, with a ```/_default/``` and ```/{whitelabel}/``` directory names
```
src/images/_default/googleMaps/googlemaps-icon-fund.png                   // if no other file can be found
src/images/_default/googleMaps/googlemaps-icon-fund.whitelabel.thales.png // if --whitelabel=thales
src/images/edgefolio/googleMaps/googlemaps-icon-fund.png                  // if --whitelabel=edgefolio
```

The output url will remove ```/_default/``` and ```/{whitelabel}/``` as well as any file extensions:
```
/assets/whitelabel/images/googleMaps/googlemaps-icon-fund.png -> src/whitelabel/images/googleMaps/googlemaps-icon-fund.png
```

Directories and files belonging to other branches will also be pruned from ```/assets/whitelabel/```

NOTE: for this to work, every whitelabel client must be defined as a directory (empty or not) in ```src/_config/{whitelabel}/```
otherwise the code has no way of knowing which directory names are structural and which should be implicitly
considered to be ```/{whitelabel}/```. Avoid picking whitelabel client names that conflict with the existing directory tree.

NOTE: you may need to create new symlinks in vagrant ```~/assets/``` to ```~/webapps/src/_config/``` and ```~/webapps/src/whitelabel/```


### Absent /_default/ images

Absence of ```logo-footer.png``` on non-edgefolio whitelabel sites was achieved by not providing a ```/_default/``` file,
only an override file in ```/edgefolio/```. The html uses a css className generated by ```gulp icon-sass```
but no css className is generated if the file is absent on a given whitelabel.

```
src/images/_default/                       // logo-footer.png file removed
src/images/edgefolio/logo-footer.png       // logo-footer.png exists
/assets/whitelabel/images/logo-footer.png  // final url, but only if --whitelabel=edgefolio
```


### gulp/config.js

- ```gulp whitelabel-filesystem``` uses this input glob to decide which files to make visible
- ```gulp clean-whitelabel``` will delete ```src/_config/{whitelabel}/```

[gulp/config.js](gulp/config.js)
```js
global.config.whitelabel.filesystem.input_glob = [
  'src/images/**/*.{jpeg,jpg,png,gif,svg,htm,html,hbs,pdf,json}',
  'src/common_components/**/*.{jpeg,jpg,png,gif,svg,htm,html,hbs,pdf,json}',
  'src/enterprise/**/*.{jpeg,jpg,png,gif,svg,htm,html,hbs,pdf,json}',
  'src/homepage/**/*.{jpeg,jpg,png,gif,svg,htm,html,hbs,pdf,json}',
  'src/investor_app/**/*.{jpeg,jpg,png,gif,svg,htm,html,hbs,pdf,json}',
  'src/manager_app/**/*.{jpeg,jpg,png,gif,svg,htm,html,hbs,pdf,json}'
]
```


### _whitelabel_filesystem.json

On a filesystem, a symlink is a tiny file that points to another file. I considered using symlinks, which would make
it easier to "see" the final mappings inside the filesystem, but this would have required setting ```{ disable_symlinks off; }```
in nginx, and symlinks also broke ```gulp icon-sass``` in a way that was not obvious to fix.

A hard link is simply a way to give an additional filesystem path to an existing file. A file is only considered deleted when all
its filesystem names have been unlinked. This is significantly quicker than a repeated filesystem copy.

A debug view for the current filesystem mappings can be found here

[src/whitelabel/_whitelabel_filesystem.json](src/whitelabel/_whitelabel_filesystem.json)
```
{
  "src/whitelabel/images/academy-icon-large.png": "src/images/_default/academy-icon-large.png",
  "src/whitelabel/images/logo-footer.png": "src/images/edgefolio/logo-footer.png",
  "src/whitelabel/images/googleMaps/googlemaps-icon-fund.png": "src/images/edgefolio/googleMaps/googlemaps-icon-fund.png",
  "src/whitelabel/images/googleMaps/googlemaps-icon-map-pin-retina.png": "src/images/edgefolio/googleMaps/googlemaps-icon-map-pin-retina.png"
}
```



# JSON

To create a new whitelabel site, make a new ```src/_config/{whitelabel}/``` directory and create empty .json files
corresponding to the .json files in ```src/_config/_default/*.json```. It is safe to leave the directory empty and
only specify the minimum changesets from ```/_default/```, any missing files will be treated as empty.

The main Edgefolio website is itself also considered a whitelabel configuration. This means it is possible to specify
specific overrides in ```src/_config/edgefolio/*.json``` if you wish to specify a ```/_default/``` whitelabel
configuration different from the main Edgefolio website.

```
mkdir src/_config/{whitelabel}/
touch src/_config/{whitelabel}/Colors.json
touch src/_config/{whitelabel}/GlobalConfig.json
```

The operation is to lodash ```_.merge()``` the equivalent json files, with ```src/_config/{whitelabel}/*.json```
overwriting the values in ```src/_config/_default/*.json``` and outputting .js .scss and .json equivalents
to ```src/_config/_autogenerated/```

Javascript comments are permitted in these .json files, both ```// single line``` and ```/* multiline */```

Variable interpolation is performed for any embedded ```url($variable)``` with a dollar prefix, similar to what
would be expected from sass. The relative ordering of variables in the file in unimportant.
Variables can point to other variables and interpolation is repeated until all values have been resolved as far as possible.

Nested objects can be referenced either using ```$javascript.dot.notation``` with a dollar prefix,
or a more sass like convention of ```$joining-the-full-path-with-dashes```, which is the format used for SCSS export.

Variables prefixed with an ```_underscore``` will be hidden from the ```.scss``` export to prevent compilation errors

There is a watch configured ```watch-whitelabel-json``` that will automatically recompile ```src/_config/_autogenerated/```
whenever the source ```.json``` files are changed. This directory is removed as part of ```gulp clean```.

The angular module ```edgefolio.common-components.constants``` includes ```edgefolio.whitelabel```
as a file and module dependancy.


[src/_config/_default/Example.json](src/_config/_default/Example.json)
```
/**
 *  This is an Example.json configuration file
 */
{
  "$black":  "#000000",
  "$white":  "#FFFFFF",
  "$blue": {
    "dark": {
      "gray": "#223e59",
      "sky":  "#59a8d9"
    }
  },
  "$element": {
    "a": {
      "background-color": "$white",
      "color":            "$blue-dark-gray",
      "color-hover":      "$blue.dark.sky"
    }
  }
}
```
[src/_config/edgefolio/Example.json](src/_config/edgefolio/Example.json)
```
// src/_config/edgefolio/Example.json only needs to contain the minimum number of overrides
{
  "$blue": {
    "dark": {
      "sky": "$white"
    }
  }
}
```

[src/_config/_autogenerated/Example.json](src/_config/_autogenerated/Example.json)
```
{
  "_JavascriptOnlyVariable": "invalid css string",
  "$black": "#000000",
  "$white": "#FFFFFF",
  "$blue": {
    "dark": {
      "gray": "#223e59",
      "sky":  "#FFFFFF"
    }
  },
  "$element": {
    "a": {
      "background-color": "#FFFFFF",
      "color": "#223e59",
      "color-hover": "#FFFFFF"
    }
  },
  "CSS": {
    "$black": "#000000",
    "$white": "#FFFFFF",
    "$blue-dark-gray": "#223e59",
    "$blue-dark-sky": "#FFFFFF",
    "$element-a-background-color": "#FFFFFF",
    "$element-a-color": "#223e59",
    "$element-a-color-hover": "#FFFFFF"
  }
}
```

[src/_config/_autogenerated/Example.js](src/_config/_autogenerated/Example.js)
```
// AUTOGENERATED: gulp whitelabel-json --whitelabel=edgefolio
// AUTOGENERATED: /Users/jamie/Edgefolio/source/webapps/src/_config/_default/Example.json
// AUTOGENERATED: /Users/jamie/Edgefolio/source/webapps/src/_config/edgefolio/Example.json
// AUTOGENERATED: Sat Apr 30 2016 23:27:06 GMT+0100 (BST)

if( typeof window.Whitelabel === 'undefined' ) { window.Whitelabel = {}; }

window.Whitelabel.Example = {
  "_JavascriptOnlyVariable": "invalid css string",
  "$black": "#000000",
  "$white": "#FFFFFF",
  "$blue": {
    "dark": {
      "gray": "#223e59",
      "sky": "#FFFFFF"
    }
  },
  "$element": {
    "a": {
      "background-color": "#FFFFFF",
      "color": "#223e59",
      "color-hover": "#FFFFFF"
    }
  },
  "CSS": {
    "$black": "#000000",
    "$white": "#FFFFFF",
    "$blue-dark-gray": "#223e59",
    "$blue-dark-sky": "#FFFFFF",
    "$element-a-background-color": "#FFFFFF",
    "$element-a-color": "#223e59",
    "$element-a-color-hover": "#FFFFFF"
  }
};

if( typeof angular !== 'undefined' ) {
  try      { angular.module('edgefolio.whitelabel')     }
  catch(e) { angular.module('edgefolio.whitelabel', []) }
  angular.module('edgefolio.whitelabel').constant('Example', window.Whitelabel.Example);
}
```


[src/_config/_autogenerated/Example.scss](src/_config/_autogenerated/Example.scss)
```
// AUTOGENERATED: gulp whitelabel-json --whitelabel=edgefolio
// AUTOGENERATED: /Users/jamie/Edgefolio/source/webapps/src/_config/_default/Example.json
// AUTOGENERATED: /Users/jamie/Edgefolio/source/webapps/src/_config/edgefolio/Example.json
// AUTOGENERATED: Sat Apr 30 2016 23:27:06 GMT+0100 (BST)

$black:                      #000000;
$white:                      #FFFFFF;
$blue-dark-gray:             #223e59;
$blue-dark-sky:              #FFFFFF;
$element-a-background-color: #FFFFFF;
$element-a-color:            #223e59;
$element-a-color-hover:      #FFFFFF;
```

### Generating SCSS via JSON

A useful alternative to injecting additional ```.scss``` files, is to create a semantically named  ```.json``` variable
which can be access within SCSS


[src/common_components/angular/components/notifications/notifications-dropdown.scss](src/common_components/angular/components/notifications/notifications-dropdown.scss)
```scss
.notifications-dropdown {
  .notifications-icon {
    .notifications-icon-count {
      background: $orchid;          // branch: master
      background: $blue-dark-ulgy;  // branch: demo/thales
      background: $whitelabel-notifications-icon-count-background; // suggested replacement
    }
  }
}
```
[src/_config/_default/Colors.json](src/_config/_default/Colors.json)
```
{
  "$whitelabel": {
    "notifications": {
      "icon-count": {
        "background": "$orchid"
      }
    }
  }
}
```
[src/_config/thales/Colors.json](src/_config/thales/Colors.json)
```
{
  "$whitelabel": {
    "notifications": {
      "icon-count": {
        "background": "$blue-dark-ulgy"
      }
    }
  }
}
```



# includes.json

Implicitly injects the following additional filepath mappings to every .includes.conf entry
searching for an ```.whitelabel.{whitelabel}.scss``` extension in the same directory and files found 
by replacing any ```/_default/``` directories with the current ```--client=whitelabel``` flag.


```
global.config.whitelabel.includes: {
  importerSearchFunctions: [
    function(path) { return path.replace(/^(.*)\/([^/.]+?)\.(.*)$/, '$1/$2.whitelabel.'+argv.whitelabel+'.$3');  },
    function(path) { return path.replace('/_default/', '/'+argv.whitelabel+'/');  }
  ]
}
```

This example javascript file dynamically rewrites the delayedKeyword directive
to increase the timeout delay and trigger an alert() message on each submission.

[src/common_components/v2/directives/delayedKeyword/delayedKeyword.whitelabel.example.js](src/common_components/v2/directives/delayedKeyword/delayedKeyword.whitelabel.example.js)
```
angular.module('edgefolio.common-components').config(function($provide) {
  $provide.decorator('delayedKeywordDirective', function($delegate) {
    var directive      = $delegate[0];
    var link           = directive.link;

    directive.compile = function() {
      return function(scope, element, attrs) {
        scope.delay = 3000;
        var applyKeyword = scope.applyKeyword;
        scope.applyKeyword = function() {
          applyKeyword.apply(this, arguments);
          alert('delayedKeywordDirective: ' + element.val());
        };
        link.apply(this, arguments);
      };
    };

    return $delegate;
  });
});
```

This example scss file dynamically repositions the notification icon the left hand side of the page

[src/common_components/angular/components/notifications/notifications-dropdown.whitelabel.example.scss](src/common_components/angular/components/notifications/notifications-dropdown.whitelabel.example.scss)
```scss
.notifications-dropdown {
  position: absolute;
  top:    65px;
  left:   0;

  .notifications-flyout {
    position: absolute;
    left:     0px;

    .notifications-triangle {
      left:  0px;
    }
  }
}
```



# SCSS

@import statements should generally be hardcoded to point to the default file and let the sassImporter imply the
whitelabel includes. If multiple files are discovered, they will all be included, with the default file first.

[gulp/util/sass-importer.js](gulp/util/sass-importer.js) is a custom written sassImporter

It intercepts each SCSS ```@import "../relative/path"``` request and searches the filesystem for possible candidates
using the following expansions, an optional underscore prefix, an implied .scss or .sass file extension,
relative or absolute pathing, files in the same directory with an ```.whitelabel.{whitelabel}.scss``` extension,
and files found by replacing any ```/_default/``` directories with the current ```--client=whitelabel``` flag.

This custom importer also implements an import once filter, to prevent duplicate and recursive includes.

```js
global.config.whitelabel.sass.importerOptions: {
 roots: [
   '',
   'src/css-scss/'  // COPYPASTE: global.config.sass.sassDir
 ],
 paths: [
   '{url}',
   '{url}.whitelabel.'+argv.whitelabel,
   function(filepath) { return filepath.replace('/_default/', '/'+argv.whitelabel+'/');  },
 ],
 filePrefixes: [
   '',
   '_'
 ],
 fileExtensions: [
   '',
   '.scss',
   '.sass'
 ]
}
```

This is an example of where a custom theme stylesheet could be placed  
[src/css-scss/whitelabel/example/extras.scss](src/css-scss/whitelabel/example/extras.scss)
```scss
section {
  #whitelabel-example  & {
    transform: rotate(180deg);
  }
}
```



### SCSS Variables and Classes

Whilst it may be better to keep all changes for a given whitelabel product in separate files or even directories,
there do exist some autogenerated CSS classnames for editing HTML directly to hide a show an element.
If overused, this method may eventually become hard to maintain.

[src/css-scss/_autogenerated/whitelabel-css-variables.scss](src/css-scss/_autogenerated/whitelabel-css-variables.scss)
 ```
$whitelabel:  "thales";
```

[src/css-scss/_autogenerated/whitelabel-css.scss](src/css-scss/_autogenerated/whitelabel-css.scss)
```
@import "whitelabel-css-variables.scss";
@if $whitelabel == "edgefolio" {
  .show-whitelabel-edgefolio { display: block; }
}
@if $whitelabel != "edgefolio" {
  .hide-whitelabel-edgefolio { display: none;  }
}
@if $whitelabel == "gottex" {
  .show-whitelabel-gottex { display: block; }
}
@if $whitelabel != "gottex" {
  .hide-whitelabel-gottex { display: none;  }
}
@if $whitelabel == "thales" {
  .show-whitelabel-thales { display: block; }
}
@if $whitelabel != "thales" {
  .hide-whitelabel-thales { display: none;  }
}
```

[src/css/_autogenerated/whitelabel-css.css](src/css/_autogenerated/whitelabel-css.css)
```css
.show-whitelabel {
  display: block;
}
.hide-whitelabel {
  display: none;
}
.hide-whitelabel-edgefolio {
  display: none;
}
.hide-whitelabel-gottex {
  display: none;
}
.show-whitelabel-thales {
  display: block;
}
```



### gulp icon-sass

- ```gulp icon-sass``` assumes all images in ```/assets/whitelabel/``` are @2x retina sized.
 The following files are output:

[src/css-scss/_autogenerated/icons-gulp-variables.scss](src/css-scss/_autogenerated/icons-gulp-variables.scss)
```scss
@mixin gulp-image($width, $height, $url, $active:false) {
  width:  $width;
  height: $height;
  background-size: $width $height;
  background-image: url($url);
  background-repeat: no-repeat;
  background-position: 50% 50%;
  display: inline-block;
  vertical-align: bottom;
  z-index: 1;
  @if $active {
    &.selected, &.active         { background-image: url($active); }
    &.image-active-onhover:hover { background-image: url($active); }
  }
}
$image-landing-page-office-width:           (2560px/2);     $image-landing-page-office-height:           (910px/2);     $image-landing-page-office-url:             '/assets/whitelabel/images/landing-page-office.jpg';
$image-academy-icon-large-width:              (55px/2);     $image-academy-icon-large-height:             (44px/2);     $image-academy-icon-large-url:              '/assets/whitelabel/images/academy-icon-large.png';
$image-academy-icon1-width:                   (28px/2);     $image-academy-icon1-height:                  (22px/2);     $image-academy-icon1-url:                   '/assets/whitelabel/images/academy-icon1.png';
$image-arrow-right-width:                     (82px/2);     $image-arrow-right-height:                    (14px/2);     $image-arrow-right-url:                     '/assets/whitelabel/images/arrow-right.png';
 ```


[src/css-scss/_autogenerated/icons-gulp.scss](src/css-scss/_autogenerated/icons-gulp.scss)
```scss
.image-landing-page-office          { @include gulp-image( (2560px/2),  (910px/2), '/assets/whitelabel/images/landing-page-office.jpg' ); }
.image-academy-icon-large           { @include gulp-image(   (55px/2),   (44px/2), '/assets/whitelabel/images/academy-icon-large.png' ); }
.image-academy-icon1                { @include gulp-image(   (28px/2),   (22px/2), '/assets/whitelabel/images/academy-icon1.png' ); }
```



