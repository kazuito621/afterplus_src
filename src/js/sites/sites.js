'use strict';

var SitesCtrl = app.controller('SitesCtrl', 
['$scope', 'Restangular', '$route', '$modal', 
function ($scope, Restangular, $route, $modal) {
	var s=window.scs=$scope
		,myStateID='sites'
		,Rest=Restangular
		,mode=''
	s.newSite={clientID:''};


	s.init = function() {
		return	// using initData list for now... may need this later if we want more data
		Rest.all('site').getList().then(function(data){
			s.list = data;
		});
	}

	s.saveNewSite = function() {
		var obj=s.newSite;
		var that=this;
		if(!obj.clientID) {
			return s.setAlert('Choose a client for the new property',{type:'d'});
		} else {
			clientEditModal.hide();
		}
		Rest.all('site').post(obj).then( function(data) {
			if(data && data.siteID) {
				s.newSite={clientID:s.newSite.clientID}
				s.refreshInitData();
			}
		})
	}

	s.saveExistingSite = function() {
		var obj=s.site;
		var that=this;
		obj.post().then(function(){
			clientEditModal.hide();
			s.refreshInitData();
		});
	}
	
	var pre_init = function() {
		if($route.current.params.stateID==myStateID) s.init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();

	// Pre-fetch an external template populated with a custom scope
	var siteEditModal = $modal({scope: $scope, template: '/js/sites/edit.tpl.html', show: false});

	s.newSiteModalOpen = function (siteID) {
		s.site={};
		siteEditModal.show();
	}

	s.existingSiteModalOpen = function (siteID) {
		s.site={};
		Restangular.one('site', siteID).get()
			.then(function(data){
				s.site=data
		});
		s.mode = 'edit';
		siteEditModal.show();
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
		s.refreshInitData();
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
