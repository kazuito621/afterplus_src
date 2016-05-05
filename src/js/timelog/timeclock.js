app
    .controller('TimelogController', TimelogController)
    .service('TimelogService', TimelogService);

TimelogController.$inject = ['Api', 'TimelogService', 'editTimelogService', 'createTimelogService']
function TimelogController(Api, TimelogService, editTimelogService, createTimelogService) {
    var vm = this;
	 window.s_vm = this

    // for ios application
    window.ios_app_is_editor_open = function() {
        return vm.isEditorOpen
    };

    vm.dateToday = moment();
    vm.dateFrom = null;
    vm.dateTo   = null;
    vm.reportID = null;
    vm.data     = [];
    vm.foremans = [];
    vm.haveSelectedUsers = false
    vm.haveSimilarLogs   = 0;
    vm.currentUserID = Auth.data().userID;
    vm.currentDate = moment().format('YYYY-MM-DD');

    init();

    function init() {
        initDates();
        initForemans();

        getData();
    };

    function initDates() {
        var currentDay = moment().format('D');
        if (currentDay < 15) {
            vm.dateFrom = moment().startOf('month');
            vm.dateTo = moment().startOf('month').add(14, 'days');;
        } else {
            vm.dateFrom = moment().startOf('month').add(14, 'days');
            vm.dateTo = moment().endOf('month');
        }
    };

    function initForemans() {
        Api.getForemanUsers().then(function(data){
            _.each(data, function (foremanUser) {
                var foreman = {};
                foreman.userID = foremanUser.userID;
                foreman.fullName = foremanUser.fName + ' ' + foremanUser.lName;
                vm.foremans.push(foreman);
            });
        });
    };

    vm.incrementDate = function() {
        vm.dateFrom = moment(vm.dateFrom);
        vm.dateTo   = moment(vm.dateTo);

        var day = vm.dateFrom.format('D');

        if (day < 15) {
            month = angular.copy(vm.dateFrom);

            vm.dateFrom = angular.copy(month.startOf('month').add(14, 'days'));
            vm.dateTo = angular.copy(month.endOf('month'));
        } else {
            month = angular.copy(vm.dateFrom).add(1, 'months');

            vm.dateFrom = angular.copy(month.startOf('month'));
            vm.dateTo = angular.copy(month.startOf('month').add(14, 'days'));
        }

        getData();
    };

    vm.decrementDate = function() {
        vm.dateFrom = moment(vm.dateFrom);
        vm.dateTo   = moment(vm.dateTo);

        var day = vm.dateFrom.format('D');

        if (day < 15) {
            month = angular.copy(vm.dateFrom).subtract(1, 'months');

            vm.dateFrom = angular.copy(month.startOf('month').add(14, 'days'));
            vm.dateTo = angular.copy(month.endOf('month'));
        } else {
            month = angular.copy(vm.dateFrom);

            vm.dateFrom = angular.copy(month.startOf('month'));
            vm.dateTo = angular.copy(month.startOf('month').add(14, 'days'));
        }

        getData();
    };

    function getData() {
        return TimelogService.getData(vm.dateFrom, vm.dateTo, vm.reportID).then(function(data) {
            vm.data = data;

            vm.totals = data.totals;
            vm.totalSummary = {};
            vm.totalSummary.hours = 0;
            vm.totalSummary.overtime = 0;
            vm.totalSummary.total = 0;
            _.each (vm.totals, function(total) {
                var summaryHours = toSeconds(total.hours);
                vm.totalSummary.hours += summaryHours;

                var summaryOvertime = toSeconds(total.overtime);
                vm.totalSummary.overtime += summaryOvertime;

                var summaryTotal = toSeconds(total.total);
                vm.totalSummary.total += summaryTotal;
            });

            vm.totalSummary.hours = toHHMMSS(vm.totalSummary.hours);
            vm.totalSummary.overtime = toHHMMSS(vm.totalSummary.overtime);
            vm.totalSummary.total = toHHMMSS(vm.totalSummary.total);

            return vm.data;
        });
    };

    function toSeconds( time ) {
        var parts = time.split(':');
        return (+parts[0]) * 60 * 60 + (+parts[1]) * 60;
    }

    function toHHMMSS(sec) {
        var sec_num = parseInt(sec, 10); // don't forget the second parm
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        var time    = hours+':'+minutes;
        return time;
    }

    vm.changeDate = function () {
        vm.dateFrom = moment(vm.dateFrom);
        vm.dateTo   = moment(vm.dateTo);
        getData();
    };

    vm.changeReportID = function () {
        getData();
    };

    vm.openUser = function (selectedUser, selectedDate) {
        var selectedUsers = [];
        selectedUsers.push(selectedUser);
        openEditModal(selectedUsers, selectedDate);
    };

    vm.openUsers = function () {
        var selectedUsers = [];
        _.each(vm.data.dates, function (date) {
            var selectedInDate = _.where(date.users, { 'selected' : true });
            if (selectedInDate.length > 0) {
                selectedUsers = selectedInDate;
            }
        });

        openEditModal(selectedUsers, vm.selectedDate);
    };

    vm.isSelectedUsersClockin = function () {
        var isClockin = true;
        _.each(vm.data.dates, function (date) {
            var selectedInDate = _.where(date.users, { 'selected' : true });
            _.each(selectedInDate, function (user) {
                if( user.status != 'clockin') {
                    isClockin = false;
                }
            })
        });
        return isClockin;
    };

    vm.formatLogTime = function (time) {
        if (moment(time).isValid && time != undefined) {
            return moment(time).format('h:mma');
        } else {
            console.log(time);
            return '...';
        }
    };

    vm.filterReportID = function (reportID) {
        vm.reportID = reportID;
        getData();
    };

    vm.clearFilterByJobID = function() {
        vm.reportID = null;
        getData();
    };

    vm.openNewClockIn = function () {
        createTimelogService.showModal(vm.foremans).then(function (data) {
            getData();
        });
    };

    vm.selectUser = function(selectedUser, selectedDate) {
        vm.selectedDate = selectedDate.date;
        vm.haveSimilarLogs = 0;

        if (selectedUser.selected) {
            vm.haveSelectedUsers = true;

            _.each(data.dates, function (date) {
                if (date.date != selectedDate.date) {
                    _.each(date.users, function (user) {
                        user.disabled = true;
                    });
                } else {
                    _.each(date.users, function (user) {
                        if (user.userID != selectedUser.userID) {
                            if (!TimelogService.compareLogs(user.logs, selectedUser.logs)) {
                                user.disabled = true;
                            } else {
                                vm.haveSimilarLogs++;
                            }
                        }
                    });
                }
            });
        } else {
            var users = selectedDate.users;
            if (_.where(users, { 'selected' : true }).length == 0) {
                vm.haveSelectedUsers = false;

                _.each(data.dates, function (date) {
                    _.each(date.users, function (user) {
                        user.disabled = false;
                    });
                });
            } else {
                vm.haveSimilarLogs = _.where(users, { 'selected' : true }).length;
            }
        }
    };

    vm.clockoutUsers = function () {
        var selectedUsers = [];
        _.each(vm.data.dates, function (date) {
            var selectedInDate = _.where(date.users, { 'selected' : true });
            if (selectedInDate.length > 0) {
                selectedUsers = selectedInDate;
            }
        });

        var user = selectedUsers[0];
        var logs = user.logs;
        logs[logs.length - 1].time_out = moment();

        _.each(logs, function (log) {
            log.time_in = moment(log.time_in).format('YYYY-MM-DD HH:mm:ss');
            log.time_out = moment(log.time_out).format('YYYY-MM-DD HH:mm:ss');;
        });

        var usersID = _.pluck(selectedUsers, 'userID');

        var params = {};

        params.date = vm.selectedDate;
        params.users = usersID;
        params.worktime  = logs;

        Api.saveTimeclockSchedules(params).then(function (data){
            getData();
        });
    };

    function openEditModal(users, date) {

        editTimelogService.showModal(users, date).then(function (data) {
            getData();
        });
    };
};

