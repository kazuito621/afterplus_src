'use strict';

var ClientsCtrl = app.controller('ClientsCtrl',
['$scope', '$route', '$modal', 'Api',
function ($scope, $route, $modal, Api) {
	var s = window.cts = $scope
		,myStateID='clients'
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
            Api.saveNewClient(s.newClient).then( function(data) {
                console.log(s.newClient);
                console.log("Post new client response:");
                console.dir(data);
            });
        }
        clientEditModal.hide();
        Api.refreshInitData();
    };

	s.saveExistingClient = function() {
		var obj=s.client;
		var that=this;
		obj.post().then(function(){
			//in the old HEAD of evren07, this if statement existed priort to the "refresh" call
			//is this necessary? would "saveExistingClient" every be executed if the state was NOT clients??
			//if($route.current.params.stateID=='clients') {
			Api.refreshInitData();
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
		s.newClient={};
		s.mode='new';
		clientEditModal.show();
	};

	s.existingClientModalOpen = function (clientID) {
		s.client={};
        Api.getClientById(clientID)
			.then(function(data){
				s.client = data;
		});
		s.mode = 'edit';
		clientEditModal.show();
	};

	s.deleteItems = function (itemID) {
        Api.removeClientById(itemID)
			.then(function() {
				Api.refreshInitData();
			},function err(){
				//todo ... how do we get this?
				// todo -- ad this same functionality to delete of site
			});
		Api.refreshInitData();
	};

	s.queueOrDequeueItemForDelete = function(itemID) {
		if (!s.isSelected(itemID)) {
			s.items[itemID] = '1';
		} else {
			delete s.items[itemID];
		}
		s.type = 'client';
	};

	s.isSelected = function(itemID) {
		if (s.items[itemID] == 1) {
			return true;
		} else {
			return false;
		}
	}

}]);
