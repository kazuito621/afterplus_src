app.directive('centerTopBlock',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/centerTopBlock/center.top.block.tpl.html'
        };
    }]);
