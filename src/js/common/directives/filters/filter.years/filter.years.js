app.directive('filterYears',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.years/filter.years.tpl.html',
            scope: {
                filtersYear: '=',   //    filters.year
                filtersYears: '=',  //    filters.years
                onSelectYear: '&'   //    onSelectYear(id)
            }
        };
    }]);
