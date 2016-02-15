app
    .service('editTimeclockService', [ '$rootScope', '$modal', 'TimeclockService', function ($rootScope, $modal, TimeclockService) {
        scope = $rootScope.$new();
        scope.users = [];
        scope.usersFirstNames = '';

        var show = function (users) {
            scope.users = users;
            scope.usersFirstNames = _.pluck(users, 'fName').join(', ');

            scope.events = _.first(users).schedule;
            console.log(scope.events);

            editTimeclockModal = $modal({
                scope: scope,
                template: '/js/timeclock/editTimeclock.tpl.html',
                show: false
            });

            editTimeclockModal.$promise.then(editTimeclockModal.show);
        };

        scope.editTime = function (event) {
            var changedIndex = _.indexOf(scope.events, event);

            var timeStartMoment = moment(new Date(Date.parse(event.time)));
            var timeStartOriginalMoment = moment(new Date(Date.parse(event.time_original)));

            var adjustment = TimeclockService.msToHM(moment(timeStartMoment.diff(timeStartOriginalMoment)));
            var adjustments = adjustment.split(':');

            event.time_original = event.time;

            for (var i = changedIndex - 1; i > 0; i--) {
                var newDate = new Date(Date.parse(scope.events[i].duration));

                newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));

                scope.events[i].duration = newDate;
                scope.events[i].original_duration = newDate;
            }

            for (var i = changedIndex + 1; i < scope.events.length; i ++) {
                var newDate = new Date(Date.parse(scope.events[i].time));
                var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));
                newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));

                scope.events[i].time = newDate;
                scope.events[i].time_end = newDateEnd;
                scope.events[i].original_time = newDate;
            }

        };

        scope.editDuration = function (event) {
            var changedIndex = _.indexOf(scope.events, event);

            var timeStartMoment = moment(new Date(Date.parse(event.duration)));
            var timeStartOriginalMoment = moment(new Date(Date.parse(event.duration_original)));

            var adjustment = TimeclockService.msToHM(moment(timeStartMoment.diff(timeStartOriginalMoment)));
            var adjustments = adjustment.split(':');

            event.duration_original = event.duration;

            for (var i = changedIndex + 1; i < scope.events.length; i ++) {
                var newDate = new Date(Date.parse(scope.events[i].time));
                var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));
                newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));


                scope.events[i].time = newDate;
                scope.events[i].time_end = newDateEnd;
                scope.events[i].original_time = newDate;
            }

        };

        scope.removeBreak = function (event) {
            var changedIndex = _.indexOf(scope.events, event);

            var prevWork = scope.events[changedIndex - 1];
            var nextWork = scope.events[changedIndex + 1];

            console.log(prevWork.time);
            console.log(nextWork.time);

            var newIndex = changedIndex-1;
            var newWorkEvent = TimeclockService.createEvent('work', prevWork.time, nextWork.time_end)

            scope.events.splice(changedIndex+1,1);
            scope.events.splice(changedIndex,1);
            scope.events.splice(changedIndex-1,1);

            scope.events.splice(newIndex, 0, newWorkEvent);
        };

        scope.addBreak = function (event) {

        };

        var showModal = function (users) {
            return show(users);
        };

        return {
            showModal: showModal
        };
    }
    ]);