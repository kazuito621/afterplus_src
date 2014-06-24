'use strict';

var ClientsCtrl = app.controller('ClientsCtrl', 
['$scope', 'Restangular', '$timeout', '$route', '$modal', '$popover', 
function ($scope, Restangular, $timeout, $route, $modal, $popover) {
	var s = window.cts = $scope
		,myStateID='clients'
		,Rest=Restangular
		,mode=''
		s.newClient={};

	var init = function() {
		return; // use this method only if you need to get more data than what initData provides...
		s.Rclient = Rest.all('client').getList({fields:'*'}).then(function(data){
			s.clientList=data;
			});
	}

	//s.Rclient.push() .. to push new data...

	s.saveNewClient = function() {
		var obj=s.newClient;
		var that=this;
		if(!obj.clientTypeID) {
			return s.setAlert('Choose a client type for the new client',{type:'d'});
		} else {
			clientEditModal.hide();
		}
		Rest.all('client').post(s.newClient).then( function(data) {
			if(data && data.clientID) {
				s.newClient={clientTypeID:s.newClient.clientTypeID};
				s.refreshInitData();
			}
		})
	}

	s.saveExistingClient = function() {
		var obj=s.client;
		var that=this;
		obj.post().then(function(){
			clientEditModal.hide();
			s.refreshInitData();
		});
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

	s.alertShown = 0;
	s.items = {};

	s.toggleAlert = function() {
		if (Object.keys(s.items).length > 0) {
			// s.alertBox.hide();
			s.setAlert(false);
			s.alertShown = 0;
		} else if (s.alertShown == 0) {
			s.alertShown = 1;
			var alertMarkup = '<button type="button" ng-controller="ClientsCtrl" ng-click="deleteItems(c.clientID)" class="btn btn-default ">APPLY CHANGES</button>';
		}
	}

	s.deleteItems = function (itemID) {
		Restangular.one('client', itemID).remove().then(function() {});
	}

	s.unselectAllItems = function () {
		s.toggleAlert();
	}

	s.queueOrDequeueItemForDelete = function(itemID) {
		if (!s.isSelected(itemID)) {
			s.items[itemID] = '1';
		} else {
			delete s.items[itemID];
		}
		s.toggleAlert();
	}

	s.isSelected = function(itemId) {
		if (s.items[itemId] == 1) {
			return true;
		} else {
			return false;
		}
	}

}]);
