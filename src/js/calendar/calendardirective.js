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
            eventfullcalendar: "@",


        },
        controller: function ($rootScope, $scope, $element, $attrs, Api, $location, $filter) {
            var search = $location.search();

            $scope.UnscheduledJobs = [];
            $scope.ScheduledJobs = [];
            $scope.clickedEvent = {};
            var elm;
            var cal;
           $scope.init = function(){
               $scope.UnscheduledJobs = [];
               $scope.ScheduledJobs = [];
               $scope.clickedEvent = {};

               Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
                   angular.forEach(data, function (field) {
                       if( field.status=="approved"  ||  (field.status=="scheduled"  &&  field.job_start==undefined)) {
                           $scope.UnscheduledJobs.push(
                               {
                                   "title": field.name? field.name.trim() : "Nil",
                                   "start": "2015-03-02",
                                   "price": "," + field.total_price,
                                   reportId: field.reportID,
                                   "siteid": field.siteID,
                                   "status" : field.status
                               });
                       }
                       else if(field.job_start ){
                           $scope.ScheduledJobs.push(
                               {
                                   "title": field.name? field.name.trim() : "Nil",
                                   "start": field.job_start,
                                   "end": field.job_end,
                                   "price": "," + field.total_price,
                                   reportId: field.reportID,
                                   "siteid": field.siteID,
                                   "status" : field.status
                               });
                       }

                   });

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
                           right: 'month,agendaWeek,agendaDay',
                       },
                       //defaultDate: '2015-02-12',
                       dropAccept: '.drop-accpted',
                       editable: $scope.editablefullcalendar,     // Under calender events drag start on true and vice-versa.
                       droppable: $scope.dropablefullcalendar,
                       eventLimit: $scope.eventfullcalendar,
                       startEditable: true,
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
                           }).then(function () {
                               //$scope.setAlert('Loading Trees', { busy: true, time: "false" });
                           });

                       },
                       updateEvent: function (event) {
                           console.log(event);
                       },
                       eventClick: function (data, jsEvent, view) {
                           if(data.reportId == undefined){
                               data=$scope.getEventInfo(data.title);
                           }
                           $scope.jobdescription = data.price;
                           $scope.$apply();
                           $scope.clickedEvent = data;
                           $('#modalTitle').html("Job Name:" + data.title);
                           console.log(data.price);
                           //$('#modalBody').html("Price:" + data.price);

                           $scope.price = data.price.replace(",", "");


                           $scope.siteID = data.siteid;
                           $scope.$apply(function () {
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
                                   group: 1,
                                   groupName: 'John Miclay' // original value
                               };
                           });

                           $('#fullCalModal').modal();
                           $('#fullCalModal').fadeIn();
                           //$("#eventContent").dialog({ modal: true, title: data.title, width: 350 });
                       },
                       eventRender: function (event, element, view) {
                           $('.fc-title br').remove();

                           if (event.title === "" || event.title === null) {
                               var onMouseHoverJob = "angular.element(this).scope().onMouseHoverJob({0})".format(event.title);
                               element.css('background-color', '#77DD77');
                               element.find(".fc-content").append('<a href="#"  style="float:right;margin-top:-15px;0" onmouseover="{0}">'.format(onMouseHoverJob) + '<i class="glyphicon glyphicon-exclamation-sign" style="color:red;" title="No foreman assigned to this job"></i></a>');
                           }
                           else if(event.status != 'scheduled'){
                               element.css('background-color', 'grey')
                           }
                           else {
                               element.css('background-color', '#FFB347')
                           }
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
                               job_start: el.start.format('YYYY-MM-DD'),
                               job_end: el.end.format('YYYY-MM-DD')
                           }).then(function (response) {
                               console.log(response);
                           });

                       },
                       eventDrop: function (el, eventStart, ev, ui) {
                           // var eventInfo=$scope.getEventInfo(event.title)
                           if(el.reportId == undefined){
                               var eventInfo=$scope.getEventInfo(el.title);
                               el.reportId = eventInfo.reportId;
                           }
                           var t= angular.copy(el.start);
                           t.add(-eventStart._days,'days');

                           Api.ScheduleJob(el.reportId, {
                               //job_start: t.format('YYYY-MM-DD'),
                               job_start: el.start.format('YYYY-MM-DD'),
                               job_end: el.end==null?el.start.format('YYYY-MM-DD'):el.end.format('YYYY-MM-DD')
                           }).then(function (response) {
                               console.log(response);
                           });
                       }

                   });

               });
           }

            $scope.init();

            $scope.onMouseHoverJob = function () {
                $("#tooltip").removeClass("hide").addClass("show");

            };

            $scope.onMouseLeaveJob = function () {
                $("#tooltip").removeClass("show").addClass("hide");
            };

            $scope.search = function (serhtxt) {
                if (serhtxt != null) {
                    $scope.job = [];
                    angular.forEach($scope.ScheduledJobs, function (item) {
                        var titletxt = item.title;
                        if (titletxt !== undefined) {
                            if (titletxt.toString().toLowerCase().indexOf(serhtxt.toString().toLowerCase()) >= 0) {
                                $("#eventwrapper").fadeIn();
                                $('#calendar').fullCalendar('removeEvents');
                                $scope.job.push(item);

                            }
                        }
                    });
                    $('#calendar').fullCalendar('addEventSource', $scope.job);
                }
                else {
                    $('#calendar').fullCalendar('addEventSource', $scope.ScheduledJobs);
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
                //$scope.foremans = [
                //   {
                //       foremanid:1,
                //       foremanname: 'John Miclay'

                //   },
                //   {
                //       foremanid: 2,
                //       foremanname: 'Ruby Johanson'
                //   },
                //   {
                //       foremanid: 3,
                //       foremanname: 'Matrick Dusak'
                //   }];

                data.title = "List of foreman's"
                $('#assignjobtitle').html(data.title);
                //$('#assignjobbody').html(data.price);
                $('#jobassignforemanpopup').modal();

            };

            $scope.loadGroups = function () {

                Api.GetForemans("staff", {

                }).then(function (response) {
                    $scope.groups = [];
                    angular.forEach(response, function (item) {
                        $scope.groups.push({ "id": item.userID, "text": item.fName + item.lName })
                    });

                });

                //$scope.groups = [
                //  {
                //      id: 1,
                //      text: 'John Miclay'

                //  },
                //  {
                //      id: 2,
                //      text: 'Ruby Johanson'
                //  },
                //  {
                //      id: 3,
                //      text: 'Matrick Dusak'
                //  }];
            };

            $scope.savejobtoforeman = function () {
                alert($scope.estimateid);
                Api.AssignJobToForeman($scope.estimateid, {
                    job_userID: $scope.user.group
                }).then(function (response) {
                    console.log(response);
                });
            };

            $scope.UnscheduledJob = function () {
                console.log($scope.clickedEvent);
                var id = $scope.clickedEvent._id
                Api.UnscheduledJob($scope.clickedEvent.reportId, {

                }).then(function () {
                    $('#fullCalModal').fadeOut();
                    $scope.init();
                    elm.fullCalendar('removeEvents', id);
                });
            };

            $scope.user = {
                group: 4,
                groupName: 'admin' // original value
            };

            $scope.groups = [];

            $scope.$watch('user.group', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    var selected = $filter('filter')($scope.groups, { id: $scope.user.group });
                    $scope.user.groupName = selected.length ? selected[0].text : null;
                }
            });
        },


    }
});