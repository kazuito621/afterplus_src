app
    .service('createTimelogService', [ '$rootScope', '$modal', 'TimelogService', 'Api', '$q', function ($rootScope, $modal, TimelogService, Api, $q) {
        var createModalDeferred;
        var createTimeclockModal = {};

        createModalScope = $rootScope.$new();
        createModalScope.foremans = [];
        createModalScope.selectedForeman = [];
        createModalScope.showClockedOut = false;
        createModalScope.maxDate = new Date();
        createModalScope.jobTypes = [
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

        createModalScope.showClockedOutTime = function () {
            createModalScope.showClockedOut = true;
            createModalScope.schedule.time_out = angular.copy(createModalScope.schedule.time_in);
        };

        createModalScope.save = function(viewValue) {
            var userIDs = _.pluck(createModalScope.schedule.foremans, 'userID');
            var date = moment(createModalScope.schedule.time_in).format('YYYY-MM-DD');
            var worktime = {};
            worktime.reportID = createModalScope.schedule.job;
            worktime.time_in = moment(createModalScope.schedule.time_in).format('HH:mm') + ':00';
            if (createModalScope.showClockedOut) {
                worktime.time_out  = moment(createModalScope.schedule.time_out).format('HH:mm') + ':00';
            }

            worktime.status = createModalScope.schedule.status;

            var params = {};

            params.date = date;
            params.users = userIDs;
            params.worktime  = [];
            params.worktime.push(worktime);

            Api.saveTimeclockSchedules(params).then(function(data) {
                createModalDeferred.resolve(data);

                createTimelogModal.$promise.then(createTimelogModal.hide);
            });
        };

        var show = function (foremans) {
            createModalDeferred = $q.defer();

            createModalScope.foremans = foremans;
            createModalScope.schedule = {};
            createModalScope.schedule.time_in = new Date();

            createTimelogModal = $modal({
                scope: createModalScope,
                template: '/js/timelog/createTimelog.tpl.html',
                show: false
            });

            createTimelogModal.$promise.then(createTimelogModal.show);

            return createModalDeferred.promise;
        };

        var showModal = function (foremans) {
            return show(foremans);
        };

        return {
            showModal: showModal
        };
    }
]);