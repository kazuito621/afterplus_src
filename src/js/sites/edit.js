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

	var pre_init = function() {
		if($route.current.params.stateID==myStateID) s.init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();

}]);
