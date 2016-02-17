app
    .service('editTimeclockService', [ '$rootScope', '$modal', 'TimeclockService', 'Api', function ($rootScope, $modal, TimeclockService, Api) {
        scope = $rootScope.$new();
        scope.users = [];
        scope.usersFirstNames = '';
        scope.allowAddBreak = false;
        scope.addNewJobAllow = false;
        scope.jobTypes = [
            {
                "type": 'work',
                "name": 'Work'
            },
            {
                "type": 'office',
                "name": 'Office'
            },
            {
                "type": 'mechanic',
                "name": 'Mechanic'
            },
            {
                "type": 'show',
                "name": 'Shop Time'
            },
            {
                "type": 'breakdown',
                "name": 'Breakdown/Screw-up'
            },
            {
                "type": 'training',
                "name": 'Training'
            },
            {
                "type": 'milf',
                "name": 'Milf'
            }
        ];


        var show = function (users) {
            scope.users = users;
            scope.usersFirstNames = _.pluck(users, 'fName').join(', ');

            scope.events = _.first(users).schedule;
            console.log(scope.events);

            if (_.where(scope.events, { "type": "pause" }).length == 0) {
                scope.allowAddBreak = true;
            }

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
                var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));

                newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));

                scope.events[i].duration = newDate;
                scope.events[i].original_duration = newDate;

                scope.events[i].time = newDate;
                scope.events[i].time_end = newDateEnd;
                scope.events[i].original_time = newDate;
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
            var newWorkEvent = TimeclockService.createEvent('work', prevWork.time, nextWork.time_end, event.reportID, event.report)

            scope.events.splice(changedIndex+1,1);
            scope.events.splice(changedIndex,1);
            scope.events.splice(changedIndex-1,1);

            scope.events.splice(newIndex, 0, newWorkEvent);

            scope.allowAddBreak = true;
        };

        scope.addBreak = function (event) {
            var changedIndex = _.indexOf(scope.events, event);
            var eventTime = new Date(Date.parse(event.time));
            scope.newBreakDuration = new Date(Date.parse(event.time));
            scope.newBreakStart = new Date(Date.parse(event.time))

            scope.newBreakDuration.setMinutes(0);
            scope.newBreakDuration.setHours(0);

            scope.newBreakStart.setMinutes(eventTime.getMinutes());
            scope.newBreakStart.setHours(eventTime.getHours());

            scope.addBreakIndex = changedIndex;
        };

        scope.closeAddBreak = function () {
            scope.addBreakIndex = -1;
        };

        scope.saveBreak = function () {
            var addBreakIndex = scope.addBreakIndex;
            var newBreakStart = new Date(Date.parse(scope.newBreakStart));
            var newBreakDuration  = new Date(Date.parse(scope.newBreakDuration));

            var newBreakStop = new Date(Date.parse(scope.newBreakStart));
            newBreakStop.setHours(newBreakStop.getHours() + newBreakDuration.getHours());
            newBreakStop.setMinutes(newBreakStop.getMinutes() + newBreakDuration.getMinutes());

            var prevStart = scope.events[addBreakIndex];
            var prevWork = scope.events[addBreakIndex+1];

            var eventStart = TimeclockService.createEvent('start', prevStart.time, moment(newBreakStart).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)
            var eventWorkBeforePause = TimeclockService.createEvent('work', prevStart.time, moment(newBreakStart).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)
            var eventPause = TimeclockService.createEvent('pause', newBreakStart, moment(newBreakStop).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)
            var eventWorkAfterPause = TimeclockService.createEvent('work', moment(newBreakStop).format('YYYY-MM-DD HH:mm:ss'), prevWork.time_end, scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)

            console.log(eventStart);
            console.log(eventWorkBeforePause);
            console.log(eventPause);
            console.log(eventWorkAfterPause);

            scope.events.splice(addBreakIndex+1, 1);
            scope.events.splice(addBreakIndex, 1);

            scope.events.splice(0, 0, eventWorkAfterPause);
            scope.events.splice(0, 0, eventPause);
            scope.events.splice(0, 0, eventWorkBeforePause);
            scope.events.splice(0, 0, eventStart);

            scope.addBreakIndex = -1;
        };

        scope.addNewJob = function() {
            scope.addNewJobAllow = true;
        };

        scope.saveJob = function() {
            var newIndex = scope.events.length -1;

            var prevTimeStart = new Date(Date.parse(scope.events[newIndex - 1].time_end));

            var prevTimeEnd = new Date(Date.parse(scope.events[newIndex - 1].time_end));
            prevTimeEnd.setHours(prevTimeEnd.getHours()+1);

            var eventSwitch = TimeclockService.createEvent('switch', moment(prevTimeStart).format('YYYY-MM-DD HH:mm:ss'), moment(prevTimeEnd).format('YYYY-MM-DD HH:mm:ss'), scope.newJobReport, '');
            var eventWork = TimeclockService.createEvent('work', moment(prevTimeStart).format('YYYY-MM-DD HH:mm:ss'), moment(prevTimeEnd).format('YYYY-MM-DD HH:mm:ss'), scope.newJobReport, '');
            var eventStop = TimeclockService.createEvent('stop', moment(prevTimeEnd).format('YYYY-MM-DD HH:mm:ss'), null, scope.newJobReport, '');

            scope.events.splice(newIndex, 1);

            scope.events.splice(newIndex, 0, eventStop);
            scope.events.splice(newIndex, 0, eventWork);
            scope.events.splice(newIndex, 0, eventSwitch);

            scope.addNewJobAllow = false;
        };

        scope.closeAddJob = function() {
            scope.addNewJobAllow = false;
        };

        scope.saveSchedule = function () {
            var schedules = TimeclockService.reverseTransform(scope.events);
            var usersID = _.pluck(scope.users, 'userID');

            var params = {};

            params.date = moment().format('YYYY-MM-DD');
            params.users = usersID;
            params.worktime  = schedules;

            Api.saveTimeclockSchedules(params);
        };

        var showModal = function (users) {
            return show(users);
        };

        return {
            showModal: showModal
        };
    }
    ]);