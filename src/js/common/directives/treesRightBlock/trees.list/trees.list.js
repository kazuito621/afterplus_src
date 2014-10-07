app.directive('treesList',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/trees.list/trees.list.tpl.html'
        };
    }]);
