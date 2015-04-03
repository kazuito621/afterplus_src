/**
 * Created by Imdadul Huq on 11-Jan-15.
 */
app.directive('addEditUserModal',
    ['$modal', 'Api',
        function ($modal, Api) {
            'use strict';

            var linker = function (scope, el, attrs) {
                var modal;
                window.sues = scope;
                scope.newContact={};
                scope.addedSites=[];
                scope.selectedClient={};
                scope.selectedClient.email="";
                scope.addedClients=[];
                scope.addedSites=[];
                scope.isLoginDisabled=false;
                scope.userRoles=[];
                scope.openModal = function () {
                    if(scope.userRoles.length==0){
                        Api.getUserRoles().then(function(userRoles){
                            scope.userRoles = angular.copy(userRoles);
                            scope.newContact.role = scope.userRoles[0];
                        });
                    }
                    if (angular.isDefined(attrs.sites)) {
                        scope.sites = scope.$eval(attrs.sites);
                    }
                    if(scope.sites==undefined){ // in case site have been not provided.
                        Api.getSiteList().then(function (data) {
                            scope.sites=data;
                        })
                    }
                    if (!modal) {
                        modal = $modal({scope: scope, template: '/js/common/directives/addEditUserModal/addEditUserModal.tpl.html', show: false});
                    }

                    if(scope.userID){
                        var param={
                            id:scope.userID
                        };
                        Api.user.getUserById(param).then(function(data){
                            scope.newContact.email=data.email;
                            //scope.newContact.role.roleCode=data.role;
                            scope.newContact.fName=data.fName;
                            scope.newContact.lName=data.lName;
                            scope.newContact.phone=data.phone;
                            var idx= _.findObj(scope.userRoles,'roleCode',data.role, true);
                            scope.newContact.role={};
                            scope.newContact.role = scope.userRoles[idx];
                        });
                    }
                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });

                };
                var getRoleIndex=function(){
                   // for(var i=0;i<)
                }
                scope.closeModal = function () {
                    scope.showAddNewSiteContact = false;
                    scope.showAddNewSiteRep = false;
                    modal.hide();
                };

                scope.clientSelected = function (user) {
                    scope.selectedClient=user;

                };
                scope.siteSelect = function (user) {
                    scope.selectedProperty=user;

                };
                scope.SaveUser = function (event) {
                    var user={};
                    if(scope.newContact.email==undefined || scope.newContact.email.trim()==""||
                        scope.newContact.role==undefined){
                        return;
                    }
                    user.email=  scope.newContact.email;
                    user.role=   scope.newContact.role.roleCode;
                    user.fName = scope.newContact.fName;
                    user.lName = scope.newContact.lName;
                    user.phone = scope.newContact.phone;
                    user.siteIDs= _.pluck(scope.addedSites, 'siteID');
                    user.clientIDs=[];
                    angular.forEach(scope.addedClients,function(item){
                        user.clientIDs.push(item.client.clientID);
                    });
                    if(scope.isLoginDisabled) user.login_disabled=1;
                   /*
                    POST /site/multi/users
                    JSON BODY: {email:'bob@hotmail.com', fname:'bob', lname:'jones', role:'customer',
                    siteIDs:[123, 876, 432],
                    clientIDs:[456]}
                    or (for existing users)
                    JSON BODY: {userID:123, role:'sales', siteIDs:[123, 876, 432]}
                    */
                    Api.user.create(user).then(function (data) {
                        var a=1;
                    });
                };//

                scope.addClientsProperty = function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if(scope.selectedClient.userID==undefined) return;
                    for(var i=0;i<scope.addedClients.length;i++){
                        if(scope.addedClients[i].client.userID==scope.selectedClient.userID){
                            return;
                        }
                    }
                    var siteNames=[];
                    Api.getSitesByClientId(scope.selectedClient.userID).then(function(sites){
                        angular.forEach(sites,function(item){
                            siteNames.push({
                                siteName:item.siteName
                            });
                        });

                        scope.addedClients.push({
                            client:scope.selectedClient,
                            siteNames:siteNames
                        });
                        scope.selectedClient={};
                        $('#newclientsProp').val('');
                    });

                };
                scope.addProperty=function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    if(scope.selectedProperty.siteID==undefined) return;
                    for(var i=0;i<scope.addedSites.length;i++){
                        if(scope.addedSites[i].siteID==scope.selectedProperty.siteID){
                           return;
                        }
                    }
                    scope.addedSites.push(scope.selectedProperty);
                    scope.selectedProperty=undefined;
                    $('#newSiteName').val('');
                }
                scope.getPropertyNames=function(client){
                    var str="";
                    angular.forEach(client.siteNames,function(item){
                        str=str+","+item.siteName;
                    });
                    return str;
                };

                scope.removeFromAddedSiteList = function (site) {
                    for(var i=0;i<scope.addedSites.length;i++){
                        if(scope.addedSites[i].siteID==site.siteID){
                            scope.addedSites.splice(i,1);
                            break;
                        }
                    }
                };
                scope.removeFromAddedClientList = function (client) {
                    for(var i=0;i<scope.addedClients.length;i++){
                        if(scope.addedClients[i].userID==client.userID){
                            scope.addedClients.splice(i,1);
                            break;
                        }
                    }
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
                        scope.mode='new';
                        if (angular.isDefined(attrs.addEditUserModal)) {
                            scope.userID = scope.$eval(attrs.addEditUserModal);
                            scope.mode='edit';
                        }
                        scope.openModal();
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
