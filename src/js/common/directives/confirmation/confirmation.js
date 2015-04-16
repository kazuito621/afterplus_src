/**
 * Created by Imdadul Huq on 11-Apr-15.
 */
app.directive('confirmPopup',
    ['$popover',
        function ($popover) {
            return {
                restrict: 'EA',
                /*scope:{
                    callback:"&",
                    message:"@confirmPopup"
                },*/
                link: function (scope, el, attrs) {

                    if (angular.isDefined(attrs.callback)) {
                        scope.callback = scope.$eval(attrs.callback);
                    }
                    if (angular.isDefined(attrs.userId)) {
                        scope.userID = scope.$eval(attrs.userId);
                    }
                    if (angular.isDefined(attrs.confirmPopup)) {
                        scope.message = scope.$eval(attrs.confirmPopup);
                    }

                    scope.ok=function(){
                        popover.hide();
                        scope.callback(scope.userID);
                    };

                    var popover;

                    $(el).click(function () {
                        //if another is visible, then hide it
                        if (popover && typeof popover.hide === 'function') {
                            popover.hide();
                        }

                        // create new one
                        popover = $popover(el, {
                            scope: scope,
                            template: '/js/common/directives/confirmation/confirmation.tpl.html',
                            show: false,
                            animation: 'am-flip-x',
                            placement: 'right',
                            trigger: 'focus'
                        });

                        popover.$promise.then(function () {
                            popover.show();
                        });


                    });

                    scope.cancel = function () {
                        if (popover && typeof popover.hide === 'function') {
                            popover.hide();
                        }
                    }
                }
            }

        }]);