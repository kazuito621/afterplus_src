app.directive('reportEstimatesTable',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/report.estimates.table/report.estimates.table.tpl.html'
        };
    }]);
