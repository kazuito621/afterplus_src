app.directive('recentEstimates',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/recent.estimates/recent.estimates.tpl.html',
            scope: {
                model: '=', //  rdata.recentReportID
                recentReportList: '=',
                getRecentReportTitle: '&'
            }
        };
    }]);
