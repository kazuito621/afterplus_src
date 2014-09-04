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


	s.data = {
		filterText: '',
		getCount: function () {
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
			estFiltered = self.sh.makeSort(estFiltered);
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


