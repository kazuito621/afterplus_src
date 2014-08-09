/**
	Service for handling Rest gateway for Reports (estimates and invoices)
	A service is global - so Tree Controller and add items to the report,
	and Report Controller can build a UI based on the data
**/
app.service('ReportService', 
	['Api', '$timeout', '$rootScope', 'md5', '$q', 'SiteModelUpdateService',
	function(Api, $timeout, $rootScope, md5, $q, SiteModelUpdateService) {
	// private properties
	var nextItemID=1

    var that=this;
	// public properties
	this.recentReportList;			// store the list of reports
	this.report={};					// the actual report object that is requested 
	this.grandTotal = 0.00;		// GrandTotal of item pricing, listed on report			
	this.lastReportMd5;
	this.emailRpt = {};
    this.groupedItems = [];

	this.init=function(){
		this.getBlankReport();
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
	}
	this.setClientID = function(ID) {
		this.clientID=ID;
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
		Api.getReport(reportID,opts)
			.then(function(data) {
				that.report=data;
				// renumber the ID's into lower numbers
				var localID=1;
				if(data.items){
					_.each(data.items, function(d){
						d.localTreeID=localID++;
					})
				}

                that.setGrandTotal();
                data.total = that.report.total;

				$rootScope.$broadcast('onLoadReport', data);

				// only needed during customer view... but if we're not sure.. then show them anyways
				var showTreatmentDesc=true;
				if($rootScope && $rootScope.renderPath && $rootScope.renderPath[0] != 'estimate' )
					showTreatmentDesc=false;
				if(showTreatmentDesc) that.setTreatmentDescriptions();

				$timeout(function(){
					that.getReportMd5(true);
				},500);
				deferred.resolve(data);
			});	
		return deferred.promise;
	}

	this.getReportMd5 = function(set){
		var items=_.extract(this, 'report.items');
		if( !items || !items.length ) return '';
		var str=JSON.stringify(items) + JSON.stringify(this.report.services)
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
		Api.updateSite(this.siteID)
			.then(function(data) {
				if(!data || !data.siteName) return;
				_.copyProps(data, that.report, 'siteName,contact,contactEmail,contactPhone,street,city,state');
			});	
		SiteModelUpdateService.setReportSiteModel(this.report);
	}

	// Get the treatment descriptions using the API
 	this.setTreatmentDescriptions = function(){
		var tc,tObj,codes=[];		// treatment type ID's
		_.each(this.report.items, function(itm){
			tc=itm.treatmentTypeCode;
			if(!tc) return;
			codes.push(tc);
		});
		codes=_.uniq(codes);

		Api.getTreatmentDesc(codes)
			.then(function(desc){
				$rootScope.$broadcast('onTreatmentDescriptions', desc);
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
		if(this.report.siteID && this.siteID && this.report.siteID!=this.siteID)
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

		var that=this;
		Api.saveReport(this.report)
			.then(function(data){
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
		Api.getRecentReports(opt)
			.then(function(data){
				that.recentReportList=data;
				$rootScope.$broadcast('onLoadRecent', data);
			});
	},1000);

        this.groupReportItems = function () {
//                console.log('about to group report items', that.report.items);
            var items = angular.copy(that.report.items);
            var res = [];
            var keys = [];

            var getTreatment = function (item) {
                return {
                    treatmentTypeCode: item.treatmentTypeCode,
                    price: item.price
                };
            };

            angular.forEach(items, function (item) {
                var index = keys.indexOf(item.treeID);
                if (index !== -1) { // another action for this tree
                    res[index].treatments.push(getTreatment(item));
                } else {
                    var i = angular.copy(item);
                    keys.push(i.treeID);
                    i.treatments = [];
                    i.treatments.push(getTreatment(item));
                    res.push(i);
                }
            });

//                console.log('after grouping', res);
//                console.log('report items initial after grouping', that.report.items);
            that.groupedItems = res;

            return res;
        };

        this.ungroupReportItems = function (groupedItems) {
            groupedItems = groupedItems || that.groupedItems;
//                console.log('about to ungroup report items', groupedItems);
            var items = angular.copy(groupedItems);
            var res = [];

            angular.forEach(items, function (item) {
                angular.forEach(item.treatments, function (treatment) {
                    var tmp = angular.copy(item);
                    delete tmp.treatments;

                    tmp.treatmentTypeCode = treatment.treatmentTypeCode;
                    tmp.price = treatment.price;

                    res.push(tmp);
                });
            });

//                console.log('Ungrouped items', res);

            return res;
        };

	this.init();

}]);

