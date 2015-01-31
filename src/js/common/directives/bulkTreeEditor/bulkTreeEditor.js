/**
 * Created by usert on 28-Jan-15.
 */
/**
 * Created by Imdadul Huq on 11-Jan-15.
 */
app.directive('bulkTreeEditor',
    ['$modal', 'SiteModelUpdateService', 'Api','$filter',
        function ($modal, SiteModelUpdateService, Api,filter) {
            'use strict';

            var linker = function (scope, el, attrs) {
                var modal;
                window.sues = scope;
                scope.newContact={};
                scope.addedSites=[];
                scope.selected={};
                var treatmentTypeIDs=[];
                var dbh=[];
                var species=[];
                scope.singleTreatmentSelected=false;
                scope.openModal = function () {
                    scope.species=[];
                    scope.treatments=[];
                    scope.dbh=[];
                    scope.years=[];

                    Api.getTrees(scope.siteID).then(function(data){

                        _.each(data,function(item){

                            _.each(item.history,function(i){
                                treatmentTypeIDs.push(i.treatmentTypeID);
                                scope.years.push(i.year);
                            });

                            species.push(item.speciesID);

                            dbh.push(item.dbhID);
                        });

                        treatmentTypeIDs = _.uniq(angular.copy(treatmentTypeIDs));
                        dbh = _.uniq(angular.copy(dbh));
                        species = _.uniq(species);
                        scope.years = _.uniq(scope.years);

                        _.each(treatmentTypeIDs,function(id){
                            scope.treatments.push({
                                treatmentType:filter('getTreatmentTypeName')(id,scope),
                                treatmentTypeID:id
                            });
                        });

                        _.each(species,function(id){
                            scope.species.push({
                                commonName:filter('speciesID2Name')(id,'',scope),
                                speciesID:id
                            });
                        });
                        _.each(dbh,function(id){
                            scope.dbh.push({
                                dbh:filter('dbhID2Name')(id,scope),
                                dbhID:id
                            });
                        });

                        scope.treatments=filter('orderBy')(scope.treatments,'+treatmentType');
                        scope.species=filter('orderBy')(scope.species,'+commonName');
                        scope.dbh=filter('orderBy')(scope.dbh,'+dbh');
                        scope.species=filter('orderBy')(scope.species,"+''.toString()");

                        scope.treatments.unshift({
                            treatmentType:  'All',
                            treatmentTypeID:-1
                        });
                        scope.species.unshift({
                            commonName:'All',
                            speciesID: -1
                        });
                        scope.dbh.unshift({
                            dbh:    'All',
                            dbhID:  -1
                        });
                        scope.years.unshift('All');

                        scope.selected.treatment=scope.treatments[0];
                        scope.selected.species=scope.species[0];
                        scope.selected.dbh=scope.dbh[0];
                        scope.selected.year=scope.years[0];

                    });

                    if (!modal) {
                        modal = $modal({scope: scope, template: '/js/common/directives/bulkTreeEditor/bulkTreeEditor.tpl.html', show: false});
                    }

                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });


                };

                scope.selectionChanged=function(){
                    if(scope.selected.treatment.treatmentTypeID==-1){
                        scope.singleTreatmentSelected=false;
                    }
                    else{
                        scope.singleTreatmentSelected=true;
                    }
                    var param={};
                    if(scope.mode=='site'){
                        param.siteID=scope.siteID;
                    }
                    else{
                        param.reportID=scope.siteID;
                    }
                    if(scope.selected.isTreatmentSelected){
                        param.treatmentTypeID=scope.selected.treatment.treatmentTypeID;
                    }
                    if(scope.selected.isSpeciesSelected){
                        param.speciesID=scope.selected.species.speciesID;
                    }
                    if(scope.selected.isDbhSelected){
                        param.dbhID=scope.selected.dbh.dbhID;
                    }
                    if(scope.selected.isYearSelected){
                        param.year=scope.selected.year;
                    }

                    Api.getBulkEditInfo(param).then(function(data){
                        var a=1;
                    });
                }
                scope.closeModal = function () {
                    modal.hide();
                };

                scope.SaveUser = function (event) {
                };


                scope.hide = function(){
                    $(document).unbind('keyup', hideOnEscape);
                    modal.hide();
                }

                var hideOnEscape = function(e){
                    if(e.keyCode === 27) scope.hide();
                };

                var init = function () {
                    el.on('click', function (event) {
                        event.preventDefault();
                        scope.addedSites=[];

                        if (angular.isDefined(attrs.siteId)) {
                            scope.siteID= scope.$eval(attrs.siteId);
                            scope.siteID='1495';
                        }
                        scope.mode=attrs.mode;
                        // TO REMOVE
                        scope.openModal();
                    });
                };
                init();
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
