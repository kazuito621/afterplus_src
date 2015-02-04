/**
 * Created by usert on 17-Jan-15.
 */
app.directive('adjustPrice',
    ['$popover','ReportService',
        function ($popover,ReportService) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {
                    scope.adjustPercentage=0;
                    scope.doRoundPrice=false;
                    scope.ok=function(){
                        scope.newTotal=0;
                        var doRoundPrice=this.doRoundPrice;
                        if(isNaN(scope.popover.$scope.adjustPercentage)==false &&
                            scope.popover.$scope.adjustPercentage>-100 &&
                            scope.popover.$scope.adjustPercentage<100 ){
                            _.each(scope.$parent.report.items,function(item){
                                var v=parseFloat(item.price)*(1+scope.popover.$scope.adjustPercentage/100);
                                if(doRoundPrice){
                                    if((v - Math.floor(v))<0.5){
                                        v=Math.floor(v);
                                    }
                                    else {
                                        v=Math.ceil(v);
                                    }
                                    item.price=v;
                                }
                                else {
                                    item.price=parseFloat(v.toFixed(2));
                                }
                            });
                            scope.$parent.groupedItems = ReportService.groupReportItems();
                            scope.popover.hide();
                            scope.adjustPercentage=0;
                            scope.popover.$scope.adjustPercentage=0;
                        }
                        else {
                            return;
                        }
                    };
                    scope.change=function(){
                        var n=this.adjustPercentage;
                        var doRoundPrice=this.doRoundPrice;
                        if(isNaN(n)==false && n>-100 && n<100 ){
                            scope.newTotal=0;
                            _.each(scope.$parent.report.items,function(item){
                                var v=(parseFloat(item.price)*(1+n/100));
                                if(doRoundPrice){
                                    if((v - Math.floor(v))<0.5){
                                        v=Math.floor(v);
                                    }
                                    else {
                                        v=Math.ceil(v);
                                    }
                                    scope.newTotal=scope.newTotal+ v;
                                }
                                else{
                                    scope.newTotal=scope.newTotal+ parseFloat(v.toFixed(2));
                                }
                            });
                            scope.newTotal=parseFloat(scope.newTotal.toFixed(2))
                        }
                        else {
                            scope.newTotal="N/A";
                        }
                    }

                    scope.cancel = function(){
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.adjustPercentage=0;
                            scope.popover.$scope.adjustPercentage=0;
                            scope.popover.hide();
                        }
                    }
                    $(el).click(function () {
                        scope.adjustPercentage=0;
                        scope.newTotal=angular.copy(scope.$parent.report.total.items);
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
