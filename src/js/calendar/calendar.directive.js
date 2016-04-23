/*
 *                    Important
 *       Things that you know before yous start
 *       FullCalendar is jqury controll here were using it with Angular JS.
 *       KEY things to know.
 *       Full Calendar always returns the event end date value as the next day of when the event ends.
 *       Suppose there is an event that starts from 1st Jan to 3rd Jan. So you would expect that in those callback you
 *       will get event.start = 1st Jan 12.00.00AM & event.end = 3rd Jan 11.59.59 PM OR event.start = 1st Jan & event.end = 3rd Jan.
 *       BUT in reality fullCalendar will return event.end = 4th Jan.
 *       Because it means that the event will no more exist at 4th Jan 12.00.00 AM or 4 Jan anymore. That's how it works.
 *
 *       AND another important thing. If you put specific time on the event value
 *       it will not be considered as a full day (11:59:59 AM means it will end at 1 sec before 12.00.00 AM), thus it will not be resizable.
 *       Because events that contains specific hour minute second value in their start/end value are not resizable.
 *
 *       Now how it is working,
 *
 *       Post: When we send data to server we get the event.end value, remove one second & send. So server gets event.end = 3rd Jan 11:59:59 PM
 *       Initialize : When we get value from server, we add 1 day with end value & eliminate the hour minute second value.
 *           Like server sent us end value : 3 Jan 11.59.59 AM. We then add 1 extra day and ignore the HH MM SS, and fetch the value to fullCalendar control
 *           Which is then 4 Jan. & according to fullCalendar design, start = 1 Jan & End = 4 Jan means the event span is 1st Jan, 2nd Jan & 3rd Jan.
 *           & that's what we meant.
 *       Open Modal : When we open modal, in order to avoid showing 4th Jan in end value field,
 *                   we subtract 1 second from it and show the DATE part in end value field.
 *
 *      TIPS:
 *      Don't change the datetime value of events by force. It will create more bug & confusion.
 *
 *      We are only changing the value of event object in 'convertLocalTime' method, because inspite of declaring timezone: 'local',
 *     the fullCalendar control returning the datetime value in UTC format.
 *     So, till now where we have FOUND that the UTC time is causing problem, we are using that function to convert it to local.
 *     So, in future whenever we face issue with time/duration, we should check if that time is UTC or Local.
 *     One way to determine is, Get the unix timestamp by event.end.format('X'), convert that here in http://www.epochconverter.com/ to see the human understandable exact time.
 *
 *     In future we will resolve this UTC problem of this fullCalendar controller by taking this solution into account
 *              http://stackoverflow.com/questions/29158308/timezone-not-working-properly-for-fullcalendar
 *
 * */

function commaDigits(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}


