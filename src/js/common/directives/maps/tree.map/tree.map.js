app.directive('treeMap',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/maps/tree.map/tree.map.tpl.html',
            scope: {

            }
        };
    }]);
