app.directive('sitesList',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/sites.list/sites.list.tpl.html',
            scope: {
                filteredSites: '=',
                selectedSites: '='
            }
        };
    }]);
