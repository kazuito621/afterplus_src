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

            $scope.UnscheduledJobs = [];
            $scope.ScheduledJobs = [];
            $scope.clickedEvent = {};
            var elm;
            var cal;
            var uncheduledJobsBackUp;
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
                                       "title": field.name? field.reportID+' - '+shortenPrice(field.total_price)+' - '+getFormaneName(field.job_userID)+' - '+ field.name.trim() : "Nil",
                                       "name": field.name? field.name.trim() : "Nil",
                                       "start": "2015-03-02",
                                       "price": "," + field.total_price,
                                       reportId: field.reportID,
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
                                       "title": field.name? field.reportID+' - '+shortenPrice(field.total_price)+' - '+getFormaneName(field.job_userID)+' - '+ field.name.trim() : "Nil",
                                       "start":sTime,
                                       "end": eTime,
                                       "name": field.name? field.name.trim() : "Nil",
                                       /*start: '2015-05-18',
                                        end: '2015-05-18',*/
                                       "type" : 'Scheduled',
                                       "price": "," + field.total_price,
                                       reportId: field.reportID,
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

                       var bindexternalevents = setTimeout(function () {
                           var externalevents = $(".fc-event");
                           externalevents.each(function () {
                               var jobtitle = $(this).text().split(",");

                               $(this).data('event', {
                                   title: jobtitle[0],     // use the element's text as the event title
                                   price: jobtitle[1],
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
                               $scope.estimateid = ev.reportId;
                               console.log("event" + event.start.format('YYYY-MM-DD'));
                               Api.ScheduleJob(ev.reportId, {
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
                               element.addClass('calendar-'+event.status);
                               if (event.title === "" || event.title === null) {
                                   var onMouseHoverJob = "angular.element(this).scope().onMouseHoverJob({0})".format(event.title);
                                   //element.css('background-color', '#77DD77');
                                   element.find(".fc-content").append('<a href="#"  style="float:right;margin-top:-15px;0" onmouseover="{0}">'
                                       .format(onMouseHoverJob) + '<i class="glyphicon glyphicon-exclamation-sign" style="color:red;" title="No foreman assigned to this job"></i></a>');
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
                               if(el.reportId == undefined){
                                   var eventInfo=$scope.getEventInfo(el.title);
                                   el.reportId = eventInfo.reportId;
                               }
                               Api.ScheduleJob(el.reportId, {
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
                               if(el.reportId == undefined){
                                   var eventInfo=$scope.getEventInfo(el.title);
                                   el.reportId = eventInfo.reportId;
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
                               Api.ScheduleJob(el.reportId, {
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
                                item.reportId.toString().toLowerCase().indexOf(serhtxt.toString().toLowerCase()) >= 0
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
                    groupName: 'John Miclay' // original value
                };

                data.title = "List of foreman's"
                $('#assignjobtitle').html(data.title);
                //$('#assignjobbody').html(data.price);
                $('#jobassignforemanpopup').modal();
            };

            $scope.loadGroups = function (deferred) {

                Api.GetForemans("staff", {

                }).then(function (response) {
                    $scope.groups = [];
                    angular.forEach(response, function (item) {
                        if(item.userID == $scope.clickedEvent.job_userID){
                            $scope.user = { "group": item.userID, "groupName": item.fName +' '+ item.lName };
                        }
                        if(item.userID == $scope.clickedEvent.sales_userID){
                            $scope.salesUser = { "group": item.userID, "salesUserName": item.fName +' '+ item.lName };
                        }
                        $scope.groups.push({ "id": item.userID, "text": item.fName +' '+ item.lName,"fName":item.fName });
                    });
                    if(deferred) deferred.resolve($scope.groups); //
                });
            };

            var getFormaneName = function(job_userID){
                for(var i = 0;i<$scope.groups.length;i++){
                    if($scope.groups[i].id == job_userID){
                        return $scope.groups[i].fName;
                    }
                }
                return 'N/A';
            }
            $scope.init();
            $scope.savejobtoforeman = function () {
                Api.AssignJobToForeman($scope.clickedEvent.reportId, {
                    job_userID: $scope.user.group
                }).then(function (response) {
                    console.log(response);
                    $scope.clickedEvent.job_userID  = $scope.user.group;
                });
            };
            $scope.savejobtoSalesUser = function () {
                Api.AssignJobToForeman($scope.clickedEvent.reportId, {
                    sales_userID: $scope.user.salesUser
                }).then(function (response) {
                    console.log(response);
                    $scope.clickedEvent.sales_userID  = $scope.salesUser.group;
                });
            };

            $scope.UnscheduledJob = function () {
                console.log($scope.clickedEvent);
                var id = $scope.clickedEvent._id
                Api.UnscheduledJob($scope.clickedEvent.reportId, {

                }).then(function () {
                    $('#fullCalModal').modal('hide');
                    $scope.init();
                    elm.fullCalendar('removeEvents', id);
                });
            };

            $scope.groups = [];
            $scope.openJob = function(data){
                if(data.reportId == undefined){
                    var tempId =  data._id;
                    data=$scope.getEventInfo(data.title);
                    data._id = tempId;
                }
                $scope.jobdescription = data.price;
                //$scope.$apply();
                $scope.clickedEvent = data;
                $('#modalTitle').html("<a href='#/trees?reportID="
                +data.reportId+"'>"+
                     '#'+data.reportId+' - '+data.name+
                "</a>");
                console.log(data.price);
                //$('#modalBody').html("Price:" + data.price);

                $scope.price = data.price.replace(",", "");


                $scope.siteID = data.siteid;
                Api.getSiteById($scope.siteID, {}).
                    then(function (response) {
                        $scope.siteName = response.siteName;
                        $scope.siteAddress = response.city;
                        $scope.city = response.city;
                        $scope.state = response.state;
                        $scope.zip = response.zip;
                        $scope.contact = response.contact;
                        $scope.email = response.contactEmail;
                        $scope.phone = response.contactPhone;
                    });
                $scope.user = {
                    group: -1,
                    groupName: '' // original value
                };
                $scope.salesUser = {
                    group: -1,
                    salesUserName: '' // original value
                };
                $scope.loadGroups();

                $('#fullCalModal').modal();
            }
            $scope.$watch('user.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { id: $scope.user.group });
                    $scope.user.groupName = selected.length ? selected[0].text : null;
                }
            });
            $scope.$watch('salesUser.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { id: $scope.salesUser.group });
                    $scope.salesUser.salesUserName = selected.length ? selected[0].text : null;
                }
            });

            function shortenPrice($pr){
                if($pr<1000) return $pr;
                if($pr<10000) return  $pr.substring(0, $pr.length-3)+'k';
                return Math.floor($pr/1000)+"k";
            }
        }


    }
});
