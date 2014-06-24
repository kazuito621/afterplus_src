'use strict';

var SitesCtrl = app.controller('SitesCtrl', 
['$scope', 'Restangular', '$route', '$modal', 
function ($scope, Restangular, $route, $modal) {
	var s=window.scs=$scope
		,myStateID='sites'
		,Rest=Restangular
		,mode=''
		,type='site'
	s.newSite={clientID:''};
	s.items = {};

	var init = function() {
		return	// using initData list for now... may need this later if we want more data
	}

	s.saveNewSite = function() {
		if(!s.newSite.clientID) {
			return s.setAlert('Choose a client for the new property',{type:'d'});
		} else {
			Rest.all('site').post(s.newSite).then( function(data) {
				console.log(s.newSite);
				console.log("Post new site response:");
				console.dir(data);
			})
			siteEditModal.hide();
			s.refreshInitData();
		}
	}

	s.saveExistingSite = function() {
		var obj=s.site;
		var that=this;
		obj.post().then(function(){
			s.refreshInitData();
		});
		siteEditModal.hide();
	}
	
	var pre_init = function() {
		if($route.current.params.stateID==myStateID) init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();

	// Pre-fetch an external template populated with a custom scope
	var siteEditModal = $modal({scope: $scope, template: '/js/sites/edit.tpl.html', show: false});

	s.newSiteModalOpen = function (siteID) {
		s.site={};
		s.mode='new';
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

	s.deleteItems = function (itemID) {
		console.log("itemID",itemID)
		Restangular.one('site', itemID).remove().then(function(data) {
			console.log(data);
			s.refreshInitData();
		});
		s.refreshInitData();
	}

	s.queueOrDequeueItemForDelete = function(itemID) {
		if (!s.isSelected(itemID)) {
			s.items[itemID] = '1';
		} else {
			delete s.items[itemID];
		}
		s.type = 'site';
	}

	s.isSelected = function(itemID) {
		if (s.items[itemID] == 1) {
			return true;
		} else {
			return false;
		}
	}

}]);
