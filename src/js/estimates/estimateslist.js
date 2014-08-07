var EstimatesListCtrl = app.controller('EstimatesListCtrl', 
['$scope', '$route', 'Api', '$location', 'Auth',
function ($scope, $route, Api, $location, Auth) {
    'use strict';
    var s = window.ecs = $scope;
    s.estimates = [];

    var init = function () {
        var search = $location.search();
        Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
			if(Auth.is('customer')){
				_.each(data, function(d){
					if(d.status=='sent') d.status='needs_approval';
				});
			}
            s.estimates = data;
        });
    };

    s.goToEstimate = function (reportID) {
        $location.url('/estimate/' + reportID);
    };

	init();

}]);


