'use strict';

var SitesCtrl = app.controller('SitesCtrl', 
['$scope', 'Restangular', '$route', '$modal', 
function ($scope, Restangular, $route, $modal) {
	var s=window.scs=$scope
		,myStateID='sites'
		,Rest=Restangular
		,mode='edit'
	s.newSite={clientID:''};


	s.init = function() {
		return	// using initData list for now... may need this later if we want more data
		Rest.all('site').getList().then(function(data){
			s.list = data;
		});
	}

	s.saveNewSite = function() {
		var obj=s.newSite;
		if(!obj.clientID) return s.setAlert('Choose a client for the new property',{type:'d'});
		var that=this;
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
		Restangular.one('site', siteID).get()
			.then(function(data){
				s.site=data
		});
		s.mode = 'edit';
		siteEditModal.show();
	}


}]);
