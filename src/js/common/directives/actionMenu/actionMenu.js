/**
 * Created by Imdadul Huq on 18-Mar-15.
 */

app.directive('actionMenu',
    ['$popover',
        function ($popover) {
            'use strict';

            var linker = function (scope, el, attrs){

                 $(el).click(function () {
                     scope.reportID=scope.report.reportID;
                     if (scope.actionMenuPopover && typeof scope.actionMenuPopover.hide === 'function') {
                         scope.actionMenuPopover.hide();
                     }
                     // create new one
                     if(!scope.actionMenuPopover)
                         scope.actionMenuPopover = $popover(el, {
                             scope: scope,
                             template: '/js/common/directives/actionMenu/actionMenu.tpl.html',
                             animation: 'am-flip-x',
                             placement: 'left',
                             trigger: 'click'
                         });
                     //show popover
                     scope.actionMenuPopover.$promise.then(function () {
                         scope.actionMenuPopover.show();
                     });
                 });
            };

            return {
                restrict: 'EA',
                replace: false,
                scope: true,
                compile: function () {
                    return linker;
                }
            };
        }]);
