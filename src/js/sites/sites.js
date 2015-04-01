/*global dbg*/
var SitesCtrl = app.controller('SitesCtrl',
    ['$scope', '$route', '$location', 'SiteModelUpdateService', 'Api', '$popover', 'Auth', 'SortHelper', '$q', '$timeout', 'FilterHelper',
        function ($scope, $route, $location, SiteModelUpdateService, Api, $popover, Auth, SortHelper, $q, $timeout, FilterHelper) {
            'use strict';
            var s = window.scs = $scope;
            var myStateID = 'sites',
                sites,  // array of original site array that comes from api/server
                sitesFiltered,  // filtered list of sites... which s.displayedSites uses as its source
                filters = {},
                filterTextTimeout,
                self = this,
                columnMap = {
                    siteID: 'number',
                    treeCount: 'number',
                    reportCount: 'number'
                },
				colSortOrder = {
					tstamp_created: 'desc',
					treeCount: 'desc',
					reportCount: 'desc'
				}
            s.mode = '';
            s.type = 'site';
            s.items = {};
            s.displayedSites = [];
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

            //we use this object as a 'singletone' property for delete-with-confirm-button directive
            //note, only one popover can be active on page
            s.activePopover = {elem:{}, itemID: undefined};

            //delete item method
            s.deleteCurrentItem = function () {
                if (!s.activePopover.itemID) return;
                Api.removeSiteById(s.activePopover.itemID).then(function (msg) {
                    if(false){ //TODO  if msg don't  indicates success,
                        s.setAlert("There was an error deleting the property.",{type:'d',time:5});
                    }
                    else {
                        if(idx>=0) {
                            sitesFiltered.splice(idx, 1);
                        }
                        s.setAlert('Property deleted successfully.',{type:'ok',time:5});
                    }
                }, function err(e){
                    s.setAlert("Property can't be deleted, try again later.",{type:'d',time:5});
                });

                var idx=_.findObj(sitesFiltered, 'siteID', s.activePopover.itemID, true);
                if(idx>=0) {
                    s.displayedSites.splice(idx, 1);
                }

                s.activePopover.elem.hide();
                delete s.activePopover.itemID;
            };



            this.fh = FilterHelper.fh();
            var init = function () {
                // pull the list of sites. were are not using initData.sites, because we need a list
                // that has user assignments as well
                Api.getSiteList().then(function (siteData) {
                    // allow them to nav to /#sites?clientID=XXX and filter
                    var search = $location.search();
                    if (search.clientID) {
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
                    self.sh = SortHelper.sh(sitesFiltered, '', columnMap, colSortOrder);
                    s.displayedSites = sitesFiltered.slice(0, 49);
                    s.sites=sitesFiltered;
                });
            };

            s.refreshSites = function () {
                init();
            };

			var clearFilter = function () {
				self.fh.setFilter({siteID:'', siteName:'', city:''});
				sitesFiltered = sites;
				s.sh.applySort();
                s.displayedSites = sitesFiltered.slice(0, 49);
			};

            var applyFilter = function () {
                sitesFiltered = self.fh.applyFilter(sites);
				// without this line here, the filter gets messed up on the next filter execution
				if(!sitesFiltered.length) sitesFiltered=[{siteName:'No Results', city:'', state:'', tstamp_created_2:'', treeCount:''}];
                s.sh.applySort();
                s.displayedSites = sitesFiltered.slice(0, 49);
            };


            // when search box is changed, then update the filters, but
            // add delay so we dont over work the browser.
            s.$watch('data.filterTextEntry', function (txt, old) {
                if (filterTextTimeout) { $timeout.cancel(filterTextTimeout); }
                filterTextTimeout = $timeout(function () {
                    if (txt === '' || !txt) {
						if(old){
							self.fh.setFilter({siteName:'', city:'', siteID:''});
							applyFilter();
						}
                    } else if (!isNaN(txt)) {
                        // if search entry is a number, search by siteID and name
						self.fh.setFilter({siteID: txt, siteName: txt});
                        applyFilter();
                    } else {
                        // if just letters, then search by name and city
						self.fh.setFilter({siteName: txt, city: txt});
                        applyFilter();
                    }
                }, 500);
            });

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
					// todo... this breaks when using filtering
                    //sitesFiltered = self.sh.makeSort(sitesFiltered);
                }
            };

            s.showMoreSites = function () {
                if (s.initData === undefined || sites === undefined || count === sitesFiltered.length) { return; }

                var count = s.displayedSites.length;
                s.displayedSites = sitesFiltered.slice(0, count + 50);
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
