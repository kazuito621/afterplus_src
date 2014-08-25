var SitesCtrl = app.controller('SitesCtrl',
    ['$scope', '$route', '$location', 'SiteModelUpdateService', 'Api', '$popover', 'Auth', 'SortHelper', '$q', '$timeout',
        function ($scope, $route, $location, SiteModelUpdateService, Api, $popover, Auth, SortHelper, $q, $timeout) {
            'use strict';
            var s = window.scs = $scope;
            var myStateID = 'sites';
            var siteDeletePopover, sitesList;
            var self = this;
            var columnMap = {
                siteID: 'number',
                treeCount: 'number',
                reportCount: 'number'
            };
            var sites, filterTextTimeout, filters={};
            s.mode = '';
            s.type = 'site';
            s.items = {};
            s.displayedSites = [];
            s.activePopover = {};
            s.auth = Auth;
			s.data={filterText:''};

            var init = function () {
                // pull the list of sites. were are not using initData.sites, because we need a list
                // that has user assignments as well
                Api.getSiteList().then(function(siteData){
                    sites=siteData
                    // allow them to nav to /#sites?clientID=XXX and filter
                    var search = $location.search();
                    if(search.clientID){
                        sitesList=[];
                        _.each(sites, function(s){
                            if(s.clientID==search.clientID) sitesList.push(s);
                        });
                    }else sitesList = sites;

                    self.sh = SortHelper.sh(sites, '', columnMap);
                    s.displayedSites = sitesList.slice(0, 49);
                });
            };
            
            s.refreshSites = function () {
                init();
            };
	
			var clearFilter = function(){
				if(!filters || !(_.objSize(filters)>0)) return;
				filters={};
				sitesList=sites;
				s.displayedSites=sitesList.slice(0,49);
			};

			// @param filterObj OBJ - ie. {siteName:'abc'}
			var setFilter = function(filterObj){
				if(filterObj){
					_.each(filterObj, function(val, key){
						if(!isNaN(val)) filterObj[key]=val.toLowerCase();
					});
					filters=filterObj;
				}

				var fsize=_.objSize(filters);
				if(!fsize) return clearFilter();
				var out=[];

				// todo fix this. its broken
				_.each(sites, function(s){
					_.each(filters, function(val, key){
						if(val){
							if(key.substr(-2).toLowerCase()=='id'){
								if(s[key]===val){
									out.push(s);
									return false;
								}
							}else{
								if(s[key].toLowerCase().indexOf(val)>=0) {
									out.push(s);
									return false;
									}
							}
						}
					});
				});
				sitesList=out;
				s.displayedSites = sitesList.slice(0,49);
			};

			// when search box is changed, then update the filters, but
			// add delay so we dont over work the browser.
            s.$watch('data.filterTextEntry', function(txt, old) {
				if(filterTextTimeout) $timeout.cancel(filterTextTimeout);
				filterTextTimeout = $timeout(function(){
					if(txt=='' || !txt) clearFilter();
					// if search entry is a number, search by siteID and name 
					else if(!isNaN(txt)) setFilter({siteID: txt, siteName:txt});
					// if just letters, then search by name and city
					else setFilter({siteName: txt, city:txt});
				},500);
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
                    sites = self.sh.sortByColumn(col);
                    s.displayedSites = sites.slice(0, s.displayedSites.length);
                },
                columnClass: function (col) {
                    return self.sh.columnClass(col);
                }
            };

            s.showMoreSites = function () {
                var count = s.displayedSites.length;
                if (s.initData === undefined || sites === undefined || count === sitesList.length )
                    return;

                var addon = sitesList.slice(count, count + 50);
                s.displayedSites = s.displayedSites.concat(addon);
            };

            s.select = function (siteID) {
                // todo... this should navigate to /#trees?siteID=XXX  but that functionality at trees does not work yet
                return;
                $location.url('/trees?siteID='+siteID);
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

            init();
            s.$on('nav', function (e, data) {
                if (data.new === myStateID) init();
            });

        }]);
