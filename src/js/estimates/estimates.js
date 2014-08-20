var EstimatesListCtrl = app.controller('EstimatesListCtrl', 
['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper',
function ($scope, $route, Api, $location, Auth, SortHelper) {
    'use strict';
    var s = window.ecs = $scope;
	var myStateID='estimates';
    var self = this;
    s.estimates = [];
    s.displayedEstimates = [];
    var columnMap = {
        'total_price': 'number'
    };

    var init = function () {
        var search = $location.search();
        Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
			if(Auth.is('customer')){
				_.each(data, function(d){
					if(d.status=='sent') d.status='needs_approval';
				});
			}
            s.estimates = data;
            self.sh = SortHelper.sh(s.estimates, '', columnMap);
            s.displayedEstimates = s.estimates.slice(0, 49);
        });
    };

    s.sh = {
        sortByColumn: function (col) {
            s.estimates = self.sh.sortByColumn(col);
            s.displayedEstimates = s.estimates.slice(0, s.displayedEstimates.length);
        },
        columnClass: function (col) {
            return self.sh.columnClass(col);
        }
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


