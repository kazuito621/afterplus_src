app.directive('mapSearchPanel',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/maps/map.search.panel/map.search.panel.tpl.html'
        };
    }]);
