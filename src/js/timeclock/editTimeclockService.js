app
    .service('editTimeclockService', [ '$rootScope', '$modal', 'TimeclockService', 'Api', '$q', function ($rootScope, $modal, TimeclockService, Api, $q) {
        var modalDeferred;

        scope = $rootScope.$new();
        scope.users = [];
        scope.events = [];
        scope.usersFirstNames = '';
        scope.selectedDate = '';
        scope.allowAddBreak = false;
        scope.addNewJobAllow = false;
        scope.newJobReport = 0;
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
                "name": 'Breakdown'
            },
            {
                "type": 'training',
                "name": 'Training'
            },
            {
                "type": 'mill',
                "name": 'Mill'
            }
        ];

        var editTimeclockModal = {};

        var show = function (users, selectedDate) {
            modalDeferred = $q.defer();
            scope.users = users;
            scope.usersFirstNames = _.pluck(users, 'full_name').join(', ');
            scope.events = angular.copy(_.first(users).schedule);
            scope.selectedDate = selectedDate;


            if (_.where(scope.events, { "type": "break" }).length == 0) {
                scope.allowAddBreak = true;
            }

            editTimeclockModal = $modal({
                scope: scope,
                template: '/js/timeclock/editTimeclock.tpl.html',
                show: false
            });

            editTimeclockModal.$promise.then(editTimeclockModal.show);

            return modalDeferred.promise;
        };

        scope.editTime = function (event) {
            var changedIndex = _.indexOf(scope.events, event);

            var timeStartMoment = moment(new Date(Date.parse(scope.events[changedIndex].time)));
            var timeStartOriginalMoment = moment(new Date(Date.parse(scope.events[changedIndex].time_original)));

            var adjustment = TimeclockService.msToHM(moment(timeStartMoment.diff(timeStartOriginalMoment)));
            var adjustments = adjustment.split(':');

            event.time_original = moment(event.time).toDate();

            switch (event.type) {
                case 'start':
                    var i = changedIndex + 1;
                    var newDate = new Date(Date.parse(scope.events[i].time));
                    var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                    newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                    newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));

                    scope.events[i].time = newDate;
                    scope.events[i].time_original = newDate;
                    scope.events[i].time_end = newDateEnd;
                    scope.events[i].time_end_original = newDateEnd;


                    duration = TimeclockService.calculateDuration(scope.events[i].time_end, scope.events[i].time);

                    scope.events[i].duration = moment(TimeclockService.msToHM(duration), 'H:m').toDate();;
                    scope.events[i].original_duration = scope.events[i].duration;
                    break;
                case 'switch':
                    var i = changedIndex + 1;

                    var newDate = new Date(Date.parse(scope.events[i].time));
                    var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                    newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                    newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));

                    scope.events[i].time = newDate;
                    scope.events[i].time_original = newDate;
                    scope.events[i].time_end = newDateEnd;
                    scope.events[i].time_end_original = newDateEnd;

                    duration = TimeclockService.calculateDuration(scope.events[i].time_end, scope.events[i].time);
                    scope.events[i].duration = moment(TimeclockService.msToHM(duration), 'H:m').toDate();;
                    scope.events[i].original_duration = scope.events[i].duration;

                    var i = changedIndex -1;

                    var newDate = new Date(Date.parse(scope.events[i].time));
                    var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                    newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                    newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));

                    scope.events[i].time = newDate;
                    scope.events[i].time_original = newDate;
                    scope.events[i].time_end = newDateEnd;
                    scope.events[i].time_end_original = newDateEnd;

                    duration = moment(moment(scope.events[i].time_end).diff(moment(scope.events[i].time)));

                    scope.events[i].duration = moment(TimeclockService.msToHM(duration), 'H:m').toDate();;
                    scope.events[i].original_duration = scope.events[i].duration;
                    break;
                case 'stop':
                    var i = changedIndex - 1;
                    var newDate = new Date(Date.parse(scope.events[i].time));
                    var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                    newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                    newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));

                    scope.events[i].time = newDate;
                    scope.events[i].time_original = newDate;
                    scope.events[i].time_end = newDateEnd;
                    scope.events[i].time_end_original = newDateEnd;

                    duration = TimeclockService.calculateDuration(scope.events[i].time_end, scope.events[i].time);

                    scope.events[i].duration = moment(TimeclockService.msToHM(duration), 'H:m').toDate();;
                    scope.events[i].original_duration = scope.events[i].duration;
                    break;
            }


        };

        scope.editDuration = function (event) {
            var changedIndex = _.indexOf(scope.events, event);

            var durationMoment = moment(scope.events[changedIndex].duration);
            var durationMomentOriginal = moment(scope.events[changedIndex].duration_original);


            var adjustment = TimeclockService.msToHM(moment(durationMoment.diff(durationMomentOriginal)));
            var adjustments = adjustment.split(':');

            scope.events[changedIndex].duration_original = event.duration;

            switch (event.type) {
                case 'work' :
                    var chahedNewDateEnd = new Date(Date.parse(scope.events[changedIndex].time_end));
                    chahedNewDateEnd.setHours(chahedNewDateEnd.getHours() + parseInt(adjustments[0]));
                    chahedNewDateEnd.setMinutes(chahedNewDateEnd.getMinutes() + parseInt(adjustments[1]));

                    scope.events[changedIndex].time_end = chahedNewDateEnd;

                    for (var i = changedIndex + 1; i < scope.events.length; i ++) {
                        var newDate = new Date(Date.parse(scope.events[i].time));
                        var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                        newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                        newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));
                        newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                        newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));


                        scope.events[i].time = newDate;
                        scope.events[i].time_original = newDate;
                        scope.events[i].time_end = newDateEnd;
                        scope.events[i].time_end_original = newDateEnd;

                        duration = TimeclockService.calculateDuration(scope.events[i].time_end, scope.events[i].time);

                        scope.events[i].duration = moment(TimeclockService.msToHM(duration), 'H:m').toDate();;
                        scope.events[i].original_duration = scope.events[i].duration;
                    }
                    break;
                case 'break' :
                    var chahedNewDateEnd = new Date(Date.parse(scope.events[changedIndex].time_end));
                    chahedNewDateEnd.setHours(chahedNewDateEnd.getHours() + parseInt(adjustments[0]));
                    chahedNewDateEnd.setMinutes(chahedNewDateEnd.getMinutes() + parseInt(adjustments[1]));

                    scope.events[changedIndex].time_end = chahedNewDateEnd;

                    for (var i = changedIndex + 1; i < scope.events.length; i ++) {
                        var newDate = new Date(Date.parse(scope.events[i].time));
                        var newDateEnd = new Date(Date.parse(scope.events[i].time_end));

                        newDate.setHours(newDate.getHours() + parseInt(adjustments[0]));
                        newDate.setMinutes(newDate.getMinutes() + parseInt(adjustments[1]));
                        newDateEnd.setHours(newDateEnd.getHours() + parseInt(adjustments[0]));
                        newDateEnd.setMinutes(newDateEnd.getMinutes() + parseInt(adjustments[1]));


                        scope.events[i].time = newDate;
                        scope.events[i].time_original = newDate;
                        scope.events[i].time_end = newDateEnd;
                        scope.events[i].time_end_original = newDateEnd;

                        duration = TimeclockService.calculateDuration(scope.events[i].time_end, scope.events[i].time);

                        scope.events[i].duration = moment(TimeclockService.msToHM(duration), 'H:m').toDate();;
                        scope.events[i].original_duration = scope.events[i].duration;
                    }
                    break;
            }

        };

        scope.removeBreak = function (event) {
            var changedIndex = _.indexOf(scope.events, event);

            var prevWork = scope.events[changedIndex - 1];
            var nextWork = scope.events[changedIndex + 1];


            var newIndex = changedIndex-1;
            var newWorkEvent = TimeclockService.createEvent('work', moment(prevWork.time).format('YYYY-MM-DD HH:mm:ss'), moment(nextWork.time_end).format('YYYY-MM-DD HH:mm:ss'), event.reportID, event.report)



            scope.events.splice(changedIndex+1,1);
            scope.events.splice(changedIndex,1);
            scope.events.splice(changedIndex-1,1);

            scope.events.splice(newIndex, 0, newWorkEvent);

            scope.allowAddBreak = true;
        };

        scope.removeEvent = function (event) {

            var changedIndex = _.indexOf(scope.events, event);
            var i = changedIndex;

            for (i; i < scope.events.length; i++) {
                if (scope.events[i+1] != undefined && scope.events[i].reportID == scope.events[i+1].reportID) {

                } else {
                    break;
                }

            }

            scope.events.splice(changedIndex,i+1);
        };

        scope.addBreak = function (event) {
            var changedIndex = _.indexOf(scope.events, event);
            var eventTime = new Date(Date.parse(event.time));
            scope.newBreakDuration = new Date(Date.parse(event.time));
            scope.newBreakStart = new Date(Date.parse(event.time))

            scope.newBreakDuration.setMinutes(30);
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

            var prevStartTime = new Date(Date.parse(prevStart.time));
            var prevStopTime = new Date(Date.parse(prevWork.time_end));


            var eventStart = TimeclockService.createEvent('start', moment(prevStartTime).format('YYYY-MM-DD HH:mm:ss'), moment(newBreakStart).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)
            var eventWorkBeforePause = TimeclockService.createEvent('work', moment(prevStartTime).format('YYYY-MM-DD HH:mm:ss'), moment(newBreakStart).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)
            var eventPause = TimeclockService.createEvent('break', moment(newBreakStart).format('YYYY-MM-DD HH:mm:ss'), moment(newBreakStop).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report, 'break')
            var eventWorkAfterPause = TimeclockService.createEvent('work', moment(newBreakStop).format('YYYY-MM-DD HH:mm:ss'), moment(prevStopTime).format('YYYY-MM-DD HH:mm:ss'), scope.events[addBreakIndex].reportID, scope.events[addBreakIndex].report)


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

            var eventSwitch = TimeclockService.createEvent('switch', moment(prevTimeStart).format('YYYY-MM-DD HH:mm:ss'), moment(prevTimeEnd).format('YYYY-MM-DD HH:mm:ss'), this.newJobReport, '');
            var eventWork = TimeclockService.createEvent('work', moment(prevTimeStart).format('YYYY-MM-DD HH:mm:ss'), moment(prevTimeEnd).format('YYYY-MM-DD HH:mm:ss'), this.newJobReport, '');
            var eventStop = TimeclockService.createEvent('stop', moment(prevTimeEnd).format('YYYY-MM-DD HH:mm:ss'), null, this.newJobReport, '');

            eventSwitch.report = this.newJobReport;
            eventWork.report = this.newJobReport;
            eventStop.report = this.newJobReport;

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

            params.date = scope.selectedDate;
            params.users = usersID;
            params.worktime  = schedules;

            Api.saveTimeclockSchedules(params).then(function(data) {
                editTimeclockModal.$promise.then(editTimeclockModal.hide);
                modalDeferred.resolve(scope.events);
            });
        };

        scope.closeSchedule = function () {

            for (var i = 0; i < scope.users.length; i++) {
                scope.users[i].schedule = scope.users[i].original_schedule;
                scope.events = scope.users[i].original_schedule;
            }

            editTimeclockModal.$promise.then(editTimeclockModal.hide);
        };

        var showModal = function (users, selectedDate) {
            return show(users, selectedDate);
        };

        return {
            showModal: showModal
        };
    }
    ]);