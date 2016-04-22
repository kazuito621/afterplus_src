app
    .controller('TimelogController', TimelogController)
    .service('TimelogService', TimelogService);

TimeclockController.$inject = ['Api', 'TimelogService', 'editTimelogService', 'createTimelogService']
function TimelogController(Api, TimelogService, editTimelogService, createTimelogService) {
    var vm = this;

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
            return vm.data;
        });
    };

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
        fixTime: fixTime
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
};