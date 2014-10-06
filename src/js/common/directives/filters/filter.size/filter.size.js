app.directive('filterSize',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.size/filter.size.tpl.html',
            scope: {
                tfsCountsTreatments: '=',   //    TFSdata.filterTypeCounts.treatments
                initDataDbh: '=',           //    initData.filters.dbh
                onFilterChange: '&'        //    onFilterChange
            }
        };
    }]);
