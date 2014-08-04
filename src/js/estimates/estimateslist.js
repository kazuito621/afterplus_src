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

    var pre_init = function () {
        init();
    };

    s.goToEstimate = function (reportID) {
        $location.url('/estimate/' + reportID);
    };

    s.$on('$locationChangeSuccess', pre_init);
    pre_init();
}]);


