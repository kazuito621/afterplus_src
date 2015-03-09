// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
	//bower:js
      'src/bower_components/angular/angular.js',
      'src/bower_components/angular-bindonce/bindonce.js',
      'src/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'src/bower_components/ng-tags-input/ng-tags-input.js',
      'src/bower_components/ng-ckeditor/libs/ckeditor/ckeditor.js',
      'src/bower_components/ng-ckeditor/ng-ckeditor.js',
      'src/bower_components/angular-mocks/angular-mocks.js',
	  'src/bower_components/jquery/dist/jquery.js',
  	  'src/bower_components/angular/angular.js',
  	  'src/bower_components/bootstrap/dist/js/bootstrap.js',
  	  'src/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
  	  'src/bower_components/lodash/dist/lodash.compat.js',
  	  'src/bower_components/restangular/dist/restangular.js',
  	  'src/bower_components/ng-table/ng-table.js',
  	  'src/bower_components/angular-route/angular-route.js',
  	  'src/bower_components/angular-xeditable/dist/js/xeditable.js',
      'src/bower_components/angular-md5/angular-md5.js',
      'src/bower_components/angular-sanitize/angular-sanitize.js',
      'src/bower_components/angular-animate/angular-animate.js',
      'src/bower_components/angular-strap/dist/angular-strap.min.js',
      'src/bower_components/angular-strap/dist/angular-strap.tpl.min.js',
      'src/bower_components/angularLocalStorage/src/angularLocalStorage.js',
      'src/bower_components/angular-cookies/angular-cookies.js',
      'src/js/*.js',
      'src/js/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js',
	//endbower
      'dist/compiled-tpl/templates.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 9100,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
