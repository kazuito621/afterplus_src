/**
 * Created by usert on 17-Jan-15.
 */
app.directive('editableTextPopup',
    ['$popover',
        function ($popover) {
            return {
                restrict: 'EA',
                scope:{
                    value:'=editableTextPopup'
                },
                link: function (scope, el, attrs) {
                    scope.ok=function(){
                        scope.value=angular.copy(this.temp);
                        scope.popover.hide();
                    };

                    scope.cancel = function(){
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                        }
                    };

                    $(el).click(function () {
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                        }
                        scope.temp=angular.copy(scope.value);
                        // create new one
                        if(!scope.popover)
                            scope.popover = $popover(el, {
                                scope: scope,
                                template: '/js/common/directives/editableTextPopup/editableTextPopup.tpl.html',
                                animation: 'am-flip-x',
                                placement: 'right',
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
