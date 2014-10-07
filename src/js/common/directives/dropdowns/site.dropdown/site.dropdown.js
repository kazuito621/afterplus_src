app.directive('siteDropdown',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/dropdowns/site.dropdown/site.dropdown.tpl.html',
            scope: {
                model: '=',
                onChange: '&',
                data: '='
            }
        };
    }]);
