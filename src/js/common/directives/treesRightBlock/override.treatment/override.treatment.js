/*global moment*/
app.directive('overrideTreatment',
    [function () {
        'use strict';

        var linker = function (scope) {
            scope.clearCodes = function () {
                scope.codes.length = 0;
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/override.treatment/override.treatment.tpl.html',
            scope: {
                codes: '=',         //    data.overrideTreatmentCodes
                treatments: '='     //    initData.filters.treatments
            },
            link: linker
        };
    }]);
