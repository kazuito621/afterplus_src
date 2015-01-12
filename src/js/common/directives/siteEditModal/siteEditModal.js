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

        var modal;
        var newSite = {clientID: ''};

        scope.onSave = function () {
            var funcName = attrs.onSave;
            var func = scope.$parent[funcName];

            if (funcName && angular.isFunction(func)) {
                func();
            }
        };

        //when user creates new property and selects Client:
        //system should copy address fields from Client to new property
        scope.copyAddressFromClientToNewSite = function(id){
            if (scope.mode && scope.mode=='new'){ //if mode!='new'('edit') => we don't need to copy address
                //find client info
                var clientInfo = [];
                for (var i = 0; i < scope.clients.length; i++){
                    if (scope.clients[i].clientID==id){
                        clientInfo = scope.clients[i];
                        break;
                    }
                }

                //copy address fields
                scope.site.street = clientInfo.street;
                scope.site.city = clientInfo.city;
                scope.site.state = clientInfo.state;
                scope.site.zip = clientInfo.zip;
            }
        }

        scope.openModal = function (id) {
            modal = $modal({scope: scope, template: '/js/common/directives/siteEditModal/siteEditModal.tpl.html', show: false});
            scope.site = angular.copy(newSite);
            if (id) {
                Api.updateSite(id).then(function (data) {
                    scope.site = data;
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
        };

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

                    scope.site = data;
                    scope.siteId = data.siteID;

                    modal.hide();

                    if (cb) {
                        scope.openModal(data.siteID);
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
			if(e.keyCode === 27) scope.hide();
		};

        var init = function () {
            el.on('click', function (event) {
                event.preventDefault();
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
