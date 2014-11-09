/*global moment*/
app.directive('sitesSelector',
    [function () {
        'use strict';

        var linker = function (scope) {
            scope.toggle = function (opt) {
                if (opt) {
                    scope.selected = _.pluck(scope.items, 'siteID');
                } else {
                    scope.selected.length = 0;
                }
            };
        };

        return {
            restrict: 'EA',
            replace: false,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/sites.selector/sites.selector.tpl.html',
            scope: {
                items: '=',
                selected: '=',
                name: '@'
            },
            link: linker
        };
    }]);
