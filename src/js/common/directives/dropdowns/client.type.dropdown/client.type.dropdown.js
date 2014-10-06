app.directive('clientTypeDropdown',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/dropdowns/client.type.dropdown/client.type.dropdown.tpl.html',
            scope: {
                model: '=',     //    selected.clientTypeID
                onChange: '&',  //    onSelectClientTypeID
                data: '='       //    initData.clientTypes
            }
        };
    }]);
