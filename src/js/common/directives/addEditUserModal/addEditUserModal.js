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
                scope.newContact.isLoginDisabled=false;
                scope.userRoles=[];

                var initVars=function(){
                    scope.newContact={};
                    scope.addedSites=[];
                    scope.selectedClient={};
                    scope.selectedClient.email="";
                    scope.addedClients=[];
                    scope.addedSites=[];
                    scope.newContact.isLoginDisabled=false;
                    scope.userRoles=[];
                }
                scope.openModal = function () {
                    initVars();
                    if(scope.userRoles.length==0){
                        Api.getUserRoles().then(function(userRoles){
                            scope.userRoles = angular.copy(userRoles);
                            scope.newContact.role = scope.userRoles[0];
                        });
                    }
                    if (angular.isDefined(attrs.sites)) 
                        scope.sites = scope.$eval(attrs.sites);

                    if (angular.isDefined(attrs.clients)) 
                        scope.clients = scope.$eval(attrs.clients);

                    if(scope.sites==undefined){ // in case site have been not provided.
                        Api.getSiteList().then(function (data) {
                            scope.sites=data;
                        })
                    }
                    if (!modal) 
                        modal = $modal({scope: scope, template: '/js/common/directives/addEditUserModal/addEditUserModal.tpl.html', show: false});


							scope.title='Add New User';
                    if(scope.user){
						  		scope.title='Edit User';
                        var param={
                            id:scope.user.userID
                        };
                        Api.user.getUserById(param).then(function(data){
									scope.newContact.userID=data.userID;
                            scope.newContact.email=data.email;
                            scope.newContact.fName=data.fName;
                            scope.newContact.lName=data.lName;
                            scope.newContact.phone=data.phone;
                            if(data.disabled == '1') scope.newContact.isLoginDisabled=true;
                            else scope.newContact.isLoginDisabled=false;

                            if(data.showStatInDash == '1') scope.newContact.showStatInDash=true;
                            else scope.newContact.showStatInDash=false;

                            var idx= _.findObj(scope.userRoles,'roleCode',data.role, true);
                            scope.newContact.role={};
                            scope.newContact.role = scope.userRoles[idx];
                            getSiteNames(data.siteIDs);
                            getClientNames(data.clientIDs);
                        });
                    }else{
						  	// if a new user, default to sending welcome email
						  	scope.newContact.sendWelcomeEmail=true;
						}

                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });

                };


			
					scope.sendPortalLink = function(user){
					 var s=scope;
                s.emailRpt={};
                s.mode='addEditUsers';
                s.type = 'sendPortalLink';
                s.modalTitle = "Email Portal Link";
                s.emailRpt.contactEmails = [];
                s.emailRpt.cc_email = '';

                s.emailRpt.ccEmails = [];

                s.emailRpt.senderEmail = Auth.data().email;

                s.emailRpt.subject = 'Manage your trees - Portal Login';
                s.emailRpt.disableSendBtn = false;
                s.emailRpt.sendBtnText = 'Send';
                s.emailRpt.contactEmails.push(user.email); 
                Api.getEmailPortalLink(user.userID).then(function(data){
                    s.emailRpt.message = data;
                })
            };

            scope.sendEmailPortalLink=function($hide, $show){
					var s = scope;
                s.emailRpt.disableSendBtn = true;
                s.emailRpt.sendBtnText = 'Sending...';

                s.emailRpt.contactEmail = _.pluck(s.emailRpt.contactEmails, 'text').join(', ');

                Api.sendEmailPortalLink(s.emailRpt)
                    .then(function (msg) {
                        s.emailRpt.disableSendBtn = false;
                        s.emailRpt.sendBtnText = 'Send';
                        $hide();
                    });
            }




                scope.closeModal = function () {

                    modal.hide();
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

						  if(scope.newContact.sendWelcomeEmail) user.sendWelcomeEmail=1;
                    
                    user.siteIDs= _.pluck(scope.addedSites, 'siteID');
                    user.clientIDs=[];
                    angular.forEach(scope.addedClients,function(item){
                        user.clientIDs.push(item.client.clientID);
                    });
                    if(user.clientIDs.length==0) user.clientIDs.push(-1);
                    if(user.siteIDs.length==0) user.siteIDs.push(-1);
                    if(scope.newContact.isLoginDisabled) user.disabled='1';
                    else user.disabled='0';
                    if(user.role!='customer' && scope.newContact.showStatInDash) user.showStatInDash='1';
                    else user.showStatInDash='0';

                    if(scope.user){
                        Api.user.update(user,scope.user.userID).then(function (data) {
                            scope.user.email=user.email;
                            scope.user.role=user.role;
                            scope.user.fName=user.fName;
                            scope.name=user.name+' '+user.lName;
                            scope.user.lName=user.lName;
                            scope.user.phone=user.phone;
                            modal.hide();
                        });
                    }
                    else{
                        Api.user.create(user).then(function (data) {
                            modal.hide();
                        });
                    }
                };//

                scope.addClientsProperty = function (event) {
                    if(this.selectedClient.clientID==undefined) return;
                    for(var i=0;i<this.addedClients.length;i++){
                        if(this.addedClients[i].client.clientID==this.selectedClient.clientID){
                            return;
                        }
                    }
                    this.addedClients.push({
                        client:this.selectedClient
                    });
                    this.selectedClient={};
                };

                var getSiteNames = function(siteIDs){
                    if(!siteIDs || siteIDs==[-1]) return;
                    siteIDs = siteIDs.split(',');
                    _.each(siteIDs,function(siteID){
					 			addToSiteList(siteID);
                    })
                }

                var getClientNames = function(clientIDs){
                    if(!clientIDs || clientIDs==[-1]) return;
                    clientIDs = clientIDs.split(',');
                    _.each(clientIDs,function(id){
                        scope.addedClients.push({
                            client: _.findObj(scope.clients,'clientID',id)
                        });

                    });
                }

                scope.addProperty=function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    if(this.selectedProperty.siteID==undefined) return;
					 		addToSiteList(this.selectedProperty.siteID, this.selectedProperty);
                    this.selectedProperty=undefined;
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

				var addToSiteList = function(siteID, site){
						if(!_.findObj(scope.addedSites, 'siteID', siteID)){
							if(!site) site = _.findObj(scope.sites,'siteID',siteID);
							if(site)
								scope.addedSites.push(site);
						}
				}
                scope.removeFromAddedClientList = function (client) {
                    for(var i=0;i<scope.addedClients.length;i++){
                        if(scope.addedClients[i].clientID==client.clientID){
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
                        scope.addedClients = [];
                        scope.addedSites = [];
                        scope.userID=null;
                        if (angular.isDefined(attrs.addEditUserModal)) {
									scope.mode='edit';
									if(attrs.addEditUserModal == 'myself'){
										scope.user = Auth.data();
										scope.editMyself=true;
									}else{
										 scope.user = scope.$eval(attrs.addEditUserModal);
									}
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
