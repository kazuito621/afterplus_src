app.directive('clientDropdown',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/dropdowns/client.dropdown/client.dropdown.tpl.html',
            scope: {
                model: '=',
                onChange: '&',
                data: '=',
                all: '='
            }
        };
    }]);
