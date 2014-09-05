/*global dbg*/
var SitesCtrl = app.controller('SitesCtrl',
    ['$scope', '$route', '$location', 'SiteModelUpdateService', 'Api', '$popover', 'Auth', 'SortHelper', '$q', '$timeout', 'FilterHelper',
        function ($scope, $route, $location, SiteModelUpdateService, Api, $popover, Auth, SortHelper, $q, $timeout, FilterHelper) {
            'use strict';
            var s = window.scs = $scope;
            var myStateID = 'sites',
                siteDeletePopover,
                sites,  // array of original site array that comes from api/server
                sitesFiltered,  // filtered list of sites... which s.displayedSites uses as its source
                filters = {},
                filterTextTimeout,
                self = this,
                columnMap = {
                    siteID: 'number',
                    treeCount: 'number',
                    reportCount: 'number'
                };
            s.mode = '';
            s.type = 'site';
            s.items = {};
            s.displayedSites = [];
            s.activePopover = {};
            s.auth = Auth;
            s.allSites = {
                selected: false,
                selectedIds: [],
                getSelected: function () {
                    console.log('Get selected', this.selectedIds);
                    return this.selectedIds;
                }
            };
            s.data = {
                filterText: '',
                getSiteCount: function () {
                    if (sitesFiltered && sitesFiltered.length) {
                        return sitesFiltered.length;
                    }
                    return 0;
                }
            };

            this.fh = FilterHelper.fh();

            var init = function () {
                // pull the list of sites. were are not using initData.sites, because we need a list
                // that has user assignments as well
                Api.getSiteList().then(function (siteData) {
                    // allow them to nav to /#sites?clientID=XXX and filter
                    var search = $location.search();
                    if (search.clientID) {
                        dbg('doing search clientID');
                        sitesFiltered = [];
                        _.each(siteData, function (s) {
                            if (s.clientID === search.clientID) {
                                sitesFiltered.push(s);
                            }
                            sites = angular.copy(sitesFiltered);
                        });
                    } else {
                        sitesFiltered = siteData;
                        sites = siteData;
                    }

                    self.sh = SortHelper.sh(sitesFiltered, '', columnMap);
                    s.displayedSites = sitesFiltered.slice(0, 49);
                });
            };

            s.refreshSites = function () {
                init();
            };

            var clearFilter = function () {
                if (!filters || (_.objSize(filters) === 0)) { return; }
                filters = {};
                sitesFiltered = sites;
                s.sh.applySort();
                s.displayedSites = sitesFiltered.slice(0, 49);
            };

            var applyFilter = function () {
                sitesFiltered = self.fh.applyFilter(sites, filters);
                s.sh.applySort();
                s.displayedSites = sitesFiltered.slice(0, 49);
            };

            // when search box is changed, then update the filters, but
            // add delay so we dont over work the browser.
            s.$watch('data.filterTextEntry', function (txt, old) {
                if (filterTextTimeout) { $timeout.cancel(filterTextTimeout); }
                filterTextTimeout = $timeout(function () {
                    if (txt === '' || !txt) {
                        clearFilter();
                    } else if (!isNaN(txt)) {
                        // if search entry is a number, search by siteID and name
                        filters = {siteID: txt, siteName: txt};
                        applyFilter();
                    } else {
                        // if just letters, then search by name and city
                        filters = {siteName: txt, city: txt};
                        applyFilter();
                    }
                }, 500);
            });


            var siteDeletePopoverFactory = function (el) {
                return $popover(el, {
                    scope: $scope,
                    template: '/js/partial_views/delete.tpl.html', // production
                    show: false,
                    animation: 'am-flip-x',
                    placement: 'left',
                    trigger: 'focus'
                });
            };

            s.sh = {
                sortByColumn: function (col) {
                    applyFilter();
                    sitesFiltered = self.sh.sortByColumn(col);
                    s.displayedSites = sitesFiltered.slice(0, 49);
                },
                columnClass: function (col) {
                    return self.sh.columnClass(col);
                },
                applySort: function () {
                    sitesFiltered = self.sh.makeSort(sitesFiltered);
                }
            };

            s.showMoreSites = function () {
                if (s.initData === undefined || sites === undefined || count === sitesFiltered.length) { return; }

                var count = s.displayedSites.length;
                s.displayedSites = sitesFiltered.slice(0, count + 50);
            };

            s.deleteCurrentItem = function () {
                Api.removeSiteById(s.activePopover.siteID).then(function () {
                    s.refreshSites();
                    Api.refreshInitData();
                });
                s.refreshSites();
                Api.refreshInitData();
                siteDeletePopover.hide();
                delete s.activePopover.siteID;
            };

            s.queueOrDequeueItemForDelete = function (itemID, event) {
                if (siteDeletePopover && typeof siteDeletePopover.hide === 'function') {
                    delete s.activePopover.siteID;
                    siteDeletePopover.hide();
                }

                if (!s.activePopover.siteID && event && event.target) {
                    s.activePopover.siteID = itemID
                    siteDeletePopover = siteDeletePopoverFactory($(event.target));

                    siteDeletePopover.$promise.then(function () {
                        siteDeletePopover.show();
                    });
                }

                s.type = 'site';
            };

            s.isSiteSelected = function (id) {
                return s.allSites.selectedIds.indexOf(id) > -1;
            };

            s.toggleSiteSelection = function (id) {
                var index = s.allSites.selectedIds.indexOf(id);
                if (index > -1) {
                    s.allSites.selectedIds.splice(index, 1);
                    s.allSites.selected = false;
                } else {
                    s.allSites.selectedIds.push(id);
                    if (s.allSites.selectedIds.length === sitesFiltered.length) {
                        s.allSites.selected = true;
                    }
                }
            };

            s.toggleAllSitesSelection = function (newVal) {
                newVal = newVal || !s.allSites.selected;
                if (!newVal) {
                    s.allSites.selected = false;
                    s.allSites.selectedIds = [];
                } else {
                    s.allSites.selected = true;
                    s.allSites.selectedIds = _.pluck(sitesFiltered, 'siteID');
                }
            };

            s.assignSelf = function (role, event) {
                event.preventDefault();
                event.stopPropagation();

                if (s.allSites.selectedIds.length === 0) { return; }

                var authData = Auth.data();
                var user = {
                    role: role,
                    fName: authData.fName,
                    lName: authData.lName,
                    userID: authData.userID,
                    siteIDs: s.allSites.selectedIds
                };

                Api.userSite.assignMulti(user).then(function () {
                    s.setAlert('You were successfully assigned as ' + role + ' to the selected sites', { type: 'success'});
                    init();
                });
            };

            init();
            s.$on('nav', function (e, data) {
                if (data.new === myStateID) { init(); }
            });

        }]);
