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

                        // replace API call with hardcode
                        //Api.getUserRoles().then(function(userRoles){
                        //    scope.userRoles = angular.copy(userRoles);
                        //    scope.newContact.role = scope.userRoles[0];
                        //});

                        //Hardcoded
                        scope.userRoles = [
                            {"roleCode":"customer","name":"Customer"},
                            {"roleCode":"admin","name":"Admin"},
                            {"roleCode":"sales","name":"Sales"},
                            {"roleCode":"foreman","name":"Foreman"},
                            {"roleCode":"crew","name":"Crew"}
                        ]
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

                            //var idx= _.findObj(scope.userRoles,'roleCode',data.role, true);
									 // role is not used anymore... roles[] array is
                            //scope.newContact.role={};
                            //scope.newContact.role = scope.userRoles[idx];

									if(data.roles.substr(-1)==',') data.roles=data.roles.substr(0,data.roles.length-1)
                            scope.newContact.roles = data.roles.split(',');

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

					scope.roleChanged = function(roleClicked){
						var c = $('input.roles.customer')
						//if(c && c.prop('checked')){				// if customer
						if('customer' == roleClicked){				// if customer
							scope.newContact.roles=['customer'];
							$('input.showstat').prop('disabled',true);
						}else{		// if not customer
							var idx=scope.newContact.roles.indexOf('customer')
							if(idx>=0) scope.newContact.roles.splice(idx,1);
							$('input.showstat').prop('disabled',false);
						}
						
						if( scope.newContact.roles && scope.newContact.roles.length>0 )
							$('div#rolesContainer').css({backgroundColor:'#fff'});
						else
							$('div#rolesContainer').css({backgroundColor:'#fcc'});
					}
			
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

                var isValidEmail = function() {
                    if (scope.newContact.email==undefined || !scope.newContact.email.match(/^[^@]+@[^\.]+\..+$/)) {
                        return false;
                    }
                    return true;
                }

                var passMisMatch = function(){
               	if(!scope.newContact.newPass || !scope.newContact.newPass.length) return false;
              		if(scope.newContact.newPass!=scope.newContact.newPassConfirm) return true;
                	return false;
                }

                scope.SaveUser = function (event) {
                    if (!isValidEmail()) {
                        scope.emailNotValid = true;
                        return;
                    } else {
                        scope.emailNotValid = false;
                    }

						  if(passMisMatch()==true){
								scope.passMisMatch = true;
								return;
						  } else {
								scope.passMisMatch = false;
						  }

                    var user={};
                    if(scope.newContact.email==undefined || scope.newContact.email.trim()=="" ||
                        !scope.newContact.roles.length){
                        return;
                    }

                    user.email=  scope.newContact.email;
                    user.roles= scope.newContact.roles.join(',');
                    user.fName = scope.newContact.fName;
                    user.lName = scope.newContact.lName;
                    user.phone = scope.newContact.phone;
                    user.pass = scope.newContact.newPass;

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

							$('button#user-save-button').attr("disabled","disabled");
							setTimeout(function(){ $('button#user-save-button').removeAttr("disabled"); },3000);

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
