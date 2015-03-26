angular.module('calenderdirective', [])
.directive('calenderFull', function () {
    return {
        restrict: 'EA',
        replace: false,
        templateUrl: '/js/calender/full_calender_tpl.html',
        scope: {
            leftButtons: "@",
            rightButtons: "@",
            editablefullcalender: "@",
            dropablefullcalender: "@",
            eventfullcalender: "@"

        },
        controller: function ($rootScope, $scope, $element, $attrs, Api, $location) {
            var search = $location.search();

            $scope.UnscheduledJobs = [];
            $scope.ScheduledJobs = [];
            $scope.SearchScheduledJobs = [];

            Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
                angular.forEach(data, function (field) {
                    if (field.status == "paid") {
                        $scope.UnscheduledJobs.push(
                            {
                                "title": field.name,
                                "start": "2015-03-02T16:00:00",
                                "price": "," + field.total_price

                            });


                        var bindexternalevents = setTimeout(function () {
                            var externalevents = $element.find(".fc-event");
                            externalevents.each(function () {
                                var jobtitle = $(this).text().split(",");

                                $(this).data('event', {
                                    title: jobtitle[0], // use the element's text as the event title
                                    price: jobtitle[1],
                                    stick: true // maintain when user navigates (see docs on the renderEvent method)
                                });

                                // make the event draggable using jQuery UI
                                $(this).draggable({
                                    zIndex: 999,
                                    revert: true,      // will cause the event to go back to its
                                    revertDuration: 0  //  original position after the drag
                                });
                            });
                        }, 1000);
                    }
                    if (field.status == "draft" && field.name != null) {

                        $scope.ScheduledJobs.push(
                            {
                                "title": field.name.trim(),
                                "start": "2015-03-02",
                                "price": "," + field.total_price

                            });


                    }

                    // clearInterval(bindexternalevents);

                });


                var elm = $element.find("#calendar");
                elm.fullCalendar({
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay',
                    },
                    //defaultDate: '2015-02-12',

                    editable: $scope.editablefullcalender,     // Under calender events drag start on true and vice-versa.
                    droppable: $scope.dropablefullcalender,
                    eventLimit: $scope.eventfullcalender,
                    startEditable: true,
                    events: $scope.ScheduledJobs,
                    //selectable: true,
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
                        console.log(el._i);
                        console.log(el._d);
                        console.log(ev.helper[0].textContent);
                        if ($('#drop-remove').is(':checked')) {
                            // if so, remove the element from the "Draggable Events" list
                            $(this).remove();
                        }


                    },
                    eventDrop: function (event, delta, revertFunc) {
                       
                        $('.fc-title br').remove();

                        console.log(event.start.format());
                        console.log(event.title);
                        console.log(event.start._i);
                        console.log(event.start._d);
                        //console.log(event.end);
                        // console.log(event.work);
                    },
                    updateEvent: function (event) {
                        console.log(event);
                    },
                    eventClick: function (data, jsEvent, view) {
                        $scope.jobdescription = data.price;
                        $scope.$apply();
                        $('#modalTitle').html("ReportName:" + data.title);
                        $('#modalBody').html("Price:" + data.price);
                        $('#fullCalModal').modal();
                        //$("#eventContent").dialog({ modal: true, title: data.title, width: 350 });
                    },
                    eventRender: function (event, element, view) {
                        $('.fc-title br').remove();
                        if (event.title === "" || event.title === null) {
                            var onMouseHoverJob = "angular.element(this).scope().onMouseHoverJob({0})".format(event.title);
                            //var onMouseLeaveJob = "angular.element(this).scope().onMouseLeaveJob({0})".format(event.title);
                            element.css('background-color', '#77DD77');
                            element.find(".fc-content").append('<a href="#"  style="float:right;margin-top:-15px;0" onmouseover="{0}">'.format(onMouseHoverJob) + '<i class="glyphicon glyphicon-exclamation-sign" style="color:red;" title="No foreman assigned to this job"></i></a>');
                            // element.find(".fc-content").append('<a style="float:right;margin-top:-15px;" class="glyphicon glyphicon-exclamation-sign" id="tooltipCalender"    title="No foreman assigned to this job" onmouseover="{0}" ></a>'.format(onMouseHoverJob) + '<div id="tooltip" style="float:left;" class="hide">Hello Hi</div>');
                            //element.find(".fc-content").append('<a style="float:right;margin-top:-15px;" class="glyphicon glyphicon-exclamation-sign tooltipCalender" title="No foreman assigned to this job"  ></a><div id="tooltip" class="hide">Hello Hi</div>');
                        }
                        else {
                            element.css('background-color', '#FFB347')
                        }
                    },
                    eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
                        //angular.element("div").find(fc-title
                        //var a = angular.element(this).find('br').remove();

                        var html = $(view.el[0]).find(".fc-title").html();
                        html = html.replace("<br/>", "");
                        html = html.replace("<br>", "");
                        $(".fc-title").html(html);
                        //$('div .fc-content .fc-title br').remove();
                    
                    },

                });
            });

            $scope.onMouseHoverJob = function () {
                $("#tooltip").removeClass("hide").addClass("show");
                //setTimeout(function () {
                //    $("#tooltip").removeClass("show").addClass("hide");
                //},500);
            };
            $scope.onMouseLeaveJob = function () {
                $("#tooltip").removeClass("show").addClass("hide");
            };


            $scope.events = [
				{
				    title: 'All Day Event',
				    start: '2015-02-01',
				    description: 'Great Today is Holiday'
				},
				{
				    title: 'Long Event',
				    start: '2015-02-07',
				    end: '2015-02-10',
				    description: 'Long Journey'
				},
				{
				    id: 999,
				    title: 'Repeating Event',
				    start: '2015-03-09T16:00:00',
				    description: ' Here I will repeat my work'
				},
				{
				    id: 919,
				    title: 'Repeating Event',
				    start: '2015-03-16T16:00:00',
				    description: 'Same Here'
				},
				{
				    title: 'Conference',
				    start: '2015-03-11',
				    end: '2015-03-13',
				    description: 'Today Sir, your meeting with MD of GSKC.So Be ready Zaeem'
				},
				{
				    title: 'Meeting',
				    start: '2015-03-12T10:30:00',
				    end: '2015-03-12T12:30:00',
				    description: 'Thats Great'
				},
				{
				    title: 'Lunch',
				    start: '2015-03-24',
				    end: '2015-03-28',
				    description: 'Guys Lunch Time'

				},
				{
				    title: 'Meeting',
				    start: '2015-03-12T14:30:00',
				    description: 'Be ready Appointments'
				},
				{
				    title: 'Happy Hour',
				    start: '2015-03-12T17:30:00',
				    description: 'Now You Happy'
				},
				{
				    title: 'Dinner',
				    start: '2015-03-12T20:00:00',
				    description: 'Be ready Lunch Time'
				},
				{
				    title: 'Birthday Party',
				    start: '2015-03-13T07:00:00',
				    description: 'Lets Rock'
				},
				{
				    title: 'Click for Google',
				    url: 'http://google.com/',
				    start: '2015-03-28',
				    description: 'World of Google.'
				}
            ];

            $scope.job = [
               {
                   title: 'All Day Event',
                   start: '2015-02-01',
                   description: 'Great Today is Holiday'
               },
               {
                   title: 'Long Event',
                   start: '2015-02-07',
                   end: '2015-02-10',
                   description: 'Long Journey'
               },
               {
                   id: 999,
                   title: 'Repeating Event',
                   start: '2015-03-09T16:00:00',
                   description: ' Here I will repeat my work'
               },
               {
                   id: 919,
                   title: 'Repeating Event',
                   start: '2015-03-16T16:00:00',
                   description: 'Same Here'
               },
               {
                   title: 'Conference',
                   start: '2015-03-11',
                   end: '2015-03-13',
                   description: 'Today Sir, your meeting with MD of GSKC.So Be ready Zaeem'
               },
               {
                   title: 'Meeting',
                   start: '2015-03-12T10:30:00',
                   end: '2015-03-12T12:30:00',
                   description: 'Thats Great'
               },
               {
                   title: 'Lunch',
                   start: '2015-03-24',
                   end: '2015-03-28',
                   description: 'Guys Lunch Time'

               },
               {
                   title: 'Meeting',
                   start: '2015-03-12T14:30:00',
                   description: 'Be ready Appointments'
               },
               {
                   title: 'Happy Hour',
                   start: '2015-03-12T17:30:00',
                   description: 'Now You Happy'
               },
               {
                   title: 'Dinner',
                   start: '2015-03-12T20:00:00',
                   description: 'Be ready Lunch Time'
               },
               {
                   title: 'Birthday Party',
                   start: '2015-03-13T07:00:00',
                   description: 'Lets Rock'
               },
               {
                   title: 'Click for Google',
                   url: 'http://google.com/',
                   start: '2015-03-28',
                   description: 'World of Google.'
               }
            ];

            /*var elm = $element.find("#calendar");
             elm.fullCalendar({
                 header: {
                     left: 'prev,next today',
                     center: 'title',
                     right: 'month,agendaWeek,agendaDay',
                 },
                 //defaultDate: '2015-02-12',
                 
                 editable: $scope.editablefullcalender,     // Under calender events drag start on true and vice-versa.
                 droppable: $scope.dropablefullcalender,
                 eventLimit: $scope.eventfullcalender,
                 startEditable: true,
                 events: $.map($scope.UnscheduledJobs, function (item) {
                     console.log($scope.UnscheduledJobs);
                     var event = new Object();
                     event.title = item.price;
                     event.start = new Date(item.start);
                     event.title = item.title;
                     return event;
                 }),
                 //selectable: true,
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
                     console.log(el._i);
                     console.log(el._d);
                     console.log(ev.helper[0].textContent);
                     if ($('#drop-remove').is(':checked')) {
                         // if so, remove the element from the "Draggable Events" list
                         $(this).remove();
                     }
                 },
                 eventDrop: function (el, eventStart, ev, ui) {
                     console.log(el.title);
                     console.log(el.start._i);
                     console.log(el.start._d);
                     console.log(el.end);
                     console.log(el.work);
                 },
                 updateEvent: function (event) {
                     console.log(event);
                 },
                 eventClick: function (data, jsEvent, view) {
                     $scope.jobdescription = data.price;
                     $scope.$apply();
                     $("#eventContent").dialog({ modal: true, title: data.title, width: 350 });
                 }
 
             });*/


            // Cut FROM Here

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

            $scope.open = function () {
                $scope.foremans = [
                   {
                       foremanname: 'John Miclay'
                   },
                   {
                       foremanname: 'Ruby Johanson'
                   },
                   {
                       foremanname: 'Matrick Dusak'
                   }];

                data.title = "List of foreman's"
                $('#assignjobtitle').html(data.title);
                //$('#assignjobbody').html(data.price);
                $('#jobassignforemanpopup').modal();

            };

            $scope.savejobtoforeman = function () {
                //alert("a");

            };

            $scope.UnscheduledJob = function () {
            }
        },

        //link: function (s) {
        //    window.ets = s;
        //    s.onMouseHoverJob = function () {
        //        s.setAlert('Deleting tree', { busy: true, time: "false" });
        //    };
        //}
    }
});