'use strict';

var ClientsCtrl = app.controller('ClientsCtrl', 
['$scope', 'Restangular', '$route', '$modal',
function ($scope, Restangular, $route, $modal) {
	var s = window.cts = $scope
		,myStateID='clients'
		,Rest=Restangular
		,mode=''
		,type='client'
		s.newClient={};
		s.items = {};

	var init = function() {
		return; // use this method only if you need to get more data than what initData provides...
	}

	//s.Rclient.push() .. to push new data...

	s.saveNewClient = function() {
		if(!s.newClient.clientTypeID) {
			return s.setAlert('Choose a client type for the new client',{type:'d'});
		} else {
			Rest.all('client').post(s.newClient).then( function(data) {
				console.log(s.newClient);
				console.log("Post new client response:");
				console.dir(data);
			})
		}
		clientEditModal.hide();
		s.refreshInitData();
	}

	s.saveExistingClient = function() {
		var obj=s.client;
		var that=this;
		obj.post().then(function(){
			s.refreshInitData();
		});
		clientEditModal.hide();
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

	// Pre-fetch an external template populated with a custom scope
	var clientEditModal = $modal({scope: $scope, template: '/js/clients/edit.tpl.html', show: false});

	s.newClientModalOpen = function (clientID) {
		s.client={};
		s.mode='new';
		clientEditModal.show();
	}

	s.existingClientModalOpen = function (clientID) {
		s.client={};
		Restangular.one('client', clientID).get()
			.then(function(data){
				s.client=data
		});
		s.mode = 'edit';
		clientEditModal.show();
	}

	s.deleteItems = function (itemID) {
		Restangular.one('client', itemID).remove()
			.then(function() {
				s.refreshInitData();
			},function err(){
				//todo ... how do we get this?
				// todo -- ad this same functionality to delete of site
			});
		s.refreshInitData();
	}

	s.queueOrDequeueItemForDelete = function(itemID) {
		if (!s.isSelected(itemID)) {
			s.items[itemID] = '1';
		} else {
			delete s.items[itemID];
		}
		s.type = 'client';
	}

	s.isSelected = function(itemID) {
		if (s.items[itemID] == 1) {
			return true;
		} else {
			return false;
		}
	}

}]);
