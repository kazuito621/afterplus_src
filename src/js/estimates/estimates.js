/*
Todo for bulkd estimates

						// add Bulk SEND .... in rpeort
						// link to new bulk estimate status ?? in /go ... which is done ?
						// add status of SENT .. if somone opened it

*/

var EstimatesListCtrl = app.controller('EstimatesListCtrl',
  ['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper', '$timeout', 'FilterHelper', 'Restangular',
    function ($scope, $route, Api, $location, Auth, SortHelper, $timeout, FilterHelper, Rest) {
      'use strict';
      // Local vars initialization
      var s = window.ecs = $scope;
		s.pageVars={filter:{status:''}, searchText:''}				//todo later, store this into browser data for recall after refresh
      var totalPrice = 0;
      var myStateID = 'estimates',
        estimates = [], // array of original estimates
        estFiltered = [], // filtered list of estimates sites... which s.displayedSites uses as its source
        filterTextTimeout,
        self = this,
        columnMap = {
          'total_price': 'number',
          'reportID': 'number'
        },
        colSortOrder = {
          total_price: 'desc'
        };

      // group the filters, so that if 2 filters from different groups are specified, both MUST match
		// but if 2 filters from same group, then either one can match
		// ie. if a "status" AND a "name" are specified as filters... both must match.
      // 	 but if a "name" and "email" is specified, either can match
      var filterGroups = [['xuyz', 'reportID', 'name', 'siteName', 'sales_email', 'siteName', 'sales_fname', 'sales_lname', 'city'], ['status'], ['completed_perc']];

      // Scope vars initialization
      s.displayedEstimates = [];
      s.data = {}; //overwritten later
      s.checkedEstimates = {
        selectAll: false,
        ids: [],
        getSelected: function () {
          console.log('Get selected', this.ids);
          return this.ids;
        }
      };
      s.salesUsers = undefined;

      //we use this object as a 'singletone' property for delete-with-confirm-button directive
      //note, only one popover can be active on page
      s.activePopover = {elem: {}, itemID: undefined};

      s.data = {

        /**
         * Determine which status menu is available, based on what the current status is
         * @param s STRING - currennt status ID
         * @return ARRAY
         */
        statuses: function (s) {
          var o = [{id: 'draft', txt: 'DRAFT', selectable: true},
            {id: 'sent', txt: 'SENT', selectable: false},
            {id: 'approved', txt: 'APPROVED', selectable: true},
            {id: 'scheduled', txt: 'SCHEDULED', selectable: true},
            {id: 'completed', txt: 'COMPLETED', selectable: true},
            {id: 'invoiced', txt: 'INVOICED', selectable: true},
            {id: 'paid', txt: 'PAID', selectable: true}];

          switch (s) {
          case 'draft': // show DRAFT, ACTIVE/SENT, APPR
			 	o[1].txt='ACTIVE/SENT';
            return o.splice(0,3);

          case 'sent':
          case 'approved': // show SENT, APPROVED, COMPLETED
            return [o[1], o[2], o[4]];

          case 'scheduled': // show SCHEDULED, COMPLETED
            return o.splice(3, 2);

          case 'completed': // show COMPL, SEND INV, MARK AS INV, PAID
            o[5].txt = 'MARK AS INVOICED';
				o[3].id = 'uncomplete';
				o[3].txt = 'UN-COMPLETE'
            o.splice(5, 0, {id: 'send_invoice', txt: 'SEND INVOICE'});
            return o.splice(3, 5);

          case 'invoiced': // show COMPL, INV, RESEND INVOICE, PAID
            o.splice(5, 0, {id: 'send_invoice', txt: 'RE-SEND INVOICE'});
            return o.splice(4, 4);

          case 'paid':
            return o.splice(6, 1); // NONE
          }
          return o;
        },

        filterText: '',
        getCount: function () {
          if (estFiltered && estFiltered.length) {
            return estFiltered.length;
          }
          return 0;
        },
        currentTstamp: 'tstamp_updated', // based on what status were filtering for, we may be displaying/sorting
        // by different timestamp values in the list. For example, if were filtering by "sent"
        // then we should display "tstamp_sent", not "tstamp_updated"
        currentTstampHeader: 'Last Updated',
        tstampItems: [
          {viewValue: 'Created', value: 'tstamp_created'},
          {viewValue: 'Updated', value: 'tstamp_updated'},
          {viewValue: 'Sent', value: 'tstamp_sent'},
          {viewValue: 'Approved', value: 'tstamp_approved'},
          {viewValue: 'Start Date', value: 'job_start'},
          {viewValue: 'Completed', value: 'tstamp_completed'},
          {viewValue: 'Invoiced', value: 'tstamp_invoiced'},
          {viewValue: 'Paid', value: 'tstamp_paid'}
        ]
      };

      s.sh = {
        sortByColumn: function (col) {
          self.applyFilter();
          self.sh.setData(estFiltered);
          estFiltered = self.sh.sortByColumn(col);
          s.displayedEstimates = estFiltered.slice(0, 49);
			 filterBySearch();
        },
        columnClass: function (col) {
		  	if(self.sh) return self.sh.columnClass(col);
        },
        applySort: function () {
          //@@todo - we git a bug here when radio buttons are used
          //estFiltered = self.sh.makeSort(estFiltered);
        }
      };

      // Self vars initialization
      this.fh = FilterHelper.fh();
      this.fh.setFilterGroups(filterGroups);

      // Local methods

      // load and cache sales users
      var setSalesUsers = function () {
        s.salesUsers = [];

        Api.getSalesUsers().then(function (saleUsers) {
          _.each(saleUsers, function (saleUser) {
            var shortEmail = saleUser.email.substr(0, saleUser.email.indexOf('@'));

            s.salesUsers.push({id: saleUser.userID, email: saleUser.email, shortEmail: shortEmail});
          });
        });
      };

      var init = function (cb) {
        s.setAlert("Loading...", {time: 8});
        var search = $location.search();
        cb = cb || angular.noop;

        Api.getRecentReports({ timestamp:1 }).then(function (data) {
          var isCust = Auth.is('customer');
          _.each(data, function (d) {
            d.origStatus = d.status;
            if (isCust) {
              if (d.status === 'sent') {
                d.status = 'needs_approval';
              }

              if (d.status === 'invoiced') {
                d.status = 'payment_due';
              }
            }

            if (d.siteName && d.siteName.length > 40) {
              d.siteName_short = d.siteName.substr(0, 40) + '...';
            } else {
              d.siteName_short = d.siteName;
            }

            if (d.name && d.name.length > 40) {
              d.name_short = d.name.substr(0, 40) + '...';
            } else {
              d.name_short = d.name;
            }

            d.sales_email_short = d.sales_email;
            if (d.sales_email_short) {
              d.sales_email_short = d.sales_email.split('@')[0];
            }

            d.foreman_email_short = d.foreman_email;
            if (d.foreman_email_short) {
              d.foreman_email_short = d.foreman_email.split('@')[0];
            }

            if (d.status === 'invoiced') {
              var a = moment();
              var b = moment(d.tstamp_updated);
              d.pastDue = a.diff(b, 'days');
            }
          });

          estimates = estFiltered = data;
          self.sh = SortHelper.sh(estimates, '', columnMap, colSortOrder);
          s.displayedEstimates = estFiltered.slice(0, 49);
          cb();
          if (s.pageVars.searchText && s.pageVars.searchText.length > 1) {
            s.pageVars.searchText = ' ' + s.pageVars.searchText;
          }
          if (!s.data.salesForemanMode) {
            s.data.salesForemanMode = 'sales';
          }

			 getEstimateTotals();
        });

        if( Auth.isAtleast('inventory') ) 
				setInterval(function(){ getEstimateTotals(); }, 60000 );

			// check if query string ...
       	var search = $location.search().s;
			if(search){
				s.pageVars.searchText = search;
			}
      };


		var getEstimateTotals = function(){
        if (!Auth.isAtleast('inventory')) return;
			Rest.one('estimateTotals').get().then(function(r){
				if(!r || !r.approved) return;

				var itms='approved,scheduled,in_prog,completed,invoiced'.split(',');
				_.each(itms, function(itm){
					var itmVar = (itm=='in_prog') ? 'in_prog_todo' : itm;
					var clr = (itm=='approved' || itm=='completed') ? '#f33' : '#bbb';
					var el = $('label#'+itm+' span');
					if(!el || !el.attr) return;

					if(!el.attr('origText')) el.attr('origText', el.text());

					if(r[itmVar].count > 0)
						el.html( el.attr('origText') + ' <span style="color:'+clr+'">('+r[itmVar].count+')</span>' );
					else
						el.text( el.attr('origText') );

				});

				return;

				if(r.approved.count) $('label#approved span').text('Appr ('+r.approved.count+')')
				if(r.scheduled.count) $('label#scheduled span').text('Sched ('+r.scheduled.count+')')
				if(r.in_prog_todo.count) $('label#in_prog span').text('In Prog ('+r.in_prog_todo.count+')')
				if(r.completed.count) $('label#completed span').text('Done ('+r.completed.count+')')
				if(r.invoiced.count) $('label#invoiced span').text('Invoiced ('+r.invoiced.count+')')
			});

		}



      var clearFilter = function () {
        self.fh.setFilter({reportID: '', name: '', siteName: '', sales_email: '', status: ''});
        estFiltered = estimates;
        s.sh.applySort();
        s.displayedEstimates = estFiltered.slice(0, 49);
      };

      // actually change the status
      var _setReportStatus = function (rpt) {
        // todo -- we need a way for calls like this to know if a api calle failed.
        // currently, both ok and fail, still calls the then()
        Api.setReportStatus(rpt.reportID, rpt.status).then(function (d) {
          var m = (d && d.msg) ? d.msg : '';
          if ((!m || !m.match(/updated|reverted/i)) && rpt.prevStatus) {
            rpt.status = rpt.prevStatus;
          }
        });
      };

      // Self methods

      this.applyFilter = function () {
        estFiltered = self.fh.applyFilter(estimates);
        // without this line here, the filter gets messed up on the next filter execution
        if (!estFiltered.length) {
          estFiltered = [{
            name_short: 'No Results',
            reportID: '',
            siteName_short: 'No Results',
            total_price: 0,
            status: 'none'
          }];
        }
        s.sh.applySort();
        s.displayedEstimates = estFiltered.slice(0, 49);
      };

      // Scope methods

      // get from cache users data for report
      s.getSalesUsers = function () {
        if (!s.salesUsers) {
          setSalesUsers();
        }
        return s.salesUsers;
      };

      s.getFormanusers = function () {
        if (!Auth.isAtleast('inventory')) { return; }
        function setForemanUsers() {
          s.foremanUsers = [];
          Api.GetForemans().then(function (foremanUsers) {
            _.each(foremanUsers, function (foremanUser) {
              var shortEmail = foremanUser.email.substr(0, foremanUser.email.indexOf('@'));
              s.foremanUsers.push({id: foremanUser.userID, email: foremanUser.email, shortEmail: shortEmail});
            });
          });
        }

        if (!s.foremanUsers) {
          setForemanUsers();
        }
        return s.foremanUsers;
      };

      // callback when sales_user was changed for estimate
      s.updateEstimate = function (rpt) {

        if (rpt.foreman_userID) {
          rpt.job_userID = rpt.foreman_userID;
        }

        var dispObj = _.findObj(s.displayedEstimates, 'reportID', rpt.reportID);

        if (!dispObj) {
          dispObj = {};
        }

        var newSalesUser = _.findObj(s.salesUsers, 'id', rpt.sales_userID);
        if (newSalesUser) {
          console.debug(newSalesUser);
          dispObj.sales_email_short = rpt.sales_email_short = newSalesUser.shortEmail;
          dispObj.sales_email = rpt.sales_email = newSalesUser.email;
          dispObj.sales_userID = rpt.sales_userID;
        }

        var newForeman = _.findObj(s.foremanUsers, 'id', rpt.job_userID);
        if (newForeman) {
          dispObj.foreman_email_short = rpt.foreman_email_short = newForeman.shortEmail;
          dispObj.foreman_email = rpt.foreman_email = newForeman.email;
          dispObj.foreman_userID = rpt.job_userID;
        }

        Api.saveReport(rpt).then(function (res) {
          if (res && res.msg) {
            s.setStatus(res.msg, {time: 3});
          }
        });
      };

      //delete item method
      s.deleteCurrentItem = function () {
        if (!s.activePopover.itemID) { return; }
        var itemID = s.activePopover.itemID;

        Api.removeEstimateById(itemID).then(function (res) {
		  		if(res.reportID){
              	s.setAlert('Deleted: #'+res.reportID, {type:'ok',time:5});
        			var idx = _.findObj(estimates, 'reportID', res.reportID, true);
					if(idx){ 
						estimates.splice(idx,1);
					}
				}
        }, function err(){
            s.setAlert("Error 887 deleting estimate.",{type:'d',time:5});
        });
        var obj = _.findObj(estimates, 'reportID', itemID);
        obj.delete = 1;
        s.activePopover.elem.hide();
        delete s.activePopover.itemID;
      };



      // based on the filter, also change which date is actually shown in the list.
      // ie. if Sent is chosen, then date column should be tstamp_sent
      s.setStatusFilter = function (status) {
			s.data.currentTstamp = 'tstamp_updated';
			s.data.currentTstampHeader = 'Last Updated';

			if( 'all' === status ){
				s.pageVars.filter.status='';
				s.pageVars.filter.completed_perc='';
			}
			else if (status === 'sent' || status === 'completed' || status === 'approved') 
			{
				s.data.currentTstamp = 'tstamp_' + status;
				s.data.currentTstampHeader = status.substr(0, 1).toUpperCase() + status.substr(1) + ' Date';
				s.pageVars.filter.status=status;
				s.pageVars.filter.completed_perc='';
			} 
			else if( 'in_prog' === status )
			{
				s.data.currentTstamp = 'job_start';
				s.data.currentTstampHeader = 'Start Date';
				s.pageVars.filter={ completed_perc:{gt:0, lt:100}, status:'scheduled' };
			} 
			else if( 'scheduled' === status )
			{
				s.data.currentTstamp = 'job_start';
				s.data.currentTstampHeader = 'Start Date';
				s.pageVars.filter={ status:status, completed_perc:'0' };
			} 
			else 
			{
				s.pageVars.filter.status=status;
				s.pageVars.filter.completed_perc='';
			}

			self.fh.setFilter(s.pageVars.filter);
			self.applyFilter();
			filterBySearch();
      };

      s.updateEstimateTime = function (e) {
        var postObj = {};
        postObj[s.data.currentTstamp] = e[s.data.currentTstamp];
        Api.updateEstimateTime(e.reportID, postObj).then(function (res) {});
      };

      s.validateDate = function (data) {
        if (data === null) { return 'Enter a valid datetime'; }
        data = data.replace(' ', 'T');
        var date = new Date(data);
        if (date.getDate().toString() === 'NaN') { return 'Enter a valid datetime'; }
      };

      // do confirmation box if needed
      s.setReportStatus = function (rpt, prev) {
        rpt.prevStatus = prev;
        var st = rpt.status;

        // trigger SEND INVOICE directive if needed
        if (st === 'send_invoice') {
          $("#sendReportBtn_" + rpt.reportID).click();
          rpt.status = 'completed';
        } else {
          _setReportStatus(rpt);
        }
      };

      s.sortDateCol = function () {
        s.sh.sortByColumn(s.data.currentTstamp);
      };

      s.getDateColHeader = function () {
        return s.data.currentTstampHeader;
      };

      s.getDateColClass = function () {
        return s.sh.columnClass(s.data.currentTstamp);
      };

      s.getTstampHeaderClass = function () {
        return _.findObj(s.data.tstampItems, 'value', s.data.currentTstamp).viewValue.toLowerCase();
      };

      s.showMoreEstimates = function () {
        var count = s.displayedEstimates.length;
        if (count === estimates.length) {
          return;
        }

        var addon = estFiltered.slice(count, count + 50);
        s.displayedEstimates = s.displayedEstimates.concat(addon);
      };

      s.reset = function () {
        //remove filter status on UI
        // there is a weird behavior of angular strap bs-radio component (view->model binding doesn't work),
        // so using jquery here
        $('#estimatesFilters').find('label').removeClass('active');
        clearFilter();

        //clear search box
        s.pageVars.searchText = '';

        self.applyFilter();
        init();
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
          var msg = 'Duplicate OK', names = [];
          _.each(data, function (d) {
            dbg(d);
            if (d.newName) { names.push(d.newName); }
          });
          if (names.length) { msg += ': ' + names.join(', '); }
          s.setAlert(msg, {time: 10});
          init(function () {
            self.applyFilter();
          });
        });
      };

      s.displayedTotalPrice = function () {
			var list = estFiltered;
			var count = list.length;
      	if (count === estimates.length && totalPrice !== 0) {
          	return totalPrice;
        	}
        	totalPrice = 0;
		  	list.forEach(function(i){
          	totalPrice += parseInt(i.total_price, 10);
        	});
        return totalPrice;
      };

      s.onCustClickStatus = function (reportID, hashLink, status) {
        var path = (status === 'invoiced' || status === 'paid' || status === 'completed' || status === 'payment_due') ? 'invoice' : 'estimate';
        return $location.path('/' + path + '/' + hashLink);
      };

      // Initialization end
      // ============================================================

      // Watches

      // when search box is changed, then update the filters, but
      // add delay so we dont over work the browser.
		var filterBySearch = function(txt, old) {
			if(!txt) txt = s.pageVars.searchText;
			console.debug('filter search'  );
        	txt = (txt || '');
        	txt = txt.trim();
		  	if(!txt && !old) return;

			if(txt.substr(0,5)=='bulk:') txt=txt.substr(5);

        	if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        	filterTextTimeout = $timeout(function () {


				 if (txt === '' || !txt) {
					if (old) {
						s.pageVars.filter.reportID='';
						s.pageVars.filter.name='';
						s.pageVars.filter.siteName='';
						s.pageVars.filter.sales_email='';
						s.pageVars.filter.sales_fname='';
						s.pageVars.filter.sales_lname='';
						s.pageVars.filter.siteName='';
						s.pageVars.filter.city='';
					  	self.fh.setFilter(s.pageVars.filter);
					  	self.applyFilter();
					}
				 } else if (!isNaN(txt)) {
						// if search entry is a number, search by siteID and name, siteName
						s.pageVars.filter.reportID=txt;
						s.pageVars.filter.name=txt;
						s.pageVars.filter.siteName=txt;
						s.pageVars.filter.sales_email='';
						s.pageVars.filter.sales_fname='';
						s.pageVars.filter.sales_lname='';
						s.pageVars.filter.siteName='';
						s.pageVars.filter.city='';
					  	self.fh.setFilter(s.pageVars.filter);
					  	self.applyFilter();
				 } else {
						// if just letters, then search by name and city, and sales person
						s.pageVars.filter.reportID='';
						s.pageVars.filter.name='';
						s.pageVars.filter.siteName=txt;
						s.pageVars.filter.sales_email=txt;
						s.pageVars.filter.sales_fname=txt;
						s.pageVars.filter.sales_lname=txt;
						s.pageVars.filter.siteName=txt;
						s.pageVars.filter.city=txt;
					  	self.fh.setFilter(s.pageVars.filter);
					  	self.applyFilter();
				 }
        	}, 500);
      }

      s.$watch('pageVars.searchText', filterBySearch);

      s.$on('nav', function (e, data) {
        if (data.new === myStateID) { init(); }
      });

      // Run stuff
      s.getFormanusers();
      init();
    }]);


