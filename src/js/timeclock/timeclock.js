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
                return user.clockinby_userID != selectedUser.clockinby_userID;
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
        transformSchedule: transformSchedule
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
        });

        return users;
    };

    function getSchedules() {
        var mockData = {
            "data": [
                {
                    "userID":3,
                    "reportID":2470,
                    "time_in":"2015-02-10 06:00:00",
                    "time_out":"2015-02-10 10:00:00"
                },
                {
                    "userID":17,
                    "reportID":2470,
                    "time_in":"2015-02-10 06:00:00",
                    "time_out":"2015-02-10 10:00:00"
                },
                {
                    "userID":3,
                    "reportID":2470,
                    "time_in":"2015-02-10 16:00:00",
                    "time_out":"2015-02-10 20:00:00"
                },
                {
                    "userID":17,
                    "reportID":2470,
                    "time_in":"2015-02-10 16:00:00",
                    "time_out":"2015-02-10 20:00:00"
                }
            ]
        };

        return mockData.data;
    };

    function transformSchedule(schedule) {
        var events = [];
        
        _.each(schedule, function (scheduleEntry, i) {
            if (schedule[i-1] != undefined) {
                switchEvent = {};
                switchEvent.type = 'switch';
                events.push(switchEvent);
            } else {
                startEvent = {};
                startEvent.type = 'start';
                events.push(startEvent);
            }

            workEvent = {};
            workEvent.type = 'work';
            events.push(workEvent);


            if (schedule[i+1] != undefined) {

            } else {
                stopEvent = {};
                stopEvent.type = 'stop';
                events.push(stopEvent);
            }
        })

        return events;
    };
};