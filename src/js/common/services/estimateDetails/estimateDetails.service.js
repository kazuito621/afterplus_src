app
    .service('estimateDetailsService', [ '$rootScope', '$modal', 'Api', 'Restangular', function ($rootScope, $modal, Api, Rest) {
        scope = $rootScope.$new();
		  window.edss=scope;

        var detailsModal = {};

        defaultOptions = {
            'allowUnschedule' : false,
            'allowCalendar': false
        };

        scope.statuses = [
            {value:'completed', txt:'Completed'},
            {value:'invoiced', txt:'Invoiced'},
            {value:'paid', txt:'Paid'},
        ];

        scope.selectedDate = new Date();

        scope.foremenList = [];
		  scope.salesList = [];

        var show = function (report, config) {
            // var options
            var options = angular.extend({}, defaultOptions, config);
            scope.options = options;
            console.log(scope.options);

            // load report details
            opts = [];
            opts.getTreeDetails = 1;
            opts.getSummary = 1;
            Api.getReport(report.reportID,opts).then(function(data) {
                report = data;
                scope.report = report;

                loadSite(report.siteID);
                loadUsers();
                loadContacts();
                prepareReportData(report);
                setupModalDatePickers(report);

                detailsModal = $modal({
                    scope: scope,
                    template: '/js/common/services/estimateDetails/estimateDetails.tpl.html',
                    show: false
                });

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
            scope.status = report.status;
            scope.jobdescription = report.price;
            scope.price = report.total_price.replace(",", "");
            if(report.todo_price == undefined) {
                report.todo_price = scope.price;
            }
            scope.todo_price = parseFloat(report.todo_price.replace(",", ""));
            scope.status = (report.status);
            if (!report.start) {
                report.start = moment(moment(report.job_start).format('YYYY-MM-DD 00:00:00'));
            }
            if (!report.end) {
                report.end = moment(moment(report.job_end).format('YYYY-MM-DD 00:00:00'));
            }
        };

        var setupModalDatePickers = function (report) {
            if (report.start && report.end) {
                if (report.start && report.end) {
                    scope.duration = moment.duration(report.end.diff(report.start)).asDays();
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
            var duration = Math.ceil(Math.abs(moment.duration(date1.diff(date2)).asHours() / 24));
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
                scope.report.foreman_email_short=newForeman.email.split('@')[0];
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
                scope.report.sales_email_short=newSalesman.email.split('@')[0];
            });
        };

        /**
         * Note days... should start at 00:00:00 and end at 23:59:59
         */
        scope.onJobDateChange = function (type) {
            scope.dateValueChanged = true;

            //
            scope.report_job_start_unix = this.report_job_start_unix;
            scope.report_job_end_unix = this.report_job_end_unix;
            scope.duration = this.duration;

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
            } else if (scope.job_start) {
                scope.job_end = moment.unix(scope.report_job_end_unix).format('YYYY-MM-DD HH:mm:ss');
                var d = Math.ceil(moment.duration(moment(scope.job_end).diff(moment(scope.job_start))).asDays());
                scope.duration = d;
            }
        };

        scope.saveJobDates = function () {
            // convert from unix back to iso
            scope.job_start = moment.unix(this.report_job_start_unix).format('YYYY-MM-DD HH:mm:ss');
            scope.job_end = moment.unix(this.report_job_end_unix).format('YYYY-MM-DD HH:mm:ss');

            Api.ScheduleJob(scope.report.reportID, {
                job_start: scope.job_start,
                job_end: scope.job_end
            }).then(function (res) {
                if (res && res.conflict == 1 && res.conflict_msg) {
                    alert(res.conflict_msg);
                }

                scope.report.start = moment(scope.job_start);
                scope.report.end = moment(scope.job_end).add(1, 'seconds');

                scope.dateValueChanged = false;
                scope.showWeekendWork = isDateSpanWeekend(scope.job_start, scope.job_end);

                emitEvent('save_date')
            });

        };

        scope.weekendWorkChanged = function (weekendWorkID) {
            Api.changeEstimateProperty(scope.report.reportID, {
                work_weekend: weekendWorkID
            }).then(function (response) {
                scope.report.work_weekend = weekendWorkID;
            });
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
        
        var emitEvent = function (event) {
            $rootScope.$emit('estimate.details.' + event, scope.report);
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
                    'allowUnschedule': scope.$eval(attr.allowUnschedule) || false
                };

                // Trigger
                element.bind('click', function() {
                    estimateDetailsService.showModal(report, options);
                });
            }
        };

    });
