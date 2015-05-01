/**
 * Created by Imdadul Huq on 09-Apr-15.
 */
app.directive('jumpToCalendar',
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
                        $location.path('/calendar');
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
                            template: '/js/common/directives/jumpToCalendar/jumpToCalendar.tpl.html',
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
