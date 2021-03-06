/*
 See treefilter.service.js for detailed diagram of filter interactions


      EVENTS BASED ON DROPDOWNS
	  How this interacts with the TreeController:


                                            +---------+                                                  
                                            |  Api    |                                                  
                                            |         |                                                  
                                            +----+----+                                                  
                                                 |                                                       
 +------------------------+                      |                                                       
 |filter clients dropdown |  when user selects   |                                                       
 |                        |    clienttype        |                                                       
 |filter the site dropdown|  OnChange()          |                                                       
 |                        | <------+             |                                                       
 |Update map with Sites   |        |             |                                                       
 |                        |        |             +                                                       
 |Reset all filters       |        |     Selected[]array                                                 
 +------------------------+        |             +                                                       
                                   |             |                                                       
                                   |             +----------------+                                      
                                   |                              |                                      
                                   |                              |                                      
                                   +-----------------------+      |$scope.selected                       
                                   | Select ClientType     | <----+   .ClientTypeID                      
                                   +-----------------------+      |                                      
                                   |-----------------------|      | $scope.selected                      
                                   +-----------------------+      |    .clientID                         
                                   | Select ClientType     | <----+$scope.selected                       
                                   +-----------------------+      |    .ClientTypeID                     
       when user selects client    |-----------------------+      | $scope.selected                      
              +--------------------+ Select Client         | <----+   .clientID                          
              |     OnChange()     +-----------------------+      |                                      
              |                    +-----------------------+      | $scope.selected                      
              |                    | Select Site           | <----+   .SiteID                            
              |                    +---+-------------------+                                             
              |                        |                                                                 
              |                        |                                                                 
              |                        |                                                                 
              |                        |                                                                 
              |                        |when user selects                                                
              |                        |a site                                                           
              |                        |OnChange()                                                       
              |                        |                                                                 
              |                        |                                                                 
+-------------+---------------+        |                                                                 
|filter sites dropdown        |        |                                                                 
|                             |        |                                                                 
|filter  clientTypeID         |     +--+                                                                 
|                             |     |                                                                    
|Update the map with Sites    |     |                                                                    
|                             |     |           +---------+---------+   LoadRecent()                     
|Reset all filters            |     |           |ReportService      +---------+                        
+-----------------------------+     |           |                   |         |                          
                                    |           +-----+-------------+         |                          
                                    |                 |                       |                          
                                    |                 |                       |                          
     +------------------------------v---+             |                       |                          
     |Set clientID and clientTypeID     |             |                       |                          
     |                                  +-------------+                       |                          
     |with corresponding ^alues         |                       +-------------+--------+                 
     |                                  |                       |RecentEstimateDropDown|                 
     |Get trees for this site           |  +------------------+ |                      |                 
     |                                  |  |LoadReport()Based | |                      |                 
     |$watch will update the map        |  |                  | +---------+------------+                 
     |                                  |  |On Selection & Url|           |                              
     |with TREES                        |  |                  |           | OnChange()                   
     |                                  |  |Changes to        |           |                              
     |                                  |  |                  |    <------+                              
     +----------------------------------+  |#/trees?reportID= |                                          
                                           |                  |                                          
                                           |xxxx              |                                          
                                           |and 3 dropdown and|                                          
                                           |                  |                                          
                                           |Corresponding Tree|                                          
                                           |                  |                                          
                                           |Changes           |                                          
                                           |                  |                                          
                                           +------------------+                                          



Description of Performance Improvements (parm)
=======================================
            
Begore my performance improvements fixes we are loading all data in one request using init() method in api service.
which is crashing whole page due to lot of data being get and then render through angular. 
So to overcome this problem we implement two api methods one will get clients and client types and other will get sites only.
because sites have lot of data in it so we seprated it out in other method called "loadsites()".

Afte that we face a new rendering problem which is related to tree list on right side bar.
because we have almost 1000 tress in one site so load this much of data at once thru angular slow down the page and almost crashes it.
So to overcome this issue I edited tree.list directive and attach a controller in it.
Now I fetch all data from API but load 100 by 100 with each seconds until all records have been loaded in. It save a lot of rendering issue.

Then we found the same issue in estmation grid below on page and I did the same in it too and I think it almost speed up application rendering process to 50%.

Now the only problem left with rendering is we are loading lot of directives on page and these directives contains their templates.
so angular issue a ajax get request to load them and it slow down the page so to overcome it I use "HTML2JS" task in grunt when we run it,
It wil automatically put all templates in one template.js file and also out those templates in cache of angular so angular don't have to issue a get request.
It load template from cache. I think it saves a lot of time while rendering and solve almost 80% of speed issue.

*/

'use strict';

