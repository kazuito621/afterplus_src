/**
 * Created by Imdadul Huq on 08-Apr-15.
 */
app.directive('statusDates',
    ['$modal','$popover','Api','$filter',
        function ($modal, $popover, Api, $filter) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {


                    var tstamp_props = ['tstamp_sent' , 'tstamp_approved', /*'tstamp_scheduled',*/ 'tstamp_completed', 'tstamp_invoiced', 'tstamp_paid'];
                    var changedValues={};
                    scope.save = function(){

                        _.each(tstamp_props, function(prop){
                            if(scope.t_backUp[prop] == null) scope.t_backUp[prop]='';
                            if(moment(scope.t_backUp[prop]).format('YYYY-MM-DD') != moment(scope.t[prop]).format('YYYY-MM-DD')){
                                var newTime=moment(scope.t[prop]).format('YYYY-MM-DD');
                                if(newTime == 'Invalid date')  changedValues[prop] = "";
                                else changedValues[prop] = newTime;
                            }
                        });

                        if(changedValues == {}){
                            scope.modal.hide();
                            return;
                        }
                        Api.updateEstimateTime(scope.report.reportID,changedValues).then(function(res){
                            _.each(tstamp_props, function(prop){
                                if(changedValues[prop] != undefined) {
                                    scope.report[prop] = changedValues[prop];
                                }
                            });
                            changedValues={};
                            scope.modal.hide();
                        });
                    };

                    scope.closeModal = function(){
                        console.log('done');
                        if (scope.modal && typeof scope.modal.hide === 'function') {
                            scope.modal.hide();
                        }
                    };

                    var hideOnEscape = function (e) {
                        if (e.keyCode === 27) scope.modal.hide();
                    };

                    $(el).click(function () {
                        scope.report = scope.$eval(attrs.statusDates);
                        scope.t={}; // this
                        scope.t = angular.copy(scope.report);

                        _.each(tstamp_props, function(prop){
									var d=scope.t[prop];
									if( d == null || d == undefined ) d='';
									else{
                            	d = $filter('formatDateOnly')(d);
										d = d.replace(/-/g, '/');		// required to change yyyy-mm-dd to yyyy/mm/dd
																				// because the datepicker is wrong if you dont
									}
									scope.t[prop] = d;
                        });

                        scope.t_backUp = angular.copy(scope.t);


                        if (scope.modal && typeof scope.modal.hide === 'function') {
                            scope.modal.hide();
                        }
                        // create new one
                        if(!scope.modal)
                            scope.modal = $modal({ scope: scope, template: '/js/common/directives/statusDates/statusDates.tpl.html', show: false });

                        //show popover
                        scope.modal.$promise.then(function () {
                            scope.modal.show();
                            $(document).keyup(hideOnEscape);
                        });


                    });
                }
            }

        }]);
