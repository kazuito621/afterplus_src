var EstimatesListCtrl = app.controller('EstimatesListCtrl', 
['$scope', '$route', 'Api', '$location', 'Auth',
function ($scope, $route, Api, $location, Auth) {
    'use strict';
    var s = window.ecs = $scope;
	var myStateID='estimates';
    s.estimates = [];
    s.displayedEstimates = [];

    var init = function () {
        var search = $location.search();
        Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
			if(Auth.is('customer')){
				_.each(data, function(d){
					if(d.status=='sent') d.status='needs_approval';
				});
			}
            s.estimates = data;
            s.displayedEstimates = s.estimates.slice(0, 49);
        });
    };

    s.showMoreEstimates = function () {
        var count = s.displayedEstimates.length;
        if (count === s.estimates.length) {
            return;
        }

        var addon = s.estimates.slice(count, count + 50);
        s.displayedEstimates = s.displayedEstimates.concat(addon);
    };

    s.goToEstimate = function (reportID) {
        $location.url('/estimate/' + reportID);
    };

	init();
	s.$on('nav', function (e, data) {
		if (data.new === myStateID) init();
	});

}]);


