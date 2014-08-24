app.directive('siteUsersEditModal', function ($modal, SiteModelUpdateService, Api, $window, $timeout) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var modal;
        var newContact = { role: 'customer'};
        var newRep = { role: 'sales'};

        window.sues = scope;

        var separateUsers = function (users) {
            var res = { contacts: [], reps: []};

            angular.forEach(users, function (user) {
                if (user.role === 'customer') {
                    res.contacts.push(user);
                } else {
                    res.reps.push(user);
                }
            });

            return res;
        };

        scope.newContact = angular.copy(newContact);
        scope.newRep = angular.copy(newRep);

        scope.openModal = function (id) {
            if (!id) {
                console.log('Trying to open site users modal without site id provided');
                return;
            }

            if (!modal) {
                modal = $modal({scope: scope, template: '/js/common/directives/templates/siteUsersEditModal.tpl.html', show: false});
//                modal = $modal({scope: scope, template: 'js/common/directives/templates/siteUsersEditModal.tpl.html', show: false}); // DEV
            }

            Api.getSiteUsers(id).then(function (data) {
                var separatedUsers = separateUsers(data);
                scope.contacts = separatedUsers.contacts;
                scope.reps = separatedUsers.reps;
            });

            modal.$promise.then(function () {
                modal.show();
            });
        };

        scope.closeModal = function () {
            scope.showAddNewSiteContact = false;
            scope.showAddNewSiteRep = false;
            modal.hide();
        };

        scope.contactSelect = function (user) {
            scope.newContact = angular.copy(user);
        };

        scope.repSelect = function (user) {
            scope.newRep = angular.copy(user);
        };

        scope.addNewSiteContact = function (event) {
            event.preventDefault();
            event.stopPropagation();

            scope.showAddNewSiteContact = false;

            var tmp = angular.copy(scope.newContact);
            var user = { role: tmp.role, email: tmp.email };

            if (!tmp.userID) {
                user.fName = tmp.fName;
                user.lName = tmp.lName;
            } else {
                user.userID = tmp.userID;
            }

            console.log('Add new site contact', user);
            Api.userSite.assign(scope.site.siteID, user).then(function (data) {
                if (data[0]) {
                    scope.contacts.push(data[0]);
					scope.site.userCustCount++;
                }
                scope.newContact = angular.copy(newContact);
            });
        };

        scope.addNewSiteRep = function (event) {
            event.preventDefault();
            event.stopPropagation();

            scope.showAddNewSiteRep = false;

            var tmp = angular.copy(scope.newRep);
            var user = { role: tmp.role, email: tmp.email };

            if (!tmp.userID) {
                user.fName = tmp.fName;
                user.lName = tmp.lName;
            } else {
                user.userID = tmp.userID;
            }

            console.log('Add new site rep', user);
            Api.userSite.assign(scope.site.siteID, user).then(function (data) {
                if (data[0]) {
                    scope.reps.push(data[0]);
					scope.site.userStaffCount++;
                }
                scope.newRep = angular.copy(newRep);
            });
        };

        scope.unassign = function (userID, email, type) {
            if ($window.confirm('User ' + email + ' will be unassigned. Please confirm.')) {
                Api.userSite.unassign(scope.site.siteID, userID);

				if(type=='cust') scope.site.userCustCount--;
				else scope.site.userStaffCount--;

				scope.reps = _.filter(scope.reps, function (rep) {
					return rep.userID !== userID;
				});
				scope.contacts = _.filter(scope.contacts, function (contact) {
					return contact.userID !== userID;
				});
            }
        };

        var saveSiteCallback = function (site) {
            console.log('Save site callback', site);

            $timeout(function () {
                console.log('Opening sues modal with id:', site.siteID);
                scope.openModal(site.siteID);
            }, 500);
        };

        var init = function () {
            el.on('click', function (event) {
                event.preventDefault();

                var funcName = attrs.beforeOpen;
                var func = scope.$parent[funcName];

                if (funcName && angular.isFunction(func)) {
                    func(saveSiteCallback, true);
                } else {
				//	if(scope.site && scope.site.siteID)
                    	scope.openModal(scope.site.siteID);
				//	else if(scope.siteId) 
                  //  	scope.openModal(scope.siteID);
				//	else console.debug('Error in siteUserEditModal - no site or siteID found');
                }
            });
        };

        init();
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        scope: {
            site: '='
        },
        compile: function () {
            return linker;
        }
    };
});
