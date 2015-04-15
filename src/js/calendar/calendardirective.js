﻿angular.module('calendardirective', [])
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
        controller: function ($rootScope, $scope, $element, $attrs, Api, $location) {
            var search = $location.search();

            $scope.UnscheduledJobs = [];
            $scope.ScheduledJobs = [];
            //$scope.SearchScheduledJobs = [];



            Api.getRecentReports({ siteID: search.siteID }).then(function (data) {
                angular.forEach(data, function (field) {
                    if (field.status == "sent" && field.name != null) {
                        $scope.ScheduledJobs.push(
                            {
                                "title": field.name,
                                "start": "2015-04-02",
                                "price": "," + field.total_price

                            });

                    }
                    if (field.status == "completed") {
                        $scope.UnscheduledJobs.push(
                            {
                                "title": field.name.trim()?field.name.trim() : "Nil",
                                "start": "2015-03-02",
                                "price": "," + field.total_price

                            });
                    }

                });
                
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

                
               
                    var elm = $element.find("#calendar");
                    elm.fullCalendar({
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
                            console.log(el._i);
                            console.log(el._d);
                            console.log(ev.helper[0].textContent);
                            if ($('#drop-remove').is(':checked')) {
                                // if so, remove the element from the "Draggable Events" list
                                $(this).remove();
                            }


                        },
                        eventDrop: function (event, delta, revertFunc) {
                            console.log(event.start.format());
                            console.log(event.title);
                            console.log(event.start._i);
                            console.log(event.start._d);


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
                                element.css('background-color', '#77DD77');
                                element.find(".fc-content").append('<a href="#"  style="float:right;margin-top:-15px;0" onmouseover="{0}">'.format(onMouseHoverJob) + '<i class="glyphicon glyphicon-exclamation-sign" style="color:red;" title="No foreman assigned to this job"></i></a>');
                            }
                            else {
                                element.css('background-color', '#FFB347')
                            }
                        },
                        eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
                            console.log(event);
                            var html = $(view.el[0]).find(".fc-title").html();
                            html = html.replace("<br/>", "");
                            html = html.replace("<br>", "");
                            $(".fc-title").html(html);


                        },
                    });
               
            });

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
            };




        },


    }
});