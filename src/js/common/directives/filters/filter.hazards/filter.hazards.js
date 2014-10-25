app.directive('filterHazards',
    [function () {
        'use strict';

        var linker = function (scope) {
            scope.hazards = [
                {
                    key: 'building',
                    value: 'building',
                    name: 'Building',
                    class: 'fa fa-building _red'
                },
                {
                    key: 'caDamagePotential',
                    value: 'yes',
                    name: 'Hardscape Damage Potential',
                    class: 'fa fa-warning _orange'
                },
                {
                    key: 'caDamage',
                    value: 'yes',
                    name: 'Hardscape Damage',
                    class: 'fa fa-warning _red'
                },
                {
                    key: 'powerline',
                    value: 'yes',
                    name: 'Powerline',
                    class: 'fa fa-bolt _red'
                }
            ];

            scope.isShown = function () {
                var res = false;

                angular.forEach(scope.hazards, function (h) {
                    res = res || scope.tfsCounts[h.key];
                });

                return res;
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.hazards/filter.hazards.tpl.html',
            scope: {
                tfsCounts: '=',         //    TFSdata.filterTypeCounts
                initDataHazards: '=',   //    initdata.filters.hazards
                onFilterChange: '&'    //    onFilterChange(filterType, ID, value)
            },
            link: linker
        };
    }]);
