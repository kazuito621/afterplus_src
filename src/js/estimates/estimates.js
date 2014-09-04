var EstimatesListCtrl = app.controller('EstimatesListCtrl', 
['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper', '$timeout', 'FilterHelper',
function ($scope, $route, Api, $location, Auth, SortHelper, $timeout, FilterHelper) {
    'use strict';
    var s = window.ecs = $scope;
	var myStateID='estimates',
		estimates=[],  		// array of original estimates
		estFiltered=[],  		// filtered list of estimates sites... which s.displayedSites uses as its source
		filters = {},
		filterTextTimeout,
		self = this,
    	columnMap = {
        	'total_price': 'number'
    	};
    s.displayedEstimates = [];
  	this.fh = FilterHelper.fh();

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
            self.sh = SortHelper.sh(estimates, '', columnMap);
            s.displayedEstimates = estFiltered.slice(0, 49);
        });
    };

	s.setStatusFilter=function(status){
		if(status && status!='all') filters.status=status;
		else delete filters.status;
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
		if (!filters || (_.objSize(filters) === 0)) { return; }
		filters = {};
		estFiltered = estimates;
		s.sh.applySort();
		s.displayedEstimates = estFiltered.slice(0, 49);
	};

	var applyFilter = function () {
		estFiltered = self.fh.applyFilter(estimates, filters);
		s.sh.applySort();
		s.displayedEstimates = estFiltered.slice(0, 49);
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
				filters = {reportID: txt, name: txt, siteName:txt};
				applyFilter();
			} else {
				// if just letters, then search by name and city, and sales person
				filters = {siteName: txt, name:txt, sales_email:txt, status:txt};
				applyFilter();
			}
		}, 500);
	});


	init();
	s.$on('nav', function (e, data) {
		if (data.new === myStateID) init();
	});

}]);


