/**
 * Created by Imdadul Huq on 06-May-15.
 */

app.directive('enterUserInfo',
    ['$popover','Api',
        function ($popover,Api) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {
                    $(el).click(function () {
                        scope.newTotal=angular.copy(scope.$parent.report.total.items);
                        if (scope.popover && typeof scope.popover.hide === 'function') {
                            scope.popover.hide();
                        }
                        // create new one
                        if(!scope.popover)
                            scope.popover = $popover(el, {
                                scope: scope,
                                template: '/js/common/directives/enterUserInfo/enterUserInfo.tpl.html',
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
