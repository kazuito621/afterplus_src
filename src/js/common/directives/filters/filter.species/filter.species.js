app.directive('filterSpecies',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.species/filter.species.tpl.html',
            scope: {
                tfsSpecies: '=',            //    TFSdata.filterTypeCounts.species
                filterSearchSpecies: '=',   //    filterSearch.species
                initDataSpecies: '=',       //    initData.filters.species
                onFilterChange: '&'         //    onFilterChange('species', speciesType.speciesID, speciesType.selected)
            }
        };
    }]);