var TreesCtrl = app.controller('TreesCtrl',
    ['$scope', '$timeout', 'ReportService', 'TreeFilterService', '$filter', 'storage', '$q', 'Auth', 'Api', 
		'SiteModelUpdateService', '$rootScope', '$modal', '$location', 'gMapInitializer', 'Restangular',
        function ($scope, $timeout, ReportService, TreeFilterService, $filter,
            storage, $q, Auth, Api, SiteModelUpdateService, $rootScope, $modal, $location, gMapInitializer, Rest) {

            var self = this;
            // local and scoped vars
            var s = window.tcs = $scope
                , myStateID = 'trees'
                , gMap, mapBounds, infowindow, inited, enableMap = true
                , TFS = TreeFilterService
                , markers_allSites = []
                , markers_singleSite = []
            s.tree_cachebuster = '?ts=' + moment().unix();
            s.data = {
                showTreeDetails: false
				, isTcia: cfg.getEntity().isTcia
                , showMap: true			// not needed now? since new routing technique
                , showTreatmentList: false
                , overrideTreatmentCodes: []		// array of treatment codes user selected in multi-box
                // for adding trees to the estimate
                , mode: function () {    	// either "trees" or "estimate"
					 		var m = s.renderPath[0]; 
							// invoice, then force mode = estimate
							return (m=='invoice') ? 'estimate' : m;
					  }					
            };
            s.whoami = 'TreesCtrl';
            s.TFSdata;	//holds tree results count, etc. Remember, always put scope data into an object
            // or it will pass by value, not reference
            s.filterSearch = { species: '', treatments: '' };
            s.selected = { clientTypeID: '', clientID: '', siteID: '', treatmentIDs: [] };
            s.filteredClients = [];	// all/filtered list of clients based on selected Client Type
            s.filteredSites = null;				// all/filtered list of sites based on selected client
            s.trees = [];			// result set of trees based on site selected
            s.selectedTrees = []; 	// treeIDs that have been SELECTED for inclusion in estimate

            s.bulkEstimates = {
                selectedSites: [],
                overrideTreatmentCodes: [],
                sitesBckp: [],
                treatmentsBckp: []
            };

            s.treatmentTypes = [];
            s.ratingTypes = [];
            s.siteLocs = [];
            s.selectedValues = [];
            s.thisYear = moment().format('YYYY');

            //s.filteredSites = [];//s.initData.sites;

            s.activePopover = { elem: {}, itemID: undefined };
           

            $scope.getAllSites = function () {

                Api.getAllSites().then(function (data) {
                    if (data !== undefined) {
                        s.initData.sites = data.sites;
                        s.filteredSites = data.sites;
                        $timeout(function () { onUserNav(); }, 1000);
                    }
                });

            }

            $scope.getAllSites();

            console.log("top of trees ");
            s.filteredClients = s.initData.clients;
            s.ratingTypes = s.initData.filters.ratings;
            s.filters = s.initData.filters;
            s.initData.filters.onlyInEstimate = false;
            s.filters.years = [
                { id: moment().add(-2, 'year').format('YYYY'), desc: '2 years ago', old: 'yes' },
                { id: moment().add(-1, 'year').format('YYYY'), desc: '1 year ago', old: 'yes' },
                { id: moment().format('YYYY'), desc: 'This year' },
                { id: moment().add(1, 'year').format('YYYY'), desc: 'Next year' },
                { id: moment().add(2, 'year').format('YYYY'), desc: '+2 years' },
                { id: moment().add(3, 'year').format('YYYY'), desc: '+3 years' },
                { id: moment().add(4, 'year').format('YYYY'), desc: '+4 years' },
            ];
            _.each(s.filters.years, function (f) { f.desc = f.id + ' - ' + f.desc; });
            s.treatmentTypes = s.initData.filters.treatments;
            ReportService.setTreatmentPrices(s.initData.filters.treatmentPrices);

            s.colors = {
                speciesCount: []		// stores count of species ie. speciesCount[133]=5, speciesCount[431]=1  (speciesID 133 = 5 total)
                , assignment: []		// stores which colorID index (for bg and fg) is assigned to which speciesID..
                // ie. assignment[0]=133 (the first color index for bg[0]/fg[0] is assigned to speciesID 133)
                , nextColorID: 0
                // tree icon colors
                //Lt Blu1   Dk Blu    Green     Dk Grn    Yellow    Lt Brn    Dk Grey   Purpl     Pink      Med Blue  Lt Brn    Dk Pink   Olive     Lt Green  maroon    Lt Olive   TrueBlue  Brn2     Lt Pink2   Blk
				, bg: ['37e1e1', '1d5188', '2ecc40', '45771e', 'edcf13', 'c45e06', '646464', '6d2dd5', 'ee5ca3', '0074d9', 'f3a33c', 'ab2d6a', '3d9970', 'a5a5a5', '751307', 'a5ff5e', '040edb', '674511', 'f296ca', '2c2c2c']
				, fg: ['000000', 'ffffff', '000000', 'ffffff', '000000', 'ffffff', 'ffffff', 'ffffff', '000000', 'ffffff', '000000', 'ffffff', 'ffffff', '000000', 'ffffff', '000000', 'ffffff', 'ffffff', '000000', 'ffffff']
            };
            s.TFSdata = TFS.data;

            //search component for google map
            s.searchBox = [];
            s.clickToAddtree = [];
            //array to store marker objects for search box
            s.searchMarkers = [];

            //            s.$watch('selected', function (newVal, oldVal) {
            //                console.log('Selected changed\n', oldVal, newVal);
            //            }, true);
            s.isBindRightClick = false;

            var loadEstimate = function () {
                var rptHash = s.renderPath[1];

                if (!rptHash) return;
                ReportService.loadReport(rptHash, { getTreeDetails: 1 })
					.then(function (data) {
					    if (Auth && Auth.requestedReportID) delete Auth.requestedReportID;
					    s.report = data;
					    if (data && data.siteID)
					        s.selected.siteID = data.siteID;

						// assign local tree id based on grouped items
						var ct=1;
						_.each(s.report.groupedItems, function(itm){
							itm.tree=s.report.items[ itm.itemIndexes[0] ];
							itm.tree.localTreeID=ct++;
						});

					    showMappedTrees(s.report.groupedItems);

					    // todo - find a better place for this.... should happen after
					    // tree map is initialized
					    setTimeout(function () {
					        $('#treeMap_estimate').width($('#treeMap_estimate').width());
					        $('#treeMap_estimate').affix({ offset: { top: $('#treeMap_estimate').offset().top - 120 } });
					        $('#action-container').affix({ offset: { top: $('#action-container').offset().top } });
					    }, 1000);
					});
            }

            if (s.data.mode() == 'estimate') loadEstimate();

            //#*#*# Commented this cause, inside trees page if user clicks on any item that has \trees href, it does not fire this nav.
            //s.$on('nav', function (e, data) {
            //    if (data.new == 'trees') {
            //        loadEstimate()
            //        if (s.selected.siteID && s.selected.siteID > 0) {
            //            var siteObj = s.getSiteByID(s.selected.siteID);
            //            s.selected.clientID = siteObj.clientID;
            //            s.selected.clientTypeID = siteObj.clientTypeID;
            //            //getTreeListings()
            //        } else {				// no site selected, so go back to site view, not tree view
            //            s.onSelectClientID();
            //        }
            //    };
            //});
            //

            s.gotoTreesPage = function () {
                s.selected.siteID = '';
                ReportService.setSiteID('');
                TFS.clearFilters(true);
                s.openTreesOrSites();
            }

            s.openTreesOrSites = function () {
                if (s.initData.sites && s.initData.sites.length == 1) { // If only site, open that site in satellite view.
                    s.selected.siteID = s.initData.sites[0].siteID;
                    getTreeListings();
                }
                else { //else show all sites in map.
                    s.trees = [];
                    showMappedSites();
                }
            }

            if (s.data.mode() == 'trees') {
                setTimeout(function () {
                    $('.collapse-container .collapse-head a').click(function (event) {
                        var $collapse_container = $(this).closest('.collapse-container');
                        $collapse_container.find('.collapse-body').slideToggle('slow');
                        if ($(this).find('i').hasClass('fa-angle-double-down')) {
                            $(this).find('i').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
                        } else {
                            $(this).find('i').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
                        }
                        return false;
                    });

                }, 2000);
            }

            // here, we account for 2 usecases:
            // 1. if user comes to this state 2nd (ie after editing a tree.. so we need a resize)
            // 2. if user comes here first... 
            if (gMap) {
                if (!inited) {
                    $timeout(function () { 			// not sure if this is needed
                        if (google && google.maps)
                            google.maps.event.trigger(gMap, 'resize')
                    }, 2000); // todo this is dumb. we should use a real callback
                }
            }

            TFS.init(s.initData);

            var showSite = function (id) {
                console.log('Showing site', id);

                //$timeout(function () {

                s.selected.siteID = id

                //}, 1000);
                //s.selected.siteID = id;

                s.selected.clientTypeID = '';
                s.selected.clientID = '';
                s.onSelectSiteID(id);
            };

            var showReport = function (id) {
                console.log('Showing report', id);
                ReportService.loadReport(id).then(function (report) {
                    console.log('Report with id %s loaded', id);
                    console.log(report);
                    console.log('About to show site %s for report', report.siteID);
                    //showSite(report.siteID);
                });
            };

            var onUserNav = function () {
                if (s.data.mode() === 'trees' && s.renderPath[0] === 'trees') {
                    var reportID = $location.search().reportID;
                    if (reportID) {
                        //s.initData.filters.onlyInEstimate = true;
                        showReport(reportID);
                        return;
                    }

                    var siteID = $location.search().siteID;
                    if (siteID) {
                        showSite(siteID);
                        ReportService.getBlankReport();
                        return;
                    }
                }
            };

            // bind variabels to local storage, so that stuff is remembered	
            // then start showing sites on a map... BUT if a site is already selected,
            // instead show trees... which will happen automatically based on $watch
            $timeout(function () {
                storage.bind(s, 'selected', { defaultValue: { clientTypeID: '', clientID: '', siteID: '', treatmentIDs: [] } });
                s.selected.treatmentIDs = [];
                //  onUserNav();
                if (!s.selected.siteID && s.data.mode() != 'estimate') showMappedSites();
            }, 1);


				s.$on('highlightTreeResult', function(e, data){
					highlightResultRow(data.treeID);
				});

            var highlightResultRow = function (treeID) {
                if (s.data.mode() !== 'trees') {
                    return;
                }

                if (s.activeResultRow) {
                    $('#tree-result-item-row-' + s.activeResultRow).toggleClass('highlighted-row');
                }

                s.activeResultRow = treeID;

                var newActiveRow = $('#tree-result-item-row-' + s.activeResultRow);
                var listContainer = $('#tree-list-container');

                var scrollTo = function (value) {
                    listContainer.animate({
                        scrollTop: value
                    }, 2000);
                };

                newActiveRow.toggleClass('highlighted-row');

				var nar=newActiveRow.offset(); 
				var lco=listContainer.offset();
				if(nar && nar.top && lco && lco.top)
                	var scrollValue = listContainer.scrollTop() + newActiveRow.offset().top - listContainer.offset().top;
				else
					return;

                scrollTo(scrollValue);
            };

            // ----------------------------------------------------------- EVENTS BASED ON DROPDOWNS

            // when user selects clientTypeID: (Rule A)
            // 		1. filter the clients dropdown, and set selected.clientID = null
            //		2. filter the sites dropdown, and set selected.siteID = null
            //		3. Update the map with Sites
            //      4. Reset all filters
            s.onSelectClientTypeID = function (typeId) {
                s.selected.clientTypeID = typeId ? typeId : "";
                s.selected.clientID = s.selected.siteID = '';
                filterClients();
                filterSitesByClients();
                showMappedSites();
                TFS.clearFilters(true);
            };

            // when user selects clientID:
            //		1. filter the sites dropdown and set selected.siteID = null 
            //		2. set selected.clientTypeID to corresponding value
            //		3. Update the map with Sites
            //      4. Reset all filters
            s.onSelectClientID = function (id) {
                ReportService.setClientID(id);
                ReportService.setSiteID('');
                s.selected.clientID = id;
                s.selected.siteID = '';
                if (s.data.mode() == 'trees') ReportService.loadRecent();

                if (id && id > 0) {
                    filterSitesByClients(id);
                    var clientObj = s.getClientByID(s.selected.clientID);
                    s.selected.clientTypeID = clientObj.clientTypeID;
                    showMappedSites();
                    TFS.clearFilters(true);
                    var url = cfg.hostAndPort() + '/#/trees';
                    document.location = url;
                } else {					//else, go back to showing clientType
                    s.onSelectClientTypeID();
                }
            }

            // when user selects a site:
            //		1. ACTIVE: Set clientID and clientTypeID with corresponding values
            //		2. ACTIVE: Get trees for this site
            //		2. passive: $watch will update the map with TREES
            var lastSiteID=-1;
            s.onSelectSiteID = function (id,ShouldChangeUrl) {
                if(lastSiteID==id) return; // Prevents loading same things twice
                else lastSiteID=id;
                s.selected.siteID = id;
                if(ShouldChangeUrl==true){  // When user changed site from the site dropdown.
                   $location.search({ siteID: id});
                   s.onFilterChange('onlyInEstimate',  -1, s.initData.filters.onlyInEstimate = false);
                }
                ReportService.setSiteID(id);

                if (s.data.mode() != 'trees') return;

                if (id && id > 0) {
                    if (s.data.mode() == 'trees') {
                        ReportService.loadRecent();
                    }
                    var siteObj = s.getSiteByID(id);
                    s.selected.clientID = siteObj.clientID;
                    s.selected.clientTypeID = siteObj.clientTypeID;
                    getTreeListings()
                } else {				// no site selected, so go back to site view, not tree view
                    s.onSelectClientID(s.selected.clientID);
                }
                SiteModelUpdateService.setSites(s.filteredSites);
            }

            s.onSelectSiteIDFromMap = s.safeApplyFn(function (id) {
                s.selected.siteID = id;
                s.onSelectSiteID(id);
                if (s.TFSdata.selectedFilters.length > 0)
                    TFS.filterTrees();
                $timeout(function () {		// sometimes the property would not get selected in dropdown
                    s.selected.siteID = id;	// so this is to ensure it does
                }, 2500);
            }, s)


				// select a bulk site based on siteID or zip 
            s.onSelectBulkSite = s.safeApplyFn(function (siteID, zip) {

					// make sure they are in some type of filtered/bulk state
					if(!s.filteredSites.length || s.filteredSites.length == s.initData.sites.length){
						alert("Must have sites filtered down to be able to use BULK SELECT features");
						return;
					}

					console.debug('Selecting site - id:' + siteID + ' zip:' +zip);
					if (!zip && !siteID) return;
					  _.each(s.filteredSites, function(site) {
							if ( (zip && site.zip == zip) || (siteID && site.siteID == siteID ) ) {
								 if (s.bulkEstimates.selectedSites.indexOf(site.siteID) == -1) {
									  s.bulkEstimates.selectedSites.push(site.siteID);
									  s.onChangeSiteCheck(site, true);
								 }
								 if(siteID) return false;	// dont need to loop if only one site
							}
					  })
            }, s)




            //When the selected.siteID model changes (not necessarily forced by user) then:
            //		1. if set to null, then show SITES on map
            //   	2. ELSE, if siteID exists, show TREES on the map
            //s.$watch('selected.siteID', function (ID, oldID) {
            //    SiteModelUpdateService.setSites(s.filteredSites);
            //    ReportService.setSiteID(ID);
            //    if (s.data.mode() == 'trees') {
            //        ReportService.loadRecent();
            //        if (ID && ID > 0) {
            //
            //            getTreeListings();
            //        }
            //        // todo -- else zoom in on the selected Site...
            //        // zoomMap(lat, long)?
            //    }
            //});

            //s.$watch('selected.clientID', function (ID, oldID) {
            //    ReportService.setClientID(ID);
            //    if (s.data.mode() == 'trees') ReportService.loadRecent();
            //});



            //Wil be fired when user select report id from recent drop down.
            s.$on('OnLoadReportEvent', function (evt, data) {
                s.report = data;
                if (data.siteID == undefined || data.siteID == "") return;

					 // required because in customer/estimate mode, the onFilterChange event
					 // calls an api which produces an error in the UI "No sites match your filter"
                if (s.data.mode() == 'estimate') return;

                if(s.report.reportID ){
                    s.onFilterChange('onlyInEstimate',  -1, s.initData.filters.onlyInEstimate = true);
                }else {
                    if(s.initData.filters.onlyInEstimate != false) {// DO NOTHING
                        s.onFilterChange('onlyInEstimate',  -1, s.initData.filters.onlyInEstimate = false);
                    }
                }
                s.onSelectSiteID(data.siteID);
            });



            // When the trees[] array changes because of a filter event... update the ui.
            // This also may be triggered when site dropdown is selected (via getTreeListings())
            s.$on('onTreeFilterUpdate', function (evt, trees) {
                s.trees = trees;
                s.filterSelectedTrees(); // when filtering, selected trees should also be updated
                s.colors.speciesCount = [];
                s.colors.assignment = [];
                s.colors.nextColorID = 0;
                s.safeApply();	// this is needed because of _throttle being used in tree filter service
                if(s.trees.length==0){
                    s.setAlert('No trees found on this property', { type: 'd', time: 5 });
                    var site=_.findObj(s.filteredSites, 'siteID', s.selected.siteID);
                    showSingleSite(site); // Can not use show mapped tree
                }
                else {
                    showMappedTrees(s.trees);
                }

            });

            //make tree update after its edited
            //use case is when notes are edited,
            // they should then update in the estimate without a page refresh
            s.$on('onTreeUpdate', function (evt, tree) {
                if (tree && tree.treeID) {
                    var t = _.findObj(s.trees, 'treeID', tree.treeID)
                    updateMarker(tree);
                    if (t) t = _.deepCopy(t, tree);
                    if (_.extract(ReportService, 'report.items')) {
                        var t2 = _.findObj(ReportService.report.items, 'treeID', tree.treeID)
                        if (t2) { // check do we need to update current report
                            t2 = _.deepCopy(t2, tree);
                            $rootScope.$broadcast('itemsAddedToReport');
                        }
                    }
                }
            });
            var updateMarker = function(tree){
                var marker = self.findMarker(tree.treeID);
                marker.info = getTreeInfoWindowHtml(tree);
                infowindow.setContent(marker.info);
                infowindow.open(gMap, marker);
            }

            // When year in filter dropdown is changed...
            s.onSelectYear = function (id) {
                _.each(s.filters.years, function (y) {
                    if (y.selected) s.onFilterChange('year', y.id, false);		// turn off the previously selected year
                    y.selected = false;											// turn off every year, just in case
                    if (y.id === id) { 												// turn ON the matching year passed in
                        y.selected = true;
                        s.onFilterChange('year', id, true);
                    }
                });
                if (id === false) s.filters.year = null;								// if id is null (ie. user canceled the filter
            };

            // Anytime any filter checkbox is changed
            // If a specific site is selected, then filter the trees by passing onto TFS
            // Else, we are now filtering the sites, not the trees
            s.onFilterChange = function (filterType, ID, value) {
                console.log('On filter change called with', filterType, ID, value);
                TFS.onChange(filterType, ID, value);
                if ( (!s.trees || !s.trees.length || s.trees.length < 1)
					 	&& filterType != 'onlyInEstimate' )
					 {
					 		getFilteredSiteIDs();
					 }
            }

            s.clearFilters = function () {
                s.filterSearch = { species: '', treatments: '' };
                TFS.clearFilters(false);
                s.onSelectYear(false);
                if (!s.trees || !s.trees.length || s.trees.length < 1) {
                    //s.filteredSites=angular.copy(s.initData.sites); 
                    s.filteredSites = s.initData.sites;		//-- fixed a dropdown ng-model issue
                    s.selected.clientTypeID = '';
                    s.selected.clientID = '';
                    showMappedSites();
                }
            }

            s.$on('trees.reset', function () {
                s.filteredSites = s.initData.sites;
                s.selected.clientTypeID = s.selected.clientID = s.selected.siteID = '';
            });

            s.reset = function () {
                // clear out the query string
                if ($location.search().reportID) $location.search('reportID', null);
                if ($location.search().siteID) $location.search('siteID', null);

                s.filteredSites = s.initData.sites;
                s.selected.clientTypeID = s.selected.clientID = s.selected.siteID = '';
                TFS.clearFilters(true);
                filterClients();
                //todo - this action jacks up the selection of the sites dropdown by changing the model
                // so instead of making a copy... do we need to make a copy? try not doing that
                // or instead of creating a filteredSites array, maybe we should just set sites[0].hide=true;
                //		and use hte original array;
                //s.filteredSites=angular.copy(s.initData.sites);
                showMappedSites();
                //s.onSelectSiteID('');
                //s.onSelectClientID('');
                ReportService.setClientID('');
                ReportService.setSiteID('');
                s.selected.clientID = '';
                s.selected.siteID = '';
                s.selected.clientTypeID = '';
                ReportService.loadRecent();
                ReportService.getBlankReport();
            }

            s.onTreeImageRollover = function (treeID) {
                s.data.showTreeDetails = true;
                s.data.showMap = false;
                s.treeDetailsID = treeID;
                s.sendEvt('onTreeResultImageRollover', treeID);
            }

            s.onTreeImageRollout = function (treeID) {
                if (treeID != s.treeDetailsID) return;
                s.data.showTreeDetails = false;
                s.data.showMap = true;
                s.sendEvt('onTreeResultImageRollout');
            }


            //ng-mouseover="onTreeImageRollover(tree.treeID,true);" ng-mouseleave="onTreeImageRollover(tree.treeID,false);"




            // ------------------------------------------------------ GOOGLE MAPS

            //google map bar: event handler for button 'X'
            s.cleanSearchMarkers = function () {
                s.googleMapSearchBoxValue = '';

                for (var i = 0, marker; marker = s.searchMarkers[i]; i++) {
                    marker.setMap(null);
                }

                s.zoomToMappedTrees();
            }

            //google map bar: event handler for button 'tree', zoom to selected sites/trees
            s.zoomToMappedTrees = function () {
                if (s.selected.siteID) {
                    showMappedTrees(s.trees);
                }
                else {
                    showMappedSites();
                }
            }

            //google map bar: event handler for button 'marker', zoom to search marker
            s.zoomToSearchMarker = function () {
                showSearchMarker();
            }

            s.treeMarkers = [];

			var initMapCalled=false;
			var initMapDefer=null;
            var initMap = function () {
					// dont let initmap get called twice
					if(initMapCalled) return initMapDefer.promise;
					initMapCalled=true;

                var deferred = initMapDefer = $q.defer();
                gMapInitializer.mapsInitialized.then(function () {
                    loadMap().then(function () {
                        window.mapLoaded = true;
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            }

			var loadMap = function() {
            var deferred = $q.defer();
				try{
                google.load(
                    "maps",
                    "3",
                    {
                        other_params: 'sensor=false&libraries=places',
                        callback:
                            function () {
                                var myOptions = { 
										zoom: 1, tilt: 0, 
										center: new google.maps.LatLng(37, 122), mapTypeId: 'hybrid',
										scrollwheel: false, panControl: false 
									};
                                var map_id = (s.data.mode() == 'estimate') ? 'treeMap2' : 'treeMap';
                                gMap = new google.maps.Map($('#' + map_id)[0], myOptions);
                                google.maps.event.addListener(gMap, 'click', function () {
                                    dbg(s, 'click');
                                    if (infowindow && infowindow.setMap) infowindow.setMap(null);
                                    //In case user is editing a tree and change its location by droping it 
                                    //on anywhere in map and after that he did not click on confirm location or cancel
                                    //button. He simply click on map then broadcast this event so that we can recieve it 
                                    //anywhere and make changes.
                                    s.$broadcast('onMapClicked');
                                });
                                //initClicktoMap();
                                initSearchBox();

								// do we really need this? ... this was here before
                                $timeout(function () {
                                    deferred.resolve();
									window.mapLoaded=true;
                                }, 1000);

                            }
                    }
                );
				}catch(err){
					console.log("ERROR LOADING MAP! ");
				}
                return deferred.promise;
            }


            //var initClicktoMap = _.throttle(function () {

            //    //// Create search panel
            //    //var clickmaptoaddtree = document.getElementById('clickmaptoaddtree');
            //    //gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(clickmaptoaddtree);

            //    //var buttonClicktoAddTree = document.getElementById('buttonClicktoAddTree');
            //    //s.clickToAddtree = new google.maps.ImageMapType(buttonClicktoAddTree);

            //    //$(clickmaptoaddtree).show();

            //    s.setAlert("Click on map to add tree.", { type: 'ok', time: 10 });
            //});

            s.editMode = false;
            s.editModeCss = "fa-plus";
            s.setStatus = function (editMode) {
                if (s.editMode) {
                    s.cancelMarker(s.treeMarkers.length - 1, true);
                    s.editMode = false;
                    s.editModeCss = "fa-plus";
                }
                else {
                    //initClicktoMap();
                    s.setAlert("Click on map to add tree.", { type: 'ok', time: 10 });
                    s.editMode = true;
                    s.editModeCss = "fa-minus";
                }
                return s.editMode;
            }

            var initSearchBox = _.throttle(function () {

                // Create search panel
                var searchPanel = document.getElementById('searchPanel');
                gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchPanel);

                var googleSearchbox = document.getElementById('googleSearchbox');
                s.searchBox = new google.maps.places.SearchBox((googleSearchbox));

                // fix preload issue: searchpanel should be hidden until added to gMap.controls
                // in other case, it will be visible to user when map is loading
                $(searchPanel).show();

                // Listen for the event fired when the user selects an item from the
                // pick list. Retrieve the matching places for that item.
                google.maps.event.addListener(s.searchBox, 'places_changed', function () {
                    showSearchMarker();
                });

                // Bias the SearchBox results towards places that are within the bounds of the
                // current map's viewport.
                google.maps.event.addListener(gMap, 'bounds_changed', function () {
                    var bounds = gMap.getBounds();
                    s.searchBox.setBounds(bounds);
                });
            }, 2000);

            var showMappedSites = _.throttle(function () {
                console.log("show mapped sites ");
                var a, l, siteLoc, noLoc = 0, numSpecies, gMapID = ''
                var map_id = (s.data.mode() == 'estimate') ? 'treeMap2' : 'treeMap';
                if (enableMap == false || !s.filteredSites || !s.filteredSites.length) return;

                if (gMap && gMap.getDiv && gMap.getDiv() && gMap.getDiv().id) gMapID = gMap.getDiv().id;
                if (gMapID !== map_id) {
                    return initMap().then(function () {
                        showMappedSites();
                    });
                }

                s.siteLocs = [];

                //todo - #optimze why are we looping twice? once here and again below....
                _.each(s.filteredSites, function (site) {
                    if (!site || !site.lng || !(site.lng.length>5) || !(site.lat.length>5)) return noLoc++;

                    if (site.species && site.species.length > 0) numSpecies = site.species.length;
                    else numSpecies = 0;
                    var _siteObj = _.findObj(s.initData.sites, 'siteID', site.siteID);
                    var _clientObj = _.findObj(s.initData.clients, 'clientID', _siteObj.clientID);

                    var click = "angular.element(this).scope().onSelectSiteIDFromMap({0})".format(site.siteID)
                    var clickSelectAllSitesInZip = "angular.element(this).scope().onSelectBulkSite(null, {0})".format(site.zip);
                    var clickThisSite = "angular.element(this).scope().onSelectBulkSite({0})".format(site.siteID);

                    site.info = '<div id="content">' +
                        '<h1 id="firstHeading" class="firstHeading">' + site.siteName + '</h1>' +
                        '<div id="bodyContent">' +
                        '<p><strong>SiteID:' + site.siteID + '</strong></p>' +
                        '<p><strong>Client:' + _clientObj.clientName + '</strong></p>' +
                        '<p><strong>Trees:' + (site.treeCount ? site.treeCount : 0) + '</strong></p>';
                    if (site.treeCount > 0) {
                        site.info += '<BR><a href onclick="{0};return false;">View Trees On This Site</a></div></div>'.format(click);
                    }

                    site.info += '<BR>Bulk: <a href onclick="{0};return false;">Select</a> | '.format(clickThisSite)
                    		+ '<a href onclick="{0};return false;">All in Zip</a></div></div>'.format(clickSelectAllSitesInZip);

                    //site.info += '<BR><div class="pull-right"><input type="checkbox"> Select in Bulk</div></div>';

                    site.iconType = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

                    // add color to site marker
                    setSiteColor(site);
                    s.siteLocs.push(site);
                });

                if (!infowindow) infowindow = new google.maps.InfoWindow();

                if (!s.siteLocs.length) {
                    if (noLoc > 0)
                        s.setAlert(noLoc + " site(s) are missing lat/long, and cannot be displayed", { type: 'd', pri: 2 })
                    return clearMarkers();
                }

                replaceMarkers(s.siteLocs, 'allSites');
            }, 1500);


            var showSingleSite = _.throttle(function (site) {
                console.log("show mapped sites ");
                var a, l, siteLoc, noLoc = 0, numSpecies, gMapID = ''
                var map_id = (s.data.mode() == 'estimate') ? 'treeMap2' : 'treeMap';
                if (enableMap == false || !s.filteredSites || !s.filteredSites.length) return;

                if (gMap && gMap.getDiv && gMap.getDiv() && gMap.getDiv().id) gMapID = gMap.getDiv().id;
                if (gMapID !== map_id) {
                    return initMap().then(function () {
                        showMappedSites();
                    });
                }

                // if staff user, then add events for moving and clicking on a tree
                if (gMapID == 'treeMap' && Auth.isAtleast('inventory')){
                    if (!s.isBindRightClick) {
                        google.maps.event.addListener(gMap, 'click', function (event) {
                            if (!s.editMode) return;
                            if (s.MarkerAdded) {
                                s.cancelMarker(s.treeMarkers.length - 1, false);
                                s.MarkerAdded = false;
                            }

                            s.$on('onMapClicked', function () {
                                if (s.MarkerAdded)
                                    s.cancelMarker(s.treeMarkers.length - 1, false);
                            });


                            // When NEW TREE is confirmed location
                            s.confirmLocation = function (markerIndex) {
                                s.setAlert('Saving tree', { busy: true, time: "false" });
                                var marker = s.treeMarkers[markerIndex];
                                var position = marker.position;
                                var tree = {
                                    siteID: s.selected.siteID,
                                    longitude: position.lng(),
                                    lattitude: position.lat(),
                                    lat: position.lat(),
                                    lng: position.lng(),
                                    building:'no', powerline:'no', caDamage:'no',
                                    speciesID:1, dbhID:1, ratingID:5
                                };
                                Api.saveTree(tree).then(function (response) {
                                    s.hideAllAlert();

                                    var lastInsertedMarker = s.treeMarkers[s.treeMarkers.length - 1];
                                    tree.treeID = lastInsertedMarker.treeID = response.treeID;
                                    lastInsertedMarker.siteID = tree.siteID;

                                    lastInsertedMarker.tree = tree;
                                    lastInsertedMarker.info = getTreeInfoWindowHtml(response);
                                    lastInsertedMarker.setIcon(setIconColor(response));
                                    markers_singleSite.push(lastInsertedMarker);
                                    s.trees.push(tree);
                                    if (infowindow)  infowindow.close();

                                    google.maps.event.clearListeners(marker, 'click');
                                    google.maps.event.addListener(marker, 'click', function (event) {
                                        if (!infowindow)
                                            infowindow = new google.maps.InfoWindow();
                                        infowindow.setContent(this.info);
                                        infowindow.open(gMap, this);

                                        google.maps.event.clearListeners(infowindow, 'closeclick');

                                        google.maps.event.addListener(infowindow, 'closeclick', function (event) {
                                            if (infowindow) {
                                                infowindow.close();
                                            }
                                        });
                                    });


                                    //todo... why wont new tree show up here?!!?

                                    var timeOut = setTimeout(function () {
                                        var treeEl = angular.element(document.getElementById('tree-anchor-' + response.treeID));
                                        if (treeEl !== undefined && treeEl.length > 0)
                                            treeEl.click();
                                        clearTimeout(timeOut);
                                    }, 1000);

                                    s.MarkerAdded = false;
                                });
                            }

                            var marker = new google.maps.Marker({
                                position: event.latLng,
                                map: gMap,
                                title: 'Add Tree',
                                draggable: true,
                                icon: 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=1|006256|000000'
                                //'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=|37e1e1|000000'
                            });

                            s.MarkerAdded = true;
                            s.treeMarkers.push(marker);

                            var click = "angular.element(this).scope().cancelMarker({0},{1})".format(s.treeMarkers.length - 1, true);
                            var confirmclick = "angular.element(this).scope().confirmLocation({0})".format(s.treeMarkers.length - 1);

                            var markertemplate = "<div style=\"height:35px;width:210px;\">" +
                                "<div class=\"\">" +
                                "<button type=\"button\" onclick=\"{0}\" class=\"btn btn-success\">Confirm Location</button>&nbsp;&nbsp;"
                                    .format(confirmclick) +
                                "<button type=\"button\" onclick=\"{0}\" class=\"btn btn-default\">".format(click) +
                                "Cancel" +
                                "</button>" +
                                "</div></div>";

                            google.maps.event.addListener(marker, 'click', function (event) {
                                if (!infowindow)
                                    infowindow = new google.maps.InfoWindow();
                                infowindow.setContent(markertemplate);
                                infowindow.open(gMap, this);
                                google.maps.event.addListener(infowindow, 'closeclick', function (event) {
                                    s.cancelMarker(s.treeMarkers.length - 1);
                                });
                            });

                            google.maps.event.trigger(marker, 'click');

                        });
                        s.isBindRightClick = true;
                    }
                }

                s.siteLocs = [];

                if (!site.lng || site.lng == 0 || !site.lat || site.lat == 0) return noLoc++;

                if (site.species && site.species.length > 0) numSpecies = site.species.length; else numSpecies = 0;
                var _siteObj = _.findObj(s.initData.sites, 'siteID', site.siteID);
                var _clientObj = _.findObj(s.initData.clients, 'clientID', _siteObj.clientID);

                var click = "angular.element(this).scope().onSelectSiteIDFromMap({0})".format(site.siteID)

                site.info = '<div id="content">' + '<h1 id="firstHeading" class="firstHeading">' + site.siteName + '</h1>' + '<div id="bodyContent">' + '<p><strong>SiteID:' + site.siteID + '</strong></p>' + '<p><strong>Client:' + _clientObj.clientName + '</strong></p>' + '<p><strong>Trees:' + (site.treeCount ? site.treeCount : 0) + '</strong></p>';
                if (site.treeCount > 0)site.info += '<BR><a href onclick="{0};return false;">View Trees On This Site</a></div></div>'.format(click);
                site.iconType = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

                // add color to site marker
                setSiteColor(site);
                s.siteLocs.push(site);

                if (!infowindow) infowindow = new google.maps.InfoWindow();

                if (!s.siteLocs.length) {
                    if (noLoc > 0)
                        s.setAlert(noLoc + " site(s) are missing lat/long, and cannot be displayed", { type: 'd', pri: 2 })
                    return clearMarkers();
                }

                replaceMarkers(s.siteLocs, 'singleSite');
            }, 1500);



            var showSearchMarker = _.throttle(function () {
                var places = s.searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                for (var i = 0, marker; marker = s.searchMarkers[i]; i++) {
                    marker.setMap(null);
                }

                // For each place, get the icon, place name, and location.
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0, place; place = places[i]; i++) {
                    var image = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    var searchMarker = new google.maps.Marker({
                        map: gMap,
                        icon: image,
                        title: place.name,
                        position: place.geometry.location
                    });

                    s.searchMarkers.push(searchMarker);

                    bounds.extend(place.geometry.location);
                }

                gMap.fitBounds(bounds);
            }, 1500);

            var setSiteColor = function (site, selected) {
                var bg = '565656';
                var fg = 'aaaaaa';
                var base = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=';
                var num = '';

                if (site.species && site.species[0]) {
                    bg = 'FE7569';
                    fg = '000000';
                }

                if (selected != undefined && selected == true) {
                    bg = '337ab7';
                }

                site.iconType = base + num + '|' + bg + '|' + fg;
            };

            var replaceMarkers = function (arr, addType) {
                clearMarkers();
                addMarkers(arr, addType);
            }

            var addMarkers = function (arr, addType) {
                //                console.log('In add markers');
                if (enableMap == false) return;
                //empty singleSite marker array
                markers_singleSite = [];
                mapBounds = new google.maps.LatLngBounds();
                var LatLngList = [];
                mapBounds = new google.maps.LatLngBounds();
                for (var a = 0; a < arr.length; a++) {
                    LatLngList.push(new google.maps.LatLng(arr[a].lat, arr[a].lng));
                    var marker = new google.maps.Marker({
                        position: LatLngList[a],
                        map: gMap,
                        icon: arr[a].iconType,
                        id: a,
                        info: arr[a].info,
                        siteID: arr[a].siteID,
                        treeID: arr[a].treeID,
                        tree: arr[a],
                        draggable: false,
                        //html: '<a href onclick="showInfo('+ (arr.length) +',event)"></a>'
                    });

                    //console.log("info added: "+marker.info);
                    mapBounds.extend(LatLngList[a]);

                    //determine which array to add markers to
                    switch (addType) {
                        case 'allSites':
                            markers_allSites.push(marker);
                            //Add event listener for SITE markers				
                            google.maps.event.addListener(marker, 'click', function () {
                                infowindow.setContent(this.info);
                                infowindow.open(gMap, this);
                                //Add call for client info here
                                //Rest.all("siteID", this.siteID).then(function(data){
                                //alert("hello")}); //test
                                //jQuery("#infoWin-clientName").innerHtml=data.clientName});

                            });

                            break;

                        case 'singleSite':
                            markers_singleSite.push(marker);
                            gMap.setTilt(0);
                            //Add event listener for TREE markers
                            google.maps.event.addListener(marker, 'click', function () {
                                highlightResultRow(this.treeID);
                                infowindow.setContent(this.info);
                                infowindow.open(gMap, this);
                            });

                            break;

                        default:
                            break;
                    }
                }

                // Don't zoom in too far on only one marker, when in site mode
                if (addType == 'allSites' && mapBounds.getNorthEast().equals(mapBounds.getSouthWest())) {
                    var xtra = 0.08;
                    var extendPoint1 = new google.maps.LatLng(mapBounds.getNorthEast().lat() + xtra, mapBounds.getNorthEast().lng() + xtra);
                    var extendPoint2 = new google.maps.LatLng(mapBounds.getNorthEast().lat() - xtra, mapBounds.getNorthEast().lng() - xtra);
                    mapBounds.extend(extendPoint1);
                    mapBounds.extend(extendPoint2);
                }


                gMap.fitBounds(mapBounds);
                if (addType == 'allSites') {
                    gMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                } else {
                    gMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
                }

                //                console.log('End of add markers function');
            };

            var showInfo = function (num, e) {
                console.log("info: " + num);
                infowindow.setContent(e.target.info);
                infowindow.open(gMap, e.target);
            }

            var clearMarkers = function () {
                //remove all markers from view
                for (var b = 0; b < markers_allSites.length; b++) {
                    //console.log("removing markers from allSite array. current:"+markers_allSites[b]);
                    markers_allSites[b].setMap(null);
                }
                for (var i = 0; i < markers_singleSite.length; i++) {
                    //console.log("removing markers from singleSite array. current: "+markers_singleSite[i]);
                    markers_singleSite[i].setMap(null);
                }
            }

            //Find the marker that user clicked after Edit Tree button.
            s.findEditableMarkerAndChangeOthers = function (treeId, reverse) {
                var currentEditableMarker = null;

                for (var i = 0; i < markers_singleSite.length; i++) {
                    var marker = markers_singleSite[i];
                    if (reverse) {
                        if (marker.prevIcon !== undefined)
                            marker.setIcon(marker.prevIcon);
                    }
                    else {
                        if (marker.treeID == treeId) {
                            currentEditableMarker = marker;//.setDraggable(true);
                        }
                        else {
                            marker.prevIcon = marker.icon;
                            marker.setIcon('https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=|d2d2d2|000000');
                        }
                    }
                }

                for (var i = 0; i < markers_allSites.length; i++) {
                    var marker = markers_allSites[i];
                    if (reverse) {
                        if (marker.prevIcon !== undefined)
                            marker.setIcon(marker.prevIcon);
                    } else {
                        if (marker.treeID == treeId) {
                            currentEditableMarker = marker;//.setDraggable(true);
                        }
                        else {
                            marker.prevIcon = marker.icon;
                            marker.setIcon('https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=|d2d2d2|000000');
                        }
                    }
                }
                return currentEditableMarker;
            }

            //Fire when user click on edit tree from infowindow in map.
            //It contains all methods which we are using to edit a tree.
            s.editCurrentTree = function (treeId) {
                s.currentEditableMarker = s.findEditableMarkerAndChangeOthers(treeId, false);
                s.currentEditableMarker.currentPosition = s.currentEditableMarker.position;
                s.cancelEditing = function (moveToCurrentPosition) {
                    if (moveToCurrentPosition === undefined) {
                        moveToCurrentPosition = true;
                    }
                    if (infowindow) {
                        infowindow.close();
                    }
                    if (s.currentEditableMarker != null) {

                        //If we found moveToCurrentPosition true it means user did not edit
                        //so fallback to previous position.
                        if (moveToCurrentPosition)
                            s.currentEditableMarker.setPosition(s.currentEditableMarker.currentPosition);

                        s.currentEditableMarker.setDraggable(false);
                        s.findEditableMarkerAndChangeOthers(0, true);

                        //Update click event of current markers so that when user again click 
                        //on it we will show him old info popup.
                        google.maps.event.addListener(s.currentEditableMarker, 'click', function (event) {
                            if (!infowindow)
                                infowindow = new google.maps.InfoWindow();
                            infowindow.setContent(this.info);
                            infowindow.open(gMap, this);
                        });
                    }

                    s.currentEditableMarker = null;
                };

                s.$on('onMapClicked', function () {
                    if (s.currentEditableMarker != null)
                        s.cancelEditing(true);
                });


					// When location of EXISTING TREE pin is confirmed
                s.confirmEditing = function () {
                    if (s.currentEditableMarker != null) {
                        s.setAlert('Updating Location', { busy: true, time: "false" });

                        var tree = s.currentEditableMarker.tree;
                        var position = s.currentEditableMarker.position;
                        tree.longitude = position.lng();
                        tree.lattitude = position.lat();
                        tree.lat = position.lat();
                        tree.lng = position.lng();

                        Api.updateTree(tree).then(function (response) {
                            s.hideAllAlert();
                            //$location.path('tree_edit/' + tree.treeID);
                            s.cancelEditing(false);
                        });
                    }
                }

                var click = "angular.element(this).scope().cancelEditing()";
                var confirmclick = "angular.element(this).scope().confirmEditing()";
                var markertemplate = "<div style=\"height:60px;width:240px;\">" +
                                         "<div class=\"\">" +
                                            "<span>Drag pin to change the location of tree.</span><br/><br/>" +
                                            "<button type=\"button\" onclick=\"{0}\" class=\"btn btn-success\">Confirm Location</button>&nbsp;&nbsp;"
                                                    .format(confirmclick) +
                                            "<button type=\"button\" onclick=\"{0}\" class=\"btn btn-default\">".format(click) +
                                            "Cancel" +
                                          "</button>" +
                                        "</div></div>";

                s.currentEditableMarker.setDraggable(true);

                google.maps.event.addListener(s.currentEditableMarker, 'click', function (event) {
                    if (!infowindow)
                        infowindow = new google.maps.InfoWindow();
                    infowindow.setContent(markertemplate);
                    infowindow.open(gMap, this);



                    google.maps.event.addListener(infowindow, 'closeclick', function () {
                        if (s.currentEditableMarker != null)
                            s.cancelEditing(true);
                    });
                });

                google.maps.event.trigger(s.currentEditableMarker, 'click');

            }

            s.MarkerAdded = false;

            s.cancelMarker = function (index, switchOfAddMode) {

                if (switchOfAddMode === undefined)
                    switchOfAddMode = false;

                if (infowindow) {
                    infowindow.close();
                }

                if (s.treeMarkers[index] !== undefined) {
                    s.treeMarkers[index].setMap(null);
                    delete s.treeMarkers[index];
                }
                if (switchOfAddMode) {
                    //Also turn off edit mode.
                    s.editMode = false;
                    if (!s.$$phase) {
                        s.$apply(function () {
                            s.editModeCss = "fa-plus";
                        });
                    }
                    else {
                        s.editModeCss = "fa-plus";
                    }
                    s.hideAllAlert();
                }
            }

            s.editExistingTree = function (treeId) {
                var treeEl = angular.element(document.getElementById('tree-anchor-' + treeId));
                if (treeEl !== undefined && treeEl.length > 0)
                    treeEl.click();
            }

				/**
				 * Create HTML code that goes into the Google Maps InfoWindow 
				 */
            var getTreeInfoWindowHtml = function (itm) {
                var ratingD = (itm.ratingID > 0 && itm.ratingID < 6) ? s.ratingTypes[itm.ratingID - 1].rating_desc : '';
					 
					 var imgTxt = (itm.images && itm.images.length>1) ? '<div>('+itm.images.length + ' images)</div>' : '';
                var o = '<div class="mapWindowContainer">'
                     + '<div class="mwcImgCt"><img class="mwcImg" src="{0}">{1}</div>'.format(itm.imgSm2, imgTxt)
                     + '<div class="mwcBody">'
                     + '<span style="font-size:1.1em; font-weight:bold">{0}</span><BR>'.format(itm.commonName)
                     + '{0}<BR>TreeID:{1}<BR>Size:{2}<BR>'.format(itm.botanicalName,
                         itm.treeID, $filter('dbhID2Name')(itm.dbhID, s));
                if (itm.ratingID) o += '<div class="firstHeading">Rating:{0}-{1}</div>'.format(itm.ratingID, ratingD);
                o += '<div>';
                if (itm.caDamage == 'yes') o += '<i class="fa fa-warning _red _size6" bs-tooltip title="Hardscape damage"></i> ';
                if (itm.caDamage == 'potential') o += '<i class="fa fa-warning _grey _size6" bs-tooltip title="Hardscape damage"></i> ';
                if (itm.powerline == 'yes') o += '<i class="fa fa-bolt _red _size6" bs-tooltip title="Powerline nearby"></i> ';
                if (itm.building == 'yes') o += '<i class="fa fa-building _red _size7" bs-tooltip title="Building nearby"></i> ';

                // todo - if itm.history[] contains any items which are "recommended" status, and year = THIS YEAR,
                // then show a little [2014] icon in red.  if there is one for NEXT YEAR, then show a [2015] in grey,
                // similar to the items in the tree results list. ... ie
                // <span class='textIconBlock-red'>2014</span>
                // .... or ...textIconBlock-grey
                //	+'<div class="recYear">{0}</div>'.format(itm.history) // Not sure how to access and format this one.

                if (s.data.mode() === 'trees') {
                    var editPositionClick = "angular.element(this).scope().editCurrentTree({0})".format(itm.treeID);
                    var editTreeClick = "angular.element(this).scope().editExistingTree({0})".format(itm.treeID);
                    if (Auth.isAtleast('inventory')) {
                        o += '</div><a href="Javascript:void(0)" onclick="{0}" style="font-weight:bold;">'.format(editPositionClick)
						+ '<i class="fa fa-arrows-alt"></i></a>&nbsp;&nbsp;'
                        +'<a href="Javascript:void(0)" onclick="{0}" style="font-weight:bold;"><i class="fa fa-pencil"></i></a><BR>'.format(editTreeClick)
                    	+ '</div>';
                    } else {
                        o += '</div><a href="Javascript:void(0)" onclick="{0}" style="font-weight:bold;">View Details</a><BR>'.format(editTreeClick)
						  + '</div>';
                    }
                }
                
                return o;
            }


				/**
				 * Put trees onto google map
				 * This is used both by Site view and Estiamte view
				 */
            var showMappedTrees = _.throttle(function (treeSet) {
					if(!treeSet){
						console.debug("FATAL ERROR: treeSet Missing ");
						console.trace();
					}

console.debug(" show mapp trees -------- ");

                var gMapID = '';
                var map_id = (s.data.mode() == 'estimate') ? 'treeMap2' : 'treeMap';
                if (gMap && gMap.getDiv && gMap.getDiv() && gMap.getDiv().id) gMapID = gMap.getDiv().id;
                // TODO NEED TO CHECK
                // It's not working for TreeMap
                if (gMapID !== map_id) {
                    return initMap().then(function () {
                        showMappedTrees(treeSet);
                    });
                }

					 // if staff user, then add events for moving and clicking on a tree
                if (gMapID == 'treeMap' && Auth.isAtleast('inventory')){
                    if (!s.isBindRightClick) {
                        google.maps.event.addListener(gMap, 'click', function (event) {
                            if (!s.editMode) return;
                            if (s.MarkerAdded) {
                                s.cancelMarker(s.treeMarkers.length - 1, false);
                                s.MarkerAdded = false;
                            }

                            s.$on('onMapClicked', function () {
                                if (s.MarkerAdded)
                                    s.cancelMarker(s.treeMarkers.length - 1, false);
                            });


									// When NEW TREE is confirmed location
                            s.confirmLocation = function (markerIndex) {
                                s.setAlert('Saving tree', { busy: true, time: "false" });
                                var marker = s.treeMarkers[markerIndex];
                                var position = marker.position;
                                var tree = {
                                    siteID: s.selected.siteID,
                                    longitude: position.lng(),
                                    lattitude: position.lat(),
                                    lat: position.lat(),
                                    lng: position.lng(),
												building:'no', powerline:'no', caDamage:'no',
												speciesID:1, dbhID:1, ratingID:5
                                };
                                Api.saveTree(tree).then(function (response) {
                                    s.hideAllAlert();

                                    var lastInsertedMarker = s.treeMarkers[s.treeMarkers.length - 1];
                                    tree.treeID = lastInsertedMarker.treeID = response.treeID;
                                    lastInsertedMarker.siteID = tree.siteID;

                                    lastInsertedMarker.tree = tree;
                                    lastInsertedMarker.info = getTreeInfoWindowHtml(response);
                                    lastInsertedMarker.setIcon(setIconColor(response));
                                    markers_singleSite.push(lastInsertedMarker);
                                    s.trees.push(tree);
                                    if (infowindow)  infowindow.close();

                                    google.maps.event.clearListeners(marker, 'click');
                                    google.maps.event.addListener(marker, 'click', function (event) {
                                        if (!infowindow)
                                            infowindow = new google.maps.InfoWindow();
                                        infowindow.setContent(this.info);
                                        infowindow.open(gMap, this);

                                        google.maps.event.clearListeners(infowindow, 'closeclick');

                                        google.maps.event.addListener(infowindow, 'closeclick', function (event) {
                                            if (infowindow) {
                                                infowindow.close();
                                            }
                                        });
                                    });


												//todo... why wont new tree show up here?!!?

                                    var timeOut = setTimeout(function () {
                                        var treeEl = angular.element(document.getElementById('tree-anchor-' + response.treeID));
                                        if (treeEl !== undefined && treeEl.length > 0)
                                            treeEl.click();
                                        clearTimeout(timeOut);
                                    }, 1000);

                                    s.MarkerAdded = false;
                                });
                            }

                            var marker = new google.maps.Marker({
                                position: event.latLng,
                                map: gMap,
                                title: 'Add Tree',
                                draggable: true,
                                icon: 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=1|006256|000000'
                                //'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=|37e1e1|000000'
                            });

                            s.MarkerAdded = true;
                            s.treeMarkers.push(marker);

                            var click = "angular.element(this).scope().cancelMarker({0},{1})".format(s.treeMarkers.length - 1, true);
                            var confirmclick = "angular.element(this).scope().confirmLocation({0})".format(s.treeMarkers.length - 1);

                            var markertemplate = "<div style=\"height:35px;width:210px;\">" +
										  "<div class=\"\">" +
											  "<button type=\"button\" onclick=\"{0}\" class=\"btn btn-success\">Confirm Location</button>&nbsp;&nbsp;"
														 .format(confirmclick) +
											  "<button type=\"button\" onclick=\"{0}\" class=\"btn btn-default\">".format(click) +
											  "Cancel" +
											"</button>" +
										 "</div></div>";

                            google.maps.event.addListener(marker, 'click', function (event) {
                                if (!infowindow)
                                    infowindow = new google.maps.InfoWindow();
                                infowindow.setContent(markertemplate);
                                infowindow.open(gMap, this);
                                google.maps.event.addListener(infowindow, 'closeclick', function (event) {
                                    s.cancelMarker(s.treeMarkers.length - 1);
                                });
                            });

                            google.maps.event.trigger(marker, 'click');

                        });
                        s.isBindRightClick = true;
                    }
                }

                clearMarkers();

                var set2 = [], ratingD, o;
                if (!infowindow) infowindow = new google.maps.InfoWindow();

                _.each(treeSet, function (itm) {
					 		// this is used because in some instances, the report.groupedItems[] array is passed as the treeSet
							// and not an actual treeSet. In which case, the "tree" object inside it, is the actual tree.
					 		if(!itm.commonName && itm.tree) itm=itm.tree;		

                    if (!itm || !itm.treeID || itm.hide) return;
                    if (itm.commonName == null || itm.commonName == 'null' || !itm.commonName) itm.commonName = ' ';
                    if (s.data.mode() === 'trees' || s.data.mode() === 'estimate') {
                        itm.info = getTreeInfoWindowHtml(itm);
                    }
                    setIconColor(itm);
                    set2.push(itm)
                });
                if (set2.length > 0) addMarkers(set2, 'singleSite');
                else s.setAlert('No trees found on this property', { type: 'd', time: 5 });
            }, 1000);


            //Define function to get tree marker iconType/color by speciesID
            var setIconColor = function (itm) {
                // tally up by species
                if (s.colors.speciesCount[itm.speciesID])
                    s.colors.speciesCount[itm.speciesID].count++;
                else
                    s.colors.speciesCount[itm.speciesID] = { colorID: s.colors.nextColorID++, count: 1 };

                var idx = s.colors.speciesCount[itm.speciesID].colorID;
                //https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=1|006256|000000
                var base = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=';
                var num = itm.localTreeID || '';
                var bg = s.colors.bg[idx];
                var fg = s.colors.fg[idx];
                if (bg === undefined) {
                    bg = 'd2d2d2';
                    fg = '000000';
                }
                itm.colorID = idx;
                itm.iconType = base + num + '|' + bg + '|' + fg;
                return itm.iconType;
            }

            //Define function to get specific treatment types (string) by ID
            // This is unused.
            //s.getTreatmentType = function (ID) {
            //    var t = _.extract(s, 'initData.filters.treatments');
            //    var found = _.findObj(t, 'treatmentTypeID', ID);
            //    return _.extract(found, 'treatmentType');
            //}


            //Define function to get specific tree sizes (string) by ID
            // ????? Noticed that this is returning false now.. Not sure why
            s.getTreeSize = function (ID) {
                var dbh = _.extract(s, 'initData.filters.dbh');
                var found = _.findObj(dbh, 'dbhID', ID);
                var diam = _.extract(found, 'diameter');
                return diam;
            }


            // ----------------------------------------------------- EVENTS for Tree Results List

            // I think we need to rename this method to toogleSelectedTrees. In all other places this collection called selectedTrees.
            // toggle checkboxes of trees
            // @param opt 1. TRUE == check all
            //			  2. FALSE == uncheck all
            //			  3. 'thisYear' == check all with recommendations this year
            //			  4. ARRAY of treeIDs - toggle all those treeIDs
            s.toggleCheckedTrees = s.safeApplyFn( function (opt) {
                if (opt instanceof Array) {							// option 4
                    _.remove(s.selectedTrees, function (t) {
                        return (opt.indexOf(t) >= 0);
                    });
                } else {
                    _.trunc(s.selectedTrees);
                    if (opt) {
                        _.each(s.trees, function (t) {
                            if (opt === true && !t.hide)
                                s.selectedTrees.push(t.treeID);
                            else if (opt == 'thisYear' && t.recoThisYear && !t.hide)
                                s.selectedTrees.push(t.treeID);
                        });
                    }
                }
            });

            // when user adds/removes filter, we should remove selected trees that dont satisfy that filter
            s.filterSelectedTrees = function () {
                var selected2 = [];
                _.each(s.selectedTrees, function (treeID) {
                    var t = _.findObj(s.trees, 'treeID', treeID);
                    if (!t.hide) selected2.push(treeID);
                });
                s.selectedTrees = selected2;
            }

            var animateMarker = function (marker, animationType) {
                if (!google.maps || !google.maps.Animation) return;
                var animation = google.maps.Animation[animationType];

                if (animationType === null) {
                    animation = null;
                }

                if (marker) {
                    marker.setAnimation(animation);
                }
            };

            this.findMarker = function (id) {
                return _.find(markers_singleSite, function (marker) {
                    return marker.treeID === id;
                })
            };


            // Handles animation of google map tree pins...
            // When user rolls over a tree result, the pin drops
            var hoveredItem = {
                animationCompleted: false
            };

            s.onTreeResultMouseOver = function (tree) {
                var marker = self.findMarker(tree.treeID);
                if (!hoveredItem.animationCompleted) {
                    animateMarker(marker, 'BOUNCE');
                }
                hoveredItem.animationCompleted = true;
                tree.showEdit = true;
            };

            s.onTreeResultMouseLeave = function (tree) {
                var marker = self.findMarker(tree.treeID);
                animateMarker(marker, null);
                tree.showEdit = null;
                hoveredItem.animationCompleted = false;
            };

            // ------------------------------------------------------ ESTIMATE RELATED STUFF

            // Add selected trees to the estimate.. 
            // And pass in data.overrideTreatmentCodes (which overrides the recommended)
            s.addToEstimate = function () {
                // get an array of selected treeID's
                var added, msg, trees = [];
                _.each(s.trees, function (t) {
                    if (s.selectedTrees.indexOf(t.treeID) >= 0)
                        trees.push(t);
                });

                if (trees.length == 0) return s.setAlert('No Trees Selected', { type: 'd' })


                // this is to combat a bug in which even a seemingly blank estimate, still gave an error: "You are mixing trees from different sites"
                var isNewReportNeeded = ReportService.checkIfNewReportNeeded(trees);
                //var asd=ReportService.isChanged(ReportService.reportBackup,ReportService.report);
                if (isNewReportNeeded == 1 &&  ReportService.isChanged(ReportService.reportBackup, ReportService.report)) { //refresh report with prompt
               // if (isNewReportNeeded == 1 ) { //refresh report with prompt
                    return $modal({ scope: s, template: 'js/common/directives/templates/newEstimatePromptModal.tpl.html', show: true });
                }
                else if (isNewReportNeeded === 0 || isNewReportNeeded === 1) {
                    ReportService.getBlankReport();
                }

                console.log('ADDED!!');
                added = ReportService.addItems(trees, s.data.overrideTreatmentCodes, s.TFSdata.selectedFilters);
                console.log(s.data.overrideTreatmentCodes);
                console.log(added);
                $rootScope.$broadcast('itemsAddedToReport');

                if (added == -1)
                    return s.setAlert('Stop: You are mixing trees from different sites on the same estimate', { type: 'd', time: 9 });
                if (added.length == trees.length) {
                    s.data.overrideTreatmentCodes = [];			// clear out "force treatment" box after use
                    s.setAlert('{0} item(s) added to estimate'.format(added.length), { type: 'ok' })
                    return s.toggleCheckedTrees(false);
                }
                if (added.length < trees.length) {
                    if (s.data.overrideTreatmentCodes.length)
                        msg = (added.length) ? 'Err 47 - Some trees were not added to estimate' : 'Err 48 - No trees added to estimate';
                    else {
                        if (added.length)
                            msg = '{0} trees added. Some did not have recommendations assigned'.format(added.length)
                        else
                            msg = 'These trees did not have recommendations assigned, or are already assigned.';
                    }
                    s.setAlert(msg, { type: 'd', time: 10 });
                    s.toggleCheckedTrees(added);
                }
                s.data.overridetreatmentCodes = [];			// clear out "force treatment" box after use
            }

            // click handler for modal "Are you sure you want to create new estiamte"
            // which pops up when user tries mixing trees from 2 sites into one estimate
            s.createNewReportAndAddToEstimate = function () {
                ReportService.getBlankReport();
                s.addToEstimate();
            }

            s.leaveOldReport = function () {
                s.setAlert('Stop: You are mixing trees from different sites on the same estimate', { type: 'd', time: 9 });
            }

            // ------------------------------------------------- HELPER METHODS

            // filter based on selected.clientTypeID, or all if null
            var filterClients = function () {
                if (s.selected.clientTypeID) {
                    s.filteredClients = _.filter(s.initData.clients, function (obj) {
                        return (obj.clientTypeID == s.selected.clientTypeID);
                    });
                } else {
                    s.filteredClients = s.initData.clients;
                }
            };

            self.updateBulkEstimatePriceFn = function (updated) {
                if (s.selected.clientTypeID || s.selected.clientID) { return; }
                //console.log('Updating bulk estimate price', s.bulkEstimates);

                if (updated.sites) {
                    if (angular.equals(s.bulkEstimates.sitesBckp, updated.sites)) {
                        return;
                    }

                    s.bulkEstimates.sitesBckp = updated.sites;
                }

                if (updated.treatments) {
                    if (angular.equals(s.bulkEstimates.treatmentsBckp, updated.treatments)) {
                        return;
                    }

                    s.bulkEstimates.treatmentsBckp = updated.treatments;

                    if (updated.treatments.length === 0) {
                        // clear prices
                        angular.forEach(s.filteredSites, function (site) {
                            site.estimatePrice = 0;
                        });
                        return;
                    }
                }

                if (s.bulkEstimates.overrideTreatmentCodes.length === 0) {
                    return;
                }
                var opts = self.makeFiltersObject();
                opts.info = 1;
                opts.bulkTreatment = s.bulkEstimates.overrideTreatmentCodes.join(',');

                Api.getSites(opts).then(self.getSitesCB);
            };

            s.updateBulkEstimatePrice = _.throttle(self.updateBulkEstimatePriceFn, 700);

            self.hideOnEscape = function (e) {
                if (e.keyCode === 27) {
                    self.bulkModalScope.hide();
                }
            };

            self.getSelectedSitesNames = function () {
                var selectedSites = _.filter(s.filteredSites, function (site) {
                    return s.bulkEstimates.selectedSites.indexOf(site.siteID) > -1;
                });

                return _.pluck(selectedSites, 'siteName');
            };



				/**
				 * Ask user to name the bulk estimates, then create them and show the user
				 * a link to click to view those estimates
				 */
            s.createBulkEstimate = function () {
					var reportName = prompt("Enter a name for these estimates");

                var opts = self.makeFiltersObject();
                opts.bulkTreatment = s.bulkEstimates.overrideTreatmentCodes.join(',');
					 opts = $.param(opts);

					 Rest.all('createBulkEstimates?'+opts).post({reportName:reportName, siteIDs:s.bulkEstimates.selectedSites})
					 	.then(function(r){

							var e=$('div#bulkEstMessage');
							if(r && r.msg && e){
								var h="<i class='fa fa-check' style='color:green;'></i> <a href='#/estimates?s=bulk:"+r.bulkID+"'>"+r.msg+"</a>";
								e.html(h).css({padding:'.4em 0 .7em 0', fontSize:'1.4em'});
							}
						});
				};

            s.onChangeSiteCheck = function (site, checked) {
                if (checked == true) {
                    _.each(s.siteLocs, function (siteLoc) {
                        if (siteLoc.siteID == site.siteID) {
                            setSiteColor(siteLoc, true);
                        }
                    });
                } else {
                    _.each(s.siteLocs, function (siteLoc) {
                        if (siteLoc.siteID == site.siteID) {
                            setSiteColor(siteLoc, false);
                        }
                    });
                }

                replaceMarkers(s.siteLocs, 'allSites');
            };

            s.$on('tree.select.site', function (event, site, checked) {
                s.onChangeSiteCheck(site, checked);
            });

            self.updateSelectedSites = function () {
                var updated = [];

                angular.forEach(s.filteredSites, function (site) {
                    if (s.bulkEstimates.selectedSites.indexOf(site.siteID) > -1) {
                        updated.push(site.siteID);
                    }
                });

                s.bulkEstimates.selectedSites = updated;
                s.updateBulkEstimatePrice({ sites: s.TFSdata.filteredSiteIDs });
            };

            // ---- FILTERING OF SITES 
            // There are 2 type of filtering of sites:
            //		1. When a specific clienttype or client is picked, then the s.initData.sites[] list 
            //			is filtered down and copied into s.filteredSites[]
            //				*** accomplished by filterSitesByClients()
            //		2. When a user clicks on a filter (ie. species filter... like pine tree), then
            //			show all sites with pine trees when pine filter is clicked. 
            //			This is done by fetching a list of siteID's from the API, and storing those,
            //				*** accomplished by getFilteredSiteIDs()
            //			then calling the same func in #1 above, but taking into account, those siteIDs

            // if selected.clientID, filter based on that,
            // else if selected.clientTypeID filter based on clientTypeID
            // else show all
            var filterSitesByClients = _.throttle(function (clientId) {
                var siteIDs = s.TFSdata.filteredSiteIDs;
                var treeCountMap = s.TFSdata.treeCountMap;
                if (!siteIDs || !siteIDs.length || !(siteIDs.length > 0)) siteIDs = false;
                if (clientId !== undefined) {
                    s.selected.clientID = clientId;
                }
                if (s.selected.clientID) {
                    s.filteredSites = _.filter(s.initData.sites, function (obj) {
                        if (obj.clientID == s.selected.clientID) {
                            if (siteIDs) return (siteIDs.indexOf(obj.siteID) != -1);
                            else return true;
                        }
                        return false;
                    });
                } else if (s.selected.clientTypeID) {
                    s.filteredSites = _.filter(s.initData.sites, function (obj) {
                        if (obj.clientTypeID == s.selected.clientTypeID) {
                            if (siteIDs) return (siteIDs.indexOf(obj.siteID) != -1);
                            else return true;
                        }
                        return false;
                    });
                } else {
                    if (siteIDs) {
                        s.filteredSites = _.filter(s.initData.sites, function (obj) {
                            return (siteIDs.indexOf(obj.siteID) != -1);
                        });

                        _.each(s.filteredSites, function (site) {
                            var treeCount = _.find(treeCountMap, function (tree) {
                                return tree.siteID === site.siteID;
                            });

                            site.matchedTreesCount = treeCount.treeCount;
                            site.estimatePrice = treeCount.estimatePrice;
                            self.updateSelectedSites();
                        });
                    } else //s.filteredSites=angular.copy(s.initData.sites);  -- fixed a dropdown ng-model issue
                        s.filteredSites = s.initData.sites;
                }
                showMappedSites();
            }, 900);

            self.getSitesCB = function (treeCountMap) {
                if (treeCountMap && treeCountMap.length > 0) {
                    s.TFSdata.filteredSiteIDs = _.pluck(treeCountMap, 'siteID');
                    s.TFSdata.treeCountMap = treeCountMap;
                    filterSitesByClients();
                } else {
                    s.TFSdata.filteredSiteIDs = false;
                    s.filteredSites = [];
                    clearMarkers();
                }
            };

            self.makeFiltersObject = function () {
                var opts = {};
                _.each(s.TFSdata.selectedFilters, function (filt) {
                    if(filt.type == 'onlyInEstimate') return;
                    var idName = (filt.type == 'year' || filt.type == 'miscProperty') ? filt.type : filt.type + 'ID';
                    if (!opts[idName]) opts[idName] = [];
                    opts[idName].push(filt.id);
                });
                _.each(opts, function (obj, name) {
                    opts[name] = obj.join(',')
                });

                return opts;
            };

            // Check with API all the selectedFilters, and get those siteID's that match
            // the given filters... then call filterSitesByClients().. which also takes those siteIDs into account
            var getFilteredSiteIDs = function () {
                if (!(s.TFSdata.selectedFilters.length > 0)) {
                    s.TFSdata.filteredSiteIDs = false;
                    s.filteredSites = s.initData.sites;
                    return showMappedSites();
                }

                var opts = self.makeFiltersObject();
                opts.info = 1;
                Api.getSites(opts).then(self.getSitesCB);
            };

            var getTreeListings = function () {
                if (s.selected.siteID <= 0)
                    return;

                console.log('Loading tree for Site #' + s.selected.siteID);

                // reset selected trees to prevent duplicates
                s.selectedTrees = [];
                s.setAlert('Loading Trees', { busy: true, time: "false" });
                Api.getTrees(s.selected.siteID)
                    .then(function (data) {
                        TFS.setTreeResults(data);		// after this, the trees get
                        // set back on $scope via $on('onTreeFilterUpdate')
                        //s.setAlert(false);
                        s.hideAllAlert();
                    });
            };


            // --- GETTERS for specific client, types, or site objects by ID
            s.getClientByID = function (id) {
                return _.findObj(s.initData.clients, 'clientID', id);
            }
            s.getClientTypeByID = function (id) {
                return _.findObj(initData.clientTypes, 'clientTypeID', id);
            }
            s.getSiteByID = function (id) {
                return _.findObj(s.initData.sites, 'siteID', id);
            }


            /*
             // pre-init stuff ----------------------------------------------
             var deferredUserNav, deferredInitData

             // called immediately, and when a location change happens
             var onUserNav = function() {
             var st = $route.current.params.stateID;
             if( st=='trees' ||  st=='estimate') {

             // customer facing estimate view
             if(st=='estimate'){
             var custToken=$route.current.params.param1;
             //if the user is not signed in... OR if there IS a token, but a requestedReportID hasnt been translated, then go find it
             if(!Auth.isSignedIn() || (custToken && Auth.requestedReportID===undefined)){		
             Auth.signInCustToken(custToken).then( function(userData){
             if(userData && userData.requestedReportID) Auth.requestedReportID=userData.requestedReportID;
             // allow navigation to continue, now that user has logged in
             deferredUserNav.resolve($route.current.params.param1);
             });
             }
             }

             s.data.showMap = (st=='trees');
             if( st != s.data.mode ){	// init if we changed views
             s.data.mode=st;
             deferredUserNav.resolve($route.current.params.param1);
             }
             s.sendEvt('registerPreventNav');
             }
             }


             var waitForUser = function(){ deferredUserNav=$q.defer(); return deferredUserNav.promise; }
             var waitForInitData = function(){ deferredInitData=$q.defer(); return deferredInitData.promise; }
             var pre_init = function() {
             // wait for user to browse here, AND initData to arrive, THEN... fire init()
             $q.all([waitForUser(), waitForInitData()])
             .then(function(result){init(result[0]);})

             angular.element(document).ready(function () {
             s.$on('$locationChangeSuccess', onUserNav);
             onUserNav();
             });

             s.$on('onInitData', function(e,data){
             deferredInitData.resolve();
             });
             }

             pre_init();
             // if user is not signed in, init wont run, so make sure init runs when they do sign in
             s.$on('onSignin', function(evt){
             pre_init();
             });
             */

            s.$watch('bulkEstimates.overrideTreatmentCodes', function (newVal) {
                s.updateBulkEstimatePrice({ treatments: newVal });
            });

            //Watch for init data here.
            s.$watch('initData.sites', function (data) {
                // alert("watch called");
                //  //if (data === undefined && data === null)
                //  //   return;

                // // console.log('On init data in sites');
                if (s.data.mode() === 'trees' && (!gMap || !gMap.j || gMap.j.id !== 'treeMap')) {// Parms solution to fix the double map load... (and comment out the following)

                    if (!gMap && !$location.search().reportID && !$location.search().siteID) { // Imdad's solution to fix the double map load
                        ////            // This if condition is blocking to override the satellite view.
                        console.log('Map not initialized in $onInitData event');
                        s.openTreesOrSites();
                    }
                    ////        /*initMap().then(function () {
                    ////            console.log('Map initialized in $onInitData event');
                    ////            showMappedSites();
                    ////        })*/
                }
            });

            //Broadcast is not occuring.
            s.$on('onInitData', function (e, data) {
                console.log('On init data in trees');

                if (s.data.mode() === 'trees' && (!gMap || !gMap.j || gMap.j.id !== 'treeMap')) {
                    console.log('Map not initialized in $onInitData event');
                    initMap().then(function () {
                        console.log('Map initialized in $onInitData event');
                        showMappedSites();
                    })
                }
            });

            s.markComplete = function (item, treatment) {
                s.markCompleteInProgress = true;
                console.log('treatment.tstamp_completed');
                console.log(treatment.tstamp_completed);
                if (treatment.tstamp_completed != null) {
                    Api.markReportItemAsIncomplete(s.report.reportID, treatment.reportItemID).then(function(data) {
                        treatment.tstamp_completed = null;
                        s.markCompleteInProgress = false;
                    });
                } else {
                    Api.markReportItemAsComplete(s.report.reportID, treatment.reportItemID).then(function(data) {
                        if (data.reportItem != undefined) {
                            treatment.tstamp_completed = data.reportItem.tstamp_completed;
                        }

                        s.markCompleteInProgress = false;
                    });
                }
            }

            //  s.$on('$routeChangeSuccess', onUserNav);
        }]);	// }}} TreesCtrl


