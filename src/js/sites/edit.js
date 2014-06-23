'use strict';

var EditSiteCtrl = app.controller('EditSiteCtrl',
	['$scope', '$http', '$route', '$modal',
	function ($scope, $http, $route, $modal) {
	var s=window.scs=$scope
		,myStateID='site-edit'
		s.siteID;
		s.site;
		s.site_cachebuster='?ts='+moment().unix();

	s.init = function() {
		return
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

	var pre_init = function() {
		if($route.current.params.stateID==myStateID) s.init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();

}]);
