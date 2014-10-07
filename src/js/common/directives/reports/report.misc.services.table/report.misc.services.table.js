app.directive('reportMiscServicesTable',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/report.misc.services.table/report.misc.services.table.tpl.html'
        };
    }]);
