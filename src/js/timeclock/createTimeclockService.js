app
    .service('createTimeclockService', [ '$rootScope', '$modal', 'TimeclockService', 'Api', '$q', function ($rootScope, $modal, TimeclockService, Api, $q) {
        var modalDeferred;
        var editTimeclockModal = {};

        scope = $rootScope.$new();
        scope.foremans = [];
        scope.selectedForeman = [];
        scope.showClockedOut = false;
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

        scope.showClockedOutTime = function () {
            scope.showClockedOut = true;
            scope.schedule.time_out = angular.copy(scope.schedule.time_in);
        };

        scope.save = function(viewValue) {
            var userIDs = _.pluck(scope.schedule.foremans, 'userID');
            var date = moment(scope.schedule.time_in).format('YYYY-MM-DD');
            var worktime = {};
            worktime.reportID = scope.schedule.job;
            worktime.time_in = moment(scope.schedule.time_in).format('HH:mm') + ':00';
            if (scope.showClockedOut) {
                worktime.time_out  = moment(scope.schedule.time_out).format('HH:mm') + ':00';
            }

            worktime.status = scope.schedule.status;

            var params = {};

            params.date = date;
            params.users = userIDs;
            params.worktime  = [];
            params.worktime.push(worktime);

            Api.saveTimeclockSchedules(params).then(function(data) {
                editTimeclockModal.$promise.then(editTimeclockModal.hide);
            });
        };

        var show = function (foremans) {
            modalDeferred = $q.defer();

            scope.foremans = foremans;
            scope.schedule = {};
            scope.schedule.time_in = new Date();

            editTimeclockModal = $modal({
                scope: scope,
                template: '/js/timeclock/createTimeclock.tpl.html',
                show: false
            });

            editTimeclockModal.$promise.then(editTimeclockModal.show);

            return modalDeferred.promise;
        };

        var showModal = function (foremans) {
            return show(foremans);
        };

        return {
            showModal: showModal
        };
    }
    ]);