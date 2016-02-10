app
    .service('editTimeclockService', [ '$rootScope', '$modal', 'TimeclockService', function ($rootScope, $modal, TimeclockService) {
        scope = $rootScope.$new();
        scope.users = [];
        scope.usersFirstNames = '';

        var show = function (users) {
            scope.users = users;
            scope.usersFirstNames = _.pluck(users, 'fName').join(', ');

            scope.events = TimeclockService.transformSchedule(_.first(users).schedule);
            console.log(scope.events);

            editTimeclockModal = $modal({
                scope: scope,
                template: '/js/timeclock/editTimeclock.tpl.html',
                show: false
            });

            editTimeclockModal.$promise.then(editTimeclockModal.show);
        };

        var showModal = function (users) {
            return show(users);
        };

        return {
            showModal: showModal
        };
    }
    ]);