app.directive('leftColumnFiltersSection',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/left.column.filters.section/left.column.filters.section.tpl.html'
        };
    }]);
