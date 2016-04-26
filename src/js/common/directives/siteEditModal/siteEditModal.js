app.directive('siteEditModal', 
	['$modal', 'SiteModelUpdateService', 'Api', '$timeout',
	function ($modal, SiteModelUpdateService, Api, $timeout) {
    'use strict';

    var linker = function (scope, el, attrs) {

        if (angular.isDefined(attrs.siteId)) {
            scope.siteId = scope.$eval(attrs.siteId);
        }

        if (angular.isDefined(attrs.clients)) {
            scope.clients = scope.$eval(attrs.clients);            
        }

        if (angular.isDefined(attrs.mode)) {
            scope.mode = attrs.mode;
        }
        scope.isCheckForNewValue=false;
        if (angular.isDefined(attrs.checkForNewValue)) {
            scope.isCheckForNewValue = attrs.checkForNewValue;
        }

        var modal;
        var newSite = {clientID: ''};

        scope.onSave = function () {
            var funcName = attrs.onSave;
            var func = scope.$parent[funcName];

            if (funcName && angular.isFunction(func)) {
                func();
            }
        };
        scope.updateAddess=function(address){
            scope.site.street=address.street;
            scope.site.state=address.state;
            scope.site.city=address.city;
            scope.site.zip=address.zip;
        };

        //when user creates new property and selects Client:
        //system should copy address fields from Client to new property
        scope.copyAddressFromClientToNewSite = function(id){

            if (scope.mode && scope.mode=='new'){ //if mode!='new'('edit') => we don't need to copy address
                //find client info
                var clientInfo = scope.selectedClient.selected;

                //copy address fields
                scope.site.street = clientInfo.street;
                scope.site.city = clientInfo.city;
                scope.site.state = clientInfo.state;
                scope.site.zip = clientInfo.zip;
            }
        }

        scope.openModal = function (id) {
            Api.getEntityInfo().then(function(data){
					  scope.customerSources = {
								 'referral':'Word of Mouth / Referral',
								 'vehicle':'Saw our Vehicles',
								 'online':'Website/Online',
								 'repeat':'Repeat Customer',
					  		};

                if (data.entityID == 2) {
                    scope.customerSources['event-caa'] = 'Tradeshow: CAA';
                    scope.customerSources['event-cacm'] = 'Tradeshow: CACM';
                    scope.customerSources['event-bava'] = 'BAVA';
                    scope.customerSources['event-boma'] = 'BOMA';
                    scope.customerSources['event-battlebay'] = 'Battle of the Bay';
                }

                modal = $modal({scope: scope, template: '/js/common/directives/siteEditModal/siteEditModal.tpl.html', show: false});
                scope.site = angular.copy(newSite);
                scope.selectedClient = {};
                if (id) {
                    Api.updateSite(id).then(function (data) {
                        scope.site = data;
                        scope.selectedClient.selected = _.findWhere(scope.clients, { 'clientID': data.clientID })
                        modal.$promise.then(function () {
                            modal.show();
                            // setup ESCAPE key
                            $(document).keyup(hideOnEscape);
                        });
                    });
                }
                else{
                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });
                }
            });
        };

        scope.onSelectSite = function (item, model) {
            scope.site.clientID = model.clientID;
        }

        scope.saveSite = function (cb, nohide) {

            if (!scope.site.clientID) {
                return scope.$parent.setAlert('Choose a client for the new property', {type: 'd'});
            }

            if (scope.site.siteID) {
                scope.site.post().then(function () {
                    scope.onSave();
                });
                // Update all other sites models, eg. the sites dropdown on the trees report
                SiteModelUpdateService.updateSiteModels(scope.site);
            } else {
                Api.saveNewSite(scope.site).then(function (data) {
                    console.log('New site created', data);
                    scope.site = {};
                   // scope.site = data;
                    //scope.siteId = data.siteID;

                    modal.hide();

                    if (cb) {
                        //scope.openModal(data.siteID);
                        $timeout(function () {
                            cb(data);
                        }, 250);
                    }

                    scope.onSave();
                });
            }

            if (!nohide) {
                modal.hide();
            }
        };

		scope.hideSiteEditModal = function(){
			if(this.hide) $(document).unbind('keyup', hideOnEscape);
			modal.hide();
		}	

		var hideOnEscape = function(e){
			if(e.keyCode === 27) modal.hide();
		};

        var init = function () {
            el.on('click', function (event) {
                event.preventDefault();
                if (scope.isCheckForNewValue) {
                // In some places (center.top.block) in same DOM the site-id gets changed with time to time.
                // So we have to get the updated value of site-id each time. Use check-for-new-value="true" for those DOMs
                    scope.siteId = scope.$eval(attrs.siteId);
                }
                scope.openModal(scope.siteId);
            });
        };

        init();
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        //scope: {
        //    siteId: '=',
        //    clients: '=',
        //    mode: '@'
        //},        
        compile: function () {
            return linker;
        }
    };
}]);
