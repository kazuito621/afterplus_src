app
    .controller('TimeclockController', TimeclockController)
    .service('TimeclockService', TimeclockService);


TimeclockController.$inject = ['TimeclockService', 'editTimeclockService']
function TimeclockController (TimeclockService, editTimeclockService) {
    var vm = this;

    vm.users = getUsers();
    vm.haveSelectedUsers = false;

    function getUsers() {
        return TimeclockService.getUsers();
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
        msToHM: msToHM
    };

    return service;

    function getUsers() {
        var schedules = getSchedules();

        var mockData = {
            "users": [
                {
                    "userID": 3,
                    "fName": "Fname",
                    "lName": "Lname",
                    "clockinby_userID": 3,
                    "reportID": 2470,
                    "duration_today": "2:00",
                    "status": "clockedin"
                },
                {
                    "userID": 17,
                    "clockinby_userID": 3,
                    "reportID": 2470,
                    "duration_today": "3:00",
                    "status": "clockedout"
                },
                {
                    "userID": 86,
                    "clockinby_userID": 86,
                    "reportID": 2468,
                    "duration_today": "3:00",
                    "status": "clockedout"
                }
            ]
        };

        var users = mockData.users;

        _.each(users, function (user, i) {
            Api.user.getUserById({ id: user.userID }).then(function (data) {
                users[i]['fName'] = data['fName'];
                users[i]['lName'] = data['lName'];
            });

            Api.getReport(user.reportID).then(function(report) {
               users[i]['report'] = report;
            });

            users[i]['schedule'] = _.where(schedules, { 'userID': user.userID });
            users[i]['schedule'] = transformSchedule(users[i]['schedule']);
        });

        return users;
    };

    function getSchedules() {
        var mockData = {
            "data": [
                {
                    "userID":3,
                    "reportID":2470,
                    "reportName": "Jaro3",
                    "time_in":"2015-02-10 06:00:00",
                    "time_out":"2015-02-10 07:30:00"
                },
                {
                    "userID":3,
                    "reportID":2470,
                    "reportName": "Jaro3",
                    "time_in":"2015-02-10 08:00:00",
                    "time_out":"2015-02-10 10:00:00"
                },
                {
                    "userID":3,
                    "reportID":2469,
                    "reportName": "Jaro2",
                    "time_in":"2015-02-10 16:00:00",
                    "time_out":"2015-02-10 20:00:00"
                }
            ]
        };

        return mockData.data;
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

            events.push(createEvent('work', scheduleEntry.time_in, scheduleEntry.time_out, scheduleEntry.reportID, scheduleEntry.reportName))


            if (schedule[i+1] == undefined) {
                events.push(createEvent('stop', scheduleEntry.time_out, scheduleEntry.reportID, scheduleEntry.reportName));
            }
        });
        console.log(events);
        return events;
    };

    function createEvent(type, timeStart, timeEnd, reportID, report) {
        timeStartMoment = moment(new Date(Date.parse(timeStart)));

        if (timeEnd != null) {
            timeEndMoment = moment(new Date(Date.parse(timeEnd)));
            duration = moment(timeEndMoment.diff(timeStartMoment));

            console.log('DURATION');
            console.log(timeStartMoment);
            console.log(timeEndMoment);
            console.log(duration);
        }

        var event = {};
        event.type = type;
        event.time = timeStartMoment.format('YYYY-MM-DD HH:mm:ss');

        if (timeEnd != null) {
            event.time_end = timeEnd;
            event.duration = moment(msToHM(duration), 'H:m').format('YYYY-MM-DD HH:mm:ss');
        }

        event.reportID = reportID;
        event.report = report;
        event.time_original = event.time;
        event.duration_original = event.duration;
        event.time_end_original = event.time_end;

        return event;
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