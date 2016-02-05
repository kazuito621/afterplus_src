app.directive('reportEstimatesTable',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/reports/report.estimates.table/report.estimates.table.tpl.html',
            controller: ['$scope', function ($scope) {
                //$scope.showMoreText = "Show More";
                $scope.total = $scope.groupedItems.length;
                $scope.limit = 100;

                //if ($scope.limit >= $scope.total) {                    
                //    $scope.overLimit = true;
                //}

                $scope.$watch('groupedItems', function () {
                    $scope.total = $scope.groupedItems.length;
                    $scope.limit = 100;
                    $scope.timeoutID = $scope.setLimit();
                });

                //$scope.overLimit = false;

                //$scope.showMore = function () {
                //    $scope.limit += 300;

                //    if ($scope.limit >= $scope.total) {
                //        $scope.overLimit = true;
                //    }                    
                //}

                $scope.setLimit = function () {
						try{
                    $scope.$apply(function () {
                        $scope.limit += 100;
                    })

                    if ($scope.limit >= $scope.total) {
                        window.clearTimeout($scope.timeoutID);
                        delete $scope.timeoutID;
                        //Do Nothing
                    }
                    else {
                            $scope.setLimit();
                    }
						}catch(e){}
                }
            }]
        };
    }]);
