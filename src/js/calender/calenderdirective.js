﻿angular.module('calenderdirective', [])
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
        controller: function ($rootScope, $scope, $element, $attrs) {
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

            var externalevents = $element.find(".fc-event");
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
                events: $scope.job,
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

                    //console.log(el._i);
                    //console.log(el._d);
                    //console.log(ev.helper[0].innerHTML);

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

                    $scope.jobdescription = data.description;
                    $scope.$apply();
                    $("#eventContent").dialog({ modal: true, title: data.title, width: 350 });
                }

            });
        
             $scope.search = function (serhtxt) {
                if (serhtxt != null) {
                    $scope.job = [];
                    angular.forEach($scope.events, function (item) {
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
                    $('#calendar').fullCalendar('addEventSource', $scope.events);
                }
            };

        },

    }
});