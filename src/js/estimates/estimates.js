var EstimatesListCtrl = app.controller('EstimatesListCtrl', 
['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper', '$timeout', 'FilterHelper',
function ($scope, $route, Api, $location, Auth, SortHelper, $timeout, FilterHelper) {
    'use strict';
    var s = window.ecs = $scope;
	var myStateID='estimates',
		estimates=[],  		// array of original estimates
		estFiltered=[],  		// filtered list of estimates sites... which s.displayedSites uses as its source
		filterTextTimeout,
		self = this,
    	columnMap = {
        	'total_price': 'number'
    	},
		colSortOrder = {
			total_price: 'desc'
		};
    s.displayedEstimates = [];
	s.data={}; //overwritten later
    s.checkedEstimates = {
        selectAll: false,
        ids: [],
        getSelected: function () {
            console.log('Get selected', this.ids);
            return this.ids;
        }
    };

  	this.fh = FilterHelper.fh();
	// group the filters. so that if a status and a name is specified, both must match
	// but if a name and email is specified, either can match
	var filterGroups=[['xuyz','reportID', 'name', 'siteName', 'sales_email'], ['status']];
	this.fh.setFilterGroups(filterGroups);

    s.salesUsers = undefined;

    // load and cache sales users
    var setSalesUsers = function(){
        s.salesUsers = [];

        Api.getSalesUsers().then(function(saleUsers){
            _.each(saleUsers, function(saleUser){
                var shortEmail = saleUser.email.substr(0, saleUser.email.indexOf('@'));

                s.salesUsers.push({id: saleUser.userID, email: saleUser.email, shortEmail: shortEmail});
            })
        })
    }

    // get from cache users data for report
    s.getSalesUsers = function(){
        if (!s.salesUsers){
            setSalesUsers();
        }
        return s.salesUsers;
    }

    // callback when sales_user was changed for estimate
    s.updateEstimate = function(rpt){
        var newSalesUser = _.findObj(s.salesUsers, 'id', rpt.sales_userID);
        if (newSalesUser){
            rpt.sales_email_short = newSalesUser.shortEmail;
            rpt.sales_email = newSalesUser.email;
        }

        Api.saveReport(rpt).then(function(data1){
            //What should we do here? May be display some user-friendly message, that report was updated?
        })
    }

    var init = function (cb) {
        var search = $location.search();
        cb = cb || angular.noop;
        Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
			var isCust=Auth.is('customer');
			_.each(data, function(d){
				d.origStatus=d.status;
				if(isCust && d.status=='sent') d.status='needs_approval';

				if(d.siteName && d.siteName.length>40) d.siteName_short=d.siteName.substr(0,40)+'...';
				else d.siteName_short=d.siteName

				if(d.name && d.name.length>40) d.name_short=d.name.substr(0,40)+'...';
				else d.name_short=d.name

				d.sales_email_short=d.sales_email;
				if(d.sales_email_short) d.sales_email_short=d.sales_email.split('@')[0];
			});
            estimates = estFiltered = data;
            self.sh = SortHelper.sh(estimates, '', columnMap, colSortOrder);
            s.displayedEstimates = estFiltered.slice(0, 49);
            cb();
        });
    };

    //we use this object as a 'singletone' property for delete-with-confirm-button directive
    //note, only one popover can be active on page
    s.activePopover = {elem:{}, itemID: undefined};

    //delete item method
    s.deleteCurrentItem = function () {
        if (!s.activePopover.itemID) return;
		var itemID=s.activePopover.itemID;
        Api.removeEstimateById(itemID).then(function () {
            if(false){ //TODO  if msg don't  indicates success,
                 s.setAlert("There was an error deleting the estimate.",{type:'d',time:5});
            }
             else {
                 s.setAlert('Property deleted successfully.',{type:'ok',time:5});
             }
        }, function err(){
            s.setAlert("Estimate can't be deleted, try again later.",{type:'d',time:5});
        });
        var obj=_.findObj(estimates, 'reportID', itemID);
        obj.delete=1;
        s.activePopover.elem.hide();
        delete s.activePopover.itemID;
    };

	// based on the filter, also change which date is actually shown in the list.
	// ie. if Sent is chosen, then date columb should be tstamp_sent

	s.setStatusFilter=function(status){
		if(status=='all')status='';
		if(status=='sent'||status=='completed'||status=='approved') {
            s.data.currentTstamp='tstamp_'+status;
			s.data.currentTstampHeader=status.substr(0,1).toUpperCase() + status.substr(1) + ' Date';
		}else{
			s.data.currentTstamp='tstamp_updated';
			s.data.currentTstampHeader='Last Updated';
		}
		self.fh.setFilter({status:status});
		applyFilter();
	}
    s.updateEstimateTime=function(e){
        var postObj={};
        postObj[s.data.currentTstamp]=e[s.data.currentTstamp];
        Api.updateEstimateTime(e.reportID,postObj).then(function(res){

        });
    }
    s.validateDate=function(data){
        if(data==null) return 'Enter a valid datetime'
        data=data.replace(' ','T')
        var date=new Date(data);
        if(date.getDate().toString()=='NaN') return 'Enter a valid datetime'
    }
	s.setReportStatus=function(rpt){
		// todo -- we need a way for calls like this to know if a api calle failed.
		// currently, both ok and fail, still calls the then()
		Api.setReportStatus(rpt.reportID, rpt.status).then(function(d){
			if(d=='Status updated'){
				d.origStatus=d.status;
				s.setAlert(d);
			}else{
				rpt.status=rpt.origStatus;
			}
		});
	}

	s.data = {
		// determine which statuses to show based on current status
		// @param s STRING - currennt status ID
		statuses:function(s){
			var o= [{id:'draft', txt:'DRAFT',selectable:true}, 
					{id:'sent', txt:'SENT',selectable:false}, 
					{id:'approved', txt:'APPROVED',selectable:true}, 
					{id:'completed', txt:'COMPLETED',selectable:true}, 
					{id:'paid', txt:'PAID',selectable:true}]
			if(s=='paid') return o.splice(4,1);			// if paid, only show COMPLETED and PAID
			else if(s=='sent' || s=='approved') return o.splice(1,3);		// sent = show SENT, APPROVED, COMPLETED
			else o.splice(1,1);							// if not sent, get rid of SENT

			if(s=='draft') o.splice(3);					// DRAFT, APPR, COMPL
			else if(s=='completed') return o.splice(2,2);		// COMPL,PAID
			return o;
		}
		,filterText: ''
		,getCount: function () {
			if (estFiltered && estFiltered.length) {
				return estFiltered.length;
			}
			return 0;
		}
		,currentTstamp:'tstamp_updated'		// based on what status were filtering for, we may be displaying/sorting
											// by different timestamp values in the list. For example, if were filtering by "sent"
											// then we should display "tstamp_sent", not "tstamp_updated"
		,currentTstampHeader:'Last Updated'
        ,tstampItems:[
            {viewValue:'Created',value:'tstamp_created'},
            {viewValue:'Updated',value:'tstamp_updated'},
            {viewValue:'Sent',value:'tstamp_sent'},
            {viewValue:'Approved',value:'tstamp_approved'},
            {viewValue:'Completed',value:'tstamp_completed'},
            {viewValue:'Paid',value:'tstamp_paid'}
        ]
	};

	s.sortDateCol=function(){
		s.sh.sortByColumn(s.data.currentTstamp);
	}
	s.getDateColHeader=function(){
		return s.data.currentTstampHeader;
	}
	s.getDateColClass=function(){
		return s.sh.columnClass(s.data.currentTstamp);
	}
    s.getTstampHeaderClass=function(){
       return _.findObj(s.data.tstampItems, 'value', s.data.currentTstamp).viewValue.toLowerCase();
    }

	s.sh = {
		sortByColumn: function (col) {
			applyFilter();
            self.sh.setData(estFiltered);
			estFiltered = self.sh.sortByColumn(col);
			s.displayedEstimates = estFiltered.slice(0, 49);
		},
		columnClass: function (col) {
			return self.sh.columnClass(col);
		},
		applySort: function () {

		//@@todo - we git a bug here when radio buttons are used
			//estFiltered = self.sh.makeSort(estFiltered);
		}
	};

    s.showMoreEstimates = function () {
        var count = s.displayedEstimates.length;
        if (count === estimates.length) {
            return;
        }

        var addon = estFiltered.slice(count, count + 50);
        s.displayedEstimates = s.displayedEstimates.concat(addon);
    };


	var clearFilter = function () {
		self.fh.setFilter({reportID:'', name:'', siteName:'', sales_email:'', status:''});
		estFiltered = estimates;
		s.sh.applySort();
		s.displayedEstimates = estFiltered.slice(0, 49);
	};

	var applyFilter = function () {
		estFiltered = self.fh.applyFilter(estimates);
		// without this line here, the filter gets messed up on the next filter execution
		if(!estFiltered.length) estFiltered=[{name_short:'No Results', reportID:'', siteName_short:'No Results', total_price:0, status:'none'}]
		s.sh.applySort();
		s.displayedEstimates = estFiltered.slice(0, 49);
	};

    s.reset = function(){
        //remove filter status on UI
        // there is a weird behavior of angular strap bs-radio component (view->model binding doesn't work),
        // so using jquery here
        $('#estimatesFilters').find('label').removeClass('active');
		clearFilter();

        //clear search box
        s.data.filterTextEntry = '';

        applyFilter();
    };

    s.isEstimateSelected = function (id) {
        return s.checkedEstimates.ids.indexOf(id) > -1;
    };

    s.toggleEstimateSelection = function (id) {
        var index = s.checkedEstimates.ids.indexOf(id);
        if (index > -1) {
            s.checkedEstimates.ids.splice(index, 1);
            s.checkedEstimates.selectAll = false;
        } else {
            s.checkedEstimates.ids.push(id);
            if (s.checkedEstimates.ids.length === estFiltered.length) {
                s.checkedEstimates.selectAll = true;
            }
        }
    };

    s.toggleAllEstimatesSelection = function (newVal) {
        newVal = newVal || !s.checkedEstimates.selectAll;
        if (!newVal) {
            s.checkedEstimates.selectAll = false;
            s.checkedEstimates.ids = [];
        } else {
            s.checkedEstimates.selecteAll = true;
            s.checkedEstimates.ids = _.pluck(estFiltered, 'reportID');
        }
    };

    s.duplicate = function (event) {
        event.preventDefault();
        event.stopPropagation();

        console.log('Duplicating reports with ids: ', s.checkedEstimates.ids.join(', '));
        // Make all duplicate requests and then reload estimates

        Api.duplicateReports(s.checkedEstimates.ids).then(function (data) {
			var msg='Duplicate OK',names=[];
			_.each(data, function(d){
			dbg(d);
				if(d.newName) names.push(d.newName);
			});
			if(names.length) msg+=': '+names.join(', ');
			s.setAlert(msg, {time:10});
            init(function () {
                applyFilter();
            });
        });
    };

    // when search box is changed, then update the filters, but
	// add delay so we dont over work the browser.
	s.$watch('data.filterTextEntry', function (txt, old) {
		if (filterTextTimeout) { $timeout.cancel(filterTextTimeout); }
		filterTextTimeout = $timeout(function () {
			if (txt === '' || !txt) {
				if(old){
					self.fh.setFilter({reportID:'', name:'', siteName:'', sales_email:''});
					applyFilter();
				}
			} else if (!isNaN(txt)) {
				// if search entry is a number, search by siteID and name
				self.fh.setFilter({reportID: txt, name: txt, siteName:txt});
				applyFilter();
			} else {
				// if just letters, then search by name and city, and sales person
				self.fh.setFilter({siteName: txt, name:txt, sales_email:txt});
				applyFilter();
			}
		}, 500);
	});


	init();
	s.$on('nav', function (e, data) {
		if (data.new === myStateID) init();
	});

}]);


