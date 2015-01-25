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
                    scope.adjustPercentage=0;
                    scope.newTotal=0;
                    scope.ok=function(){
                        if(isNaN(scope.popover.$scope.adjustPercentage)==false &&
                            scope.popover.$scope.adjustPercentage>-100 &&
                            scope.popover.$scope.adjustPercentage<100 ){
                            _.each(scope.report.items,function(item){
                                var v=parseFloat(item.price)*(1+scope.popover.$scope.adjustPercentage/100);
                                if((v - Math.floor(v))<0.5){
                                    v=Math.floor(v);
                                }
                                else {
                                    v=Math.ceil(v);
                                }
                                item.price=v;
                            });
                            scope.groupedItems = ReportService.groupReportItems();
                            scope.popover.hide();
                            scope.newTotal=0;
                        }
                        else {
                            return;
                        }

                    };
                    scope.change=function(){
                        var n=this.adjustPercentage;
                        if(isNaN(n)==false && n>-100 && n<100 ){
                            scope.newTotal=0;
                            _.each(scope.report.items,function(item){
                                //scope.newTotal=scope.newTotal+parseFloat(parseFloat((parseFloat(item.price)*(1+n/100)).toFixed(2)));
                                var v=(parseFloat(item.price)*(1+n/100));
                                if((v - Math.floor(v))<0.5){
                                    v=Math.floor(v);
                                }
                                else {
                                    v=Math.ceil(v);
                                }
                                scope.newTotal=scope.newTotal+v;
                            });
                            //scope.newTotal=parseFloat(scope.newTotal).toFixed(2);
                        }
                        else {
                            scope.newTotal="N/A";
                        }

                    }
                    scope.cancel = function(){
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                            //scope.popover=null;
                        }
                    }
                    $(el).click(function () {
                        scope.adjustPercentage=0;
                        scope.newTotal=0;
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
