/**
	Service for handling Rest gateway for Reports (estimates and invoices)
	A service is global - so Tree Controller and add items to the report,
	and Report Controller can build a UI based on the data
**/
app.service('ReportService', 
	['Restangular', '$timeout', '$rootScope', 'md5', '$q',
	function(Restangular, $timeout, $rootScope, md5, $q) {
	// private properties
	var Rest=Restangular
		,nextItemID=1

	// public properties
	this.recentReportList;			// store the list of reports
	this.report={};					// the actual report object that is requested 
	this.grandTotal = 0.00;		// GrandTotal of item pricing, listed on report			
	this.lastReportMd5;
	this.emailRpt = {};

	this.init=function(){
		this.getBlankReport();
		var that=this;
		// when reportID changes, update the report Link
		$rootScope.$watch(function(){ return that.report.reportID}, function(){ 
				var t=that.report.token || that.report.reportID;
				that.report.reportLink='http://app.arborplus.com/#/estimate/'+t;
			});
		// when items in report change, get a new total
		var onChg=function(){ that.setGrandTotal(); }
		$rootScope.$watch(function(){ return that.report.items}, onChg, true);
		$rootScope.$watch(function(){ return that.report.services}, onChg, true);

		// send a func that will tell if report is dirty or not
		$rootScope.$broadcast('registerPreventNav', function(){
			if(!that.report) return false;
			if(!that.report.items.length) return false;
			var thisMd5 = that.getReportMd5();
			if( thisMd5 != that.lastReportMd5 )
				return true;
		})
		$rootScope.$on('preventNavIgnored',function(){
			that.getReportMd5(true);
		});
	}

	this.setSiteID = function(ID) {
		this.siteID=ID;
		this.loadRecent();
	}
	this.setClientID = function(ID) {
		this.clientID=ID;
		this.loadRecent();
	}
	this.setTreatmentPrices = function(tp) {
		this.treatmentPrices=tp;
	}

	this.getBlankReport = function(){
		this.report={name:'Untitled Report', items:[], services:[], siteID:this.siteID};
		$rootScope.$broadcast('onLoadReport', this.report);
		return this.report;
	}


	this.loadReport = function( reportID, opts ){
		var deferred=$q.defer();
		if(!reportID) {
			deferred.reject('Invalid reportID');
			return deferred.promise;
		}
		if(!opts) opts={};
		opts.getTreeDetails=1;
		var that=this;
		Rest.one('estimate',reportID).get(opts).then(function(data) {
			that.report=data;
			// renumber the ID's into lower numbers
			var localID=1;
			if(data.items){
				_.each(data.items, function(d){
					d.localTreeID=localID++;
				})
			}
			$rootScope.$broadcast('onLoadReport', data);
			$timeout(function(){
				that.getReportMd5(true);
			},500);
			deferred.resolve(data);
		});	
		return deferred.promise;
	}

	this.getReportMd5 = function(set){
		if( !this.report ) return '';
		if( !this.report.items.length ) return '';
		var str=JSON.stringify(this.report.items) + JSON.stringify(this.report.services)
			+this.report.name;
		var m = md5.createHash(str);
		if(set)this.lastReportMd5=m;
		return m;
	}
	
	this.addMiscService = function(desc,qty,price){
		var miscService = {desc:desc,quantity:qty, price:price};
		this.report.services.push(miscService);
	}

	this.updateSiteInfo = function(){
		if(this.report && this.report.siteName && this.report.siteName.length) return;
		var that=this;
		Rest.one('site',this.siteID).get().then(function(data) {
			if(!data || !data.siteName) return;
			dbg(data)
			_.copyProps(data, that.report, 'siteName,contact,contactEmail,contactPhone,street,city,state');
			dbg(that.report)
		});	
	}

	// Get the treatment descriptions using the API
	// Filter out the description IDs to only include what is needed.
	// This mmight be able to simplified if API supports query by codes
	// and/or look for a way to combine the filtering.
 	this.setTreatmentDescriptions = function(treatmentTypes, that){
		var codelist = that.estimateTreatmentCodes; // List of codes to query descriptions.
		var allTreatments = {};
		var temp = {};
		
		// Build hash table with treatmentcode:id with count>0
		that.treatmentTypes.map(function (v, i, a) { 
			if(v.count>0){ 
				allTreatments[v.code] = v.treatmentTypeID;
			} 
		});

		// Get a list of unique treatment codes that are actually on the estimate report.items
		if (that.report && that.report.items.length){
			trees = that.report.items;
			for (x in trees){
				if (!temp[trees[x].treatmentTypeCode]){
					temp[trees[x].treatmentTypeCode] = allTreatments[trees[x].treatmentTypeCode];
					codelist.push(allTreatments[trees[x].treatmentTypeCode]);
				}
			}
		}

     	// Finally make rest call to get descriptions
		Rest.one('service_desc','treatmenttype').get({id:codelist.toString()}).then(function(descriptions){
			that.treatmentDescriptions = descriptions;
		});
  	}


	// if treatment codes exist, then use them,
	// else, use what is recommended for the tree 
	//		(but only the first year that is listed...
	//		ie. if there is a 2014 and a 2015, only use the 2014)  (#note1)
	//			EXCEPTION TO THIS RULE: if a 2015 filter is set and there is a 2015 reco, then use that..
	//			ie. disregard the "first year" rule if a different filter is set (#note2)
	// @return MIXED - If any trees were successful, return ARRAY of ID's that succeeded
	//				 - if error mixing trees from different sites, return "-1"
	this.addItems = function(trees, treatmentCodes, selectedFilters) {

		// dont let them add trees to a report that has a different siteID
		if(this.report.siteID && this.report.siteID!=this.siteID)
				return -1;

		if(!this.report.siteID) this.report.siteID=this.siteID;

		var addedTreeIDs=[], th, tree, that=this;
		this.updateSiteInfo();
		if(treatmentCodes && treatmentCodes.length>0){
			// for each tree, add each treatment type ID to it
			for(var i=0;i<trees.length;i++){
				_.each(treatmentCodes, function(tc) {
					tree=angular.copy(trees[i]);
					tree.treatmentTypeCode=tc;
					tree.price=that.getTreatmentPrice(tc, tree.dbhID);
					if(!tree.reportItemID) tree.reportItemID=nextItemID++;
					that.report.items.unshift(tree);
					addedTreeIDs.push(tree.treeID);
				});
			}
		}else{	//use what is recommended
			_.each(trees, function(t){
				// store the year of the item recomendation,
				// so if a different year comes up, we can disregard
				var recoYearUsed=false;

				// check to see which/if YEAR filters were used, and if one was used, then prefer that year
				if(selectedFilters){
					var lowestFilterYear=9999;
					_.each(selectedFilters, function(itm){
						if(itm.type=='year' && itm.id<lowestFilterYear){
							lowestFilterYear=itm.id;
						}
					})
				}

				_.each(t.history, function(th){
					tree=angular.copy(t);
					if(!th || !th.treatmentTypeID) return;

					// if a reco year has already been used, and doesnt match this one, then skip it (see #note1)
					if(recoYearUsed && th.year!=recoYearUsed) return;		

					// if there is a filter year, and it doesnt match this current tree item, 
					// then skip this item (see #note2)
					if(lowestFilterYear<9999 && lowestFilterYear!=th.year) return;

					recoYearUsed=th.year;							// record the year used 
					tree.treatmentTypeCode=th.treatmentTypeCode;
					tree.price=that.getTreatmentPrice(tree.treatmentTypeCode, tree.dbhID);
					if(!tree.reportItemID) tree.reportItemID=nextItemID++;
					that.report.items.unshift(tree);
					addedTreeIDs.push(tree.treeID);
				});
			});
		}
		return addedTreeIDs;
	}


	//Define function to get specific treatment price by ID
	this.getTreatmentPrice = function(treatmentTypeCode, dbhID){
		var found = _.find(this.treatmentPrices, function(itm){
				if(itm.dbhID==dbhID && itm.treatmentTypeCode==treatmentTypeCode) return true;
			});
		if(found) return found.price;
		return "0.00";
	}

	// total up items, services and grand total, and set on report obj	
	this.setGrandTotal = function(){
		var p,items_total=0, services_total=0;
		_.each(this.report.items, function(itm){
			if(itm.price) {
				p=Number(itm.price);
				items_total += p;
			}
		})

		_.each(this.report.services, function(itm){
			if( itm.price ){
				p=Number(itm.price*itm.quantity);
				services_total+=p;
			}
		})

		this.report.total={items:items_total, services:services_total, grand:(services_total+items_total)};
	}



	this.saveReport = function() {
		if(!this.report.siteID) this.report.siteID=this.siteID;
		this.getReportMd5(true);

		// if its a Restangular obj, then post it...
		if( this.report.post && typeof this.report.post === 'function' ) 
			return this.report.post();

		//else, its a new one
		var that=this;
		Rest.all('estimate').post(this.report).then(function(data){
			if(data && data.reportID) that.report.reportID = data.reportID;
			if(data.token) that.report.token=data.token;
			console.log("Report data returned: "+that.report.reportID);
			that.setReportLink();
		});

		this.loadRecent();
	}
	
	
	this.prepareReport = function(){
		console.dir(this.report)
		this.emailRpt.contact = this.report.contactEmail;
		this.emailRpt.messageFrom = "Admin Email here";
		this.emailRpt.subject = "Aplus Tree Estimate: "+this.report.name;
		this.emailRpt.message = "Hi "+this.report.contact+", A link with the estimate is below. Feel free to email or call if you have any questions.  When you're ready to go, click APPROVE at the bottom of the estimate. Aplus Tree Admin";
	}
	
	this.setReportLink=function(){
		var t=this.report.token || this.report.reportID
		this.report.reportLink='http://app.arborplus.com/#/estimate/'+t
	}

	// Grabs list of recent reports.. based on siteID or clientID.. else all
	this.loadRecent = _.throttle(function(){
		var opt={limit:20};
		var that=this;
		if(this.siteID) opt.siteID=this.siteID;
		else if(this.clientID) opt.clientID=this.clientID;
		Rest.all('estimate').getList(opt).then(
			function(data){
				that.recentReportList=data;
				$rootScope.$broadcast('onLoadRecent', data);
			});
	},1000);

	this.init();

}]);

