app.directive('reportEstimatesTable',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/report.estimates.table/report.estimates.table.tpl.html',
            controller: ['$scope', function ($scope) {
                $scope.showMoreText = "Show More";
                $scope.total = $scope.groupedItems.length;
                $scope.limit = 50;

                if ($scope.limit >= $scope.total) {                    
                    $scope.overLimit = true;
                }

                $scope.$watch('groupedItems', function () {
                    $scope.total = $scope.groupedItems.length;
                    $scope.limit = 50;
                    if ($scope.limit >= $scope.total) {                        
                        $scope.overLimit = true;
                    }
                });

                $scope.overLimit = false;

                $scope.showMore = function () {
                    $scope.limit += 50;

                    if ($scope.limit >= $scope.total) {
                        $scope.overLimit = true;
                    }                    
                }

            }]
        };
    }]);
