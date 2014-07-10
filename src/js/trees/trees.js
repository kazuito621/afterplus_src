/*
	See treefilter.service.js for detailed diagram of filter interactions

*/
'use strict';

var TreesCtrl = app.controller('TreesCtrl', 
	['$scope', '$route', '$timeout', 'ReportService', 'TreeFilterService', '$filter', 'storage', '$q', 'Auth', 'Api', 'SiteModelUpdateService',
	function ($scope, $route, $timeout, ReportService, TreeFilterService, $filter, storage, $q, Auth, Api, SiteModelUpdateService) {


	// local and scoped vars
	var s = window.tcs = $scope
		,myStateID='trees'
		,gMap, mapBounds, infowindow, inited, enableMap=true
		,TFS=TreeFilterService
		,markers_allSites = []
		,markers_singleSite= []
		s.tree_cachebuster='?ts='+moment().unix();	
		s.data={
				showTreeDetails:false
				,showMap:true			// not needed now? since new routing technique
				,showTreatmentList:false
				,currentTreatmentCodes:[]		// array of treatment codes user selected in multi-box
												// for adding trees to the estimate
				,mode:function(){ return s.renderPath[0]; }					// either "trees" or "estimate"
				};
		s.whoami='TreesCtrl';
		s.TFSdata;	//holds tree results count, etc. Remember, always put scope data into an object
					// or it will pass by value, not reference
		s.filterSearch={species:'', treatments:''};
		s.selected={clientTypeID:'', clientID:'', siteID:'', treatmentIDs:[], treatmentCodes:[]};
		s.filteredClients=[];	// all/filtered list of clients based on selected Client Type
		s.filteredSites=[];				// all/filtered list of sites based on selected client
		s.trees = [];			// result set of trees based on site selected
		s.selectedTrees = []; 	// treeIDs that have been SELECTED for inclusion in estimate
		s.treatmentTypes = [];
		s.ratingTypes = [];
		s.siteLocs = [];
		s.selectedValues = [];
		s.thisYear=moment().format('YYYY');
		s.filteredSites = s.initData.sites;
		s.filteredClients = s.initData.clients;
		s.ratingTypes = s.initData.filters.ratings;
		s.filters = s.initData.filters;
		s.filters.year=[{id:moment().format('YYYY'), desc:'This year'}
									,{id:moment().add('year',1).format('YYYY'), desc:'Next yr'}
									,{id:moment().add('year',2).format('YYYY'), desc:'2yr'}
									,{id:moment().add('year',3).format('YYYY'), desc:'3yr'}
									,{id:moment().add('year',4).format('YYYY'), desc:'4yr'}]
		s.treatmentTypes = s.initData.filters.treatments;
		ReportService.setTreatmentPrices(s.initData.filters.treatmentPrices);

		s.colors={
			speciesCount:[]		// stores count of species ie. speciesCount[133]=5, speciesCount[431]=1  (speciesID 133 = 5 total)
			,assignment:[]		// stores which colorID index (for bg and fg) is assigned to which speciesID..
								// ie. assignment[0]=133 (the first color index for bg[0]/fg[0] is assigned to speciesID 133)
			,nextColorID:0		
			// tree icon colors
			//    green     drk blue   red   orange   dkgry     purpl     yellow,  futia   brown   dk grn  dkred    lt.futia  lt.blue  dk.teal lt.teal  lt.orng med.grey   medred  med.grn  med.purp
			,bg:['78ee31','2044df','ce2712','db7e00','646464','6d2dd5','f5f02c','ed79fb','a8621c','487123','751307','dc85ee','9baeec','298d8c','8bf8f7','fdc476','a5a5a5','e27966','6aab09','ad8cd6']
			,fg:['000000','ffffff','ffffff','ffffff','ffffff','ffffff','000000','000000','ffffff','ffffff','ffffff','000000','ffffff','ffffff','000000','000000','000000','000000','000000','ffffff']
			};


		s.TFSdata=TFS.data;
		if(s.data.mode()=='estimate'){
			var rptHash=s.renderPath[1];
			if( rptHash ){ 
				ReportService.loadReport(rptHash, {getTreeDetails:1})
					.then(function(data){
						if(Auth && Auth.requestedReportID) delete Auth.requestedReportID;
						s.report=data;
						if(data && data.siteID) s.selected.siteID=data.siteID;
						showMappedTrees();
					});
			}
		}

		// here, we account for 2 usecases:
		// 1. if user comes to this state 2nd (ie after editing a tree.. so we need a resize)
		// 2. if user comes here first... 
		if(gMap) {						
			if(!inited) {				
				$timeout( function() { 			// not sure if this is needed
					if(google && google.maps)	
						google.maps.event.trigger(gMap,'resize')
				},2000);
			}
		}

		TFS.init(s.initData);

		// bind variabels to local storage, so that stuff is remembered	
		// then start showing sites on a map... BUT if a site is already selected,
		// instead show trees... which will happen automatically based on $watch
		$timeout(function(){
			storage.bind(s, 'selected', {defaultValue:{clientTypeID:'', clientID:'', siteID:'', treatmentIDs:[], treatmentCodes:[]}});
			s.selected.treatmentIDs=[]; s.selected.treatmentCodes=[];
			if( !s.selected.siteID && s.data.mode()!='estimate') showMappedSites();
		},1);

	


    var highlightResultRow = function (treeID) {
        if (s.activeResultRow) {
            $('#tree-result-item-row-' + s.activeResultRow).toggleClass('highlighted-row');
        }

        s.activeResultRow = treeID;

        var newActiveRow = $('#tree-result-item-row-' + s.activeResultRow);
        var listContainer = $('.trees-result-list');

        var scrollTo = function (value) {
            listContainer.animate({
                scrollTop: value
            }, 2000);
        };

        newActiveRow.toggleClass('highlighted-row');

        var scrollValue = listContainer.scrollTop() + newActiveRow.offset().top - listContainer.offset().top;

        scrollTo(scrollValue);
    };

	// ----------------------------------------------------------- EVENTS BASED ON DROPDOWNS

	// when user selects clientTypeID: (Rule A)
	// 		1. filter the clients dropdown, and set selected.clientID = null
	//		2. filter the sites dropdown, and set selected.siteID = null
	//		3. Update the map with Sites
	s.onSelectClientTypeID = function() {
		filterClients();
		filterSitesByClients();
		s.selected.clientID=s.selected.siteID='';
		showMappedSites();
	};

	// when user selects clientID:
	//		1. filter the sites dropdown and set selected.siteID = null 
	//		2. set selected.clientTypeID to corresponding value
	//		3. Update the map with Sites
	s.onSelectClientID = function(id){
		if(id && id>0){
			filterSitesByClients();
			s.selected.siteID='';
			var clientObj = s.getClientByID(s.selected.clientID);
			s.selected.clientTypeID=clientObj.clientTypeID;
			showMappedSites();
		}else{					//else, go back to showing clientType
			s.onSelectClientTypeID();
		}
	}

	// when user selects a site:
	//		1. ACTIVE: Set clientID and clientTypeID with corresponding values
	//		2. ACTIVE: Get trees for this site
	//		2. passive: $watch will update the map with TREES
	s.onSelectSiteID = function(id){
		if(id && id>0){
			var siteObj = s.getSiteByID(id);
			s.selected.clientID = siteObj.clientID;
			s.selected.clientTypeID = siteObj.clientTypeID;
			getTreeListings()
		}else{				// no site selected, so go back to site view, not tree view
			s.onSelectClientID();
		}
	}

	s.onSelectSiteIDFromMap = s.safeApplyFn(function(id){
		s.selected.siteID=id;
		s.onSelectSiteID(id);
		if(s.TFSdata.selectedFilters.length>0)
			TFS.filterTrees();
		$timeout(function(){		// sometimes the property would not get selected in dropdown
			s.selected.siteID=id;	// so this is to ensure it does
		},2500);
	},s)

	// When the selected.siteID model changes (not necessarily forced by user) then:
	// 		1. if set to null, then show SITES on map
	//		2. ELSE, if siteID exists, show TREES on the map
	s.$watch('selected.siteID', function(ID, oldID) {
		SiteModelUpdateService.setSites(s.filteredSites);
		ReportService.setSiteID(ID);
		if(s.data.mode()=='trees'){
			ReportService.loadRecent();
			if(ID && ID>0) getTreeListings();
			// todo -- else zoom in on the selected Site...
			// zoomMap(lat, long)?
		}
	});

	s.$watch('selected.clientID', function(ID, oldID) {
		ReportService.setClientID(ID);
		if(s.data.mode()=='trees') ReportService.loadRecent();
	});

	// When the trees[] array changes because of a filter event... update the ui.
	// This also may be triggered when site dropdown is selected (via getTreeListings())
	s.$on('onTreeFilterUpdate', function(evt, trees){
		s.trees=trees;
		s.colors.speciesCount=[];
		s.colors.assignment=[];
		s.colors.nextColorID=0;	
		showMappedTrees(s.trees);
	});

	s.$on('onTreeUpdate', function(evt, tree){
	return		//todo -- make tree update after its edited. use case is when notes are edited,
				// they should then update in the estimate without a page refresh
		if(tree && tree.treeID){
			var t=_.findObj(s.trees, 'treeID', tree.treeID)
			if(t) t=tree;
			if(_.extract(ReportService, 'report.items')){
				var t=_.findObj(ReportService.report.items, 'treeID', tree.treeID)
				if(t) t=tree;
			}
		}
	});


	// Anytime any filter checkbox is changed
	// If a specific site is selected, then filter the trees by passing onto TFS
	// Else, we are now filtering the sites, not the trees
	s.onFilterChange = function(filterType, ID, value) {
		TFS.onChange(filterType, ID, value);
		if(!s.trees || !s.trees.length || s.trees.length<1) getFilteredSiteIDs();
	}

	s.clearFilters = function(){
		TFS.clearFilters();
		if(!s.trees || !s.trees.length || s.trees.length<1){
			//s.filteredSites=angular.copy(s.initData.sites); 
			s.filteredSites=s.initData.sites;		//-- fixed a dropdown ng-model issue
			showMappedSites();
		}
	}

	s.reset = function(){
		ReportService.getBlankReport();
		TFS.clearFilters(true);
		//todo - this action jacks up the selection of the sites dropdown by changing the model
		// so instead of making a copy... do we need to make a copy? try not doing that
		// or instead of creating a filteredSites array, maybe we should just set sites[0].hide=true;
		//		and use hte original array;
		//s.filteredSites=angular.copy(s.initData.sites);
		s.filteredSites=s.initData.sites;  //-- fixed a dropdown ng-model issuet 
		showMappedSites();
		s.selected.clientTypeID=s.selected.clientID=s.selected.siteID='';
	}

	s.onTreeImageRollover = function(treeID){
		s.data.showTreeDetails=true;
		s.data.showMap=false;
		s.treeDetailsID=treeID;
		s.sendEvt('onTreeResultImageRollover', treeID);
	}

	s.onTreeImageRollout = function(treeID){
		if( treeID!=s.treeDetailsID ) return;
		s.data.showTreeDetails=false;
		s.data.showMap=true;
	}

								//ng-mouseover="onTreeImageRollover(tree.treeID,true);" ng-mouseleave="onTreeImageRollover(tree.treeID,false);"




	// ------------------------------------------------------ GOOGLE MAPS
	var initMap = function(){
		var deferred=$q.defer();
		if(gMap)return;
		google.load("maps", "3", {other_params:'sensor=false', callback:function(){
			var myOptions = {zoom: 1, tilt:0, center: new google.maps.LatLng(37,122),mapTypeId:'hybrid'};
			var map_id=(s.data.mode()=='estimate') ? 'treeMap2' : 'treeMap';
			gMap = new google.maps.Map($('#'+map_id)[0], myOptions);
			google.maps.event.addListener(gMap, 'click', function() {
			dbg(s,'click')
       			if(infowindow && infowindow.setMap) infowindow.setMap(null);
	    	});
			deferred.resolve();
		}});
		return deferred.promise;
	}

	var showMappedSites = _.throttle(function() {
			var a, l, siteLoc, noLoc=0, numSpecies
			if(enableMap==false || !s.filteredSites || !s.filteredSites.length) return;
			if(!gMap) return initMap().then(function(){ showMappedSites(); })

        	s.siteLocs = [];

			//todo - #optimze why are we looping twice? once here and again below....
			_.each(s.filteredSites, function(site){
				if(!site.lng || site.lng==0 || !site.lat || site.lat==0) return noLoc++;

				if(site.species && site.species.length>0) numSpecies=site.species.length;
				else numSpecies=0;
				var _siteObj=_.findObj(s.initData.sites, 'siteID', site.siteID); 
				var _clientObj=_.findObj(s.initData.clients, 'clientID', _siteObj.clientID); 
				var click="angular.element(this).scope().onSelectSiteIDFromMap({0})".format(site.siteID)
				site.info = '<div id="content">'+
					'<h1 id="firstHeading" class="firstHeading">'+site.siteName+'</h1>'+
					'<div id="bodyContent">'+
					'<p><strong>SiteID:'+site.siteID+'</strong></p>'+
					'<p><strong>Client:'+_clientObj.clientName+'</strong></p>'+
					'<p><strong>Total Trees:'+s.trees.length+'</strong></p>'+
					'<BR><a href onclick="{0};return false;">View Trees On This Site</a></div></div>'.format(click);
				site.iconType = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
				s.siteLocs.push(site);
			});
			
			if(!infowindow) infowindow = new google.maps.InfoWindow();

			if(!s.siteLocs.length) {
				if(noLoc>0) 
					s.setAlert(noLoc+" site(s) are missing lat/long, and cannot be displayed", {type:'d', pri:2})	
				return clearMarkers();
			}

			replaceMarkers(s.siteLocs,'allSites');
		},1500);

	var replaceMarkers = function(arr,addType) {
		clearMarkers();
		addMarkers(arr, addType);
	}
		
	var addMarkers = function(arr,addType) {	
		if(enableMap==false) return;
			//empty singleSite marker array
			markers_singleSite = [];
        	mapBounds = new google.maps.LatLngBounds();
			var LatLngList = [];
			mapBounds = new google.maps.LatLngBounds();
			for(var a=0;a<arr.length;a++){
				LatLngList.push(new google.maps.LatLng (arr[a].lat,arr[a].lng));
				var marker = new google.maps.Marker({
					position: LatLngList[a],
					map: gMap,
					icon: arr[a].iconType,
					id: a,
					info: arr[a].info,
					siteID: arr[a].siteID,
                    treeID: arr[a].treeID
					//html: '<a href onclick="showInfo('+ (arr.length) +',event)"></a>'
				});

				//console.log("info added: "+marker.info);
				mapBounds.extend(LatLngList[a]);				
								
		
				//determine which array to add markers to
				switch(addType){
					case 'allSites':
					markers_allSites.push(marker);
				//Add event listener for SITE markers				
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.setContent(this.info); 
					infowindow.open(gMap,this);
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
					google.maps.event.addListener(marker, 'click', function() {
                        highlightResultRow(this.treeID);
						infowindow.setContent(this.info); 
						infowindow.open(gMap,this);
					});

					break;
			
					default:
					break;
				}
			}


			 // Don't zoom in too far on only one marker, when in site mode
			if (addType=='allSites' && mapBounds.getNorthEast().equals(mapBounds.getSouthWest())) {
				var xtra=0.08;
				var extendPoint1 = new google.maps.LatLng(mapBounds.getNorthEast().lat() + xtra, mapBounds.getNorthEast().lng() + xtra);
				var extendPoint2 = new google.maps.LatLng(mapBounds.getNorthEast().lat() - xtra, mapBounds.getNorthEast().lng() - xtra);
				mapBounds.extend(extendPoint1);
				mapBounds.extend(extendPoint2);
			}


			gMap.fitBounds(mapBounds);
			if(addType == 'allSites'){
				gMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			}else{
				gMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
			}
		}
		
		var showInfo = function(num,e){
			console.log("info: "+num);
			infowindow.setContent(e.target.info); 
			infowindow.open(gMap,e.target);
		}
			
	var clearMarkers = function() {
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
	
	//Define function to show site specific trees in map
	var showMappedTrees = _.throttle(function(treeSet){
		if(!gMap) return initMap().then(function(){ showMappedTrees(treeSet); })
		if(s.data.mode()=='estimate' && s.report && s.report.items) treeSet=s.report.items;
		clearMarkers();
		var set2=[],ratingD,o;
		if(!infowindow) infowindow = new google.maps.InfoWindow();
		_.each(treeSet, function(itm){
			if(!itm || itm.hide) return;
			if(itm.commonName==null || itm.commonName=='null' || !itm.commonName) itm.commonName=' ';
			if(s.data.mode()=='trees'){
				ratingD = (itm.ratingID>0) ? s.ratingTypes[itm.ratingID-1].rating_desc : '';
				o= '<div class="mapWindowContainer">'
				+'<h1 id="firstHeading" class="firstHeading">{0}</h1>'.format(itm.commonName)
				+'<div class="mwcImgCt"><img class="mwcImg" src="{0}"></div>'.format(itm.imgMed)
				+'<div class="mwcBody">{0}<BR>TreeID:{1}<BR>Size:{2}<BR>'.format(itm.botanicalName, 
							itm.treeID, $filter('dbhID2Name')(itm.dbhID,s));
				if(itm.ratingID) o+= '<div class="firstHeading">Rating:{0}-{1}</div>'.format(itm.ratingID,ratingD);
				o+='<div>';
				if(itm.caDamage=='yes') o+='<i class="fa fa-warning _red _size7" title="Hardscape damage"></i> ';
				if(itm.caDamage=='potential') o+='<i class="fa fa-warning _grey _size7" title="Hardscape damage"></i> ';
				if(itm.powerline=='yes') o+='<i class="fa fa-bolt _red _size7" title="Powerline nearby"></i> ';
				if(itm.building=='yes') o+='<i class="fa fa-building _red _size7" title="Building nearby"></i> ';
			// todo - if itm.history[] contains any items which are "recommended" status, and year = THIS YEAR,
			// then show a little [2014] icon in red.  if there is one for NEXT YEAR, then show a [2015] in grey,
			// similar to the items in the tree results list. ... ie
			// <span class='textIconBlock-red'>2014</span>
			// .... or ...textIconBlock-grey
			//	+'<div class="recYear">{0}</div>'.format(itm.history) // Not sure how to access and format this one.
				o+='</div><a href="#/tree_edit/'+itm.treeID+'">Edit Tree</a><BR></div>';
				itm.info=o;

			}else{
				itm.info = '<h1 id="firstHeading" class="firstHeading">{0}</h1>'.format(itm.commonName)
				+'treeID: '+itm.treeID
				+'</div>'
			}
				setIconColor(itm);
			set2.push(itm)
		});
		if(set2.length>0) addMarkers(set2,'singleSite');
		else s.setAlert('No tree results, or trees do not have GPS locations',{type:'d',time:5});
	},1000);
	
	
	//Define function to get tree marker iconType/color by speciesID
	var setIconColor = function(itm){
		// tally up by species
		if(s.colors.speciesCount[itm.speciesID])
			s.colors.speciesCount[itm.speciesID].count++;
		else
			s.colors.speciesCount[itm.speciesID]={colorID:s.colors.nextColorID++, count:1};

		var idx=s.colors.speciesCount[itm.speciesID].colorID;
		//https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=1|006256|000000
		var base='https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld='
		var num = itm.localTreeID || '';
		var bg=s.colors.bg[idx];
		var fg=s.colors.fg[idx];
		if(bg===undefined) {
			bg = 'd2d2d2';
			fg = '000000';
		}
		itm.colorID=idx;
		itm.iconType=base+num+'|'+bg+'|'+fg;
	}

	//Define function to get specific treatment types (string) by ID
	s.getTreatmentType = function(ID){
		var t=_.extract(s, 'initData.filters.treatments');
		var found = _.findObj(t, 'treatmentTypeID', ID);
		return _.extract(found, 'treatmentType');
	}


	//Define function to get specific tree sizes (string) by ID
	// ????? Noticed that this is returning false now.. Not sure why
	s.getTreeSize = function(ID){
		var dbh=_.extract(s, 'initData.filters.dbh');
		var found = _.findObj(dbh, 'dbhID', ID);
		var diam = _.extract(found, 'diameter');
		return diam;
	}






	// ----------------------------------------------------- EVENTS for Tree Results List

	// toggle checkboxes of trees
	// @param opt 1. TRUE == check all
	//			  2. FALSE == uncheck all
	//			  3. 'thisYear' == check all with recommendations this year
	//			  4. ARRAY of treeIDs - toggle all those treeIDs
	s.toggleCheckedTrees = function(opt){
		if(opt instanceof Array){							// option 4
			_.remove(s.selectedTrees,function(t){
				return (opt.indexOf(t.treeID)>=0);
			});
		}else{
			_.trunc(s.selectedTrees);	
			if(opt){
				_.each(s.trees, function(t){
					if(opt===true && !t.hide)
						s.selectedTrees.push(t.treeID);	
					else if(opt=='thisYear' && t.recoThisYear && !t.hide)
						s.selectedTrees.push(t.treeID);	
				});
			}
		}
	};

    var animateMarker = function (marker, animationType) {
		if(!google.maps || !google.maps.Animation) return;
        var animation = google.maps.Animation[animationType];

        if (animationType === null) {
            animation = null;
        }

        if (marker) {
            marker.setAnimation(animation);
        }
    };

    var findMarker = function (id) {
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
		var marker = findMarker(tree.treeID);
		if (!hoveredItem.animationCompleted) {
			animateMarker(marker, 'BOUNCE');
		}
		hoveredItem.animationCompleted = true;
		tree.showEdit = true;
	};

	s.onTreeResultMouseLeave = function (tree) {
        var marker = findMarker(tree.treeID);
        animateMarker(marker, null);
		tree.showEdit = null;
		hoveredItem.animationCompleted = false;
	};

	// ------------------------------------------------------ ESTIMATE RELATED STUFF

	// Add selected trees to the estimate.. 
	// IF data.showTreatmentList && currentTreatmentCodes is selected, then use those (pass them in)
	// BUT if they are not, then the ReportService will assume the "next recommended treatment"
	s.addToEstimate = function (){
		// get an array of selected treeID's
		var added,msg,trees=[];
		_.each(s.trees, function(t){
			if(s.selectedTrees.indexOf(t.treeID)>=0)
				trees.push(t);
		});

		if(trees.length==0) return s.setAlert('No Trees Selected',{type:'d'})
		var tc = (s.data.showTreatmentList) ? s.data.currentTreatmentCodes : null;
		added=ReportService.addItems(trees, tc, s.TFSdata.selectedFilters);
		if(added==-1)
				return s.setAlert('Stop: You are mixing trees from different sites on the same estimate',{type:'d',time:9});
		if(added.length==trees.length){
			s.selected.treatmentCodes=[];			// clear out "force treatment" box after use
			s.setAlert('{0} item(s) added to estimate'.format(added.length),{type:'ok'})
			return s.toggleCheckedTrees(false);
		}
		if(added.length < trees.length){
			if(s.data.currentTreatmentCodes)	
				msg=(added.length) ? 'Err 47 - Some trees were not added to estimate' : 'Err 48 - No trees added to estimate';
			else{
				if( added.length ) 
					msg='{0} trees added. Some did not have recommendations assigned'.format(added.length)
				else
					msg='These trees did not have recommendations assigned.';
			}
			s.setAlert(msg,{type:'d', time:10});
			s.toggleCheckedTrees(added);
		}
		s.selected.treatmentCodes=[];			// clear out "force treatment" box after use
	}


	//MULTI SELECT CODE
    s.$watch('selected.treatmentCodes', function(nowSelected){
        s.data.currentTreatmentCodes = [];
        if( ! nowSelected ){
            // here we've initialized selected already
            // but sometimes that's not the case
            // then we get null or undefined
            return;
        }
        angular.forEach(nowSelected, function(val){
           s.data.currentTreatmentCodes.push(val);
        });
    });











	// ------------------------------------------------- HELPER METHODS

	// filter based on selected.clientTypeID, or all if null
	var filterClients = function() {
		if( s.selected.clientTypeID ){
			s.filteredClients = _.filter(s.initData.clients, function( obj ) {
					return ( obj.clientTypeID == s.selected.clientTypeID );
				});
		}else{
			s.filteredClients=s.initData.clients;
		}
	}



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
	var filterSitesByClients = _.throttle(function() {
		var siteIDs=s.TFSdata.filteredSiteIDs;
		if(!siteIDs || !siteIDs.length || !(siteIDs.length>0)) siteIDs=false;
		if( s.selected.clientID ){
			s.filteredSites = _.filter(s.initData.sites, function( obj ){
					if( obj.clientID == s.selected.clientID ){
						if(siteIDs) return (siteIDs.indexOf(obj.siteID)!=-1);
						else return true;
					}
					return false;
				});
		}else if( s.selected.clientTypeID ){
			s.filteredSites = _.filter(s.initData.sites, function( obj ){
					if(obj.clientTypeID == s.selected.clientTypeID){
						if(siteIDs) return (siteIDs.indexOf(obj.siteID)!=-1);
                        else return true;
					}
					return false;
				});
		}else{
			if(siteIDs){
				s.filteredSites = _.filter(s.initData.sites, function( obj ){
					return (siteIDs.indexOf(obj.siteID)!=-1);
				})
			}else //s.filteredSites=angular.copy(s.initData.sites);  -- fixed a dropdown ng-model issue
				s.filteredSites=s.initData.sites;    
		}
		showMappedSites();
	},900);


	// Check with API all the selectedFilters, and get those siteID's that match
	// the given filters... then call filterSitesByClients().. which also takes those siteIDs into account
	var getFilteredSiteIDs = function(){
		if( !(s.TFSdata.selectedFilters.length>0) ){
			s.TFSdata.filteredSiteIDs=false;
			s.filteredSites=s.initData.sites;
			return showMappedSites();
		}
		
		var opts={};
		_.each(s.TFSdata.selectedFilters, function(filt){
			var idName=(filt.type=='year'||filt.type=='miscProperty') ? filt.type : filt.type+'ID';
			if(!opts[idName]) opts[idName]=[];
			opts[idName].push(filt.id);
		});
		_.each(opts, function(obj, name){
			opts[name]=obj.join(',')
		});

		Api.getSites(opts)
			.then(function(siteIDs){
				if(siteIDs && siteIDs.length>0){
					s.TFSdata.filteredSiteIDs=siteIDs;
					filterSitesByClients();
				}else{
					s.TFSdata.filteredSiteIDs=false;
					s.filteredSites=[];
					clearMarkers();
				}
			});
	}




	var getTreeListings = function(){
		// reset selected trees to prevent duplicates
		s.selectedTrees = [];
		s.setAlert('Loading Trees',{busy:true});
		Api.getTrees(s.selected.siteID)
			.then(function(data){
				TFS.setTreeResults(data);		// after this, the trees get
												// set back on $scope via $on('onTreeFilterUpdate')
				s.setAlert(false);
			});
	};


	// --- GETTERS for specific client, types, or site objects by ID
	s.getClientByID = function(id) {
		return _.findObj(s.initData.clients, 'clientID', id);
	}	
	s.getClientTypeByID = function(id) {
		return _.findObj(initData.clientTypes, 'clientTypeID', id);
	}	
	s.getSiteByID = function(id) {
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

}]);	// }}} TreesCtrl


