app.directive('siteUsersEditModal', 
	['$modal', 'SiteModelUpdateService', 'Api', '$window', '$timeout',
	function ($modal, SiteModelUpdateService, Api, $window, $timeout) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var modal;
        var newContact = { role: 'customer', email:''};
        var newRep = { role: 'sales', email:''};

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
                modal = $modal({scope: scope, template: '/js/common/directives/siteUsersEditModal/siteUsersEditModal.tpl.html', show: false});
            }

            Api.getSiteUsers(id).then(function (data) {
                var separatedUsers = separateUsers(data);
                scope.contacts = separatedUsers.contacts;
                scope.reps = separatedUsers.reps;
            });

            modal.$promise.then(function () {
                modal.show();
				// setup ESCAPE key
				$(document).keyup(hideOnEscape);
            });
        };

        scope.closeModal = function () {
            scope.showAddNewSiteContact = false;
            scope.showAddNewSiteRep = false;
            modal.hide();
        };

		scope.showAddForm = function(type){
			if(type=='rep'){
				scope.showAddNewSiteRep = true;
				var css='input#newRepEmail';
			}else{
				scope.showAddNewSiteContact = true;
				var css='input#newContactEmail';
			}
			setTimeout(function(){
				$(css).focus();
			},100);
		}
        scope.contactSelect = function (user) {
            scope.newContact = angular.copy(user);
        };

        scope.repSelect = function (user) {
			if(user.role=='admin') user.role='sales';
            scope.newRep = angular.copy(user);
        };

        scope.addNewSiteContact = function (event) {
			event.preventDefault();
			event.stopPropagation();
            scope.showAddNewSiteContact = false;

            var tmp = angular.copy(scope.newContact);
            var user = { role: tmp.role, email: tmp.email };

			user.fName = tmp.fName;
			user.lName = tmp.lName;
			user.phone = tmp.phone;
            if (tmp.userID) user.userID = tmp.userID;

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

			user.fName = tmp.fName;
			user.lName = tmp.lName;
			user.phone = tmp.phone;
            if (tmp.userID) user.userID = tmp.userID;

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

				if(type=='customer'){
					scope.site.userCustCount--;
					scope.contacts = _.filter(scope.contacts, function (contact) {
						return contact.userID !== userID;
					});
				}else{
					scope.site.userStaffCount--;
					scope.reps = _.filter(scope.reps, function (rep) {
						return rep.userID !== userID;
					});
				}
            }
        };

        var saveSiteCallback = function (site) {
            console.log('Save site callback', site);

            $timeout(function () {
                console.log('Opening sues modal with id:', site.siteID);
                scope.openModal(site.siteID);
            }, 500);
        };

		scope.hide = function(){
			$(document).unbind('keyup', hideOnEscape);
			modal.hide();
		}	

		var hideOnEscape = function(e){
			if(e.keyCode === 27) scope.hide();
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
}]);
