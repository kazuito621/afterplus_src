app.directive('emailLogs',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/email.logs/email.logs.tpl.html',
            scope: {
                report: '='
            }
        };
    }]);
