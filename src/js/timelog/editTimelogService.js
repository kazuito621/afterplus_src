app
    .service('editTimelogService', [ '$rootScope', '$modal', '$q', 'Api', 'TimelogService', function ($rootScope, $modal, $q, Api, TimelogService) {
        var modalDeferred;

        scope = $rootScope.$new();

        var editTimelogModal = {};

        var show = function (users, date) {
            modalDeferred = $q.defer();

            init(users, date);

            editTimelogModal = $modal({
                scope: scope,
                template: '/js/timelog/editTimelog.tpl.html',
                show: false
            });

            editTimelogModal.$promise.then(editTimelogModal.show);

            return modalDeferred.promise;
        };

        var init = function(users, date) {
            scope.showNewLog = false;
            scope.newJobReport = '';
            scope.newJobType = '';

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

            scope.date = date;
            scope.users = angular.copy(users);
            scope.status = angular.copy(_.first(users).status);
            scope.logs = angular.copy(_.first(users).logs);
        };

        scope.editLogTime = function(log, index) {
            log.time_in   = moment(log.time_in);
            log.time_out  = moment(log.time_out);
            log.duration_time = moment(log.duration_time);

            log.duration = moment.duration(log.time_out.diff(log.time_in));
            log.duration_time = moment(log.duration.hours()+':'+log.duration.minutes(), 'hh:mm');

            TimelogService.fixTime(log);

            if (index != 0) {
                var prevIndex = index - 1;
                scope.logs[prevIndex].time_out = angular.copy(log.time_in);

                scope.logs[prevIndex].duration = moment.duration(scope.logs[prevIndex].time_out.diff(scope.logs[prevIndex].time_in));
                scope.logs[prevIndex].duration_time = moment(scope.logs[prevIndex].duration.hours()+':'+scope.logs[prevIndex].duration.minutes(), 'hh:mm');

                TimelogService.fixTime(scope.logs[prevIndex]);
            }
        };

        scope.editLogDuration = function(log, index) {
            log.time_in   = moment(log.time_in);
            log.time_out  = moment(log.time_out);
            log.duration_time = moment(log.duration_time);

            var difference = log.duration_time.diff(log.duration_time_original);
            var differenceDuration = moment.duration(difference);

            log.time_out.add(differenceDuration);

            log.duration = moment.duration(log.time_out.diff(log.time_in));
            log.duration_time = moment(log.duration.hours()+':'+log.duration.minutes(), 'hh:mm');

            TimelogService.fixTime(log);

            for (var i = index + 1; i < scope.logs.length; i ++) {
                scope.logs[i].time_in   = moment(scope.logs[i].time_in);
                scope.logs[i].time_out  = moment(scope.logs[i].time_out);

                scope.logs[i].time_in.add(differenceDuration);
                scope.logs[i].time_out.add(differenceDuration);

                scope.logs[i].duration = moment.duration(scope.logs[i].time_out.diff(scope.logs[i].time_in));
                scope.logs[i].duration_time = moment(scope.logs[i].duration.hours()+':'+scope.logs[i].duration.minutes(), 'hh:mm');

                TimelogService.fixTime(scope.logs[i]);
            }
        };

        scope.removeLog = function(log, index) {
            var i = index;

            for (i; i < scope.logs.length; i++) {
                if (scope.logs[i+1] != undefined && scope.logs[i].reportID == scope.logs[i+1].reportID) {

                } else {
                    break;
                }

            }

            scope.logs.splice(index,i+1);
        };

        scope.removeWork = function(log, index) {
            scope.logs.splice(index, 1);
        };

        scope.removeBreak = function (log, index) {
            var prevWork = scope.logs[index - 1];
            var nextWork = scope.logs[index + 1];

            var newIndex = index-1;
            var newWork = angular.copy(prevWork);
            newWork.time_out = angular.copy(nextWork.time_out);

            scope.logs.splice(index+1,1);
            scope.logs.splice(index,1);
            scope.logs.splice(index-1,1);

            newWork.duration = moment.duration(newWork.time_out.diff(newWork.time_in));
            newWork.duration_time = moment(newWork.duration.hours()+':'+newWork.duration.minutes(), 'hh:mm');

            TimelogService.fixTime(newWork);

            scope.logs.splice(newIndex, 0, newWork);
        };

        scope.showNewLogForm = function () {
            scope.showNewLog = true;
        };

        scope.changeNewJobReport = function () {
            if (this.newJobReport != '' && this.newJobReport != undefined) {
                this.newJobType = 'work';
            }
        };

        scope.closeNewLogForm = function () {
            scope.showNewLog = false;
        };

        scope.saveNewLog = function () {
            var newIndex = scope.logs.length + 1;

            var prevWork = scope.logs[scope.logs.length - 1];
            prevWork.time_in   = moment(prevWork.time_in);
            prevWork.time_out  = moment(prevWork.time_out);

            var newWork = angular.copy(prevWork);
            newWork.time_in = angular.copy(prevWork.time_out);
            newWork.time_out = angular.copy(prevWork.time_out).add(1, 'hour');

            newWork.duration = moment.duration(newWork.time_out.diff(newWork.time_in));
            newWork.duration_time = moment(newWork.duration.hours()+':'+newWork.duration.minutes(), 'hh:mm');

            TimelogService.fixTime(newWork);

            newWork.reportID = angular.copy(this.newJobReport);
            newWork.status = angular.copy(this.newJobType);

            scope.logs.splice(newIndex, 0, newWork);

            scope.showNewLog = false;
        };

        scope.clockOut = function() {
            scope.status = 'clockout';
            _.each(scope.users, function (user) {
                user.status = 'clockout';
            });

            scope.logs[scope.logs.length-1].time_out = moment();
        };

        scope.saveLogs = function () {
            var usersID = _.pluck(scope.users, 'userID');

            var params = {};

            _.each(scope.logs, function (log) {
                log.time_in = moment(log.time_in).format('YYYY-MM-DD HH:mm:ss');
                log.time_out = moment(log.time_out).format('YYYY-MM-DD HH:mm:ss');;
            });

            params.date = scope.date;
            params.users = usersID;
            params.worktime  = scope.logs;

            Api.saveTimeclockSchedules(params).then(function(data) {
                editTimelogModal.$promise.then(editTimelogModal.hide);
                modalDeferred.resolve(scope.logs);
            });
        };

        scope.closeSchedule = function () {
            editTimelogModal.$promise.then(editTimelogModal.hide);
        };

        var showModal = function (users, date) {
            return show(users, date);
        };

        return {
            showModal: showModal
        };
    }
    ]);