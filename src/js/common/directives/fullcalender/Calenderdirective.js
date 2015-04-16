app.directive('arborplusappUiCalendar', [ function () {
    'use strict';

    var linker = function (s, el, attrs) {
        window.ets = s;
        s.events = [];
        var elm = el.find("#calender");
        elm.fullCalendar({
            header: {
                left: s.leftButtons,   //'prev,next today',
                center: 'title',
                right: s.rightButtons   //'month,agendaWeek,agendaDay',
            },
            editable: s.editable,
            droppable: s.droppable
        });
    };

    return {
        restrict: 'EA',
        template:'<div id=\"calendar\" style=\" background-color:red\"></div>',
        scope: {
            leftButtons: '@',
            rightButtons: '@',
            editable: '@',
            droppable: '@'

        },
        compile: function () {
            return linker;
        }
    };
}]);