function commaDigits(val){
	while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
}

angular.module('calendardirective', [])
.directive('calendar', function () {
    return {
        restrict: 'EA',
        replace: false,
        templateUrl: '/js/calendar/full_calendar_tpl.html',
        scope: {
            leftButtons: "@",
            rightButtons: "@",
            editablefullcalendar: "@",
            dropablefullcalendar: "@",
            eventfullcalendar: "@"
        },
        controller: function ($rootScope, $scope, $element, $attrs, Api, $location, $filter,$q) {
            var search = $location.search();

				window.fcs=$scope;
            $scope.UnscheduledJobs = [];
            $scope.ScheduledJobs = [];
            $scope.clickedEvent = {};
				$scope.filter_job_userID=-99;
				$scope.goalPerDay=(cfg && cfg.entity && cfg.entity.goal_per_day) ? cfg.entity.goal_per_day : 0;
				$scope.total={approved:0, scheduled:0, completed:0, invoiced:0, paid:0};
            $scope.weekendWork = false;
            $scope.weekends = [
                {id:'0',text:'No weekend work'},
                {id:'1',text:'Sat'},
                {id:'2',text:'Sun'},
                {id:'3',text:'Both'}
            ]
            var elm, 
					cal, 		// ref to calendar html obj
					uncheduledJobsBackUp;

           $scope.init = function(){
			  		$rootScope.$broadcast('alert', {msg:'Loading...', time:8});
               $scope.UnscheduledJobs = [];
               $scope.ScheduledJobs = [];
               $scope.clickedEvent = {};
               var apis=[];
               var deferred1 = $q.defer();
               var deferred2 = $q.defer();
               apis.push(deferred1.promise);
               apis.push(deferred2.promise);

               Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
                   deferred1.resolve(data)
               });
               $scope.loadGroups(deferred2);

               $q.all(apis)
                   .then(function(values) {
                       var data = values[0];
							  $scope.jobUsers=[{userID:-99, name:'All', count:0}, {userID:-98, name:'Unassigned', count:0}];
                       angular.forEach(data, function (field) {

									var obj=angular.copy(field);
									obj.estimateUrl=obj.url;
									delete obj.url;		//or else the calendar uses this as a link
									obj.name = (field.name) ? field.name.trim() : '(blank name)';
									obj.title=field.reportID+' - $'+shortenPrice(field.total_price)
											+' - '+userID2Name(field.job_userID)+' - '+ obj.name;
									obj.price=obj.total_price;

										// whats this? debug code?
                            if(field.reportID == '826'){
                                var a=1;
                            }
									obj.work_weekend=obj.work_weekend;

                           if( field.status=="approved"  ||  (field.status=="scheduled"  &&  field.job_start==undefined)) {
										obj.type='Unscheduled';
										$scope.UnscheduledJobs.push(obj);
                           }
                           else if(field.job_start)
									{
                               var sTime ;
                               var eTime ;
                               if(moment(field.job_start).format('h:mm:ss a') ==  "12:00:00 am")
                                   sTime =  moment(field.job_start).format('YYYY-MM-DD');
                               else 
                                   sTime =  moment(field.job_start).format('YYYY-MM-DD hh:mm:ss')

                               if(moment(field.job_end).format('h:mm:ss a') ==  "12:00:00 am")
                                   eTime =  moment(field.job_end).format('YYYY-MM-DD');
                               else 
                                   eTime =  moment(field.job_end).format('YYYY-MM-DD hh:mm:ss')

										obj.type='Scheduled';
										obj.start=sTime;
										obj.end=eTime;
										//obj.end=moment(eTime).add(1, 'days').format('YYYY-MM-DD');
                                if(field.reportID == '901') {
                                    var a=1;
                                }
                               $scope.ScheduledJobs.push(obj);
                           }

									// setup filtering
									if(obj.job_userID){
										var f=_.findObj($scope.jobUsers, 'userID', obj.job_userID);
										if(f) f.count++;
										else $scope.jobUsers.push({userID: obj.job_userID, name: userID2Name(obj.job_userID), count:1});
									}else{
										$scope.jobUsers[1].count++;	//unassigned
									}
									$scope.jobUsers[0].count++;		//all

                       });
                       uncheduledJobsBackUp = angular.copy($scope.UnscheduledJobs);

							  // get event data from sched or unsched array based on reportID or event name in title box
                   $scope.getEventInfo = function (eventName) {

								eventName=''+eventName;
								eventName=eventName.trim();

						 		if(!isNaN(eventName)){		// if its a number, its a reportID
									var rptID=eventName
								}else{
									// try to lookup by ID first
									var m=eventName.match(/([0-9]+)[ -]/);
									if(m) var rptID=m[1];
								}

                       var selectedEvent = null;
                       for (var index = 0; index <= $scope.UnscheduledJobs.length - 1; index++) {
                           var event = $scope.UnscheduledJobs[index];
                           if (event.reportID == rptID || event.title.trim() == eventName.trim()) {
                               selectedEvent = event;
                               break;
                           }
                       }
                       return selectedEvent;
                   }


                       var bindexternalevents = setTimeout(function () {
                           var externalevents = $(".fc-event");
                           externalevents.each(function () {
										 var reportID=$(this).attr('data-reportID');
                               var jobtitle = $(this).text();
                               var ev = $scope.getEventInfo(reportID);
										 var pr = (ev && ev.price) ? ev.price : 0;

                               $(this).data('event', {
										 	  reportID: (ev && ev.reportID) ? ev.reportID : '',
                                   title: jobtitle,     // use the element's text as the event title
                                   price: pr,
                                   stick: true            // maintain when user navigates (see docs on the renderEvent method)
                               });

                               // make the event draggable using jQuery UI
                               $(this).draggable({
                                   zIndex: 999,
                                   revert: true,               // will cause the event to go back to its
                                   revertDuration: 0          //  original position after the drag
                               });
                           });
                       }, 30);



                       elm = $element.find("#calendar");
                       window.cal = cal = elm.fullCalendar({
                           header: {
                               left: 'prev,next today',
                               center: 'title',
                               right: 'month,basicWeek'
                           },
                           //defaultDate: '2015-02-12',
                           dropAccept: '.drop-accpted',
                           editable: $scope.editablefullcalendar,     // Under calender events drag start on true and vice-versa.
                           droppable: $scope.dropablefullcalendar,
									eventLimit: true,
									views:{
										week:{ eventLimit:false }
									},
                           defaultTimedEventDuration: '04:00:00',
                           startEditable: true,
                           durationEditable: true,
                           events:  function(st, end, tz, callback){ 
											callback( filterJobs() );
									},
                           select: function (start, end) {
                               var title = prompt('Event Title:');
                               var eventData;
                               if (title) {
                                   eventData = {
                                       title: title,
                                       start: start,
                                       end: end
                                   };
                                   $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
                               }
                               $('#calendar').fullCalendar('unselect');
                           },
                           drop: function (el, eventStart, ev, ui) {		// jquery ui external drop call: http://fullcalendar.io/docs/dropping/drop/
										// without these here, the job detail box opens on drag
                               $('.fc-title br').remove();
                               //console.log(ev.helper[0].textContent);
                               // if so, remove the element from the "Draggable Events" list
                               $(this).remove();
                           },
                           eventReceive: function (event) {			// external drop callback
                               var ev = $scope.getEventInfo(event.title);
                               $scope.estimateid = ev.reportID;
                               var temp = angular.copy(event.start);
                               temp = temp.add(1,'days');
                               event.end = temp;
                               console.log("event:" + event.start.format('YYYY-MM-DD') + " $"+ev.price);
                               Api.ScheduleJob(ev.reportID, {
                                   job_start: event.start.format('YYYY-MM-DD'),
                                   job_end: temp.format('YYYY-MM-DD')
                               }).then(function (res) {
                                   if(res && res.conflict==1 && res.conflict_msg){
                                       alert(res.conflict_msg);
                                   }
                               });

                           },
									eventDragStop: function( event, jsEvent, ui, view ){
										setTimeout(function(){	updateTotals() },1000);
									},
                           updateEvent: function (event) {
                               console.log(event);
                           },
                           eventClick: function (data, jsEvent, view) {
                               $scope.openJob(data);
                           },
									dayClick: function( date, evt, view ){

										// check for double click
										var now=new Date().getTime();
										if(now - view.lastDayClick < 600){
											var v=elm.fullCalendar('getView');
											if(v.name=='basicWeek' || v.name=='agendaWeek')
												elm.fullCalendar('changeView', 'month');
											else
												elm.fullCalendar('changeView', 'basicWeek');
											elm.fullCalendar('gotoDate', date);
											return;
										}
										view.lastDayClick=now;

										// dislay daily total
										var tot=getDayTotal(date),diff;
										if(tot>0){
											niceTot = "$" + commaDigits(tot);
											var msg=date.format("dddd") + " the " + date.format("Do") + " = " + niceTot;
											var diff=Math.abs(Math.round($scope.goalPerDay-tot));
											var undOvr = (tot>$scope.goalPerDay) ? " over)" : " UNDER!)";
											var alType = (tot>$scope.goalPerDay) ? "ok" : "d";
											msg+=" ($"+diff+undOvr;
											$rootScope.$broadcast('alert', { msg:msg, time: 9, type: alType });
										}else{
											$rootScope.$broadcast('alert', { msg:'$0 Total! Give me some jobs!', time: 9, type: 'd' });
										}
									},
									//dayRender: function( date, cell ){
									//},
									viewRender: function( view, cal ){
										setTimeout(function(){
											if(!updateTotals()){
												setTimeout(function(){
													updateTotals();
												},2000);
											}
										},1000);
									},
                           eventRender: function (event, element, view) {
                               $('.fc-title br').remove();

                               /*WILL WORK ON IT LATER*/

//
                               // var box = $( "div.fc-bg" ).find("[data-date='"+event.start.format('YYYY-MM-DD')+"']");
                               ////var box = element.closest('table').find('th').eq(element.index())
                               //box.html('<h1 style="position: absolute;bottom: 2px">'+element.totalCost+'$</h1>');
                               element.addClass('clr-'+event.status);
                               if (event.title === "" || event.title === null) {
                                   var onMouseHoverJob = "angular.element(this).scope().onMouseHoverJob({0})".format(event.title);
                                   //element.css('background-color', '#77DD77');
                                   element.find(".fc-content").append('<a href="#"  style="float:right;margin-top:-15px;0" onmouseover="{0}">'
                                       .format(onMouseHoverJob) + '<i class="glyphicon glyphicon-exclamation-sign" style="color:red;" '
													+'title="No foreman assigned to this job"></i></a>');
                               }
                              if(event.status != 'scheduled'){
                                  event.editable = false;
                              }
                               //else {
                               //    //element.css('background-color', '#FFB347')
                               //}
                           },
                           eventResize: function (el, delta, revertFunc, jsEvent, ui, view) {
                               var html = $(view.el[0]).find(".fc-title").html();
                               html = html.replace("<br/>", "");
                               html = html.replace("<br>", "");
                               $(".fc-title").html(html);
                               if(el.reportID == undefined){
                                   var eventInfo=$scope.getEventInfo(el.title);
                                   el.reportID = eventInfo.reportID;
                               }
                               el.job_start = moment(el.start).format('YYYY-MM-DD HH:mm:ss');
                               el.job_end = moment(el.end).format('YYYY-MM-DD HH:mm:ss')
                               updateArray(el.reportID,moment(el.job_start).format('YYYY-MM-DD hh:mm:ss'),moment(el.job_end).format('YYYY-MM-DD hh:mm:ss'));
                               //$('#calendar').fullCalendar('updateEvent', event);

                               Api.ScheduleJob(el.reportID, {
                                   //job_start: t.format('YYYY-MM-DD'),
                                   job_start: moment(el.start).format('YYYY-MM-DD HH:mm:ss'),
                                   job_end: moment(el.end).format('YYYY-MM-DD HH:mm:ss')
                               }).then(function (res) {
                                   if(res && res.conflict==1 && res.conflict_msg){
                                       alert(res.conflict_msg);
                                   }
                               });
										setTimeout(function(){	updateTotals() },1000);
                           },
                           eventDrop: function (el, eventStart, revertFunc, jsEvent, ui, view) {
                               if(el.reportID == undefined){
                                   var eventInfo=$scope.getEventInfo(el.title);
                                   el.reportID = eventInfo.reportID;
                               }
                               var sTime, eTime;
                               sTime =  moment(el.start).format('YYYY-MM-DD HH:mm:ss');
                               if(el._allDay == false && el.end == undefined){
                                   el.end =  angular.copy(el.start);
                                   el.end.add(4, 'hours');
                                   eTime = moment(el.end).format('YYYY-MM-DD HH:mm:ss');
                               }
                               else if (el.end == undefined){
                                   el.end = moment(el.start).add(1,'days');
                                   eTime = el.end.format('YYYY-MM-DD HH:mm:ss');
                               }
                               else
                                   eTime = moment(el.end).format('YYYY-MM-DD HH:mm:ss');

                               Api.ScheduleJob(el.reportID, {
                                   job_start: sTime,
                                   job_end: eTime
                               }).then(function (res) {
                                   if(res && res.conflict==1 && res.conflict_msg){
                                       alert(res.conflict_msg);
                                   }
                               });
										setTimeout(function(){	updateTotals() },1000);
                           }

                       });
                   });

           }

			$scope.saveGoalPerDay = function(){
                Api.saveEntityInfo({goal_per_day:$scope.goalPerDay});
					 updateTotals();
			}

            $scope.onMouseHoverJob = function () {
                $("#tooltip").removeClass("hide").addClass("show");

            };

            $scope.onMouseLeaveJob = function () {
                $("#tooltip").removeClass("show").addClass("hide");
            };

            $scope.search = function (serhtxt) {
                $scope.UnscheduledJobs = [];
                if (serhtxt != null) {
                    $scope.job = [];
                    angular.forEach(uncheduledJobsBackUp, function (item) {
                        var titletxt = item.title;
                        if (titletxt !== undefined) {
                            if (
                                titletxt.toString().toLowerCase().indexOf(serhtxt.toString().toLowerCase()) >= 0 ||
                                item.siteName.toString().toLowerCase().indexOf(serhtxt.toString().toLowerCase()) >= 0 ||
                                item.reportID.toString().toLowerCase().indexOf(serhtxt.toString().toLowerCase()) >= 0
                            ) {
                                $scope.UnscheduledJobs.push(item);
                            }
                        }
                    });
                   /// $('#calendar').fullCalendar('addEventSource', $scope.job);
                }
                else {
                    $scope.UnscheduledJobs = uncheduledJobsBackUp;
                   // $('#calendar').fullCalendar('addEventSource', $scope.ScheduledJobs);
                }
            };

            $scope.bindJobData = function () {
                console.log("2nd");
                var externalevents = $element.find(".fc-event");
                console.log("externalevents" + externalevents[0]);
                externalevents.each(function () {
                    $(this).data('event', {
                        title: $.trim($(this).text()), // use the element's text as the event title
                        stick: true // maintain when user navigates (see docs on the renderEvent method)
                    });

                    // make the event draggable using jQuery UI
                    $(this).draggable({
                        zIndex: 999,
                        revert: true,      // will cause the event to go back to its
                        revertDuration: 0  //  original position after the drag
                    });
                });

            }

            $scope.open = function (siteID) {
                $scope.user = {
                    group: 1,
                    name: 'John Miclay' // original value
                };

                data.title = "List of foreman's"
                $('#assignjobtitle').html(data.title);
                //$('#assignjobbody').html(data.price);
                $('#jobassignforemanpopup').modal();
            };

            $scope.loadGroups = function (deferred) {

                Api.GetForemans()
					 .then(function (response) {
                    $scope.groups = [];
                    angular.forEach(response, function (item) {
                        if(item.userID == $scope.clickedEvent.job_userID){
                            $scope.job_user = { "userID": item.userID, "name": item.fName +' '+ item.lName };
                        }
                        if(item.userID == $scope.clickedEvent.sales_userID){
                            $scope.sales_user = { "userID": item.userID, "name": item.fName +' '+ item.lName };
                        }
                        $scope.groups.push({ "userID": item.userID, "text": item.fName +' '+ item.lName,"fName":item.fName });
                    });
                    if(deferred) deferred.resolve($scope.groups); //
                });
            };

            var userID2Name = function(job_userID){
					if(!job_userID) return 'n/a';
					if(-99 == job_userID) return 'All'; // for filters
                for(var i = 0;i<$scope.groups.length;i++){
                    if($scope.groups[i].userID == job_userID){
						  		if($scope.groups[i].email)
									return $scope.groups[i].replace(/@.*/,'');
								else
                        	return $scope.groups[i].fName;
                    }
                }
                return 'User '+job_userID;
            }
            $scope.init();
				//@@todo - update the counts in the dropdown! .. by knowing who was assigned before, and subtracting and adding
            $scope.savejobtoforeman = function () {
					var oldUserID=$scope.clickedEvent.job_userID;
					var newUserID=$scope.job_user.userID;
					$scope.job_user.name=userID2Name($scope.job_user.userID); 

					var job = _.find($scope.ScheduledJobs, 'reportID', $scope.clickedEvent.reportID);
					if(job) job.job_userID=newUserID;
					/*
					ok this makes no fucking sense to me... it seems that the schedulesjobs[] array 
					is different then the events[] array that gets passed in to calendar...
					so when the job user is set, we need to set on both....

					.. but i do set on both, but then when we refilter the users... 
					it doesnt fucking stick.

					*/

                Api.changeEstimateProperty($scope.clickedEvent.reportID, {
                    job_userID: $scope.job_user.userID
                }).then(function (response) {
							$scope.clickedEvent.job_userID = $scope.job_user.userID;

						  //@@todo .. duplicate code here! dont reassign the title again.. make a function for this WTF
                    $scope.clickedEvent.title = $scope.clickedEvent.name? $scope.clickedEvent.reportID+' - '
						  		+shortenPrice($scope.clickedEvent.price.replace(',',''))+' - '+userID2Name($scope.clickedEvent.job_userID)+' - '
								+ $scope.clickedEvent.name.trim() : "Nil";

// if we do this, we lose the data on the object when its reloaded. stupid fucking bug
//							updateFilter(oldUserID, newUserID);
                });
            };

            $scope.savejobtoSalesUser = function () {
				$scope.sales_user.name=userID2Name($scope.sales_user.userID);
                Api.changeEstimateProperty($scope.clickedEvent.reportID, {
                    sales_userID:  $scope.sales_user.userID
                }).then(function (response) {
                    console.log(response);
                    $scope.clickedEvent.sales_userID  = $scope.sales_user.userID;
                });
            };

            $scope.UnscheduledJob = function () {
                var id = $scope.clickedEvent._id
                Api.UnscheduledJob($scope.clickedEvent.reportID, {

                }).then(function (res) {
                    $scope.init();
                    elm.fullCalendar('removeEvents', id);
                }).catch(function(res){
                    $scope.init();
					 });

               $('#fullCalModal').modal('hide');
					setTimeout(function(){	updateTotals() },1000);
            };







				/** ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------

												JOB DETAILS MODAL BOX 
				
				   ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- */

            $scope.groups = [];
            var job_start_backup_value ;
            var job_end_backup_value ;
            var getValueBackup = function(data){
                job_start_backup_value = data.start;
                if(data.end==null){
                    var temp=angular.copy(data.start);
                    job_end_backup_value = temp.add(1, 'days');
                }
                else
                    job_end_backup_value = data.end;
            }
            $scope.saveJobDates = function(){
                Api.ScheduleJob($scope.clickedEvent.reportID, {
                    job_start: moment($scope.job_start).format('YYYY-MM-DD HH:mm:ss'),
                    job_end: moment($scope.job_end).format('YYYY-MM-DD HH:mm:ss')
                }).then(function (res) {
                    if(res && res.conflict==1 && res.conflict_msg){
                        alert(res.conflict_msg);
                    }
                   //$scope.clickedEvent.start = moment($scope.job_start).format('YYYY-MM-DD');
                   //$scope.clickedEvent.end =moment($scope.job_end).format('YYYY-MM-DD');
                    updateArray($scope.clickedEvent.reportID,moment($scope.job_start).format('YYYY-MM-DD'),moment($scope.job_end).format('YYYY-MM-DD'));
                    $scope.clickedEvent.start = $scope.job_start;
                    $scope.clickedEvent.end = $scope.job_end;
                    elm.fullCalendar('updateEvent', $scope.clickedEvent);
                    $scope.valueChanged = false;
                });

            }

            var prepareModal = function(event){
                $scope.weekendWork = false;
                if(event.start){
                    var duration = 1;
                    if(event.end){
                        duration = moment.duration(event.end.diff(event.start)).asDays();
                        //if(duration<4) return;
                        var day1, day2;
                        $scope.weekendWork = false;
                        //Th Fr Sa Sun No
                        if(event.reportID == '2478' ){
                            var a=1;
                        }
                        for(var i = 1;i<duration-2; i++){
                            var startDate = angular.copy(event.start);
                            var endDate = angular.copy(event.start);
                            day1 = startDate.add(i, 'days');
                            startDate = angular.copy(event.start);
                            day2 = startDate.add(i+1, 'days');
                            if(day1.format('dd') == 'Sa' && day2.format('dd') == 'Su'){
                                $scope.weekendWork = true;
                                break;
                            }
                        }
                    }
                }
            }

            $scope.openJob = function(data){
                if(data.reportID == undefined){
                    getValueBackup(data);
                    var tempId =  data._id;
                    data=$scope.getEventInfo(data.title);
                    data.start = job_start_backup_value;
                    data._start = job_start_backup_value;
                    data.end = job_end_backup_value;
                    data._end = job_end_backup_value;
                    data._id = tempId;
                }
                $scope.jobdescription = data.price;
                $scope.selectedWeekendWork = data.work_weekend;
                //$scope.$apply();
                $scope.clickedEvent = data;
                $('#modalTitle').html('<span style="font-size:1.5em; font-weight:bold;">'+data.reportID + " - " + data.name 
					 	+"</span> (<a href='#/trees?reportID="+data.reportID+"'>edit</a> | "
						+"<a href='"+data.estimateUrl+"' target=_new>view</a>)");
                console.log(data.price);
                //$('#modalBody').html("Price:" + data.price);

                $scope.price = data.price.replace(",", "");
					 $scope.status = data.status;

                prepareModal(data);
                $scope.siteID = data.siteID;
                $scope.sales_user = {  userID: -1, name:'' }
                $scope.job_user = {  userID: -1, name:'' }
						$scope.job_user.userID = data.job_userID || -1;
						$scope.sales_user.userID = data.sales_userID || -1;

                Api.getSiteById($scope.siteID, {}).
                    then(function (res) {
						  		// copy over string and numbers to $scope
						  		_.each(res, function(r, key){
									if( typeof r == 'string' || typeof r == 'number' )
										$scope[key]=r;
								});
								$scope.email=$scope.contactEmail;
								$scope.phone=$scope.contactPhone;

								if(data.start)
									$scope.job_start = data.start.format('YYYY-MM-DD');
								if(data.end)
									$scope.job_end = data.end.format('YYYY-MM-DD');
								if(data.start && data.end){
									$scope.duration = moment.duration(data.end.diff(data.start)).asDays();
									$scope.duration = Math.floor($scope.duration);
								}
//needed?
                        $scope.reportID = data.reportID;
                    });
                $scope.loadGroups();
                $('#fullCalModal').modal({backdrop:false});
            }

            $scope.weekendWorkChanged = function(weekendWorkID){
                Api.changeEstimateProperty($scope.clickedEvent.reportID, {
                    work_weekend:  weekendWorkID
                }).then(function (response) {
                    $scope.clickedEvent.work_weekend = weekendWorkID;
                });
            }

            $scope.onJobDateChange = function(type){
               // $scope.job_start =moment($scope.job_start).format('YYYY-MM-DD hh:mm:ss');
               // $scope.job_end = moment($scope.job_end).format('YYYY-MM-DD hh:mm:ss');
                $scope.valueChanged = true;
                if(typeof  $scope.job_start != 'object'){
                    $scope.job_start = moment($scope.job_start);
                }
                if( typeof $scope.job_end  != 'object'){
                    $scope.job_end = moment($scope.job_end);
                }

					 //if start was set after end, reset end
					 if( $scope.job_start > $scope.job_end ) $scope.job_end=$scope.job_start;

                if(type == 'days'){
                    var temp=angular.copy($scope.job_start);
                    $scope.job_end = temp.add($scope.duration, 'days');
                } else {
                	if($scope.job_start)
                 		var d = Math.round(moment.duration(moment($scope.job_end).diff(moment($scope.job_start))).asDays());
                 		$scope.duration = (d>0) ? d : 1;
                }
            }

            $scope.$watch('user.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { userID: $scope.user.group });
                    $scope.user.name = selected.length ? selected[0].text : null;
                }
            });

            $scope.$watch('sales_user.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { userID: $scope.sales_user.userID });
                    $scope.sales_user.name = selected.length ? selected[0].text : null;
                }
            });

            function shortenPrice($pr){
                if($pr<1000) return Math.round($pr);
                if($pr<10000) return  parseInt($pr).toString().substring(0, parseInt($pr).toString().length-3)+'k';
                return Math.floor(parseInt($pr)/1000)+"k";
            }


				//$scope.jobUserIDs=[{name:'xx', userID:123}];
				// when filter drop down is changed
				$scope.filterByJobUserID = function(){
					cal.fullCalendar('refetchEvents');
				}

				function updateFilter(oldUserID, newUserID){
				console.debug("up ::  "+oldUserID);
					$($("#foreman_filter option")).each(function(){
						if($(this).val()==oldUserID) $(this).text('xx');
					});

					return	;
					// angular method.. but needs to call apply...
					var idx=_.findObj($scope.jobUsers, 'userID', oldUserID, true);
					if(f) f.count--;
					var f=_.findObj($scope.jobUsers, 'userID', newUserID);
					if(f) f.count++;
				}

				// provides the events to the calendar, and filters
				// the array based on filter_job_userID
				function filterJobs(){
					var uid = $scope.filter_job_userID;
					if(uid==-99) return $scope.ScheduledJobs;
					var o=[];
					_.each($scope.ScheduledJobs, function(e){
						var show=false;
						if(uid==-98 && !e.job_userID) show=true;
						else if(e.job_userID == uid) show=true;
						if(show) o.push(e);
					});
					return o;
				}

				/** ========== PRICE CALCULATIONS PER DAY ============ **/

				function updateTotals(){
					updatePriceColors();
					updateTotalBoxes();
				}

				function updateTotalBoxes(){
					var t=0, st=$scope.total;
					st.approved=st.scheduled=st.completed=st.invoiced=st.paid=0;

					// approved
					_.each($scope.UnscheduledJobs, function(j){
						if( j.price ) st.approved+=parseFloat(j.price);
						else if( j.total_price) st.approved+=parseFloat(j.total_price);
					});

					var ev=cal.fullCalendar('clientEvents');
					_.each(ev, function(e){
						if(e.status && e.price){ 
							st[e.status]+=parseFloat(e.price);
						}
					});

					var stats=['approved','scheduled','completed','invoiced','paid'];
					_.each(stats, function(s){
						st[s]='$' + shortenPrice(st[s]);
						var c=$('.small-tag.'+s);
						if(c) c.text(s+' = '+st[s]);
					});
				}


				// change color of all calendar day box backgrounds, based on $ amount
				function updatePriceColors(){
					if(!cal || !cal.fullCalendar) return false;
					var view=cal.fullCalendar('getView');
					if(view.name=='month'){
						var t,dt,st=view.start;
						for( var d=moment(view.start); d.isBefore(view.end); d.add('days', 1) ){
							paintDay(d);
						}
					}
					
					// update today box
					/*
					var dt=moment().format('YYYY-MM-DD');
					var cell=$('td.fc-day-number[data-date="'+dt+'"]');
					cell.css('font-color', '#f33');
					*/

					return true;
				}

			
				function paintDay(date){
					var goal=$scope.goalPerDay;
					var t=getDayTotal(date);
					if(t===false) return;
					var warnLevel=-1;
					if(t < goal * .75) warnLevel=2;		//red less than 75% of goal
					else if(t < goal ) warnLevel=1;		//orng 75-100% of goal
					else if(t>=goal) warnLevel=0;			//green 100%

					if(warnLevel>=0){
						//				green			orgn       red
						var colors=['#a7f49f', '#fbc972', '#fbacac'];
						var clr = colors[warnLevel];
						var dt=date.format('YYYY-MM-DD');
					//	var cell=$('td[data-date="'+dt+'"]')
						var cell=$('td.fc-day-number[data-date="'+dt+'"]');
						if(cell) cell.css('background-color', clr);
					}
				}


				// get a total price for a given day
				function getDayTotal(today){
					if(!today) return false;
					if(!cal || !cal.fullCalendar) return false;
					var events=cal.fullCalendar('clientEvents');
					var mev=[];  // matched events
					var tot=0;
					_.each( events, function(e){
						if(!e.todo_price) e.todo_price=e.total_price;
						if(!e.todo_price){
                  	var ev = $scope.getEventInfo(e.reportID);
							if(ev.todo_price) e.todo_price=ev.todo_price;
							if(ev.total_price) e.todo_price=ev.total_price;
						}
						// check for jobs that span multiple days
						if( e.end
						    && e.start.isBefore(today,'day') 
							 && e.end.isAfter(today,'day')
						){
							var totalDays=e.end.diff(e.start,'days');
							var p=parseFloat(parseFloat(e.todo_price) / totalDays);
							// todo, check for work_weekend variable here...
							// if set, then check if job spans a weekend.. and if so,
							// dont include that in the totalDays when dividing
							tot+=p;
							mev.push(e);

						// job on single day
						}else if( e.start.isSame(today,'day')){ 
							tot+=parseFloat(e.todo_price);
							mev.push(e);
						}
						else{
						}
					});
					return Math.round(tot);
				}

            function updateArray(reportID,start,end){  // where star and end is not moment type object.
                for(var i= 0;i<$scope.ScheduledJobs.length;i++){
                    if($scope.ScheduledJobs[i].reportID == reportID){
                        $scope.ScheduledJobs[i].start = start;
                        $scope.ScheduledJobs[i].job_start = start;
                        $scope.ScheduledJobs[i].end = end;
                        $scope.ScheduledJobs[i].job_end = end;
                        break;
                    }
                }
                for(var i= 0;i<$scope.UnscheduledJobs.length;i++){
                    if($scope.UnscheduledJobs[i].reportID == reportID){
                        $scope.UnscheduledJobs[i].start = start;
                        $scope.UnscheduledJobs[i].job_start = start;
                        $scope.UnscheduledJobs[i].end = end;
                        $scope.UnscheduledJobs[i].job_end = end;
                        break;
                    }
                }
            }


        }


    }
});
