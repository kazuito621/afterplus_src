'use strict';

var ClientsCtrl = app.controller('ClientsCtrl', 
['$scope', 'Restangular', '$timeout', '$route',
function ($scope, Restangular, $timeout, $route) {
	var s = window.cts = $scope
		,myStateID='clients'
		,Rest=Restangular
		s.newClient={};

	var init = function() {
		return; // use this method only if you need to get more data than what initData provides...
		s.Rclient = Rest.all('client').getList({fields:'*'}).then(function(data){
			s.clientList=data;
			});
	}


	//s.Rclient.push() .. to push new data...
	s.saveNewClient = function() {
		Rest.all('client').post(s.newClient).then( function(data) {
			if(data && data.clientID) s.newClient={clientTypeID:s.newClient.clientTypeID};
			s.refreshInitData();
		})
	}


	var pre_init = function() {
		if($route.current.params.stateID==myStateID) init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();

	// HOW TO Add a new client
	//s.newClient={clientName:'tim2', clientTypeID:1, street:'123 main'};
	//save(s.newClient)

	// Update an existing client
	/*
	s.Rest.one('client', 38).get().then(function(data){
		data.clientName='tim44xx55';
		data.post();
	})
	*/


}]);
