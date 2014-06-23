'use strict';

var EditClientCtrl = app.controller('EditClientCtrl',
	['$scope', '$http', '$route', '$modal',
	function ($scope, $http, $route, $modal) {
	var s=window.scs=$scope
		,myStateID='client-edit'
		s.clientID;
		s.client;
		s.client_cachebuster='?ts='+moment().unix();

	s.init = function() {
		return
	}

	var pre_init = function() {
		if($route.current.params.stateID==myStateID) s.init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();

}]);
