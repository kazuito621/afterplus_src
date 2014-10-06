app.directive('filterHazards',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.hazards/filter.hazards.tpl.html',
            scope: {
                tfsCounts: '=',         //    TFSdata.filterTypeCounts
                initDataHazards: '=',   //    initdata.filters.hazards
                onFilterChange: '&'    //    onFilterChange(filterType, ID, value)
            }
        };
    }]);
