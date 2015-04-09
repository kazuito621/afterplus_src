/**
 * Created by Imdadul Huq on 09-Apr-15.
 */
app.directive('jumpToCalender',
    ['$popover', '$location',
        function ($popover,$location) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {

                    if (angular.isDefined(attrs.parentModal)) {
                        scope.parentModal = scope.$eval(attrs.parentModal);
                    }

                    scope.go=function(){
                        popover.hide();
                        scope.parentModal.hide();
                        $location.path('/calender');
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
                            template: '/js/common/directives/jumpToCalender/jumpToCalender.tpl.html',
                            show: false,
                            animation: 'am-flip-x',
                            placement: 'left',
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
