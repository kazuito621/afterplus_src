app.directive('filterHealth',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.health/filter.health.tpl.html',
            scope: {
                tfsCountsRating: '=',   //    TFSdata.filterTypeCounts.rating
                initDataRatings: '=',   //    initData.filters.ratings
                onFilterChange: '&'     //    onFilterChange
            }
        };
    }]);
