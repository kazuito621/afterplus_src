app.directive('deleteWithConfirmButton',
    ['$popover',
        function ($popover) {
            return {
                restrict: 'EA',
                //scope: {
                //    type: '@', //site/client/estimate
                //    itemId: '=',
                //    activePopover: '=', //we should monitor, that only one popover can be visible
                //    onConfirmCallback: '&'
                //},
                link: function (scope, el, attrs) {

                    if (angular.isDefined(attrs.itemId)) {
                        scope.itemId = scope.$eval(attrs.itemId);
                    }
                    if (angular.isDefined(attrs.activePopover)) {
                        scope.activePopover = scope.$eval(attrs.activePopover);
                    }
//
                    if (angular.isDefined(attrs.onConfirmCallback)) {
                        scope.onConfirmCallback = attrs.onConfirmCallback;
                    }
//
                    if (angular.isDefined(attrs.type)) {
                        scope.type = attrs.type;
                    }
                                        
                    $(el).click(function () {
                        //if another is visible, then hide it
                        if (scope.activePopover && scope.activePopover.elem && typeof scope.activePopover.elem.hide === 'function') {
                            scope.activePopover.elem.hide();
                        }

                        // create new one
                        scope.activePopover.elem = $popover(el, {
                            scope: scope,
                            template: '/js/common/directives/deleteWithConfirmButton/delete.tpl.html',
                            show: false,
                            animation: 'am-flip-x',
                            placement: 'left',
                            trigger: 'focus'
                        });

                        scope.activePopover.itemID = scope.itemId;

                        scope.$apply();

                        //show popover
                        scope.activePopover.elem.$promise.then(function () {
                            scope.activePopover.elem.show();
                        });


                    });

                    scope.cancel = function(){
                        if (scope.activePopover && scope.activePopover.elem && typeof scope.activePopover.elem.hide === 'function') {
                            scope.activePopover.elem.hide();
                        }
                    }
                }
            }

    }]);
