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
				$scope.goalPerDay=2000;
				$scope.total={approved:0, scheduled:0, completed:0, invoiced:0, paid:0}
            var elm, 
					cal, 		// ref to calendar html obj
					uncheduledJobsBackUp;
           $scope.init = function(){
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
                       angular.forEach(data, function (field) {
                           if( field.status=="approved"  ||  (field.status=="scheduled"  &&  field.job_start==undefined)) {
                               $scope.UnscheduledJobs.push(
                                   {
                                       "title": field.name? field.reportID+' - $'+shortenPrice(field.total_price)
														+' - '+userID2Name(field.job_userID)+' - '+ field.name.trim() : "Nil",
                                       "name": field.name? field.name.trim() : "Nil",
                                       "start": "2015-03-02",
                                       "price": field.total_price,
                                       reportID: field.reportID,
                                       "siteid": field.siteID,
                                       "status" : field.status,
                                       "type" : 'Unscheduled',
                                       "siteName" : field.siteName,
                                       "job_userID" : field.job_userID,
                                       "sales_userID" : field.sales_userID
                                   });
                           }
                           else if(field.job_start ){
                               var sTime ;
                               var eTime ;
                               if(moment(field.job_start).format('h:mm:ss a') ==  "12:00:00 am"){
                                   sTime =  moment(field.job_start).format('YYYY-MM-DD');
                               }
                               else {
                                   sTime =  moment(field.job_start).format('YYYY-MM-DD hh:mm:ss')
                               }
                               if(moment(field.job_end).format('h:mm:ss a') ==  "12:00:00 am"){
                                   eTime =  moment(field.job_end).format('YYYY-MM-DD');
                               }
                               else {
                                   eTime =  moment(field.job_end).format('YYYY-MM-DD hh:mm:ss')
                               }
                               $scope.ScheduledJobs.push(
                                   {
                                       "title": field.name? field.reportID+' - $'+shortenPrice(field.total_price)+' - '+userID2Name(field.job_userID)+' - '+ field.name.trim() : "Nil",
                                       "start":sTime,
                                       "end": eTime,
                                       "name": field.name? field.name.trim() : "Nil",
                                       /*start: '2015-05-18',
                                        end: '2015-05-18',*/
                                       "type" : 'Scheduled',
                                       "price": field.total_price,
                                       reportID: field.reportID,
                                       "siteid": field.siteID,
                                       "status" : field.status,
                                       "job_userID" : field.job_userID,
                                       "sales_userID" : field.sales_userID
                                   });
                           }

                       });
                       uncheduledJobsBackUp = $scope.UnscheduledJobs;
                       $scope.getEventInfo = function (eventName) {
                           var selectedEvent = null;
                           for (var index = 0; index <= $scope.UnscheduledJobs.length - 1; index++) {
                               var event = $scope.UnscheduledJobs[index];
                               if (event.title.trim() == eventName.trim()) {
                                   selectedEvent = event;
                                   break;
                               }
                           }
                           return selectedEvent;
                       }


                   $scope.getEventInfo = function (eventName) {
								// lookup by ID first
								var m=eventName.trim().match(/([0-9]+)[ -]/);
								if(m) var rptID=m[1];

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
                               var jobtitle = $(this).text();
                               var ev = $scope.getEventInfo(jobtitle);

                               $(this).data('event', {
                                   title: jobtitle,     // use the element's text as the event title
                                   price: ev.price,
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
                       cal = elm.fullCalendar({
                           header: {
                               left: 'prev,next today',
                               center: 'title',
                               right: 'month,agendaWeek,agendaDay'
                           },
                           //defaultDate: '2015-02-12',
                           dropAccept: '.drop-accpted',
                           editable: $scope.editablefullcalendar,     // Under calender events drag start on true and vice-versa.
                           droppable: $scope.dropablefullcalendar,
                           eventLimit: $scope.eventfullcalendar,
                           defaultTimedEventDuration: '04:00:00',
                           startEditable: true,
                           durationEditable: true,
                           events: $scope.ScheduledJobs,
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
                           drop: function (el, eventStart, ev, ui) {

                               $('.fc-title br').remove();

                               console.log(ev.helper[0].textContent);
                               //if ($('#drop-remove').is(':checked')) {
                               // if so, remove the element from the "Draggable Events" list
                               $(this).remove();
                               //}


                           },
                           eventReceive: function (event) {
                               var ev = $scope.getEventInfo(event.title);
                               $scope.estimateid = ev.reportID;
                               console.log("event:" + event.start.format('YYYY-MM-DD') + " $"+ev.price);
                               Api.ScheduleJob(ev.reportID, {
                                   job_start: event.start.format('YYYY-MM-DD'),
                                   job_end: event.start.format('YYYY-MM-DD')
                               }).then(function (res) {
                                   if(res && res.conflict==1 && res.conflict_msg){
                                       alert(res.conflict_msg);
                                   }
                               });

                           },
                           updateEvent: function (event) {
                               console.log(event);
                           },
                           eventClick: function (data, jsEvent, view) {
                               $scope.openJob(data);
                               // $('#fullCalModal').fadeIn();
                               //$("#eventContent").dialog({ modal: true, title: data.title, width: 350 });
                           },
									dayClick: function( date, evt, view ){
										var tot=getDayTotal(date),diff;
										if(tot>0){
											niceTot = "$" + commaDigits(tot);
											var msg=date.format("dddd") + " the " + date.format("Do") + " = " + niceTot;
											var diff=Math.abs(Math.round($scope.goalPerDay-tot));
											var undOvr = (tot>$scope.goalPerDay) ? " over)" : " UNDER!)";
											msg+=" ($"+diff+undOvr;
											$rootScope.$broadcast('alert', { msg:msg, time: 9, type: 'ok' });
										}
									},
									//dayRender: function( date, cell ){
									//},
									viewRender: function( view, cal ){
										//@@todo - tim ... calendar isnt ready on this call.. is there a better way?
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
                               //if(event.start){
                               //    if(element.totalCost == undefined) element.totalCost = 0;
                               //    var duration = 1;
                               //    var price = event.price.substring(event.price.indexOf(',')+1, event.price.length);
                               //    price = parseFloat(price);
                               //    if(event.end){
                               //        duration = moment.duration(event.end.diff(event.start)).asDays();
                               //        //element.totalCost+=event.price /duration;
                               //        //element.totalCost+=(price/duration).toFixed(2);
                               //        var currentDate = angular.copy(event.start);
                               //        for(var i = 0;i<duration; i++){
                               //            currentDate = currentDate.add(i, 'days');
                               //            var box = $( "div.fc-bg" ).find("[data-date='"+currentDate.format('YYYY-MM-DD')+"']");
                               //            if(box.totalCos)
                               //            box.totalCost+=(price/duration).toFixed(2);
                               //            box.html('<h1 style="position: absolute;bottom: 2px">'+box.totalCost+'$</h1>');
                               //        }
                               //    }
                               //    else {
                               //        element.totalCost+=price;
                               //    }
                               //}
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
                               //else if(event.status != 'scheduled'){
                               //    //element.css('background-color', 'grey')
                               //}
                               //else {
                               //    //element.css('background-color', '#FFB347')
                               //}
                           },
                           eventResize: function (el, delta, revertFunc, jsEvent, ui, view) {
                               console.log(el);
                               var html = $(view.el[0]).find(".fc-title").html();
                               html = html.replace("<br/>", "");
                               html = html.replace("<br>", "");
                               $(".fc-title").html(html);
                               if(el.reportID == undefined){
                                   var eventInfo=$scope.getEventInfo(el.title);
                                   el.reportID = eventInfo.reportID;
                               }
                               Api.ScheduleJob(el.reportID, {
                                   //job_start: t.format('YYYY-MM-DD'),
                                   job_start: moment(el.start).format('YYYY-MM-DD HH:mm:ss'),
                                   job_end: moment(el.end).format('YYYY-MM-DD HH:mm:ss')
                               }).then(function (res) {
                                   if(res && res.conflict==1 && res.conflict_msg){
                                       alert(res.conflict_msg);
                                   }
                               });

                           },
                           eventDrop: function (el, eventStart, revertFunc, jsEvent, ui, view) {
                               if(el.reportID == undefined){
                                   var eventInfo=$scope.getEventInfo(el.title);
                                   el.reportID = eventInfo.reportID;
                               }
                               var sTime;
                               var eTime;

                               sTime =  moment(el.start).format('YYYY-MM-DD HH:mm:ss');
                               if(el._allDay == false && el.end == undefined){
                                   el.end =  angular.copy(el.start);
                                   el.end.add(4, 'hours');
                                   eTime = moment(el.end).format('YYYY-MM-DD HH:mm:ss');
                               }
                               else if (el.end == undefined){
                                   eTime = sTime;
                               }
                               else {
                                   eTime = moment(el.end).format('YYYY-MM-DD HH:mm:ss');
                               }
                               Api.ScheduleJob(el.reportID, {
                                   job_start: sTime,
                                   job_end: eTime
                               }).then(function (res) {
                                   if(res && res.conflict==1 && res.conflict_msg){
                                       alert(res.conflict_msg);
                                   }
                               });
                           }

                       });
                   });

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

                Api.GetForemans("staff", {})
					 .then(function (response) {
                    $scope.groups = [];
                    angular.forEach(response, function (item) {
                        if(item.userID == $scope.clickedEvent.job_userID){
                            $scope.job_user = { "userID": item.userID, "name": item.fName +' '+ item.lName };
                        }
                        if(item.userID == $scope.clickedEvent.sales_userID){
                            $scope.sales_user = { "userID": item.userID, "name": item.fName +' '+ item.lName };
                        }
                        $scope.groups.push({ "id": item.userID, "text": item.fName +' '+ item.lName,"fName":item.fName });
                    });
                    if(deferred) deferred.resolve($scope.groups); //
                });
            };

            var userID2Name = function(job_userID){
                for(var i = 0;i<$scope.groups.length;i++){
                    if($scope.groups[i].id == job_userID){
                        return $scope.groups[i].fName;
                    }
                }
                return 'N/A';
            }
            $scope.init();
            $scope.savejobtoforeman = function () {
					$scope.job_user.name=userID2Name($scope.job_user.userID); 
                Api.AssignJobToForeman($scope.clickedEvent.reportID, {
                    job_userID: $scope.job_user.userID
                }).then(function (response) {
                    console.log(response);
                    $scope.clickedEvent.job_userID  = $scope.job_user.userID;
						  //@@todo .. duplicate code here! dont reassign the title again.. make a function for this WTF
                    $scope.clickedEvent.title = $scope.clickedEvent.name? $scope.clickedEvent.reportID+' - '
						  		+shortenPrice($scope.clickedEvent.price.replace(',',''))+' - '+userID2Name($scope.clickedEvent.job_userID)+' - '
								+ $scope.clickedEvent.name.trim() : "Nil",
                    elm.fullCalendar( 'refetchEvents');
                });
            };

            $scope.savejobtoSalesUser = function () {
						$scope.sales_user.name=userID2Name($scope.sales_user.userID); 
                Api.AssignJobToForeman($scope.clickedEvent.reportID, {
                    sales_userID:  $scope.sales_user.userID
                }).then(function (response) {
                    console.log(response);
                    $scope.clickedEvent.sales_userID  = $scope.sales_user.userID;
                });
            };

            $scope.UnscheduledJob = function () {
                console.log($scope.clickedEvent);
                var id = $scope.clickedEvent._id
                Api.UnscheduledJob($scope.clickedEvent.reportID, {

                }).then(function () {
                    $('#fullCalModal').modal('hide');
                    $scope.init();
                    elm.fullCalendar('removeEvents', id);
                });
            };

            $scope.groups = [];
            $scope.openJob = function(data){
                if(data.reportID == undefined){
                    var tempId =  data._id;
                    data=$scope.getEventInfo(data.title);
                    data._id = tempId;
                }
                $scope.jobdescription = data.price;
                //$scope.$apply();
                $scope.clickedEvent = data;
                $('#modalTitle').html('<span style="font-size:1.5em; font-weight:bold;">'+data.reportID + " - " + data.name 
					 	+"</span> (<a href='#/trees?reportID="+data.reportID+"'>link</a>)");
                console.log(data.price);
                //$('#modalBody').html("Price:" + data.price);

                $scope.price = data.price.replace(",", "");


                $scope.siteID = data.siteid;
                Api.getSiteById($scope.siteID, {}).
                    then(function (res) {
                        $scope.siteName = res.siteName;
                        $scope.street = res.street
                        $scope.city = res.city;
                        $scope.state = res.state;
                        $scope.zip = res.zip;
                        $scope.contact = res.contact;
                        $scope.email = res.contactEmail;
                        $scope.phone = res.contactPhone;
								$scope.job_start = res.job_start;
								$scope.job_end = res.job_end;
                    });
                $scope.job_user = {
                    userID: -1,
                    name: '' // original value
                };
                $scope.sales_user = {
                    userID: -1,
                    name: '' // original value
                };
                $scope.loadGroups();

                $('#fullCalModal').modal();
            }
            $scope.$watch('user.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { id: $scope.user.group });
                    $scope.user.name = selected.length ? selected[0].text : null;
                }
            });
            $scope.$watch('sales_user.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { id: $scope.sales_user.userID });
                    $scope.sales_user.name = selected.length ? selected[0].text : null;
                }
            });

            function shortenPrice($pr){
                if($pr<1000) return Math.round($pr);
                if($pr<10000) return  parseInt($pr).toString().substring(0, parseInt($pr).toString().length-3)+'k';
                return Math.floor(parseInt($pr)/1000)+"k";
            }



				/** ========== PRICE CALCULATIONS PER DAY ============ **/

				function updateTotals(){
					updatePriceColors();
					updateTotalBoxes();
				}

				function updateTotalBoxes(){
					// approved
					var t=0;
					_.each($scope.UnscheduledJobs, function(j){
						t+=parseFloat(j.price);
					});
					$scope.total.approved='$'+shortenPrice(t);

					var st=$scope.total;
					st.scheduled=st.completed=st.invoiced=st.paid=0;
					var ev=cal.fullCalendar('clientEvents');
					_.each(ev, function(e){
						if(e.status && e.price){ 
							st[e.status]+=parseFloat(e.price);
						}
					});
					st.scheduled='$' + shortenPrice(st.scheduled);
					st.completed='$' + shortenPrice(st.completed);
					st.invoiced='$' + shortenPrice(st.invoiced);
					st.paid='$' + shortenPrice(st.paid);
				}


				// change color of all calendar day box backgrounds, based on $ amount
				function updatePriceColors(){
					if(!cal || !cal.fullCalendar) return false;
					var view=cal.fullCalendar('getView');
					if(view.name=='month'){
						var t,dt,st=view.start;
						for( var d=view.start; d.isBefore(view.end); d.add('days', 1) ){
							paintDay(d);
						}
					}
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
						var colors=['#BBFAB4', '#FAF9B4', '#FCE6E6'];
						var clr = colors[warnLevel];
						var dt=date.format('YYYY-MM-DD');
						var cell=$('td[data-date="'+dt+'"')
						if(cell) cell.css('background-color', clr);
					}
				}


				// get a total price for a given day
				function getDayTotal(today){
					if(!today) return false;
					if(!cal || !cal.fullCalendar) return false;
					var events=cal.fullCalendar('clientEvents');
					console.debug(events.length);
					var mev=[];  // matched events
					var tot=0;
					_.each( events, function(e){

						if(!e.price) return;
						// check for jobs that span multiple days
						if( e.end
						    && e.start.isBefore(today,'day') 
							 && e.end.isAfter(today,'day')
						){
							var totalDays=e.end.diff(e.start,'days');
							var p=parseFloat(parseFloat(e.price) / totalDays);
							tot+=p;
							mev.push(e);

						// job on single day
						}else if( e.start.isSame(today,'day')){ 
						console.debug(e);
							tot+=parseFloat(e.price);
							mev.push(e);
						}
						else{
						}
					});
					return Math.round(tot);
				}


        }


    }
});
