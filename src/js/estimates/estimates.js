var EstimatesListCtrl = app.controller('EstimatesListCtrl', 
['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper', '$timeout', 'FilterHelper',
function ($scope, $route, Api, $location, Auth, SortHelper, $timeout, FilterHelper) {
    'use strict';
    var s = window.ecs = $scope;
	var myStateID='estimates',
		estimates=[],  		// array of original estimates
		estFiltered=[],  		// filtered list of estimates sites... which s.displayedSites uses as its source
		filterTextTimeout,

		// group the filters. so that if a status and a name is specified, both must match
		// but if a name and email is specified, either can match
		filterGroups=[['reportID', 'name', 'siteName', 'sales_email'], ['status']], 
		self = this,
    	columnMap = {
        	'total_price': 'number'
    	},
		colSortOrder = {
			total_price: 'desc'
		};
    s.displayedEstimates = [];
  	this.fh = FilterHelper.fh();
	this.fh.setFilterGroups(filterGroups);

    var init = function () {
        var search = $location.search();
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
			$("table#estimatesList tr#item_"+itemID).hide();
			var idx=_.findObj(estimates, 'reportID', itemID, true);
			if(idx>=0) estimates.splice(idx, 1);
        }, function err(){
            s.setAlert("Estimate can't be deleted, try again later.",{type:'d',time:5});
        });
        s.activePopover.elem.hide();
        delete s.activePopover.itemID;
    };

	s.setStatusFilter=function(status){
		if(status=='all') status='';
		self.fh.setFilter({status:status});
		applyFilter();
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
	};



    s.sh = {
        sortByColumn: function (col) {
            estimates = self.sh.sortByColumn(col);
            s.displayedEstimates = estimates.slice(0, s.displayedEstimates.length);
        },
        columnClass: function (col) {
            return self.sh.columnClass(col);
        }
    };

	s.sh = {
		sortByColumn: function (col) {
			applyFilter();
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

        var addon = estimates.slice(count, count + 50);
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
    }

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


