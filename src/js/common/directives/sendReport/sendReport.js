/**
 * Created by Imdadul huq on 28-Oct-15.
 */

app.directive('sendReport',
    ['$modal', 'Api','$timeout','$q','$popover',
        function ($modal, Api,$timeout,$q,$popover) {
            'use strict';
            var linker = function (scope, el, attrs) {
                var modal;
                scope.openModal = function () {
                    if (angular.isDefined(attrs.sendReport)){
								var rg = scope.$eval(attrs.sendReport);
								if(typeof rg == 'function') 					// check if its a funciton getter
                        	scope.report = rg();
								else													// or actual object
									scope.report = rg;							
							}
                    if (angular.isDefined(attrs.type))
                        scope.type = (attrs.type);
                    if (angular.isDefined(attrs.preCallBack))
                        scope.preCallBack = attrs.preCallBack;
                    if (angular.isDefined(attrs.postCallBack))
                        scope.postCallBack = attrs.postCallBack;

                    if (!modal)
                        modal = $modal({scope: scope, template: '/js/common/directives/sendReport/sendReport.tpl.html', show: false});

                    initEmailModal(scope.type);
                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });

                };
                var alreadySkipped= [];
                var contactEmailsBackup=[];
                var initEmailModal = function (type) {
                    if(scope.preCallBack)
                        scope.$eval(scope.preCallBack)();
                    scope.emailRpt={}
                    alreadySkipped=[];
                    if(type=='invoice') {
                        scope.type = 'sendInvoice';
                        scope.modalTitle = "Send Invoice: ";
                    }
                    else if(type=='report') {
                        scope.type = 'sendReport';
                        scope.modalTitle = 'Send Estimate:';
                    }

                    scope.modalTitle += scope.report.name;

                    scope.emailRpt.reportID = scope.report.reportID;
                    scope.emailRpt.siteID = scope.report.siteID;
                    scope.emailRpt.contactEmail = scope.report.contactEmail;
                    scope.emailRpt.cc_email = '';

                    scope.emailRpt.ccEmails = [];
                    scope.emailRpt.contactUsers = [];

                    scope.emailRpt.senderEmail = Auth.data().email;

                    scope.emailRpt.subject = cfg.getEntity().name
                    + ((type=='invoice') ? " Invoice #0" : " Estimate #")
                    + scope.report.reportID + " " + scope.report.name;
                    scope.emailRpt.disableSendBtn = false;
                    scope.emailRpt.sendBtnText = 'Send';

                    if(scope.report.customer){
                        scope.report.customer.forEach(function(item){
                            scope.emailRpt.contactUsers.push({'email':item.email, 'userID': item.userID, 'fName': item.fName, 'lName': item.lName});
                        });
                        scope.emailRpt.contactEmail = scope.emailRpt.contactEmails.join(', ');
                        contactEmailsBackup = angular.copy(scope.emailRpt.contactEmails);
                    }
                    else{
                        Api.getSiteUsers(scope.emailRpt.siteID, 'customer')
                            .then(function (res) {
                                if (!res) {
                                    return;
                                }
                                var emList = [];
                                var userList = [];
                                _.each(res, function (r) {
                                    if (r && r.email) {
                                        emList.push(r.email);
                                        userList.push({'email':r.email, 'userID': r.userID, 'fname': r.fName, 'lname': r.lName});
                                    }
                                });
                                if (emList) {
                                    scope.emailRpt.contactUsers = userList;
                                    scope.emailRpt.contactEmail = emList.join(', ');
                                    contactEmailsBackup = angular.copy(emList);
                                }
                            });
                    }

                    Api.getEmailTemplate(type).then(function(res){
                        if(res){
                            scope.emailRpt.message = res;
                        }
                    });
                };

                scope.sendReport = function (hideFn, showFn) {
                    scope.emailRpt.disableSendBtn = true;
                    scope.emailRpt.sendBtnText = 'Sending and verifying...';
                    isValidEmails().then(function(valid){
                        console.log('Email validation promise:' + valid);
                        console.log(valid.indexOf(false));
                        if(valid.indexOf(false)!=-1) {
                            scope.emailRpt.disableSendBtn = false;
                            scope.emailRpt.sendBtnText = 'Send';
                            return;
                        }

                        isNewEmails().then(function(data){
                            if(data.indexOf(true)!=-1) {
                                scope.emailRpt.disableSendBtn = false;
                                scope.emailRpt.sendBtnText = 'Send';
                                return;
                            };
                            _.each(scope.emailRpt.contactEmails,function(item){
                                item.email = item.text;
                            });
                            // s.emailRpt.contactEmail = _.pluck(s.emailRpt.contactEmails, 'text').join(', ');

                            scope.emailRpt.contactEmail = scope.emailRpt.contactUsers;
                            scope.emailRpt.cc_email = _.pluck(scope.emailRpt.ccEmails, 'text').join(', ');
                            scope.emailRpt.reportID = scope.report.reportID;
                            Api.sendReport(scope.emailRpt)
                                .then(function (res) {
                                    scope.emailRpt.disableSendBtn = false;
                                    scope.emailRpt.sendBtnText = 'Send';
                                    if (res.msg.trim().toLowerCase().match(/success/)){
                                        hideFn();
                                    }
                                    if(scope.postCallBack)scope.$eval(scope.postCallBack)();


                                    if(scope.type == 'sendInvoice')
                                        scope.report.status='invoiced';
                                });
                        });
                    });
                };

                var isValidEmails = function(){
                    console.log(scope.report);
                    var deferred = $q.defer();

                    var apis=[];

                    _.each(scope.emailRpt.contactUsers,function(item, index){
                        var deferred = $q.defer();
                        apis.push(deferred.promise);

                        if( !validateEmail(item.email) ){
                            enterUserEmail(item, deferred);
                            deferred.resolve(false);
                        } else {
                            deferred.resolve(true);
                        }
                    });


                    $q.all(apis).then(function(values) {
                        console.log('deferred:');
                        console.log(values);
                        deferred.resolve(values);
                    });

                    return deferred.promise;
                }

                var validateEmail = function(email) {
                    if(email.match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/) ){
                        return true;
                    }

                    return false;
                }

                var isNewEmails = function(){
                    var deferred = $q.defer();
                    var newAdded = [];

                    _.each(scope.emailRpt.contactUsers,function(item){
                        var idx = contactEmailsBackup.indexOf(item.email);
                        //var idx = _.findObj(contactEmailsBackup, 'text', item.text,true);
                        if (idx == -1){
                            var alreadySkippedIdx = alreadySkipped.indexOf(item.email);
                            if(alreadySkippedIdx == -1) {
                                newAdded.push(item.email);
                            }
                        }
                    });
                    if(newAdded.length==0){
                        $timeout(function(){ deferred.resolve([false]); },100);
                        return deferred.promise;
                        return;
                    }
                    var apis=[];
                    _.each(newAdded,function(item){
                        var deferred = $q.defer();
                        apis.push(deferred.promise);
                        Api.user.lookUp({email:item}).then(function (data) {
                            if(data.length == 0){
                                enterUserInfo(item);
                                deferred.resolve(true);
                            }
                            else {
                                deferred.resolve(false);
                            }
                        });
                    });

                    $q.all(apis)
                        .then(function(values) {
                            console.log(values);
                            deferred.resolve(values);
                        });

                    return deferred.promise;
                }
                var enterUserEmail = function (customer, deferred) {
                    var sm= scope.$new();

                    sm.validEmail = true;
                    sm.customer = customer;
                    sm.deferred = deferred;

                    if (sm.popover && typeof sm.popover.hide === 'function') {
                        sm.popover.hide();
                    }
                    // create new one
                    var modal = $('#emailField');
                    if(!sm.popover)
                        sm.popover = $popover(modal, {
                            scope: sm,
                            template: '/js/common/directives/enterUserInfo/enterUserEmail.tpl.html',
                            animation: 'am-flip-x',
                            placement: 'bottom'
                        });
                    //show popover
                    sm.popover.$promise.then(function () {
                        sm.popover.show();
                    });
                    sm.cancel = function(){
                        if (sm.popover && typeof sm.popover.hide === 'function') {
                            modal.off();
                            sm.popover.hide();
                        }
                    };
                    sm.ok = function(){
                        console.log(validateEmail(this.customer.email));
                        if( validateEmail(this.customer.email)) {

                            if (this.customer.userID != undefined) {
                                Api.user.update(this.customer, this.customer.userID);
                            }

                            if (sm.popover && typeof sm.popover.hide === 'function') {
                                modal.off();
                                sm.popover.hide();
                            }
                        } else {
                            sm.validEmail = false;
                        }
                    };
                }
                var enterUserInfo = function(email){
                    var sm= scope.$new();
                    sm.email=email;
                    if (sm.popover && typeof sm.popover.hide === 'function') {
                        sm.popover.hide();
                    }
                    // create new one
                    var modal = $('#emailField');
                    if(!sm.popover)
                        sm.popover = $popover(modal, {
                            scope: sm,
                            template: '/js/common/directives/enterUserInfo/enterUserInfo.tpl.html',
                            animation: 'am-flip-x',
                            placement: 'bottom'
                        });
                    //show popover
                    sm.popover.$promise.then(function () {
                        sm.popover.show();
                    });
                    sm.cancel = function(){
                        alreadySkipped.push(email);
                        if (sm.popover && typeof sm.popover.hide === 'function') {
                            modal.off();
                            sm.popover.hide();
                        }
                    };
                    sm.ok = function(){
                        var idx = _.findObj(scope.emailRpt.contactUsers, 'email', sm.email, true);
                        scope.emailRpt.contactUsers[idx].fname = this.fname;
                        scope.emailRpt.contactUsers[idx].lname = this.lname;
                        scope.emailRpt.contactUsers[idx].phone = this.phone;
                        alreadySkipped.push(email);
                        if (sm.popover && typeof sm.popover.hide === 'function') {
                            modal.off();
                            sm.popover.hide();
                        }
                    };
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
                        scope.mode='new';
                        scope.addedClients = [];
                        scope.addedSites = [];
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
