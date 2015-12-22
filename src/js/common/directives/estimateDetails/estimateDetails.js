/**
 * Created by Imdadul Huq on 27-Oct-15.
 */

app.directive('estimateDetails',
    ['$modal','Api','Restangular', '$sce',
        function ($modal, Api, Rest, $sce) {
            'use strict';

            var linker = function (scope, el, attrs){
                var hideOnEscape = function(e){
                    if(e.keyCode === 27){
                        $(document).unbind('keyup', hideOnEscape);
								if(scope.modal && scope.modal.hide){
                        	scope.modal.hide();
								}else{
									console.debug('ERROR Hiding, scope.modal doesnt exist');
								} 
                    }
                };

                scope.statuses = [
                    {value:'completed', txt:'Completed'},
                    {value:'invoiced', txt:'Invoiced'},
                    {value:'paid', txt:'Paid'},
                ]
                scope.openJob = function(report){
                    scope.title = '';
                    scope.status = report.status;
                    scope.jobdescription = report.price;
                    scope.price = report.total_price.replace(",", "");
                    if(report.todo_price == undefined) report.todo_price = scope.price;
                    scope.todo_price = parseFloat(report.todo_price.replace(",", ""));
                    scope.status = (report.status);
                    scope.siteID = report.siteID;
						  scope.report=report;
						  var reportType=(report.status=='invoiced' || report.status=='paid') ? 'invoice' : 'estimate';
						  scope.pdfUrl = '/go/'+reportType+'/pdf/'+report.token;
                    Api.getSiteById(scope.siteID, {}).
                        then(function (res) {
                            scope.site = res;
                        });
                    loadGroups();
                }
                scope.groups = [];
                var loadGroups = function (deferred) {
                    if(scope.groups.length>0) return;
                    Api.GetForemans()
                        .then(function (response) {

                            angular.forEach(response, function (item) {
                                scope.groups.push({ "userID": item.userID, "text": item.email.split('@')[0],"fName":item.fName,lName:item.lName,email: item.email});
                            });
                            if(deferred) deferred.resolve(scope.groups); //
                        });
                };

                scope.savejobtoforeman = function () {
                    Api.changeEstimateProperty(scope.report.reportID, {
                        job_userID: scope.report.job_userID
                    }).then(function (response) {
                        var newForeman = _.findObj(scope.groups, 'userID', scope.report.job_userID);
                        scope.report.foreman_email=newForeman.email;
                        scope.report.foreman_fname=newForeman.fName;
                        scope.report.foreman_lname=newForeman.lName;
                        scope.report.foreman_email_short=newForeman.email.split('@')[0];
                    });
                };
                scope.savejobtoSalesUser = function () {

                    Api.changeEstimateProperty(scope.report.reportID, {
                        sales_userID: scope.report.sales_userID
                    }).then(function (response) {
                        var newSalesman = _.findObj(scope.groups, 'userID', scope.report.sales_userID);
                        scope.report.sales_email=newSalesman.email;
                        scope.report.sales_fname=newSalesman.fName;
                        scope.report.sales_lname=newSalesman.lName;
                        scope.report.sales_email_short=newSalesman.email.split('@')[0];
                    });
                };
                function shortenPrice($pr){
                    if($pr<1000) return Math.round($pr);
                    if($pr<10000) return  parseInt($pr).toString().substring(0, parseInt($pr).toString().length-3)+'k';
                    return Math.floor(parseInt($pr)/1000)+"k";
                }
                scope.updateStatus = function(s){
                    Api.setReportStatus(scope.reportID, scope.report.status).then(function(d){
                        scope.report.status  = scope.status;
                        scope.setAlert(d);
                        //updateJobStatus(scope.reportID,{status:scope.status});
                        //scope.clickedEvent.status = scope.status
                        //elm.fullCalendar('updateEvent', scope.clickedEvent);
                    });
                }
                /*scope.weekendWorkChanged = function(weekendWorkID){
                    Api.changeEstimateProperty(scope.clickedEvent.reportID, {
                        work_weekend:  weekendWorkID
                    }).then(function (response) {
                        //scope.clickedEvent.work_weekend = weekendWorkID;
                    });
                }*/
               //scope.UnscheduledJob = function () {
               //    Api.UnscheduledJob(scope.report.reportID, {

               //    }).then(function (res) {

               //    }).catch(function(res){

               //    });

               //    //$('#fullCalModal').modal('hide');
               //    //setTimeout(function(){	updateTotals() },1000);
               //};

                //var setupModalDatePickers = function(event){
                //    scope.showWeekendWork = isDateSpanWeekend(event.start, event.end);
                //    scope.job_start_unix=event.start.format('X');
                //    scope.job_end_unix=event.end.format('X')-1; // Because fullCallendar always gives the next day which is 12.00.00 AM,
                //    // so have subtract  1s to get 11:59:59 of prev date.
                //}
                var modal ;
                $(el).click(function () {
                    scope.report = scope.$eval(attrs.estimateDetails);
                    scope.reportID=scope.report.reportID;
                    if (modal && typeof modal.hide === 'function') {
                        modal.hide();
                    }
                    scope.openJob(scope.report);
                    // create new one
                    if(!modal)
                        modal = $modal({scope: scope, template: '/js/common/directives/estimateDetails/estimateDetails.tpl.html', show: false});

                    //show popover
                    modal.$promise.then(function () {
                        modal.show();
                        $(document).keyup(hideOnEscape);
                    });


						// load contacts
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
                });

            };


            return {
                restrict: 'EA',
                replace: false,
                scope: true,
                compile: function () {
                    return linker;
                }
            };
        }]);
