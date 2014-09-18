app.directive('siteUsersMultiEditModal',
    ['$modal', 'SiteModelUpdateService', 'Api', '$window', '$timeout',
        function ($modal, SiteModelUpdateService, Api, $window, $timeout) {
            'use strict';

            var linker = function (scope, el, attrs) {
                var modal;
                var newContact = { role: 'customer', email: ''};
                var newRep = { role: 'sales', email: ''};
                var newSite = { name: ''};

                window.sumes = scope;

                scope.newContact = angular.copy(newContact);
                scope.newRep = angular.copy(newRep);
                scope.newSite = angular.copy(newSite);
                scope.canAddSite = false;
                scope.contacts = [];
                scope.reps = [];
                scope.selectedSites = [];

                scope.openModal = function () {
                    if (!modal) {
                        modal = $modal({scope: scope, template: '/js/common/directives/siteUsersMultiEditModal/siteUsersMultiEditModal.tpl.html', show: false});
//                        modal = $modal({scope: scope, template: 'js/common/directives/siteUsersMultiEditModal/siteUsersMultiEditModal.tpl.html', show: false}); // DEV
                    }

                    modal.$promise.then(function () {
                        modal.show();
                    });
                };

                scope.closeModal = function () {
                    scope.showAddNewSiteContact = false;
                    scope.showAddNewSiteRep = false;
                    scope.showAddNewSite = false;
                    scope.onSave();
                    modal.hide();
                };

                scope.showAddForm = function (type) {
                    var css;
                    if (type === 'rep') {
                        scope.showAddNewSiteRep = true;
                        css = 'input#newRepEmail';
                    } else if (type === 'customer') {
                        scope.showAddNewSiteContact = true;
                        css = 'input#newContactEmail';
                    } else if (type === 'site') {
                        scope.showAddNewSite = true;
                        css = 'input#newSiteName';
                    }
                    setTimeout(function () {
                        $(css).focus();
                    }, 100);
                };

                scope.siteSelect = function (site, canAddSite) {
//                    console.log('Site selected', site, canAddSite);
                    scope.canAddSite = canAddSite;
                    if (canAddSite) {
                        scope.newSite = angular.copy(site);
                    }
                };

                scope.deselect = function (site, index) {
//                    console.log('Deselect site', index, site);
                    scope.reps = [];
                    scope.contacts = [];

                    scope.selectedSites.splice(index, 1);
                };

                scope.contactSelect = function (user) {
                    scope.newContact = angular.copy(user);
                };

                scope.repSelect = function (user) {
                    if (user.role === 'admin') {
                        user.role = 'sales';
                    }
                    scope.newRep = angular.copy(user);
                };

                scope.addNewSite = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    scope.showAddNewSite = false;

                    scope.selectedSites = scope.selectedSites || [];

                    scope.selectedSites.push(angular.copy(scope.newSite));

                    scope.reps = [];
                    scope.contacts = [];
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
                    if (tmp.userID) {
                        user.userID = tmp.userID;
                    }

                    user.siteIDs = _.pluck(scope.selectedSites, 'siteID');

                    console.log('Add new site contact', user);
                    Api.userSite.assignMulti(user).then(function (data) {
                        if (data[0]) {
                            scope.contacts.push(data[0]);
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
                    if (tmp.userID) {
                        user.userID = tmp.userID;
                    }

                    user.siteIDs = _.pluck(scope.selectedSites, 'siteID');

                    console.log('Add new site rep', user);
                    Api.userSite.assignMulti(user).then(function (data) {
                        if (data[0]) {
                            scope.reps.push(data[0]);
                        }
                        scope.newRep = angular.copy(newRep);
                    });
                };

                var init = function () {
                    el.on('click', function (event) {
                        if (scope.preSelected && scope.preSelected.length) {
                            scope.selectedSites = _.filter(scope.sites, function (site) {
                                return scope.preSelected.indexOf(site.siteID) > -1;
                            });
                        }

                        event.preventDefault();
                        scope.openModal();
                    });
                };

                init();
            };

            return {
                restrict: 'EA',
                replace: false,
                transclude: false,
                scope: {
                    onSave: '&',
                    clients: '=',
                    sites: '=',
                    preSelected: '='
                },
                compile: function () {
                    return linker;
                }
            };
        }]);
