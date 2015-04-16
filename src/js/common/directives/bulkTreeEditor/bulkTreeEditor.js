/**
 * Created by Imdadul Huq on 11-Jan-15.
 */
app.directive('bulkTreeEditor',
    ['$modal','Api','$filter',
        function ($modal , Api,filter) {
            'use strict';
            var linker = function (scope, el, attrs) {
                var modal;
                window.sues = scope;
                scope.allTreatments=[]; // Should show all the treatmens
                scope.selected={};
                scope.singleTreatmentSelected=false;
                scope.yearRecommendation=[];
                scope.currentInfo={};
                var initVars=function(){
                    scope.species=[];
                    scope.treatments=[];
                    scope.dbh=[];
                    scope.years=[];
                    scope.selected={};
                    scope.selected.isAllSelected = true;
                    scope.selected.isTreatmentSelected=false;
                    scope.selected.isSpeciesSelected=false;
                    scope.selected.isSetPrice=false;
                    if (scope.mode =='site') scope.selected.isYearSelected=false;
                    scope.selected.isDbhSelected=false;
                    scope.selected.chgPriceBy=true;
                    scope.yearRecommendation=[];
                    scope.contiueToEdit=false;
                }
                scope.openModal = function () {
                    initVars();

                    if(scope.siteID) scope.mode='site';
                    else if(scope.reportID) scope.mode='report';

                    var param={};

                    if(scope.siteID){
                        param.siteID=scope.siteID;
                    }
                    else if(scope.reportID){
                        param.reportID=scope.reportID;
                    }
                    Api.getBulkItemSummary(param).then(function(data){
                        scope.treatments=data.treatments;
                        scope.species=data.species;
                        scope.dbh=data.dbh;
                        if(scope.mode=='site')scope.years=data.year;

                        scope.treatments=filter('orderBy')(scope.treatments,'+treatmentType');
                        scope.species=filter('orderBy')(scope.species,'+commonName');
                        scope.dbh=filter('orderBy')(scope.dbh,'+dbh');
                        scope.species=filter('orderBy')(scope.species,"+''.toString()");


                        //scope.allTreatments=scope.treatments; // should show all the treatmenst in 'ADD TREATNEBT RECOMMENDATION'



                        scope.selected.treatment=scope.treatments[0];
                        scope.selected.species=scope.species[0];
                        scope.selected.dbh=scope.dbh[0];
                        if(scope.mode=='site')
                            scope.selected.year=scope.years[0];

                        scope.selected.changeTreatmentTo=scope.allTreatments[0];
                        scope.selected.addedTreatRecom=scope.allTreatments[0];

                        scope.selected.IschgPrice=1;
                        scope.selected.chgPriceBy=1;
                        scope.selected.chgPriceByPercent=1;

                        var currentYear=new Date().getFullYear();
                        for(var i=1;i<=5;i++){
                            currentYear++;
                            scope.yearRecommendation.push(currentYear);
                        }
                        scope.selected.changeYearTo=scope.yearRecommendation[0];
                        scope.selected.addedTreatRecomYear=scope.yearRecommendation[0];

                        scope.selectionChanged();
                    })

                        //scope.treatments.unshift({
                        //    treatmentType:  'All',
                        //    treatmentTypeID:-1
                        //});
                        //scope.species.unshift({
                        //    commonName:'All',
                        //    speciesID: -1
                        //});
                        //scope.dbh.unshift({
                        //    dbh:    'All',
                        //    dbhID:  -1
                        //});
                        //scope.years.unshift('All');

                    //if (!modal) {
                        modal = $modal({scope: scope, template: '/js/common/directives/bulkTreeEditor/bulkTreeEditor.tpl.html', show: false});
                    //}

                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                        $("#bulkEditorModal").css("overflow-y", "auto"); // After save, we manually trigger the modal again,
                                                                        // that's why modal-open css is not applying.
                    });
                };

                scope.ok=function(){
                    var param=createParam();
                    var post={};

                    if(scope.singleTreatmentSelected && scope.selected.isSetPrice){
                        post.setPrice=scope.selected.setPrice;
                    }
                    if(scope.selected.isPriceAdjusted){
                        if(scope.selected.IschgPrice==1) // by $$
                            post.chgPriceBy=scope.selected.chgPriceBy;
                        else if(scope.selected.IschgPrice==0) // by %
                            post.chgPriceByPercent=scope.selected.chgPriceByPercent;
                    }
                    if(scope.selected.removeFromRecommendation == true) post.removeTreatment=1;
                    if(scope.selected.IsChangeToTreatment){
                        post.chgTreatment=scope.selected.changeTreatmentTo.treatmentTypeID;
                    }

                    if(scope.selected.IsChangeToYear){
                        post.chgYear=scope.selected.changeYearTo;
                    }

                    if(scope.selected.IsTreatmentRecommendationAdded){
                        post.addTreatment=scope.selected.addedTreatRecom.treatmentTypeID;
                        if(scope.mode=='site')
                            post.addTreamentYear=scope.selected.addedTreatRecomYear;
                    }
                    if(scope.selected.IsNoteAdded){
                        post.addNote=scope.selected.note;
                    }
                    Api.modifyBulkEditInfo(param,post).then(function(data){
                        if(scope.onApplyChange != undefined) // mode = report
                            scope.onApplyChange();
                    });
                }
                var createParam=function(){
                    var param={};

                    if(scope.siteID){
                        param.siteID=scope.siteID;
                    }
                    else{
                        param.reportID=scope.reportID;
                    }
                    if(scope.selected.isTreatmentSelected && scope.selected.treatment){
                        param.treatmentTypeID=scope.selected.treatment.treatmentTypeID;
                    }
                    if(scope.selected.isSpeciesSelected && scope.selected.species){
                        param.speciesID=scope.selected.species.speciesID;
                    }
                    if(scope.selected.isDbhSelected && scope.selected.dbh){
                        param.dbhID=scope.selected.dbh.dbhID;
                    }
                    if(scope.selected.isYearSelected && scope.selected.year){
                        param.year=scope.selected.year.year;
                    }

                    return param;
                }
                var anyCategorySelected=function(){
                    if(scope.selected.isTreatmentSelected || scope.selected.isSpeciesSelected ||
                        scope.selected.isDbhSelected || (scope.mode =='site' && scope.selected.isYearSelected) ){
                        return true;
                    }
                    else return false;
                }
                scope.allselected=function(){
                    scope.selected.isTreatmentSelected = false;
                    scope.selected.isSpeciesSelected = false;
                    if (scope.mode=='site') scope.selected.isYearSelected = false;
                    scope.selected.isDbhSelected = false;
                    scope.selected.isSetPrice = false
                    scope.selected.IsChangeToTreatment = false
                    scope.singleTreatmentSelected = false;
                    scope.selectionChanged();
                }

                var timer;
                scope.pricyTyping=function(v){
                    if(v==1 && scope.selected.isSetPrice==false){
                        scope.selected.isSetPrice=true;
                        scope.selected.isPriceAdjusted=false;
                    }
                    else if(v==2){
                        scope.selected.IschgPrice=1;
                        scope.selected.isSetPrice=false;
                        scope.selected.isPriceAdjusted=true;
                    }
                    else if(v==3){
                        scope.selected.IschgPrice=0;
                        scope.selected.isSetPrice=false;
                        scope.selected.isPriceAdjusted=true;
                    }
                }

                scope.priceAdjustmentSelected = function(v){
                    if(v==0){
                        scope.selected.isPriceAdjusted=false;
                    }
                    else if(v==1){
                        scope.selected.isSetPrice=false;
                    }
                }

					// @param opt - optional object, may have: 
					//	  {
					//		  turnOn: STRING - if set, then selected[opt.turnOn] should be set to true
					// 					    ie. if a certain dropdown is selected, we want to turn on the corresponding checkbox
					//		}
                scope.selectionChanged=function(opt){
					 		//if this selection changing, should turn on other options (ie. dropdown turns on checkbox)
					 		if(opt && opt.turnOn && scope.selected[opt.turnOn]!=true) 
								scope.selected[opt.turnOn]=true;

							// turn off ALL TREES if any other is selected
                    if(scope.selected.isAllSelected == true && anyCategorySelected()==true) {
                        scope.selected.isAllSelected = false;
                    }

					
                    if(scope.selected.isTreatmentSelected){
                        scope.singleTreatmentSelected=true;
                    }else{
                        scope.selected.isSetPrice = false
                        scope.selected.IsChangeToTreatment = false
                        scope.singleTreatmentSelected=false;
                    }
                    var param=createParam();
                    Api.getBulkEditInfo(param).then(function(data){
                        scope.currentInfo.treeCount=data.treeCount;
                        scope.currentInfo.treatmentCount=data.treatmentCount;
                        scope.currentInfo.price=data.price;
                    });
                }

                scope.closeModal = function () {
                    modal.hide();
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
                        if (angular.isDefined(attrs.reportId)) {
                            scope.reportID = scope.$eval(attrs.reportId);
                        }
                        if (angular.isDefined(attrs.siteId)) {
                            scope.siteID = scope.$eval(attrs.siteId);
                        }
                        if (angular.isDefined(attrs.treatments)) {
                            scope.allTreatments = scope.$eval(attrs.treatments);
                        }
                        if (angular.isDefined(attrs.savedReportCheck)) {
                            scope.savedReportCheck = scope.$eval(attrs.savedReportCheck);
                        }
                        if (angular.isDefined(attrs.onApplyChange)) {
                            scope.onApplyChange = scope.$eval(attrs.onApplyChange);
                        }

                        if( scope.savedReportCheck==true){
                            return $modal({ scope: scope, template: 'js/common/directives/templates/OpenEditConfirmation.tpl.html', show: true });
                        }

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
