var EstimatesListCtrl = app.controller('EstimatesListCtrl', ['$scope', '$route', 'Api', '$location', function ($scope, $route, Api, $location) {
    'use strict';
    var s = window.ecs = $scope;
    s.estimates = [];

    var init = function () {
        var search = $location.search();
        Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
            s.estimates = data;
        });
    };

    s.goToEstimate = function (reportID) {
        $location.url('/estimate/' + reportID);
    };

	init();

}]);


