app.directive('siteEditModal', function ($modal, SiteModelUpdateService, Api, $window) {
    'use strict';

    var linker = function (scope, el) {
        var modal;
        var newSite = {clientID: ''};
        var newContact = { role: 'customer'};

        var separateUsers = function (users) {
            var res = { contacts: [], reps: []};

            angular.forEach(users, function (user) {
                if (user.role === 'customer') {
                    res.contacts.push(user);
                } else if (user.role === 'sales' || user.role === 'inventory') {
                    res.reps.push(user);
                }
            });

            return res;
        };

        scope.mode = '';
        scope.newContact = angular.copy(newContact);

        scope.openModal = function (id) {
            if (!modal) {
                modal = $modal({scope: scope, template: '/js/common/directives/templates/siteEditModal.tpl.html', show: false});
            }

            scope.site = angular.copy(newSite);

            if (id) {
                scope.mode = 'edit';
                Api.updateSite(id).then(function (data) {
                    scope.site = data;
                    Api.getSiteUsers(id).then(function (data) {
                        var separatedUsers = separateUsers(data);
                        scope.contacts = separatedUsers.contacts;
                        scope.reps = separatedUsers.reps;

                        console.log('Edit site', scope.site);
                    });
                });
            } else {
                scope.mode = 'new';
            }

            modal.$promise.then(function () {
                modal.show();
            });
        };

        scope.saveSite = function () {
            if (!scope.site.clientID) {
                return scope.setAlert('Choose a client for the new property', {type: 'd'});
            }

            if (scope.site.id) {
                scope.site.post().then(function () {
                    Api.refreshInitData();
                });
                // Update all other sites models, eg. the sites dropdown on the trees report
                SiteModelUpdateService.updateSiteModels(scope.site);
            } else {
                Api.saveNewSite(scope.site).then(function () {
                    Api.refreshInitData();
                });
            }

            modal.hide();
        };

        scope.userSelect = function (user) {
            scope.newContact.fName = user.fName;
            scope.newContact.lName = user.lName;
            scope.newContact.userID = user.userID;
        };

        scope.addNewSiteContact = function (event) {
            event.preventDefault();
            event.stopPropagation();

            scope.showAddNewSiteContact = false;

            var tmp = angular.copy(scope.newContact);
            var user = { role: tmp.role };

            if (!tmp.userID) {
                user.fName = tmp.fName;
                user.lName = tmp.lName;
            } else {
                user.userID = tmp.userID;
            }

            console.log('Add new site contact', user);
            Api.userSite.assign(scope.siteId, scope.newContact).then(function () {
                scope.newContact = angular.copy(newContact);
            });
        };

        scope.unassign = function (userID, email) {
            if ($window.confirm('User ' + email + ' will be unassigned. Please confirm.')) {
                Api.userSite.unassign(scope.siteId, userID);
                scope.contacts = _.filter(scope.contacts, function (contact) {
                    return contact.userID !== userID;
                });

                scope.reps = _.filter(scope.reps, function (rep) {
                    return rep.userID !== userID;
                });
            }
        };

        var init = function () {
            el.on('click', function (event) {
                event.preventDefault();
                scope.openModal(scope.siteId);
            });
        };

        init();
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        scope: {
            siteId: '=',
            clients: '='
        },
        compile: function () {
            return linker;
        }
    };
});
