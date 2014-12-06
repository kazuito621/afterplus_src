/**
 * Created by vmelekh on 05.12.2014.
 */
app.directive('treeImagePopover', ['$window', function ($window) {
    'use strict';

    function getViewport() {
        var viewPortWidth, viewPortHeight;

        // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
        if (typeof $window.innerWidth !== 'undefined') {
            viewPortWidth = $window.innerWidth;
            viewPortHeight = $window.innerHeight;
        }

// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
        else if (typeof document.documentElement !== 'undefined'
            && typeof document.documentElement.clientWidth !== 'undefined' && document.documentElement.clientWidth != 0) {
            viewPortWidth = document.documentElement.clientWidth;
            viewPortHeight = document.documentElement.clientHeight;
        }
        // older versions of IE
        else {
            viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
            viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
        }

        return {width : viewPortWidth, height: viewPortHeight};
    }

    var linker = function (scope, el, attrs) {
        //get screen size: {width, height}
        scope.viewport = getViewport();
        //approximate popover height, hardcoded
        scope.treePopoverHeight = 350;

        scope.mousePosition = undefined;

        $(el).find('img').popover();

        $(el).find('img').on('shown.bs.popover', function (e) {
            //console.info(scope.mousePosition);
            //console.info(scope.viewport);

            if (!scope.viewport || !scope.mousePosition) return;

            //apply css fixes on popover, based on mouse position
            if (scope.mousePosition.y.clientY <= scope.treePopoverHeight/2){
                $(el).find('.popover').css('top', parseInt($('.popover').css('top')) + scope.treePopoverHeight/2 + 'px');

            }
            else if (scope.mousePosition.y.clientY >= scope.viewport.height - scope.treePopoverHeight/2){
                $(el).find('.popover').css('top', parseInt($('.popover').css('top')) - scope.treePopoverHeight/2 + 'px');
            }
        });

        $(el).find('img').hover(function (e) {
            //save mouse position, before popover appears
            scope.mousePosition = {
                x: {
                    'pageX' : e.pageX,
                    'clientX' : e.clientX,
                    'offsetX' : e.offsetX,
                    'screenX' : e.screenX
                },
                y: {
                    'pageY': e.pageY,
                    'clientY': e.clientY,
                    'offsetY': e.offsetY,
                    'screenY': e.screenY
                }
            };
        });

        $($window).on('resize', function(){
            //recalculate screen size
            scope.viewport = getViewport();
        });

    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        priority: 500,
        scope: {
            item: '=',
            cacheBuster : '='
        },
        compile: function (el, attrs) {
            return linker;
        },
        templateUrl: 'js/common/directives/reports/treeImagePopover/treeImagePopover.tpl.html'
    };
}]);