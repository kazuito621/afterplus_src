//2014-11-07 vmelekh
//this directive is used to switch UI to mobile mode.
//we hide main menu(header), decrease page width if needed
app.directive('mobileView', function () {
    'use strict';

    var linker = function (scope, el, attrs) {

        //hide menu
        $('header').hide();

        scope.$on('nav', function (e, data) {

            //if we switch off current view to any another, we need to show menu again
            if (data.old === scope.myState && data.new !== scope.myState) {
                $('header').show();
            }

            //if we switch on current view, we need to hide menu
            if (data.new === scope.myState) {
                $('header').hide();
            }
        });

    };

    return {
        restrict: 'A',
        scope:{
            myState : '@'
        },
        compile: function (el, attrs) {
            return linker;
        }
    };
});
