/**
 * Created by usert on 17-Jan-15.
 */
app.directive('adjustPrice',
    ['$popover','ReportService',
        function ($popover,ReportService) {
            var a=0;
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {
                    scope.adjustPercentage=-1;
                    scope.ok=function(){
                        if(isNaN(scope.popover.$scope.adjustPercentage)==false &&
                            scope.popover.$scope.adjustPercentage>-100 &&
                            scope.popover.$scope.adjustPercentage<100 ){
                            _.each(scope.report.items,function(item){
                                item.price=(parseFloat(item.price)*(1+scope.popover.$scope.adjustPercentage/100)).toFixed(2);
                            });
                            scope.groupedItems = ReportService.groupReportItems();
                            scope.popover.hide();
                        }
                        else {
                            return;
                        }

                    };

                    scope.cancel = function(){
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                            //scope.popover=null;
                        }
                    }
                    $(el).click(function () {
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                        }
                        // create new one
                        if(!scope.popover)
                            scope.popover = $popover(el, {
                                scope: scope,
                                template: '/js/common/directives/adjustPriceInEstimate/adjustPrice.tpl.html',
                                animation: 'am-flip-x',
                                placement: 'left',
                                trigger: 'click'
                            });
                        //show popover
                        scope.popover.$promise.then(function () {
                            scope.popover.show();
                        });

                    });
                }
            }

        }]);