angular.module('calendardirective', [])
    .directive('calendar', ['$timeout', 'storage', '$filter', 'estimateDetailsService',
        function ($timeout, storage, $filter, estimateDetailsService) {
            return {
                restrict: 'EA',
                replace: false,
                templateUrl: '/js/calendar/calendar.directive.tpl.html',
                scope: {
                    leftButtons: "@",
                    rightButtons: "@",
                    editablefullcalendar: "@",
                    dropablefullcalendar: "@",
                    eventfullcalendar: "@"
                },
                controller: ['$rootScope', '$scope', '$element', '$attrs', 'Api', '$location', '$filter', '$q', 'Restangular',
                    function ($rootScope, $scope, $element, $attrs, Api, $location, $filter, $q, Rest) {
                        var search = $location.search();

                        window.fcs = $scope;
                        var s = $scope;
                        var onFilterHighlightColor = '#ffdc71';
                        var bindexternalevents;
                        s.schedJobs = [];
                        s.unschedJobs = [];
                        s.clickedEvent = {};
                        s.total = {approved: 0, scheduled: 0, completed: 0, invoiced: 0, paid: 0};
                        s.showWeekendWork = false;
                        var elm,
                            cal, 		// ref to calendar html obj
                            unschedBackup,
                            schedBackup;

                        s.statuses = [
                            {value: 'scheduled', txt: 'Scheduled'},
                            {value: 'completed', txt: 'Completed'},
                            {value: 'invoiced', txt: 'Invoiced'},
                            {value: 'paid', txt: 'Paid'},
                        ]


                        var getEventTitle = function (obj) {
                            var t = obj.reportID + ' $' + $filter('shortenNumber')(obj.todo_price) + ' ';

                            if (obj.status == 'scheduled' && obj.completed_perc > 0) {
                                if (obj.completed_perc == 100) t += '[DONE] ';
                                else t += '[' + obj.completed_perc + '%] ';
                            }

                            t += userID2Name(obj.job_userID) + ' - ';
                            t += shortenName(obj.siteName);

                            if (obj.city) t += ' (' + obj.city + ') ';
									 console.debug(obj  );
									 console.debug('title'  );
									  switch(parseInt(obj.work_weekend)){
									     case 1: t+='[SAT]'; break;
										  case 2: t+='[SUN]'; break;
										  case 3: t+='[SAT,SUN]'; break;
									 }
                            return t;
                        }


                        var init = function () {
                            var default_settings = {
                                month: moment().format('YYYY-MM')
                                , showStatus: {
                                    scheduled: true,
                                    in_prog: true,
                                    completed: 0,
                                    invoiced: 0,
                                    paid: 0
                                }
                                , sales_userIDs: []
                                , job_userIDs: []
										  , goalPerDay: 1000,
                            }
                            storage.bind(s, 'pageVars',
                                {
                                    defaultValue: default_settings,
                                    storeName: 'calendar_pageVars'
                                });
                            if (!s.pageVars.sales_userIDs) s.pageVars.sales_userIDs = [];
                            if (!s.pageVars.job_userIDs) s.pageVars.job_userIDs = [];

                            $rootScope.$broadcast('alert', {msg: 'Loading...', time: 8});
                            s.unschedJobs = [];
                            s.schedJobs = [];
                            s.clickedEvent = {};
                            var apis = [];
                            var deferred1 = $q.defer();
                            var deferred2 = $q.defer();
                            apis.push(deferred1.promise);
                            apis.push(deferred2.promise);

                            // get approved
                            setTimeout(function () {
                                Rest.all('estimate').getList({status: 'approved'}).then(function (data) {
                                    var jobs = [];
                                    _.each(data, function (field) {
                                        var obj = angular.copy(field);
                                        obj.estimateUrl = obj.url;
                                        delete obj.url;		//or else the calendar uses this as a link
                                        obj.name = (field.name) ? field.name.trim() : ' ';
                                        obj.title = getEventTitle(field);
                                        obj.price = obj.total_price;
                                        obj.todo_price = obj.todo_price;
                                        obj.id = field.reportID;
                                        obj.type = 'Unscheduled';
                                        jobs.push(obj);
                                    });
                                    s.unschedJobs = jobs;
                                    unschedBackup = angular.copy(jobs);
                                    updateTotals();
                                    setTimeout(bindexternalevents, 30);
                                });
                            }, 1000);


                            Api.getRecentReports({schedSince: 4}).then(function (data) {
                                deferred1.resolve(data)
                            });
                            s.loadGroups(deferred2);


                            $q.all(apis).then(function (values) {
                                estimates = values[0];
                                processEstimates();
                                schedBackup = angular.copy(s.schedJobs);
                                initCalendar();

                                // fix dropdowns... just in case... cuz sometimes, they werent binding via angular!
                                setTimeout(function () {
                                    s.onFilterChange('noRefresh');
                                }, 400);

                            });
                        } // end init()


                        // setup property name fields
                        // setup filtering
                        var processEstimates = function (type) {
                            if (!estimates || !estimates.length) return;

                            var allJ = [{userID: -98, name: 'Unassigned', count: 0}];
                            var allS = [{userID: -98, name: 'Unassigned', count: 0}];
                            var jobUsers = [], salesUsers = [], suids = {}, juids = {};
                            var ALL_INDEX = 0;
                            var UNASSIGNED_INDEX = 0;

                            angular.forEach(estimates, function (field) {
                                var obj = angular.copy(field);
                                obj.estimateUrl = obj.url;
                                delete obj.url;		//or else the calendar uses this as a link
                                obj.name = (field.name) ? field.name.trim() : '(blank name)';
                                obj.title = getEventTitle(field);
                                obj.price = obj.total_price;
                                obj.todo_price = obj.todo_price;
                                obj.id = field.reportID;
                                if (field.job_start) {
                                    var eMoment;
                                    obj.type = 'Scheduled';
                                    obj.start = moment(field.job_start).format('YYYY-MM-DD');
                                    if (field.job_end)
                                        eMoment = moment(field.job_end).local();
                                    else
                                        eMoment = moment(field.job_start).local();
                                    obj.end = eMoment.add(1, 'days');
                                    obj.end = eMoment.format('YYYY-MM-DD');
                                    s.schedJobs.push(obj);
                                }

                                // setup filtering
                                if (obj.sales_userID) {
                                    if (suids[obj.sales_userID]) suids[obj.sales_userID]++;
                                    else suids[obj.sales_userID] = 1;
                                } else allS[UNASSIGNED_INDEX].count++;

                                if (obj.job_userID) {
                                    if (juids[obj.job_userID]) juids[obj.job_userID]++;
                                    else juids[obj.job_userID] = 1;
                                } else allJ[UNASSIGNED_INDEX].count++;

                                //allS[ALL_INDEX].count++;
                                //allJ[ALL_INDEX].count++;
                            });

                            if (allS[UNASSIGNED_INDEX].count == 0) allS.splice(1);
                            _.each(suids, function (ct, id) {
                                salesUsers.push({userID: id, name: userID2Name(id), count: ct});
                            });
                            s.salesUsers = allS.concat(salesUsers);

                            if (allJ[UNASSIGNED_INDEX].count == 0) allJ.splice(1);
                            _.each(juids, function (ct, id) {
                                jobUsers.push({userID: id, name: userID2Name(id), count: ct});
                            });
                            s.jobUsers = allJ.concat(jobUsers);
                        }


                        // get event data from sched or unsched array based on reportID or event name in title box
                        var getEventInfo = function (eventName) {

                            eventName = '' + eventName;
                            eventName = eventName.trim();

                            if (!isNaN(eventName)) {		// if its a number, its a reportID
                                var rptID = eventName
                            } else {
                                // try to lookup by ID first
                                var m = eventName.match(/([0-9]+)[ -]/);
                                if (m) var rptID = m[1];
                            }

                            var selectedEvent = null;
                            for (var index = 0; index <= s.unschedJobs.length - 1; index++) {
                                var event = s.unschedJobs[index];
                                if (event.reportID == rptID || event.title.trim() == eventName.trim()) {
                                    selectedEvent = event;
                                    break;
                                }
                            }
                            return selectedEvent;
                        }


                        var shortNameMap = {
                            apartments: 'Apts',
                            apartment: 'Apt',
                            village: 'Vill',
                            street: 'St',
                            terrace: '',
                            gardens: '',
                            plaza: '',
                            building: 'Bldg',
                            association: 'Assoc',
                            station: 'Stn',
                            apartment: 'Apt',
                            condominium: 'Condo',
                            condominiums: 'Condos',
                            mountain: 'Mtn',
                            place: 'Pl',
                            street: 'St',
                            point: 'Pt',
                            office: 'Ofc',
                            center: 'Ctr'
                        }
                        var snMatch = /center|office|point|street|place|apartments|apartment|village|street|terrace|gardens|plaza|building|association|station|apartment|condominium|condominiums|mountain/gi;
                        var shortenName = function (n) {
                            if (!n) return '';
                            else n = String(n);
                            if (n.length < 10) return n;
                            if (n.length > 35) return n.substr(0, 33) + '...';
                            return n.replace(snMatch, function (m) {
                                return shortNameMap[m.toLowerCase()];
                            });
                        }

                        var bindexternalevents = function () {
                            var externalevents = $("#external-events .fc-event");
                            externalevents.each(function () {
                                var reportID = $(this).attr('data-reportID');
                                var jobtitle = $(this).text();
                                var ev = getEventInfo(reportID);
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
                        }

                        var initCalendar = function () {
                            var initObj = {
                                header: {
                                    left: 'prev,next',
                                    center: 'title',
                                    right: 'month,basicWeek,basicDay'
                                },
                                //defaultDate: '2015-02-12',
                                dropAccept: '.drop-accpted',
                                editable: s.editablefullcalendar,     // Under calender events drag start on true and vice-versa.
                                droppable: s.dropablefullcalendar,
                                eventLimit: true,
                                timezone: 'local',
                                views: {week: {eventLimit: false}},
                                defaultTimedEventDuration: '04:00:00',
                                startEditable: true,
                                durationEditable: true,

                                events: function (st, end, tz, callback) {
                                    callback(fetchJobsFilter());
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
                                eventReceive: function (event) {			// external drop callbackreturn;
                                    var ev = getEventInfo(event.title);
                                    s.estimateid = ev.reportID;
                                    //event.start = event.start.local();
                                    convertLocalTime(event.start, event.end);
                                    //event.end = angular.copy((event.start));
                                    //event.end = setLastMomentOfTheDay(angular.copy(event.start));
                                    console.log(event.start.format('YYYY-MM-DD'));
                                    var jobStart = event.start.format('YYYY-MM-DD') + ' 00:00:00';
                                    Api.ScheduleJob(ev.reportID, {
                                        job_start: event.start.format('YYYY-MM-DD')
                                    }).then(function (res) {
                                        if (res && res.conflict == 1 && res.conflict_msg) {
                                            alert(res.conflict_msg);
                                        }
                                        else {
                                            event.status = 'scheduled'
                                            elm.fullCalendar('updateEvent', event);

                                            // todo ? in case job confirmation comes back different?
                                            /*
                                             if( jobStart != res.job_start ){
                                             console.debug(res.job_start  );
                                             console.debug('!!!! job start is diff... not '+jobStart  );
                                             }
                                             */
                                        }
                                    });
                                },
                                eventDragStop: function (event, jsEvent, ui, view) {
                                    setTimeout(function () {
                                        updateTotals()
                                    }, 1000);
                                },
                                eventClick: function (data, jsEvent, view) {
                                    convertLocalTime(data.start, data.end)
                                    estimateDetailsService.showModal(data, {
                                        'allowCalendar' : true,
                                        'allowUnschedule' : true,
													 'callback' : function( obj ){			
														updateJobData(obj);
													 }
                                    });
                                },
                                dayClick: function (date, evt, view) {
                                    // check for double click
                                    var now = new Date().getTime();
                                    if (now - view.lastDayClick < 400) {
                                        var v = elm.fullCalendar('getView');
                                        if (v.name == 'basicWeek' || v.name == 'agendaWeek')
                                            elm.fullCalendar('changeView', 'month');
                                        else
                                            elm.fullCalendar('changeView', 'basicWeek');
                                        elm.fullCalendar('gotoDate', date);
                                        return;
                                    }
                                    view.lastDayClick = now;

                                    // if in the past, dont do anything... todo ... this should calculate actual work done
                                    if (date.format('YYYYMMDD') < moment().format('YYYYMMDD')) return;

                                    // dislay daily total
                                    var tot = getDayTotal(date, {debug: true}), diff;
                                    if (tot > 0) {
                                        niceTot = "$" + commaDigits(tot);
                                        var msg = date.format("ddd M/DD") + " = " + niceTot;
                                        var diff = Math.abs(Math.round(s.pageVars.goalPerDay - tot));
                                        var alertType = 'ok';

                                        // warning if too far over
                                        if (tot > (s.pageVars.goalPerDay * 1.2)) {
                                            msg += " ( $" + diff + " OVER BOOKED!)";
                                            alertType = 'd';
                                        } else if (tot < s.pageVars.goalPerDay) {
                                            msg += " ($" + diff + " Under Goal!)";
                                            alertType = 'd';
                                        }
                                        $rootScope.$broadcast('alert', {msg: msg, time: 9, type: alertType});
                                    } else {
                                        $rootScope.$broadcast('alert', {
                                            msg: '$0 Total! Give me some jobs!',
                                            time: 9,
                                            type: 'd'
                                        });
                                    }
                                },

                                // Triggered when a new date-range is rendered, or when the view type switches.
                                viewRender: function (view, cal) {
                                    setTimeout(function () {
                                        updateTotals();
                                    }, 600);
                                    s.pageVars.viewName = view.name;
                                    if (view.name == 'month')
                                        s.pageVars.startDate = view.start.add(14, 'days').format('YYYY-MM-DD');
                                    else
                                        s.pageVars.startDate = view.start.format('YYYY-MM-DD');
                                },

                                // called for every job event box
                                eventRender: function (event, element, view) {
                                    //$('.fc-title br').remove();

                                    /*WILL WORK ON IT LATER*/
                                    // var box = $( "div.fc-bg" ).find("[data-date='"+event.start.format('YYYY-MM-DD')+"']");
                                    ////var box = element.closest('table').find('th').eq(element.index())
                                    //box.html('<h1 style="position: absolute;bottom: 2px">'+element.totalCost+'$</h1>');

                                    // check if job in progress, else color it by status
                                    if (event.status == 'scheduled' && parseFloat(event.todo_price) < parseFloat(event.total_price))
                                        element.addClass('clr-in_prog')
                                    else
                                        element.addClass('clr-' + event.status);

                                    if (event.title) element.attr('title', event.title);

                                    //if event spans more than 2 days, then remove double height
                                    if (event.end && event.end.diff) {
                                        var duration = moment.duration(event.end.diff(event.start)).asDays();
                                        if (duration > 2) {
                                            element.css('height', '1.2em');
                                            element.find('.fc-title').css('height', '1.2em');
                                        }
                                    }


                                    /* this if or adding a "!" icon if no foreman assigned
                                     if (event.title === "" || event.title === null) {
                                     var onMouseHoverJob = "angular.element(this).scope().onMouseHoverJob({0})".format(event.title);
                                     element.find(".fc-content").append('<a href="#"  style="float:right;margin-top:-15px;0" onmouseover="{0}">'
                                     .format(onMouseHoverJob) + '<i class="glyphicon glyphicon-exclamation-sign" style="color:red;" '
                                     +'title="No foreman assigned to this job"></i></a>');
                                     } */


                                    //if(event.status != 'scheduled'){
                                    //    event.editable = false;
                                    //}
                                },

                                eventResize: function (el, delta, revertFunc, jsEvent, ui, view) {
                                    updateJobDuration(el.reportID, el.start.format('YYYY-MM-DD'), el.end.format('YYYY-MM-DD'));
                                    convertLocalTime(el.start, el.end);
                                    var html = $(view.el[0]).find(".fc-title").html();
                                    html = html.replace("<br/>", "");
                                    html = html.replace("<br>", "");
                                    $(".fc-title").html(html);
                                    if (el.reportID == undefined) {
                                        var eventInfo = getEventInfo(el.title);
                                        el.reportID = eventInfo.reportID;
                                    }
                                    el.job_start = moment(el.start).format('YYYY-MM-DD HH:mm:ss');
                                    el.job_end = moment(el.end).format('YYYY-MM-DD HH:mm:ss')
                                    console.log(moment(el.start).format('YYYY-MM-DD HH:mm:ss') + '   ' + moment(el.end).subtract(1, 'seconds').format('YYYY-MM-DD HH:mm:ss'));

                                    var js = moment(el.start).format('YYYY-MM-DD HH:mm:ss');
                                    var je = moment(el.end).subtract(1, 'seconds').format('YYYY-MM-DD HH:mm:ss');
                                    Api.ScheduleJob(el.reportID, {job_start: js, job_end: je})
                                        .then(function (res) {
                                            if (res && res.conflict == 1 && res.conflict_msg) {
                                                alert(res.conflict_msg);
                                            } else {

                                                // todo ? in case job confirmation comes back different?
                                                /*
                                                 if( jobStart != res.job_start ){
                                                 console.debug(res.job_start  );
                                                 console.debug('!!!! job start is diff... not '+jobStart  );
                                                 }
                                                 */

                                            }
                                        });
                                    setTimeout(function () {
                                        updateTotals()
                                    }, 1000);
                                },

                                eventDrop: function (el, eventStart, revertFunc, jsEvent, ui, view) {
                                    updateJobDuration(el.reportID, el.start.format('YYYY-MM-DD'), el.end.format('YYYY-MM-DD'));
                                    convertLocalTime(el.start, el.end);
                                    if (el.reportID == undefined) {
                                        var eventInfo = getEventInfo(el.title);
                                        el.reportID = eventInfo.reportID;
                                    }
                                    var sTime, eTime;
                                    sTime = moment(el.start).format('YYYY-MM-DD HH:mm:ss');
                                    if (el._allDay == false && el.end == undefined) {
                                        eTime = moment(el.start).format('YYYY-MM-DD 23:59:59');
                                    }
                                    else if (el.end == undefined) {  // When duration is 1
                                        eTime = moment(el.start).format('YYYY-MM-DD 23:59:59');
                                    }
                                    else { // When duration is >1
                                        eTime = moment(el.end).subtract(1, 'seconds').format('YYYY-MM-DD HH:mm:ss');
                                    }
                                    Api.ScheduleJob(el.reportID, {
                                        job_start: sTime,
                                        job_end: eTime
                                    }).then(function (res) {
                                        if (res && res.conflict == 1 && res.conflict_msg) {
                                            alert(res.conflict_msg);
                                        }
                                    });
                                    setTimeout(function () {
                                        updateTotals();
                                    }, 600);
                                }

                            }; // end init Obj

                            if (s.pageVars.startDate && s.pageVars.startDate.match(/^2[0-9]{3}--/)) initObj.defaultDate = s.pageVars.startDate;
                            if (s.pageVars.viewName) initObj.defaultView = s.pageVars.viewName;

                            elm = $element.find("#calendar");
                            window.cal = cal = elm.fullCalendar(initObj);

                        } // initCalendar

								s.editGoalPerDay = function(){
									var g = prompt("Enter Goal Per Day", s.pageVars.goalPerDay);
									s.pageVars.goalPerDay = g;
								}

                        s.onMouseHoverJob = function () {
                            $("#tooltip").removeClass("hide").addClass("show");
                        };

                        s.onMouseLeaveJob = function () {
                            $("#tooltip").removeClass("show").addClass("hide");
                        };


                        var LSTO = null;
                        // Called when text changes in search box
                        // We are limited the search procesing by only calling
                        // to filter AFTER user is done typing for half a second
                        s.search = function (searchtxt) {
                            $timeout.cancel(LSTO);
                            LSTO = $timeout(function () {
                                doSearch(s.searchtxt);
                            }, 700);
                        };

                        var doSearch = function (searchtxt) {
                            searchtxt = searchtxt.toString().toLowerCase();
                            if (!searchtxt || searchtxt == '') {
                                s.schedJobs = angular.copy(schedBackup);
                                s.unschedJobs = angular.copy(unschedBackup);
                                var hiColor = '';
                            } else {
                                filterApprovals();

                                var sched = []

                                // filter sched jobs
                                angular.forEach(schedBackup, function (item) {
                                    var titletxt = item.title;
                                    if (titletxt !== undefined) {
                                        item.siteName = '' + item.siteName;
                                        if (
                                            item.siteName.toString().toLowerCase().indexOf(searchtxt) >= 0 ||
                                            item.reportID.toString().toLowerCase().indexOf(searchtxt) >= 0 ||
                                            item.name.toString().toLowerCase().indexOf(searchtxt) >= 0
                                        ) {
                                            sched.push(item);
                                        }
                                    }
                                });
                                s.schedJobs = sched;
                                var hiColor = onFilterHighlightColor;
                            }

                            $('#searchJob').css('background-color', hiColor);
                            cal.fullCalendar('refetchEvents');
                            setTimeout(bindexternalevents, 30);
                        };


                        s.open = function (siteID) {
                            s.user = {
                                group: 1,
                                name: 'John Miclay' // original value
                            };

                            data.title = "List of foreman's"
                            $('#assignjobtitle').html(data.title);
                            //$('#assignjobbody').html(data.price);
                            $('#jobassignforemanpopup').modal();
                        };

                        s.loadGroups = function (deferred) {

                            Api.getForemanUsers()  //(this acutally gets ALL sales,admin,users)
                                .then(function (response) {
                                    s.groups = [];
                                    angular.forEach(response, function (item) {
                                        if (item.userID == s.clickedEvent.job_userID) {
                                            s.job_user = {"userID": item.userID, "name": item.fName + ' ' + item.lName};
                                        }
                                        if (item.userID == s.clickedEvent.sales_userID) {
                                            s.sales_user = {
                                                "userID": item.userID,
                                                "name": item.fName + ' ' + item.lName
                                            };
                                        }
                                        s.groups.push({
                                            "userID": item.userID,
                                            "text": item.fName + ' ' + item.lName,
                                            "fName": item.fName
                                        });
                                    });
                                    if (deferred) deferred.resolve(s.groups); //
                                });
                        };

                        var userID2Name = function (job_userID) {
                            if (!job_userID) return ' ';
                            if (-99 == job_userID) return 'All'; // for filters
                            for (var i = 0; i < s.groups.length; i++) {
                                if (s.groups[i].userID == job_userID) {
                                    if (s.groups[i].email)
                                        return s.groups[i].replace(/@.*/, '');
                                    else
                                        return s.groups[i].text;
                                }
                            }
                            return 'User ' + job_userID;
                        }
                        init();

								/**
								 * Updates the local data array for a given job
								 * TODO - should this search across both unschedJobs and schedJobs? 
								 * Should we unite those somehow, and keep those as just pointers?
								 * @param obj - ie. {reportID:123, someVar:someVal}
								 * @param jobArray - which job array to update, 
								 *							if EMPTY, then try to update both arrays
								 */
								var updateJobData = function(obj, jobArray){
									 if(!jobArray){
										 updateJobData( obj, s.schedJobs );
										 updateJobData( obj, s.unschedJobs );
										 if( cal ){ 
										 		var events = cal.fullCalendar('clientEvents');
										 		updateJobData( obj, events );
										 }
										 return;
									 }
                            var job = _.find(jobArray, 'reportID', obj.reportID);
                            if (!job) return;
									 for( prop in obj ){
							 			if(prop=='reportID') continue;
								 		if( job[prop] ) job[prop] = obj[prop]
									 }
								}

                        //@@todo - update the counts in the dropdown! .. by knowing who was assigned before, and subtracting and adding
                        s.savejobtoforeman = function () {
                            var oldUserID = s.clickedEvent.job_userID;
                            var newUserID = s.job_user.userID;
                            s.job_user.name = userID2Name(s.job_user.userID);

                            var job = _.find(s.schedJobs, 'reportID', s.clickedEvent.reportID);
                            if (job) job.job_userID = newUserID;
                            /*
                             ok this makes no fucking sense to me... it seems that the schedulesjobs[] array
                             is different then the events[] array that gets passed in to calendar...
                             so when the job user is set, we need to set on both....

                             .. but i do set on both, but then when we refilter the users...
                             it doesnt fucking stick.

                             */

                            Api.changeEstimateProperty(s.clickedEvent.reportID, {
                                job_userID: s.job_user.userID
                            }).then(function (response) {
                                s.clickedEvent.job_userID = s.job_user.userID;

                                //@@todo .. duplicate code here! dont reassign the title again.. make a function for this WTF
                                s.clickedEvent.title = s.clickedEvent.name ? s.clickedEvent.reportID + ' - '
                                + $filter('shortenNumber')(s.clickedEvent.price.replace(',', '')) + ' - ' + userID2Name(s.clickedEvent.job_userID) + ' - '
                                + s.clickedEvent.name.trim() : "Nil";

// if we do this, we lose the data on the object when its reloaded. stupid fucking bug
//							updateFilter(oldUserID, newUserID);
                            });
                        };

                        s.savejobtoSalesUser = function () {
                            s.sales_user.name = userID2Name(s.sales_user.userID);
                            Api.changeEstimateProperty(s.clickedEvent.reportID, {
                                sales_userID: s.sales_user.userID
                            }).then(function (response) {
                                console.log(response);
                                s.clickedEvent.sales_userID = s.sales_user.userID;
                            });
                        };


                        $rootScope.$on('estimate.details.unschedule', function (event, report) {
                            elm.fullCalendar('removeEvents', report._id);
                        });

                        $rootScope.$on('estimate.details.save_date', function (event, report) {
                            console.log(report);
                            elm.fullCalendar('updateEvent', report);
                        });

                        s.UnscheduledJob = function () {
                            var id = s.clickedEvent._id
                            Api.UnscheduledJob(s.clickedEvent.reportID, {}).then(function (res) {
                                //init();
                                elm.fullCalendar('removeEvents', id);
                            }).catch(function (res) {
                                //s.init();
                            });

                            $('#fullCalModal').modal('hide');
                            setTimeout(function () {
                                updateTotals()
                            }, 1000);
                        };


                        /** ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- -------

                         JOB DETAILS MODAL BOX

                         ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- */

                        s.groups = [];
                        var job_start_backup_value;
                        var job_end_backup_value;
                        var getValueBackup = function (data) {
                            job_start_backup_value = data.start;
                            if (data.end == null) {
                                var temp = moment(data.start);
                                job_end_backup_value = temp.format('YYYY-MM-DD 23:59:59');
                            }
                            else
                                job_end_backup_value = data.end;
                        }

                        //s.saveJobDates = function () {
                        //    // convert from unix back to iso
                        //    s.job_start = moment.unix(s.job_start_unix).format('YYYY-MM-DD HH:mm:ss');
                        //    s.job_end = moment.unix(s.job_end_unix).format('YYYY-MM-DD HH:mm:ss');
                        //
                        //    Api.ScheduleJob(s.clickedEvent.reportID, {
                        //        job_start: s.job_start,
                        //        job_end: s.job_end
                        //    }).then(function (res) {
                        //        if (res && res.conflict == 1 && res.conflict_msg) {
                        //            alert(res.conflict_msg);
                        //        }
                        //        s.clickedEvent.start = moment(s.job_start);
                        //        s.clickedEvent.end = moment(s.job_end).add(1, 'seconds');
                        //        updateJobDuration(s.clickedEvent.reportID, s.clickedEvent.start, s.clickedEvent.end);
                        //        elm.fullCalendar('updateEvent', s.clickedEvent);
                        //        s.valueChanged = false;
                        //        s.showWeekendWork = isDateSpanWeekend(s.job_start, s.job_end);
                        //    });
                        //
                        //}

                        var setupModalDatePickers = function (event) {
                            s.showWeekendWork = isDateSpanWeekend(event.start, event.end);
                            s.job_start_unix = event.start.format('X');
                            s.job_end_unix = event.end.format('X') - 1; // Because fullCallendar always gives the next day which is 12.00.00 AM,
                            // so have subtract  1s to get 11:59:59 of prev date.
                        }


                        /**
                         * Calc total days of work of an event, taking weekend work into account.
                         * @param e eventObj (which should have vars: start, end, work_weekend
                         *                        work_weekend: 0=no weekends, 1=work on sat, 2=work on sun, 3=work both
                         * @param opt - optional object:
                         *                        excludePast: boolean - dont include days in the past
                         * @return INT
                         */
                        var getTotalDaysOfWork = function (e, opt) {
									 var dbg=true;
                            opt = opt || {};
                            var d1 = e.start.format('YYYYMMDD');
                            var d2 = e.end.format('YYYYMMDD');

                            // the way the fullcalendar works is that the end date is actually 1 day past...
                            // so if you dragged form 1/1 to 1/4, the end date in fullcalendar is 1/5...
                            if (d2 > d1) d2 -= 1;

                            if (opt.excludePast) d1 = moment().format('YYYYMMDD');

                            var d, c = 0, day, ds;
									 if(dbg) console.debug('    : weekend? ' + e.work_weekend);
                            for (var di = d1; di <= d2; di++) {
                                ds = '' + di;
                                d = moment(ds.substr(0, 4) + '-' + ds.substr(4, 2) + '-' + ds.substr(6));
                                day = d.format('d');
                                if (day >= 1 && day <= 5 || e.work_weekend == 3) {
												if(dbg) console.debug('    +a ' + d.toString());
                                    c++;
                                } else if (day == 6 && e.work_weekend == 1) {
												if(dbg) console.debug('    +b ' + d.toString());
                                    c++;
                                } else if (day == 0 && e.work_weekend == 2) {
												if(dbg) console.debug('    +c ' + d.toString());
                                    c++;
                                }else{
												if(dbg) console.debug('    -X ' + d.toString());
										  }
                            }
                            return c;
                        }
                        /* Testing of getTotalDaysOfWork
                         var dts=[
                         ['2015-07-10', '2015-07-13', 0, 2],
                         ['2015-07-10', '2015-07-13', 1, 3],
                         ['2015-07-10', '2015-07-13', 2, 3],
                         ['2015-07-10', '2015-07-13', 3, 4],

                         ['2015-07-10', '2015-07-12', 0, 1],
                         ['2015-07-10', '2015-07-12', 1, 2],			//5
                         ['2015-07-10', '2015-07-12', 2, 2],
                         ['2015-07-10', '2015-07-12', 3, 3],

                         ['2015-07-04', '2015-07-12', 0, 5],
                         ['2015-07-04', '2015-07-12', 1, 7],
                         ['2015-07-04', '2015-07-12', 2, 7],			//10
                         ['2015-07-04', '2015-07-12', 3, 9],

                         ['2015-07-05', '2015-07-12', 0, 5],
                         ['2015-07-05', '2015-07-12', 1, 6],
                         ['2015-07-05', '2015-07-12', 2, 7],
                         ['2015-07-05', '2015-07-12', 3, 8],
                         ]
                         _.each(dts, function(d, idx){
                         var e={start:moment(d[0]), end:moment(d[1]), work_weekend:d[2]};
                         var res=getTotalDaysOfWork(e);
                         if( res!=d[3] )
                         console.debug('Test '+idx+' FAIL: '+d[0]+' --> '+d[1]+' SHOULD BE '+d[3]+', but is '+res);
                         });



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
                        /* Testing of isDateSpanWeekend
                         var dts=[
                         ['2015-07-10', '2015-07-13', true],
                         ['2015-07-10 13:00', '2015-07-13', true],
                         ['2015-07-10', '2015-07-12', false],
                         ['2015-07-10', '2015-07-11', false],
                         ['2015-07-11', '2015-07-13', false],
                         ['2015-07-12', '2015-07-13', false],	//5

                         ['2015-07-09', '2015-07-13', true],
                         ['2015-07-08', '2015-07-13', true],
                         ['2015-07-10', '2015-07-14', true],
                         ['2015-07-10', '2015-07-15', true],
                         ['2015-07-09', '2015-07-15', true],		//10

                         ['2015-07-05', '2015-07-12', false],
                         ['2015-07-05', '2015-07-13', true],
                         ['2015-07-03', '2015-07-10', true],
                         ['2015-07-02', '2015-07-10', true],
                         ['2015-07-04', '2015-07-10', false],	//15

                         ['2015-07-04', '2015-07-11', false],
                         ['2015-07-04', '2015-07-12', false],
                         ['2015-07-04', '2015-07-13', true],

                         ['2015-07-09', '2015-07-15', true],
                         ]
                         _.each(dts, function(d, idx){
                         var res=isDateSpanWeekend(d[0],d[1]);
                         if( res!=d[2] )
                         console.debug('Test '+idx+' FAIL: '+d[0]+' --> '+d[1]+' SHOULD BE '+d[2]);
                         });
                         */




                        //
                        ///**
                        // * Note days... should start at 00:00:00 and end at 23:59:59
                        // */
                        //s.onJobDateChange = function (type) {
                        //    s.valueChanged = true;
                        //
                        //    //use the unix ... convert back
                        //    s.job_start = moment.unix(s.job_start_unix).format('YYYY-MM-DD HH:mm:ss');
                        //
                        //    //if start was set after end, reset end
                        //    if (s.job_start > s.job_end) s.job_end = s.job_start;
                        //
                        //    if (type == 'days') {
                        //        var temp = moment(s.job_start);
                        //        s.job_end = temp.add(s.duration, 'days');
                        //        s.job_end_unix = s.job_end.format('X') - 1;
                        //    } else if (s.job_start) {
                        //        s.job_end = moment.unix(s.job_end_unix).format('YYYY-MM-DD HH:mm:ss');
                        //        var d = Math.ceil(moment.duration(moment(s.job_end).diff(moment(s.job_start))).asDays());
                        //        s.duration = d;
                        //    }
                        //}

                        s.$watch('user.group', function (newVal, oldVal) {
                            if (newVal !== oldVal) {
                                var selected = $filter('filter')(s.groups, {userID: s.user.group});
                                s.user.name = selected.length ? selected[0].text : null;
                            }
                        });

                        s.$watch('sales_user.group', function (newVal, oldVal) {
                            if (newVal !== oldVal) {
                                var selected = $filter('filter')(s.groups, {userID: s.sales_user.userID});
                                s.sales_user.name = selected.length ? selected[0].text : null;
                            }
                        });

                        // when filter drop down is changed
                        s.onFilterChange = function (opt) {
                            $('#sales_filter').css('background-color', ( s.pageVars.sales_userIDs.length == 0 ) ? '' : onFilterHighlightColor);
                            $('#foreman_filter').css('background-color', ( s.pageVars.job_userIDs.length == 0 ) ? '' : onFilterHighlightColor);

                            if (opt != 'noRefresh') cal.fullCalendar('refetchEvents');

                            updateTotalBoxes();
                            updateApprovedTotal();
                            if (opt == 'sales' || opt == 'foreman') filterApprovals();
                        }

                        s.updateStatus = function (s) {
                            Api.setReportStatus(s.reportID, s.status).then(function (d) {
                                //s.setAlert(d);
                                updateJobStatus(s.reportID, {status: s.status});
                                s.clickedEvent.status = s.status
                                elm.fullCalendar('updateEvent', s.clickedEvent);
                            });
                        }

                        function updateFilter(oldUserID, newUserID) {
                            $($("#foreman_filter option")).each(function () {
                                if ($(this).val() == oldUserID) $(this).text('xx');
                            });

                            return;
                            // angular method.. but needs to call apply...
                            var idx = _.findObj(s.jobUsers, 'userID', oldUserID, true);
                            if (f) f.count--;
                            var f = _.findObj(s.jobUsers, 'userID', newUserID);
                            if (f) f.count++;
                        }

                        // provides the events to the calendar, and filters
                        // the array based on filter_job_userID
                        function fetchJobsFilter() {
                            var juid = s.pageVars.job_userIDs;
                            var suid = s.pageVars.sales_userIDs;
                            var o = [];

                            _.each(s.schedJobs, function (e) {
                                var show = 0;

                                if (s.pageVars.showStatus[e.status]) show++;
                                else return;

                                if (suid.length == 0) show++;
                                else if (suid.indexOf(-98) >= 0 && !e.sales_userID) show++;
                                else if (suid.indexOf(e.sales_userID) >= 0) show++;
                                else return;

                                if (juid.length == 0) show++;
                                else if (juid.indexOf(-98) >= 0 && !e.job_userID) show++;
                                else if (juid.indexOf(e.job_userID) >= 0) show++;
                                else return;

                                o.push(e);
                            });
                            return o;
                        }


                        /*
                         > TODO .. not done:
                         >  x - bug: filter, then search
                         >  x - search then filter
                         >  - filter after assignment
                         >  - search after assignment'
                         */
                        function filterApprovals(opt) {
                            var juid = s.pageVars.job_userIDs;
                            var suid = s.pageVars.sales_userIDs;
                            var search = s.searchtxt || '';
                            search = search.toLowerCase().trim();

                            var o = [];
                            var filtersActive = 0;
                            if (suid.length > 0) filtersActive++;
                            if (juid.length > 0) filtersActive++;
                            if (search.length > 1) filtersActive++;


                            if (filtersActive == 0) {
                                s.unschedJobs = angular.copy(unschedBackup);
                                setTimeout(bindexternalevents, 100);
                                return;
                            }

                            angular.forEach(unschedBackup, function (item) {
                                var match = 0;
                                if (juid.length > 0) {
                                    if (juid.indexOf(item.job_userID) >= 0 || (juid.indexOf(-98) >= 0 && !item.job_userID)) {
                                        match++;
                                    }
                                }

                                if (suid.length > 0) {
                                    if (suid.indexOf(item.sales_userID) >= 0 || (suid.indexOf(-98) >= 0 && !item.sales_userID)) {
                                        match++;
                                    }
                                }

                                if (search.length > 1) {
                                    var sn = String(item.siteName).toLowerCase();
                                    if (
                                        sn.indexOf(search) >= 0 ||
                                        item.reportID.toString().indexOf(search) >= 0 ||
                                        item.name.toString().toLowerCase().indexOf(search) >= 0
                                    ) {
                                        match++;
                                    }
                                }

                                if (match == filtersActive)    o.push(item);
                            });

                            s.unschedJobs = o;
                            setTimeout(bindexternalevents, 100);
                        }


                        /** ========== PRICE CALCULATIONS PER DAY ============ **/

                        function updateTotals() {
                            updateDayGoalColor();
                            updateTotalBoxes();
                            updateApprovedTotal();
                        }


                        /**
                         * Calc the prices for the totals of each status indicator at bottom of screen (ie. SCHED, COMPLETED, etc)
                         */
                        var updateTotalBoxes = _.throttle(function () {

                            var juid = s.pageVars.job_userIDs.join(',');
                            var suid = s.pageVars.sales_userIDs.join(',');

                            // get latest estimate totals from server
                            Rest.one('estimateTotals').get({sales_userID: suid, job_userID: juid}).then(function (r) {
                                if (!r) return;
                                if (r.scheduled_all) s.total.scheduled_all = r.scheduled_all.price;

                                // new: not doing sched... since that would only be totals for this month
                                // using API call above to get totals for ALL
                                var stats = ['in_prog_todo', 'in_prog_done', 'scheduled', 'completed', 'invoiced', 'paid'];
                                _.each(stats, function (s) {
                                    if (!r[s]) return;
                                    var p = '$' + $filter('shortenNumber')(r[s].price);
                                    var c = $('.small-tag.' + s);
                                    if (c) c.text(c.attr('data-text') + ': ' + p);
                                });
                            });
                        }, 5000, {trailing: true});


                        var updateApprovedTotal = function () {
                            var appr = 0;
                            _.each(s.unschedJobs, function (j) {
                                if (j.total_price) appr += parseFloat(j.total_price);
                                else if (j.price) appr += parseFloat(j.price);
                            });
                            var sn = $filter('shortenNumber')(appr);
                            $('#approved-jobs-title').text('Approved ($' + sn + ')');
                        }


                        // Change color of all calendar day box backgrounds, based on $ amount ... if they hit their goals
                        function updateDayGoalColor() {
                            if (!cal || !cal.fullCalendar || !s.pageVars.goalPerDay) return false;
                            var view = cal.fullCalendar('getView');
                            if (view.name == 'month') {
                                var dow, t, dt, st = view.start;
                                for (var d = moment(); d.isBefore(view.end); d.add(1, 'days')) {
                                    // dont paint weekends
                                    dow = d.format('d');
                                    if (dow == 0 || dow == 6) continue;

                                    paintDay(d, s.pageVars.goalPerDay);
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


                        function paintDay(date, goal) {
                            var t = getDayTotal(date);
                            if (t === false || t < 1) return;

                            var warnLevel = -1;
                            if (t < goal * .75) warnLevel = 2;		//red less than 75% of goal
                            else if (t < goal) warnLevel = 1;		//orng 75-100% of goal
                            else if (t >= (goal * 1.25)) warnLevel = 3;			//dark green .. OVER GOAL!
                            else if (t >= goal) warnLevel = 0;			//green 100%

                            if (warnLevel >= 0) {
                                //				green			orgn       red			dark grn
                                var colors = ['#B4FAAC', '#FAD784', '#FCBDBD', '#08BD92'];
                                var clr = colors[warnLevel];
                                var dt = date.format('YYYY-MM-DD');
                                //	var cell=$('td[data-date="'+dt+'"]')
                                var cell = $('td.fc-day-number[data-date="' + dt + '"]');
                                if (cell) cell.css('background-color', clr);
                            }
                        }


                        // get a total price for a given day
                        // @param today - moment object
                        // @param opt - options object:
                        //						debug:true - print out logic for calculating days
                        function getDayTotal(today, opt) {
                            if (!today || !cal || !cal.fullCalendar) return false;
                            opt = opt || {};

                            var events = cal.fullCalendar('clientEvents');
                            var tot = 0;
                            _.each(events, function (e) {
                                var jobTotal = 0;

                                if (!e.todo_price) e.todo_price = e.total_price;
                                if (!e.todo_price) {
                                    var ev = getEventInfo(e.reportID);
                                    if (ev.todo_price) e.todo_price = ev.todo_price;
                                    if (ev.total_price) e.todo_price = ev.total_price;
                                }

                                // check for jobs that span multiple days
                                // if:
                                //			- has an end day, AND start and end day not the same
                                //			AND:
                                //				   - start is today or before today
                                //				AND
                                //				   - end is today or after today (AND end date end time is more than 00:00:00)
                                if (
                                    (e.end && e.start.format('M/d') != e.end.format('M/d'))
                                    &&
                                    (
                                        (e.start.isBefore(today, 'day') || e.start.isSame(today, 'day'))
                                        &&
                                        e.end.isAfter(today, 'day')
                                    )
                                ) {
                                    var totalDays = getTotalDaysOfWork(e, {excludePast: true});
                                    jobTotal = parseFloat(parseFloat(e.todo_price) / totalDays);

                                } else if (e.start.isSame(today, 'day')) { 							// job on single day
                                    var totalDays = 1;
                                    jobTotal = parseFloat(e.todo_price);
                                }
                                else {
                                }

                                if (opt.debug && jobTotal > 0)
												console.debug("$" + jobTotal + "    = "+e.todo_price+" / "+totalDays+"d (#"+e.reportID+")");
                                tot += jobTotal;
                            });
                            return Math.round(tot);
                        }

                        function updateJobDuration(reportID, start, end) {  // where star and end is not moment type object.
                            for (var i = 0; i < s.schedJobs.length; i++) {
                                if (s.schedJobs[i].reportID == reportID) {
                                    s.schedJobs[i].start = start;
                                    s.schedJobs[i].job_start = start;
                                    s.schedJobs[i].end = end;
                                    s.schedJobs[i].job_end = end;
                                    break;
                                }
                            }
                            for (var i = 0; i < s.unschedJobs.length; i++) {
                                if (s.unschedJobs[i].reportID == reportID) {
                                    s.unschedJobs[i].start = start;
                                    s.unschedJobs[i].job_start = start;
                                    s.unschedJobs[i].end = end;
                                    s.unschedJobs[i].job_end = end;
                                    break;
                                }
                            }
                            unschedBackup = angular.copy(s.unschedJobs);
                            schedBackup = angular.copy(s.schedJobs);
                        }

                        function updateJobStatus(reportID, object) {
                            for (var i = 0; i < s.schedJobs.length; i++) {
                                if (s.schedJobs[i].reportID == reportID) {
                                    for (var property in object) {
                                        if (object.hasOwnProperty(property)) {
                                            s.schedJobs[i][property] = object[property];
                                        }
                                    }
                                }
                            }
                            schedBackup = angular.copy(s.schedJobs);
                        }

                        var convertLocalTime = function (startMoment, endMoment) {
                            startMoment = startMoment.local();
                            if (endMoment != undefined && endMoment != null) {
                                endMoment = endMoment.local();
                            }
                        }
                    }]// end controller func
            }
        }]);
