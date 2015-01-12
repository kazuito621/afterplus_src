/**
 * Created by Imdadul Huq on 11-Jan-15.
 */
app.directive('addEditUserModal',
    ['$modal', 'SiteModelUpdateService', 'Api', '$window', '$timeout',
        function ($modal, SiteModelUpdateService, Api, $window, $timeout) {
            'use strict';

            var linker = function (scope, el, attrs) {
                var modal;
                window.sues = scope;
                scope.userRoles=[
                    {role:'Admin'},{role:'Customer'},{role:'Inventory'},{role:'Sales'},
                ];
                scope.newContact={};
                scope.addedSites=[];
                scope.selectedClient={};
                scope.selectedClient.email="";
                Api.getUserRoles().then(function(userRoles){
                    scope.userRoles = angular.copy(userRoles);
                })
                scope.openModal = function (id) {
                    if (!id) {
                        console.log('Trying to open site users modal without site id provided');
                        return;
                    }
                    if (!modal) {
                        modal = $modal({scope: scope, template: '/js/common/directives/addEditUserModal/addEditUserModal.tpl.html', show: false});
                    }

                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });
                };

                scope.closeModal = function () {
                    scope.showAddNewSiteContact = false;
                    scope.showAddNewSiteRep = false;
                    modal.hide();
                };

                scope.clientSelected = function (user) {
                    scope.selectedClient=user;

                };
                scope.SaveUser = function (event) {
                    var user={};
                    if(user.email==undefined || user.email.trim()==""|| user.role==undefined){
                        return;
                    }
                    user.email= scope.newContact.email;
                    user.role= scope.newContact.role;
                    user.fName = scope.newContact.fName;
                    user.lName = scope.newContact.lName;
                    user.phone = scope.newContact.phone;
                    user.siteIDs= _.pluck(angular.copy(scope.addedSites), 'siteID');

                    //Api.userSite.assign(user).then(function (data) {
                    //    if (data[0]) {
                    //        scope.contacts.push(data[0]);
                    //        scope.site.userCustCount++;
                    //    }
                    //});
                };//

                scope.addClientsProperty = function (event) {
                    //event.preventDefault();
                    //event.stopPropagation();
//
                    //scope.showAddNewSiteRep = false;
//
                    Api.getSitesByClientId(scope.selectedClient.userID).then(function(sites){
                        angular.forEach(sites,function(item){
                            scope.addedSites.push({
                                siteName:item.siteName,siteID:item.siteID
                            });
                        })
                     var a=1;
                    });
                };

                scope.removeFromAddedSiteList = function (site) {
                    for(var i=0;i<scope.addedSites.length;i++){
                        if(scope.addedSites[i].siteID==site.siteID){
                            scope.addedSites.splice(i,1);
                            break;
                        }
                    }
                };

                var saveSiteCallback = function (site) {
                    console.log('Save site callback', site);

                    $timeout(function () {
                        console.log('Opening sues modal with id:', site.siteID);
                        scope.openModal(site.siteID);
                    }, 500);
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

                        var funcName = attrs.beforeOpen;
                        var func = scope.$parent[funcName];

                        if (funcName && angular.isFunction(func)) {
                            func(saveSiteCallback, true);
                        } else {
                            //	if(scope.site && scope.site.siteID)
                            //scope.openModal(scope.site.siteID);
                            //	else if(scope.siteId)
                              	//scope.openModal(scope.siteID);
                                scope.addedSites=[];
                              	scope.openModal(1);
                            //	else console.debug('Error in siteUserEditModal - no site or siteID found');
                        }
                    });
                };

                init();
            };

            return {
                restrict: 'EA',
                replace: false,
                transclude: false,
                //scope: {
                //    site: '='
                //},
                compile: function () {
                    return linker;
                }
            };
        }]);
