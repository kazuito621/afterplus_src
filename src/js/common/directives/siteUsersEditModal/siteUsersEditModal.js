app.directive('siteUsersEditModal',
	['$modal', 'SiteModelUpdateService', 'Api', '$window', '$timeout',
	function ($modal, SiteModelUpdateService, Api, $window, $timeout) {
	    'use strict';

	    var linker = function (scope, el, attrs) {

	        var modal;
	        var newContact = { role: 'customer', email: undefined, fName: undefined, lName: undefined, phone: undefined };
	        var newRep = { role: 'sales', email: undefined, fName: undefined, lName: undefined, phone: undefined };

	        if (angular.isDefined(attrs.site)) {
	            scope.site = scope.$eval(attrs.site);
	        }
	        if (angular.isDefined(attrs.refreshSiteUsers)) {
	            scope.refreshSiteUsers = scope.$eval(attrs.refreshSiteUsers);
	        }
	        if (angular.isDefined(attrs.sites)) scope.sites=scope.$eval(attrs.sites);
	        if (angular.isDefined(attrs.clients)) scope.clients=scope.$eval(attrs.clients);

	        window.sues = scope;

	        var separateUsers = function (users) {
	            var res = { contacts: [], reps: [] };

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

			scope.salesList = [];
			scope.newSaleRep = {};

	        scope.openModal = function (id) {
				console.log('openModal');
	            if (!id) {
	                console.log('Trying to open site users modal without site id provided');
	                return;
	            }

	            if (!modal) {
	                modal = $modal({ scope: scope, template: '/js/common/directives/siteUsersEditModal/siteUsersEditModal.tpl.html', show: false });
	            }

	            Api.getSiteUsers(id).then(function (data) {
	                var separatedUsers = separateUsers(data);
	                scope.contacts = separatedUsers.contacts;
	                scope.reps = separatedUsers.reps;
	            });
				console.log('openModal 2');
				if(!scope.salesList.length){
					Api.getSalesUsers().then(function (response) {
						console.log(response);
						scope.salesList = processUsers(response);
						//if(deferred) deferred.resolve(scope.salesList);

						modal.$promise.then(function () {
							modal.show();
							// setup ESCAPE key
							$(document).keyup(hideOnEscape);
						});
					});
				} else {
					modal.$promise.then(function () {
						modal.show();
						// setup ESCAPE key
						$(document).keyup(hideOnEscape);
					});
				}


	        };

	        scope.closeModal = function () {
	            scope.showAddNewSiteContact = false;
	            scope.showAddNewSiteRep = false;
				modal.$promise.then(function () {
					modal.hide();
				});
	        };

	        scope.showAddForm = function (type) {
	            if (type == 'rep') {
	                scope.showAddNewSiteRep = true;
	                var css = 'input#newRepEmail';
	            } else {
	                scope.showAddNewSiteContact = true;
	                var css = 'input#newContactEmail';
	            }
	            setTimeout(function () {
	                $(css).focus();
	            }, 100);
	        }
	        scope.contactSelect = function (user) {
	            scope.newContact = angular.copy(user);
	        };

	        scope.repSelect = function (user) {
	            if (user.role == 'admin') user.role = 'sales';
	            scope.newRep = angular.copy(user);
	        };

	        scope.newContactCloned = angular.copy(scope.newContact);
	        scope.newRepCloned = angular.copy(scope.newRep);

	        scope.closePopup = function (invalid) {

	            if (!angular.equals(scope.newContactCloned, scope.newContact)
                    || !angular.equals(scope.newRepCloned, scope.newRep)) {

	                if (window.confirm("There are contacts you have not saved yet. Continue?")) {
	                    scope.closeModal();
	                }
	            }
	            else
	                scope.closeModal();

	            //if ((scope.newContact.email !== "" || scope.newContact.email !== undefined)
	            //    (scope.newContact.lName !== "" || scope.newContact.lName !== undefined) ||
	            //    (scope.newContact.fName !== "" || scope.newContact.fName !== undefined) ||
	            //    (scope.newContact.phone !== "" || scope.newContact.phone !== undefined) ||
	            //    (scope.newRep.email !== "" || scope.newContact.email !== undefined) ||
	            //    (scope.newRep.lName !== "" || scope.newContact.lName !== undefined) ||
	            //    (scope.newRep.fName !== "" || scope.newContact.fName !== undefined) ||
	            //    (scope.newRep.phone !== "" || scope.newContact.phone !== undefined)) {
	            //    if (window.confirm("There are contacts you have not saved yet. Continue?")) {
	            //        scope.$parent.closeModal();
	            //    }
	            //}
	            //else {
	            //    scope.$parent.closeModal();
	            //}
	        };

	        scope.addNewSiteContact = function (event) {
	            event.preventDefault();
	            event.stopPropagation();
	            scope.showAddNewSiteContact = false;

	            var tmp = angular.copy(scope.newContact);

				if (tmp.email != undefined) {
					var isvalid = validateEmail(tmp.email);
					if (isvalid !== true) {
						scope.setAlert('Email address is invalid', { type:'d' });
						return;
					}
				}

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

	                // For bulk estimate add the newly added user to child popup
	                if (scope.refreshSiteUsers && tmp.role == 'customer') scope.refreshSiteUsers(scope.site.siteID, data, 'add');
	            });
	        };

	        function validateEmail(sEmail) {
	            var filter = /^[a-zA-Z0-9].*@.*\..*/;
	            if (filter.test(sEmail)) return true;
	         	return false;
	        }

			scope.addNewSiteRepOnSelect = function ($item, $model) {
				$('div#isWorking').show();
				scope.showAddNewSiteRep = false;

				var tmp = angular.copy($model);
				var isvalid = validateEmail(tmp.email);
				if (isvalid === true) {

				}
				else {
					$("#newRepEmail").val(' ');
					return;
				}
				var user = { role: tmp.role, email: tmp.email };

				user.fName = tmp.fName;
				user.lName = tmp.lName;
				user.phone = tmp.phone;
				if (tmp.userID) user.userID = tmp.userID;

				console.log('Add new site rep', user);
				Api.userSite.assign(scope.site.siteID, user).then(function (data) {
					$('div#isWorking').hide();
					if (data[0]) {
						scope.reps.push(data[0]);
						scope.site.userStaffCount++;
					}
					scope.newRep = angular.copy(newRep);
				});

				scope.newSaleRep = {};
			};

	        scope.addNewSiteRep = function (event) {
				event.preventDefault();
	            event.stopPropagation();

	            scope.showAddNewSiteRep = false;

	            var tmpUsers = angular.copy(scope.newSaleRep.sales);
				angular.forEach(tmpUsers, function (tmp) {
					var isvalid = validateEmail(tmp.email);
					if (isvalid === true) {

					}
					else {
						$("#newRepEmail").val(' ');
						return;
					}
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
				});

				scope.newSaleRep = {};
	        };

	        scope.unassign = function (userID, email, type) {
	            if ($window.confirm('User ' + email + ' will be unassigned. Please confirm.')) {
	                Api.userSite.unassign(scope.site.siteID, userID).then(function (res) {
	                    // For bulk estimate add the newly added user to child popup
	                    if (scope.refreshSiteUsers && type == 'customer') scope.refreshSiteUsers(scope.site.siteID, { userID: userID }, 'delete');
	                });

	                if (type == 'customer') {
	                    scope.site.userCustCount--;
	                    scope.contacts = _.filter(scope.contacts, function (contact) {
	                        return contact.userID !== userID;
	                    });
	                } else {
	                    scope.site.userStaffCount--;
	                    scope.reps = _.filter(scope.reps, function (rep) {
	                        return rep.userID !== userID;
	                    });
	                }
	            }
	        };

	        var saveSiteCallback = function (site) {
	            console.log('Save site callback', site);
	            scope.site = site;
	            $timeout(function () {
	                console.log('Opening sues modal with id:', site.siteID);
	                scope.openModal(site.siteID);
	            }, 500);
	        };
            scope.validateEmail=function (email) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }


            scope.hide = function () {
	            $(document).unbind('keyup', hideOnEscape);
	            modal.hide();
	        }

	        var hideOnEscape = function (e) {
	            if (e.keyCode === 27) modal.hide();
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

			var processUsers = function(users){
				var usersList = [];
				if(!users) {
					return usersList;
				}

				angular.forEach(users, function (item) {
					usersList.push({
						userID:item.userID,
						fullName: item.fName + ' ' + item.lName,
						fName:item.fName,
						lName:item.lName,
						email: item.email
					});
				});
				return usersList;
			}

	        init();
	    };

	    return {
	        restrict: 'EA',
	        replace: false,
	        transclude: false,
	        //scope: {
	        //    site: '='
	        //},
	        compile: function () {
	            return linker;
	        }
	    };
	}]);
