app.directive('sitesList',
    [function () {
        'use strict';

        var linker = function (scope) {

            scope.onChangeSiteCheck = function (site, checked) {
                scope.$emit('tree.select.site', site, checked);
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/sites.list/sites.list.tpl.html',
            scope: {
                filteredSites: '=',
                selectedSites: '='
            },
            link: linker
        };
    }]);