TimelogService.$inject = ['$q', 'Api']
function TimelogService($q, Api) {
    var service = {
        getData: getData,
        fixTime: fixTime,
        compareLogs: compareLogs
    };

    return service;

    function getData(dateFrom, dateTo, reportID) {
        var deferred = $q.defer();

        var params = {};
        params.date_to = dateTo.format('YYYY-MM-DD');
        params.date_from = dateFrom.format('YYYY-MM-DD');
        params.report_id = reportID;

        Api.getTimeclockUsersInfo(params).then(function(data) {
            data.dates = data.dates.reverse();
            _.each(data.dates, function (date) {
                date.date_object = moment(date.date, "YYYY-MM-DD");
                _.each(date.users, function (user) {
                    user.duration = user.numeric_duration;
                    _.each(user.logs, function (log) {
                        log.time_in = moment(log.time_in, "YYYY-MM-DD HH:mm:ss");

                        if (log.time_out != undefined) {
                            log.in_progress = false;
                            log.time_out = moment(log.time_out, "YYYY-MM-DD HH:mm:ss");
                        } else {
                            user.status = 'clockin';
                            log.time_out = moment();
                            log.in_progress = true;
                        }


                        log.duration = moment.duration(log.time_out.diff(log.time_in));
                        log.duration_time = moment(log.duration.hours()+':'+log.duration.minutes(), 'hh:mm');

                        fixTime(log);
                    });
                });
            });

            deferred.resolve(data);
        });

        return deferred.promise
    }

    function fixTime(log) {
        log.time_in_original = angular.copy(log.time_in);
        log.time_out_original = angular.copy(log.time_out);
        log.duration_time_original = angular.copy(log.duration_time);
    }

    function compareLogs(logs1, logs2) {
        var isEqual = false;

        if (logs1.length == logs2.length) {
            _.each(logs1, function (log, i) {
                if (
                    logs1[i].status == logs2[i].status &&
                    logs1[i].time_in.toDate().getTime() == logs2[i].time_in.toDate().getTime() &&
                    (
                        (logs1[i].in_progress == true && logs2[i].in_progress == true) ||
                        (logs1[i].time_out.toDate().getTime() == logs2[i].time_out.toDate().getTime())
                    )
                ) {
                    isEqual = true;
                }
            });
        }

        return isEqual;
    }
};

app.directive('usersNotClockinPopOver', function ($compile) {
    var itemsTemplate = "<ul><li ng-repeat='item in items'>{{item.full_name}}</li></ul>";
    var getTemplate = function (contentType) {
        var template = '';
        switch (contentType) {
            case 'items':
                template = itemsTemplate;
                break;
        }
        return template;
    }
    return {
        restrict: "A",
        transclude: true,
        template: "<span ng-transclude></span>",
        link: function (scope, element, attrs) {
            var popOverContent;
            if (scope.items) {
                var html = getTemplate("items");
                popOverContent = $compile(html)(scope);
            }
            var options = {
                content: popOverContent,
                placement: "bottom",
                html: true,
                title: scope.title
            };
            $(element).popover(options);
        },
        scope: {
            items: '=',
            title: '@'
        }
    };
});