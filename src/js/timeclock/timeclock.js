app
    .controller('TimeclockController', TimeclockController)
    .service('TimeclockService', TimeclockService);


TimeclockController.$inject = ['TimeclockService', 'editTimeclockService', 'Api']
function TimeclockController (TimeclockService, editTimeclockService, Api) {
    var vm = this;
    vm.users = [];

    vm.haveSelectedUsers = false;

    var currentWeek = moment().week();

    vm.currentWeek = moment().week();
    vm.week = vm.currentWeek;
    vm.selectedDate = null;
    vm.currentDay = moment().format('YYYY-MM-DD');

    vm.haveSimilarSchedule = 0;
    vm.similarSchedule = [];

    vm.selectAllSimilarValue = false;

    getWeekData(currentWeek);


    function getWeekData(currentWeek) {
        var day = moment().day("Monday").week(currentWeek);
        var today = day.clone();
        var startOfWeek = today.clone().startOf('isoWeek');
        var endOfWeek = today.clone().endOf('isoWeek');

        vm.startOfWeekFormated = startOfWeek.format('MMM DD, YYYY');
        vm.endOfWeekFormated = endOfWeek.format('MMM DD, YYYY');

        var days = [];
        for (var current = startOfWeek.clone(); current.isBefore(today, 'day'); current.add(1, 'days')) {
            days.push(current.format('YYYY-MM-DD'));
        }
        days.push(today.format('YYYY-MM-DD'));

        for (var current = today.clone().add(1, 'days');
             current.isBefore(endOfWeek, 'day') || (current.isSame(endOfWeek, 'day') && !today.isSame(endOfWeek, 'day'));
             current.add(1, 'days')) {
            if (current < moment()) {
                days.push(current.format('YYYY-MM-DD'));
            }
        }
        days = days.reverse();
        getUsers(days);
    }

    function getUsers(days) {
        TimeclockService.getUsers(days).then(function (dates) {
            vm.users = dates;
            console.log(dates);
        });
        //_.each(days, function (singleDay) {
        //    TimeclockService.getUsers(singleDay).then(function(users) {
        //        var entry = {};
        //        entry.date = singleDay;
        //        entry.date_string = moment(singleDay).format('dddd, D/MM');
        //        entry.users = users;
        //        vm.users.push(entry);
        //    });
        //});

    };

    vm.openUser = function (selectedUser, selectedDate) {
        vm.selectedDate = selectedDate.date;
        var selectedUsers = [];
        selectedUsers.push(selectedUser);
        editTimeclockService.showModal(selectedUsers, vm.selectedDate);
    };
    
    vm.decrementWeekNumber = function() {
        vm.week--;
        vm.users = [];
        getWeekData(vm.week);
    }

    vm.incrementWeekNumber = function() {
        vm.week++;
        vm.users = [];
        getWeekData(vm.week);
    }

    vm.selectUser = function(selectedUser, selectedDate) {
        vm.selectedDate = selectedDate.date;

        if (selectedUser.selected) {
            var users = selectedDate.users;
            if (selectedUser.schedule.length > 0) {
                vm.haveSelectedUsers = true;
            }

            var otherSchedule = _.filter(users, function(user) {
                return !TimeclockService.haveSimilarSchedule(user, selectedUser);
            });

            var similarSchedule = _.filter(users, function(user) {
                return TimeclockService.haveSimilarSchedule(user, selectedUser);
            });

            vm.similarSchedule = similarSchedule;
            vm.haveSimilarSchedule = similarSchedule.length;

            _.each(otherSchedule, function (user) {
                user.disabled = true;
            });

            _.each(vm.users, function (date) {
                if (date.date != vm.selectedDate) {
                    _.each(date.users, function (user) {
                        user.disabled = true;
                    });
                }
            });
        } else {
            var users = selectedDate.users;
            if (_.where(users, { 'selected' : true }).length == 0) {
                vm.haveSelectedUsers = false;

                vm.haveSimilarSchedule = 0;
                vm.similarSchedule = [];

                _.each(users, function (user) {
                    user.disabled = false;
                })

                _.each(vm.users, function (date) {
                    if (date.date != vm.selectedDate) {
                        _.each(date.users, function (user) {
                            user.disabled = false;
                        });
                    }
                });
            }
        }
    };

    vm.editTimeclockForUsers = function() {
        var selectedUsers = [];
        _.each(vm.users, function (date) {
            var selectedInDate = _.where(date.users, { 'selected' : true });
            if (selectedInDate.length > 0) {
                selectedUsers = selectedInDate;
            }
        });
        editTimeclockService.showModal(selectedUsers, vm.selectedDate);


    };

    vm.isSelectedUsersClockin = function () {
        var selectedUsers = [];
        var isClockin = true;
        _.each(vm.users, function (date) {
            var selectedInDate = _.where(date.users, { 'selected' : true });
            _.each(selectedInDate, function (user) {
                if( user.status != 'clockin') {
                    isClockin = false;
                }
            })
        });
        return isClockin;
    };

    vm.clockoutUsers = function () {
        var selectedUsers = [];
        _.each(vm.users, function (date) {
            var selectedInDate = _.where(date.users, { 'selected' : true });
            if (selectedInDate.length > 0) {
                selectedUsers = selectedInDate;
            }
        });

        var schedules = [];
        _.each(selectedUsers, function (user, i) {
            selectedUsers[i].status = 'clockout';
            schedules = selectedUsers[i].schedule;
            schedules[schedules.length-1].time_end = new Date();
            schedules[schedules.length-1].inProgress = false;

            schedules[schedules.length-2].time_end = new Date();
            schedules[schedules.length-2].inProgress = false;
        });



        var logs = TimeclockService.reverseTransform(schedules);
        var usersID = _.pluck(selectedUsers, 'userID');

        var params = {};

        params.date = vm.selectedDate;
        params.users = usersID;
        params.worktime  = logs;

        _.each(selectedUsers, function (user, i) {
            selectedUsers[i].schedule = schedules;
        });

        Api.saveTimeclockSchedules(params).then(function (data){

        });
    };
    
    vm.formatScheduleTime = function (time) {
        var momentTime = moment(time).clone();

        return momentTime.format('h:mma');
    };

    vm.selectAllSimilar = function () {
        if (vm.selectAllSimilarValue) {
            _.each(vm.similarSchedule, function (user, i) {
                vm.similarSchedule[i].selected = true;
            });
        } else {
            _.each(vm.similarSchedule, function (user, i) {
                vm.similarSchedule[i].selected = false;
            });
            vm.haveSimilarSchedule = 0;
            vm.similarSchedule = [];
            _.each(vm.users, function (date) {
                _.each(date.users, function (user) {
                    user.disabled = false;
                });
            });
        }

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

    function getUsers(days) {
        var deferred = $q.defer();

        var users = [];
        var schedules = [];

        var params = {};
        params.date_to = days[0];
        params.date_from = days[days.length - 1];

        Api.getTimeclockUsersInfo(params).then(function(data) {
            var dates = data.dates
            
            _.each(dates, function (date) {
                var newUser = {};

                var userWithSchedules = date.users;
                _.each(userWithSchedules, function(user, i){
                    userWithSchedules[i].schedule = transformSchedule(userWithSchedules[i]['logs']);
                    userWithSchedules[i].original_schedule = transformSchedule(userWithSchedules[i]['logs']);
                    userWithSchedules[i].workSchedule = _.where(userWithSchedules[i].schedule, {'type': 'work'});
                });
                newUser.date = date.date;
                newUser.date_string = moment(date.date).format('ddd, MMM DD, YYYY');
                newUser.users = userWithSchedules;

                users.push(newUser);
            });
            //users = data.users;
            //
            //var usersID = _.pluck(users, 'userID');
            //
            //getSchedules(usersID, date).then(function (schedulesData) {
            //    schedules = schedulesData;
            //
            //    _.each(users, function (user, i) {
            //        users[i]['schedule'] = _.where(schedules, { 'userID': user.userID });
            //        users[i]['schedule'] = transformSchedule(users[i]['schedule']);
            //    });
            //
            //    deferred.resolve(users);
            //});

            users = users.reverse();

            deferred.resolve(users);
        });


        return deferred.promise
    };

    function getSchedules(usersID, date) {
        var deferred = $q.defer();

        var params = {
            "users[]" : usersID,
            "date" : date
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
        console.log('PRE=======');
        console.log(user);
        console.log(selectedUser);
        var isEqual = isEqualSchedule(user.schedule, selectedUser.schedule);
        console.log('result:' + isEqual);
        return isEqual;
    };

    function isEqualSchedule(schedule, other) {
        if (schedule.length != other.length) {
            return false;
        }

        var isEqualSchedule = true;
        _.each(schedule, function (event, i) {

            console.log('EQUAL:');
            console.log(schedule[i].time);
            console.log(other[i].time);
            console.log(schedule[i].time != other[i].time);
            if (
                schedule[i].type != other[i].type ||
                schedule[i].time.getTime() != other[i].time.getTime() ||
                (schedule[i].time_end != undefined && other[i].time_end && (schedule[i].time_end.getTime() != other[i].time_end.getTime()))
            ) {
                isEqualSchedule = false;
            }
        });

        return isEqualSchedule;
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
        console.log('&&&&&&');
        console.log(timeStart);
        var timeStartArr = timeStart.split(/[- :]/),
            timeStartDate = new Date(timeStartArr[0], timeStartArr[1]-1, timeStartArr[2], timeStartArr[3], timeStartArr[4], timeStartArr[5]);


        timeStartMoment = moment(timeStartDate).clone();

        if (timeEnd != null && timeEnd != undefined) {
            console.log(timeEnd);
            var timeEndArr = timeEnd.split(/[- :]/),
                timeEndDate = new Date(timeEndArr[0], timeEndArr[1]-1, timeEndArr[2], timeEndArr[3], timeEndArr[4], timeEndArr[5]);

            timeEndMoment = moment(timeEndDate);
            duration = moment(timeEndMoment.diff(timeStartMoment));
        }

        var event = {};
        event.type = type;
        event.time = timeStartMoment.toDate();

        if (timeEnd != null && timeEnd != undefined) {
            event.time_end = timeEndMoment.toDate();
            event.duration = moment(msToHM(duration), 'H:m').toDate();
            event.duration_original = moment(msToHM(duration), 'H:m').toDate();
        }

        event.reportID = reportID;
        event.report = report;
        event.time_original = moment(timeStartDate).toDate();
        event.time_end_original = event.time_end;
        event.status = status;
        event.inProgress = inProgress;
        console.log(timeEndMoment);
        console.log('@@@@');
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