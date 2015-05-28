/**
 * Created by Imdadul Huq on 15-Mar-15.
 */

app.directive('selectMiscService',
    ['$popover','Api',
        function ($popover,Api) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {
                    scope.services= [];
                    Api.getServiceDesc().then(function(data){
                        scope.services=data;
                    });
                    scope.onSelect=function(svc){
                        scope.popover.hide();
                        scope.setServiceDetails(svc);
                    }

                    scope.cancel = function(){
                        scope.popover.hide();
                    };

                    var hideOnEscape = function(e){
                        if(e.keyCode === 27) scope.cancel();
                    };

                    $(el).click(function () {

                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                        }
                        // create new one
                        if(!scope.popover)
                            scope.popover = $popover(el, {
                                scope: scope,
                                template: '/js/common/directives/adjustPriceInEstimate/selectMiscService.tpl.html',
                                animation: 'am-flip-x',
                                placement: 'right',
                                trigger: 'click'
                            });
                        //show popover
                        scope.popover.$promise.then(function () {
                            scope.popover.show();
                            $(document).keyup(hideOnEscape);
                        });

                    });
                }
            }

        }]);
