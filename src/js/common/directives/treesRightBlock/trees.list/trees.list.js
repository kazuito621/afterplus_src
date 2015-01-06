app.directive('treesList',
    [function () {
        'use strict';

        return {
            restrict: 'EA',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/trees.list/trees.list.tpl.html',
            controller: ['$scope', function ($scope) {

                $scope.total = $scope.trees.length;
                $scope.limit = 50;

                $scope.$watch('trees', function () {
                    $scope.total = $scope.trees.length;
                    $scope.limit = 50;
                    setTimeout(function () {
                        $scope.setLimit();
                    }, 1000);
                })


                $scope.setLimit = function () {
                    $scope.$apply(function () {
                        $scope.limit += 20;
                    })

                    if ($scope.limit >= $scope.total) {
                        //Do Nothing
                    }
                    else {
                        setTimeout(function () {
                            $scope.setLimit();
                        }, 1000);
                    }
                }
            }]
        };
    }]);
