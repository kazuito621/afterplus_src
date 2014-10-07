app.directive('estimateSummary',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/estimate.summary/estimate.summary.tpl.html',
            scope: {
                report: '=',
                mode: '&'
            }
        };
    }]);
