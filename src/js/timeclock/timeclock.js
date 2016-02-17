app
    .controller('TimeclockController', TimeclockController)
    .service('TimeclockService', TimeclockService);


TimeclockController.$inject = ['TimeclockService', 'editTimeclockService']
function TimeclockController (TimeclockService, editTimeclockService) {
    var vm = this;
    getUsers();
    vm.haveSelectedUsers = false;

    function getUsers() {
        TimeclockService.getUsers().then(function(users) {
            vm.users = users;
        });
    };

    vm.selectUser = function(selectedUser) {
        vm.haveSelectedUsers = true;
        if (selectedUser.selected) {
            var otherSchedule = _.filter(vm.users, function(user) {
                return !TimeclockService.haveSimilarSchedule(user, selectedUser);
            });

            _.each(otherSchedule, function (user) {
                user.disabled = true;
            });
        } else {
            if (_.where(vm.users, { 'selected' : true }).length == 0) {
                vm.haveSelectedUsers = false;

                _.each(vm.users, function (user) {
                    user.disabled = false;
                })
            }
        }
    };

    vm.editTimeclockForUsers = function() {
        var selectedUsers = _.where(vm.users, { 'selected' : true });

        editTimeclockService.showModal(selectedUsers);
    };
};

TimeclockService.$inject = ['$q', 'Api']
function TimeclockService($q, Api) {
    var service = {
        getUsers: getUsers,
        haveSimilarSchedule: haveSimilarSchedule,
        transformSchedule: transformSchedule,
        createEvent: createEvent,
        reverseTransform: reverseTransform,
        msToHM: msToHM
    };

    return service;

    function getUsers() {
        var deferred = $q.defer();

        var users = [];
        var schedules = [];

        Api.getTimeclockUsers().then(function(data) {
            users = data.users;

            var usersID = _.pluck(users, 'userID');

            getSchedules(usersID).then(function (schedulesData) {
                schedules = schedulesData;

                _.each(users, function (user, i) {
                    users[i]['schedule'] = _.where(schedules, { 'userID': user.userID });
                    users[i]['schedule'] = transformSchedule(users[i]['schedule']);
                });

                deferred.resolve(users);
            });
        });


        return deferred.promise
    };

    function getSchedules(usersID) {
        var deferred = $q.defer();

        var params = {
            "users[]" : usersID,
            "date" : moment().format('YYYY-MM-DD')
        };

        var schedules = [];

        Api.getTimeclockUsersInfo(params).then(function(data) {
            _.each(data, function(user) {
                console.log(user);
                _.each(user.work, function(work){
                    work['userID'] = user.userID;
                    schedules.push(work);
                });
            });

            deferred.resolve(schedules);
            console.log(deferred);
        });


        return deferred.promise;
    };

    function haveSimilarSchedule(user, selectedUser) {
        return isEqualSchedule(user.schedule, selectedUser.schedule);
    };

    function isEqualSchedule(schedule, other) {
        if (schedule.length != other.length) {
            return false;
        }

        _.each(schedule, function (event, i) {
            if (
                schedule[i].type != other[i].type ||
                schedule[i].time != other[i].time
            ) {
                return false;
            }
        });

        return true;
    };

    function transformSchedule(schedule) {
        var events = [];
        console.log(schedule);
        _.each(schedule, function (scheduleEntry, i) {

            if (schedule[i-1] != undefined) {
                if (schedule[i-1].reportID != schedule[i].reportID) {
                    events.push(createEvent('switch', scheduleEntry.time_in, scheduleEntry.time_out, scheduleEntry.reportID, scheduleEntry.reportName))
                } else {
                    events.push(createEvent('pause', schedule[i-1].time_out, scheduleEntry.time_in, scheduleEntry.reportID, scheduleEntry.reportName))
                }
            } else {
                events.push(createEvent('start', scheduleEntry.time_in, scheduleEntry.time_out, scheduleEntry.reportID, scheduleEntry.reportName))
            }

            if (scheduleEntry.time_out == null) {
                events.push(createEvent('work', scheduleEntry.time_in, moment().format('YYYY-MM-DD HH:MM:ss'), scheduleEntry.reportID, scheduleEntry.reportName, scheduleEntry.status, true))
            } else {
                events.push(createEvent('work', scheduleEntry.time_in, scheduleEntry.time_out, scheduleEntry.reportID, scheduleEntry.reportName, scheduleEntry.status))
            }



            if (schedule[i+1] == undefined && scheduleEntry.time_out != null) {
                console.log('STOP');
                console.log(scheduleEntry.time_out);
                events.push(createEvent('stop', scheduleEntry.time_out, null, scheduleEntry.reportID, scheduleEntry.reportName));
            }
        });

        return events;
    };

    function createEvent(type, timeStart, timeEnd, reportID, report, status, inProgress) {
        var timeStartArr = timeStart.split(/[- :]/),
            timeStartDate = new Date(timeStartArr[0], timeStartArr[1]-1, timeStartArr[2], timeStartArr[3], timeStartArr[4], timeStartArr[5]);

        timeStartMoment = moment(timeStartDate);

        if (timeEnd != null) {
            console.log(timeEnd);
            var timeEndArr = timeEnd.split(/[- :]/),
                timeEndDate = new Date(timeEndArr[0], timeEndArr[1]-1, timeEndArr[2], timeEndArr[3], timeEndArr[4], timeEndArr[5]);

            timeEndMoment = moment(timeEndDate);
            duration = moment(timeEndMoment.diff(timeStartMoment));
        }

        var event = {};
        event.type = type;
        event.time = timeStartMoment.toDate();

        if (timeEnd != null) {
            event.time_end = timeEndMoment.toDate();
            event.duration = moment(msToHM(duration), 'H:m').toDate();
        }

        event.reportID = reportID;
        event.report = report;
        event.time_original = event.time;
        event.duration_original = event.duration;
        event.time_end_original = event.time_end;
        event.status = status;
        event.inProgress = inProgress;

        return event;
    }

    function reverseTransform(events)
    {
        console.log(events);
        var schedules = [];
        for (var i = 0; i < events.length; i ++) {
            var schedule = {};

            if (events[i].type == 'work') {
                schedule.reportID = events[i].reportID;
                schedule.time_in = moment(events[i].time).format('HH:mm:ss');
                schedule.status = events[i].status;
                if (events[i].inProgress) {
                    schedule.time_out = null;
                } else {
                    schedule.time_out = moment(events[i].time_end).format('HH:mm:ss');
                }


                schedules.push(schedule);
            }
        }

        return schedules;
    }

    function msToHM( ms ) {
        var seconds = ms / 1000;
        var hours = parseInt( seconds / 3600 );
        seconds = seconds % 3600;
        var minutes = parseInt( seconds / 60 );
        seconds = seconds % 60;
        return hours+':'+minutes;
    }

};