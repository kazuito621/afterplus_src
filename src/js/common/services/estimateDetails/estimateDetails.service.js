app
    .service('estimateDetailsService', [ '$rootScope', '$modal', 'Api', 'Restangular', function ($rootScope, $modal, Api, Rest) {
        scope = $rootScope.$new();
		  window.edss=scope;

        var detailsModal = {};

        defaultOptions = {
            'allowUnschedule' : false,
            'allowCalendar': false,
				'callback': false
        };

        scope.statuses = [
            {value:'completed', txt:'Completed'},
            {value:'invoiced', txt:'Invoiced'},
            {value:'paid', txt:'Paid'},
        ];

        scope.selectedDate = new Date();

        scope.foremenList = [];
		  scope.salesList = [];
        scope.treatmentCategories = [];

        var show = function (report, config) {
            scope.original_report = report;
            // var options
            var options = angular.extend({}, defaultOptions, config);
            scope.options = options;
            console.log(scope.options);

            // load report details
            opts = [];
            opts.getTreeDetails = 1;
            opts.getSummary = 1;
            opts.getDates = 1;
            Api.getReport(report.reportID,opts).then(function(data) {
                report = data;
                scope.report = report;

                loadSite(report.siteID);
                loadUsers();
                loadContacts();
                loadTreatmentCategories();
                prepareReportData(report);
                setupModalDatePickers(report);

                detailsModal = $modal({
                    scope: scope,
                    template: '/js/common/services/estimateDetails/estimateDetails.tpl.html',
                    show: false
                });

                scope.selectedWeekendWork = (data.work_weekend) ? data.work_weekend : 0;
                detailsModal.$promise.then(detailsModal.show);
            });
        };

        var loadSite = function(siteID) {
            Api.getSiteById(siteID, {}).then(function (site) {
                scope.site = site;
            });
        };

        var loadUsers = function (deferred) {
            // create email short for report foreman and sales
            scope.report.foreman_fullname = (scope.report.foreman_fullname != undefined) ? scope.report.foreman_fname + ' ' + scope.report.foreman_lname : null;
            scope.report.sales_fullname = (scope.report.sales_fullname != undefined) ? scope.report.sales_fname + ' ' + scope.report.sales_lname : null;

            if(!scope.foremenList.length){
					Api.getForemen().then(function (response) {
						scope.foremenList = processUsers(response);
					});
				}

            if(!scope.salesList.length){
					Api.getSalesUsers().then(function (response) {
						scope.salesList = processUsers(response);
						//if(deferred) deferred.resolve(scope.salesList);
					});
				}

        };

        var loadTreatmentCategories = function(siteID) {
            Api.getTreatmentCategories().then(function (data) {
                scope.treatmentCategories = data;
            });
        };

		 // process incoming user list, and setup text for firstname / last initial
		  var processUsers = function(users){
		  		out=[];
				if(!users) return ou;

          	angular.forEach(users, function (item) {
					var ini=''+item.lName;
					if(ini) ini=' ' + ini.substr(0,1);

					out.push({ 
						userID:item.userID, 
						text: item.fName+' '+item.lName,
						fName:item.fName,
						lName:item.lName,
						email: item.email
					});
          	});
				return out;
		  }

        var loadContacts = function() {
            Rest.one('site/'+scope.report.siteID+'/users?role=customer').get().then(function(res){
                if(!res){
                    var txt="<div class='estContacts'>"+scope.site.contact+"<br>"
                        +"<a href='mailto:"+scope.site.email+"' target=_new>"+scope.site.email+"</a><BR>"
                        +"Tel: "+scope.site.phone+"</div>";
                }else{
                    var txt='';
                    var ct=0;
                    _.each(res, function(r){
                        ct++; if(ct>3) return false;
                        txt += '<div class="estContacts">'+r.fName + ' ' + r.lName + '<br>'
                            +'<a href="mailto:'+r.email+'" target=_new>'+r.email+'</a><br>'
                            +'Tel: '+r.phone + '</div>';
                    });
                }
                scope.contacts=txt;
            });
        };

        var prepareReportData = function(report) {
            scope.summary = report.summary;
            console.log(scope.summary);
            scope.status = report.status;
            scope.jobdescription = report.price;
            scope.price = report.total_price.replace(",", "");
            if(report.todo_price == undefined) {
                report.todo_price = scope.price;
            }
            scope.todo_price = parseFloat(report.todo_price.replace(",", ""));
            scope.status = (report.status);
            if (!report.start) {
                report.start = moment(moment(report.job_start).format('YYYY-MM-DD HH:mm:ss'));
            }
            if (!report.end) {
                report.end = moment(moment(report.job_end).format('YYYY-MM-DD HH:mm:ss'));
            }
        };

        var setupModalDatePickers = function (report) {
            if (report.start && report.end) {
                if (report.start && report.end) {
                    scope.duration = moment.duration(report.end.diff(report.start)).asHours()/24;
                    scope.duration = Math.ceil(scope.duration);
                }
                scope.showWeekendWork = isDateSpanWeekend(report.start, report.end);
                scope.report_job_start_unix = report.start.format('X');
                scope.report_job_end_unix = report.end.format('X');
            }
        };

        /**
         * Check if two dates span a weekend.. ie.
         * 	Fri-Mon = TRUE
         * 	Wed-Mon = TRUE
         *		Sat-Mon = FALSE
         *		Fri-Sun = FALSE
         * @param date1 - momentJS object
         * @param date2 - momentJS object
         * @return BOOL
         */
        var isDateSpanWeekend = function (date1, date2) {
            if (!date1 || !date2) return false;
            if (typeof date1 != 'object') date1 = moment(date1);
            if (typeof date2 != 'object') date2 = moment(date2);
            if (date1 > date2) return false;

            // make sure date2 hours is late in the day so duration will round up
            if (date2.format('H') < 15) date2 = moment(date2.format('YYYY-MM-DD 23:59:59'))
            var duration = Math.floor(Math.abs(moment.duration(date1.diff(date2)).asHours() / 24));
            if (duration < 4) return false;
            if (duration > 9) return true;

            // if duration is between 5 and 9 days, then examine more carefully
            var d1 = date1.format('d');		// convert to day of week, 0=sun, 1=mon, etc
            var d2 = date2.format('d');

            // if 9 days, and only one (or none) start/end on weekend then true
            if (duration == 9) {
                if ((d1 != 0 && d1 != 6) || (d2 != 0 && d2 != 6)) return true;
                return false;
            }

            // if starts or ends on a weekend, then FALSE
            if ((d1 == 0 || d1 == 6) || (d2 == 0 || d2 == 6)) return false;
            return true;

        }

        scope.saveJobToForeman = function () {
            Api.changeEstimateProperty(scope.report.reportID, {
                job_userID: scope.report.job_userID
            }).then(function (response) {
                var newForeman = _.findObj(scope.foremenList, 'userID', scope.report.job_userID);
                scope.report.foreman_email=newForeman.email;
                scope.report.foreman_fname=newForeman.fName;
                scope.report.foreman_lname=newForeman.lName;
                scope.report.foreman_fullname=newForeman.fName + ' ' + newForeman.lName;
            	 scope.callback_syncData();
            });
        };

        scope.saveJobToSalesUser = function () {

            Api.changeEstimateProperty(scope.report.reportID, {
                sales_userID: scope.report.sales_userID
            }).then(function (response) {
                var newSalesman = _.findObj(scope.salesList, 'userID', scope.report.sales_userID);
                scope.report.sales_email=newSalesman.email;
                scope.report.sales_fname=newSalesman.fName;
                scope.report.sales_lname=newSalesman.lName;
                scope.report.sales_fullname=newSalesman.fName + ' ' + newSalesman.lName;
            	 scope.callback_syncData();
            });
        };

        /**
         * Note days... should start at 00:00:00 and end at 23:59:59
			* @param {string} type - if "days", then the number of days coutner changed, else an actual date changed
         */
        scope.onJobDateChange = function (type) {
            scope.dateValueChanged = true;

            scope.report_job_start_unix = this.report_job_start_unix;
            scope.report_job_end_unix = this.report_job_end_unix;
            scope.duration = this.duration;
				dbg("start unix:"+scope.report_job_start_unix +", end:"+scope.report_job_end_unix);

            //use the unix ... convert back
            scope.job_start = moment.unix(scope.report_job_start_unix).format('YYYY-MM-DD HH:mm:ss');

            //if start was set after end, reset end
            if (scope.job_start > scope.job_end) {
                scope.job_end = scope.job_start;
            }

            if (type == 'days') {
                var temp = moment(scope.job_start);

                scope.job_end = temp.add(scope.duration, 'days');

                scope.report_job_end_unix = scope.job_end.format('X');
                this.report_job_end_unix = scope.job_end.format('X');
					 	
					// subtract the timezone now...  WHY ?? cuz 3 things seem to be interpretting date differently
					// datepicker
					// calendar... how its displayed (ie. if
					// OK BUG HERE ANF MAJOR HACK... but no time to fix right now
					// ... with this hack below, it fixes so that START/END/DAYS will be correct, when days are changed
					// without it, .. even though i pick 2 days... the date might be 1/1 - 1/3
					// BUT WITH IT... IT CAUSES ANOTHER MINOR BUG...
					// in the calendar rendering, the event shows it being 1 day LESS than it should be 
					// ALTHOUGH the server is correct... (ie. if you refreshed it then it would be ok)
					// perhaps the convertLocalTime() func below could be a key to it, cuz thats who they soilved it in the
					// calendar.directive... but it didnt work..
					var localTz = new Date().getTimezoneOffset() * 60;
					this.report_job_end_unix -= localTz;
					this.report_job_end_unix -= 1; //cuz we want it 23:59:59

					 dbg('ebnd unix: ' +this.report_job_end_unix);
            } else if (scope.job_start) {
                scope.job_end = moment.unix(scope.report_job_end_unix).format('YYYY-MM-DD HH:mm:ss');
                var d = Math.ceil(moment.duration(moment(scope.job_end).diff(moment(scope.job_start))).asDays());
                scope.duration = d;
            }
        };


				// unused, but example for solving an issue in calendar directive
				var convertLocalTime = function (startMoment, endMoment) {
					 startMoment = startMoment.local();
					 if (endMoment != undefined && endMoment != null) {
						  endMoment = endMoment.local();
					 }
				}

        scope.saveJobDates = function () {
            // convert from unix back to iso
            scope.job_start = moment.unix(this.report_job_start_unix).format('YYYY-MM-DD HH:mm:ss');
            scope.job_end = moment.unix(this.report_job_end_unix).format('YYYY-MM-DD HH:mm:ss');

            Api.ScheduleJob(scope.report.reportID, {
                job_start: scope.job_start,
                job_end: scope.job_end,
            }).then(function (res) {
                if (res && res.conflict == 1 && res.conflict_msg) {
                    alert(res.conflict_msg);
                }

                scope.report.start = moment(scope.job_start);
                scope.report.end = moment(scope.job_end).add(1, 'seconds');

                scope.dateValueChanged = false;
                scope.showWeekendWork = isDateSpanWeekend(scope.job_start, scope.job_end);

                scope.report.job_start = moment(scope.job_start).format('YYYY-MM-DD HH:mm:ss');
                scope.report.job_end = moment(scope.job_end).format('YYYY-MM-DD HH:mm:ss');

                emitEvent('save_date')
            });

        };

        scope.weekendWorkChanged = function (weekendWorkID) {
            Api.changeEstimateProperty(scope.report.reportID, {
                work_weekend: weekendWorkID
            }).then(function (response) {
                scope.report.work_weekend = weekendWorkID;
            	scope.callback_syncData();
            });
        }

        // This is used so that after info is updated, the callback is called so that
		  // the object which initiated this popup, can know if info changed, and can update
		  // their local objects accordingly
        scope.callback_syncData = function( obj ){
            if(scope.options.callback) scope.options.callback( scope.report );
        }

        scope.updateStatus = function(s){
            Api.setReportStatus(scope.reportID, scope.report.status).then(function(d){
                scope.report.status  = scope.status;
                scope.setAlert(d);
            });
        };

        scope.unschedule = function() {
            Api.UnscheduledJob(scope.report.reportID, {}).then(function (res) {
                emitEvent('unschedule');
                detailsModal.$promise.then(detailsModal.hide);
            }).catch(function (res) {
            });
        };

        scope.addNewMultipleDates = function() {
            var newDate = {};

            if (scope.report.dates.length > 0) {
                newDate.job_start = moment(scope.report.dates[scope.report.dates.length - 1].job_start).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
                newDate.job_end = moment(scope.report.dates[scope.report.dates.length - 1].job_end).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
            } else {
                newDate.job_start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
                newDate.job_end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            }
            scope.report.dates.push(newDate);
        };

        scope.saveMultipleDates = function() {
            console.log(scope.report.dates);
            _.each(scope.report.dates, function (_date) {
                var params = {};
                params.crew_userIDs = _date.crew_userIDs;
                params.daylead_userID = _date.daylead_userID;
                params.treatmentCategoryIDs = _date.treatmentCategoryIDs;
                params.job_start = _date.job_start;
                params.job_end = _date.job_end;


                if (_date.workDateID != undefined) {
                    Api.updateWorkDate(scope.report.reportID, _date.workDateID, params);
                } else {
                    Api.createWorkDate(scope.report.reportID, params);
                }
            });
        };
        
        var emitEvent = function (event) {
            $rootScope.$emit('estimate.details.' + event, scope.report, scope.original_report);
        };

        var showModal = function (report, options) {
            return show(report, options);
        };

        return {
            showModal: showModal
        };
    }
    ])
    .directive('estimateDetail', function(estimateDetailsService) {

        return {
            restrict: 'A',
            replace: true,
            link: function postLink(scope, element, attr) {

                var report = scope.$eval(attr.estimateDetail)

                var options = {
                    'allowCalendar': scope.$eval(attr.allowCalendar) || false,
                    'allowUnschedule': scope.$eval(attr.allowUnschedule) || false,
						  'callback' : scope.$eval(attr.callback) || false
                };

                // Trigger
                element.bind('click', function() {
                    estimateDetailsService.showModal(report, options);
                });
            }
        };

    });
