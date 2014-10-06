app.directive('filterTreatmentType',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/filters/filter.treatment.type/filter.treatment.type.tpl.html',
            scope: {
                tfsTreatments: '=',             //    TFSdata.filterTypeCounts.treatments
                filterSearchTreatments: '=',    //    filterSearch.treatments
                initDataTreatments: '=',         //    initData.filters.treatments
                onFilterChange: '&'             //    onFilterChange('treatments', t.treatmentTypeID, t.selected)
            }
        };
    }]);
