/*global moment*/
app.directive('sitesSelector',
    [function () {
        'use strict';
        var linker = function (scope) {
            scope.totalMatchedTreeCount=0;
            scope.totalEstimatePrice=0;
            scope.toggle = function (opt) {
                if (opt) {
                    scope.selected = _.pluck(scope.items, 'siteID');
                } else {
                    scope.selected.length = 0;
                }
            };
            scope.getTotalTreeCount=function(){
                var totalMatchedTreeCount=0;
                for(var i=0;i<scope.items.length;i++){
                    if(scope.selected.indexOf(scope.items[i].siteID)!=-1){
                        if(scope.items[i].matchedTreesCount!=undefined)
                            totalMatchedTreeCount+=parseInt(scope.items[i].matchedTreesCount);
                    }
                }
                return totalMatchedTreeCount;
            }
            scope.getTotalEstimatePrice=function(){
                var totalEstimatePrice=0;
                for(var i=0;i<scope.items.length;i++){
                    if(scope.selected.indexOf(scope.items[i].siteID)!=-1){
                        if(scope.items[i].estimatePrice!=undefined)
                            totalEstimatePrice+=parseFloat(scope.items[i].estimatePrice);
                    }
                }
                return totalEstimatePrice;
            }
        };
        return {
            restrict: 'EA',
            replace: false,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/sites.selector/sites.selector.tpl.html',
            scope: {
                items: '=',
                selected: '=',
                name: '@'
            },
            link: linker
        };
    }]);
