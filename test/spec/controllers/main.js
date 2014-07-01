'use strict';
//http://nathanleclaire.com/blog/2013/12/13/how-to-unit-test-controllers-in-angularjs-without-setting-your-hair-on-fire/

describe('Controller: MainCtrl', function () {

	var MainCtrl, scope;

  	// load the controller's module
  	beforeEach(module('arborPlusApp'));

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		MainCtrl = $controller('MainCtrl', {
			$scope: scope
		});

		var done=false;
		function chk(){
			setTimeout(function(){
        done = true;
      }, 1000); 
		}

		runs(chk);

		waitsFor(function(){
			return done;
		});

	}));

	it('should be alive', function () {
		expect(scope.whoami).toBe('MainCtrl');
	});

	it('should have initdata', function() {
		//expect(scope.initData.filters).toBeDefined();
	});

//todo try out this async stuff:
//http://lostechies.com/derickbailey/2012/08/18/jasmine-async-making-asynchronous-testing-with-jasmine-suck-less/

	

});
