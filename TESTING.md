# Testing

Config Files
- [tests/karma.conf.js](tests/karma.conf.js)
- [tests/protractor.conf.js](tests/protractor.conf.js)
- [gulp/tasks/test-unit.js](gulp/tasks/test-unit.js)
- [gulp/tasks/test-e2e.js](gulp/tasks/test-e2e.js)

Gulp command line (does all required build steps before running):
```bash
gulp test-unit   // unit tests only, in --single run mode
gulp test-e2e    // selenium/protractor tests
gulp test        // run unit test then e2e tests;
```

Gulp command line arguments:
```bash
gulp test-e2e --host=http://edgefolio-development.com # defaults to edgefolio-local.com
gulp test-e2e  --chrome --firefox # --opera --safari --ie --phantomjs flags are broken
gulp test-unit --chrome --firefox # --opera --safari --ie --phantomjs flags are broken
```

Running combined karma server and gulp build/watch - alternatively run gulp and karma separate tabs
```
gulp watch-test-unit  // run karma server, with gulp pre-build and file watchers
gulp watch-test-e2e   // unsure if
gulp watch-test       // run both test watchers - not sure if this is useful
```

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



#### Test Debugging
```
karma start tests/karma.conf.js
open http://localhost:9877/debug.html  # or wait for karma to auto open browser and click debug button
# cmd-alt-I open Chrome developer tools
# set breakpoint either in tests or code
# cmd-R to refresh the page and rerun tests
# Chrome debugging only needs karma server to be running, even if set to PhantomJS mode (except it doesn't open browser for you)
# Command-click can open weblinks echoed to OSX terminal
```


## Developer Tools

#### Chrome
- [Allow-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi)
 - Allows apiRedirection.js to work without explicit server configuration
 - Create rules such as: ```https://edgefolio-development.com/*```, ```https://*.edgefolio.com/*```,
 - Cannot access /api/users using token authentication

- [Switcheroo Redirector](https://chrome.google.com/webstore/detail/switcheroo-redirector/cnmciclhnghalnpfhhleggldniplelbg)
 - An alterative method of remote debugging
 - create redirect rule for: ```https://edgefolio.com/assets/ -> https://edgefolio-local.com/assets/```
 - Use development mode endpoints: [https://edgefolio.com/investor-app-unoptimized/](https://edgefolio.com/investor-app-unoptimized/), [https://edgefolio.com/manager-app-unoptimized/]([https://edgefolio.com/manager-app-unoptimized/])
 - NOTE: it is not possible to add new include files using this method
