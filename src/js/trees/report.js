var ReportCtrl = app.controller(
    'ReportCtrl',
    ['$scope', 'Api', '$route', '$timeout', 'ReportService', '$location', '$anchorScroll', 'Auth','$modal','$q','$rootScope','$popover',
        function ($scope, Api, $route, $timeout, ReportService, $location, $anchorScroll, Auth, $modal, $q, $rootScope,$popover) {
            'use strict';

            // local and scoped vars
            var s = window.rcs = $scope;
            var myStateID = 'trees'; //this is trees because its embedded in trees controller
            var RS = ReportService;
            s.whoami = 'ReportCtrl';
            s.rdata = { recentReportID: ''};
			s.report = {};
            s.service = {};
            s.emailRpt = {};
            s.groupedItems = [];
            s.estimateTreatmentCodes = [];
            s.treatmentDescriptions = [];
            s.siteOfReport={};
            var changedItems = [];
            var contactEmailsBackup=[];
			s.afiliations=cfg.getEntity().afiliations || '';
			if(s.afiliations)s.afiliations=s.afiliations.split(',');
			s.estimate_links=cfg.getEntity().estimate_links;

            s.editorOptions = {
//                filebrowserBrowseUrl: '/browser/browse.php',
//                filebrowserUploadUrl: '/uploader/upload.php',
                disableNativeSpellChecker: false
            };

            s.getRecentReportTitle = function (report) {
                var res = '(' + report.reportID + ') ' + report.name + ' - ';
				if(report.total_price) res+='$'+report.total_price+' - ';
				res += report.tstamp_updated;

                if (report.status)
                    res += ' [' + report.status.toUpperCase() + ']';
				
                return res;
            };

            // let's watch the recentReportList property, and update on scope if it changes
            s.$on('onLoadRecent', function (evt, list) {
                s.recentReportList = list;
            });

            s.$on('onSignIn', function (evt, list) {
                RS.loadRecent();
            });

            s.$on('onTreatmentDescriptions', function (evt, desc) {
                s.treatmentDescriptions = desc;
            });

            // when a recent report is selected

            s.$watch('rdata.recentReportID', function (ID) {
                RS.reportBackup=undefined;

                ID += '';
                if (ID.length && $location.search().reportID !== ID) {
                    $location.search({ reportID: ID});
                }

                // todo -- if changes were made, but not saved to the report, we should probably
                // ask them if they want to save
                s.setAlert('Loading',{type:'ok',time:5});
                RS.loadReport(ID);
            });

            // When a new report is loaded, bind it to this scope
            s.$on('onLoadReport', function (evt, rpt) {
                s.report = rpt;                
                
                //Use to load site on basis of recent selected report in tree.js
                $rootScope.$broadcast('OnLoadReportEvent', { siteID: rpt.siteID });

                s.siteOfReport = {}
                s.report.customers=[]
                if(s.report.sales_userID==undefined){
                    setDefaultSalesRep();
                }
                // set email links
                if (rpt.emailLogs) {
                    _.each(rpt.emailLogs, function (e) {
                        if (e.hashLink) {
                            e.link = cfg.hostAndPort() + '/#/estimate/' + e.hashLink;
                        }
                    });
                }
                //s.report.grandTotal = RS.getGrandTotal(s.report.items);
                s.groupedItems = ReportService.groupReportItems();
                updateReportStatusUI();

                if(s.report.siteID==undefined || s.report.siteID=="") return;

                RS.reportBackup=angular.copy(s.report);

                getSiteBySiteID();
                getSiteCustomers();
            });

            var getSiteCustomers=function(){
                Api.getSiteUsers(s.report.siteID, 'customer')
                    .then(function (res) {
                        s.report.customers=res;
                    })
            }

            var getSiteBySiteID=function(){
                Api.getSiteById(s.report.siteID).then(function (data) {
                    if (data){
                        s.siteOfReport = data;
                    }
                })
            }

			var updateReportStatusUI = function(){
				s.disableApproveButton=false;
				if(!s.report.status || s.report.status=='sent' || s.report.status=='draft' || s.report.status=='change_requested') s.report.actionButton=1;
				else s.report.actionButton=0;
			}


            s.isChanged=function(){
                if(
                    s.data.mode()!=="trees"
                    || !Auth.isAtleast('inventory')
                    || RS.reportBackup==undefined
                    || discard == true
                    || !((RS.reportBackup=='new') ||  ReportService.isChanged(RS.reportBackup, s.report))
                ){
                    return false;
                }
                return true;
            }
            var discard=false;
            s.$on('$locationChangeStart', function (event, next, current) {
                if(s.isChanged()==false) return;

                $location.url($location.url(next).hash());
                event.preventDefault();
                var sm= s.$new();
                sm.leaveCurrentPage=function(){
                    RS.reportBackup=undefined;
                    discard=true;
                    $location.url($location.url(next).hash());

                }
                sm.stayOnCurrentPage=function(){
                }
                $('#loadingDiv').css('display','none'); // To remove the loading div.
                return $modal({ scope: sm, template: 'js/common/directives/templates/pageNavConfirm.tpl.html', show: true });
            });

            var setDefaultSalesRep=function(){
                s.report.sales_userID=Auth.authData.userID;
                s.report.sales_email=Auth.authData.email;
                s.report.sales_fname=Auth.authData.fName;
                s.report.sales_lname=Auth.authData.lName;
            }

            s.$on('itemsAddedToReport', function () {
                if(RS.reportBackup==undefined)
                    RS.reportBackup= 'new';
                s.groupedItems = ReportService.groupReportItems();
                if(s.report.customers.length==0){
                    getSiteCustomers();
                }
            });

            // After the counts for the treatments have been added, add in the service descriptions 
            s.$on('treatmentCountsProcessed', function (evt, treatments) {
                var that = $scope;
                RS.setTreatmentDescriptions(treatments, that);
            });

            // returns true if row with passed id is the current highlighted row
            s.rowHighlightClass = function (item) {
                if (item.$$hashKey === s.highLightedRowId) {
                    return 'highlighted-row';
                }

                if (changedItems.indexOf(item.$$hashKey) !== -1) {
                    return 'changed-row';
                }

                return '';
            };

            s.onTreatmentTypeUpdate = function (item, treatment) {
                //set default price
                treatment.price = RS.getTreatmentPrice(treatment.treatmentTypeCode, item.dbhID);

                s.report.items = RS.ungroupReportItems();
            };

            s.onTreatmentPriceUpdate = function () {
                s.report.items = RS.ungroupReportItems();
            };

            // After an item in the report has been edited via x-editable
            // sometimes the adjusted DOM throws the scroll out of position,
            // One way to fix is record scroll and go back there...
            s.onShowEditItem = function (id) {
                s.tempScrollPos = $(window).scrollTop();
                s.highLightedRowId = id;
                changedItems.push(id);
            };

            s.onHideEditItem = function () {
                $(window).scrollTop(s.tempScrollPos);
            };
            // another way later..if the above doesnt work that well, is this way:
            /*
             add this to template in place of other onhide/onshow
             onhide="onAfterEditReportItem('rpt_item_'+item.$$hashKey)">
             s.onAfterEditReportItem = function(elID){
             $location.hash(elID);
             $anchorScroll();
             }
             */


            /*
             // when a selected report is loaded
             s.$watch( function () { return ReportService.report; }, function ( report ) {
             console.log("report returned: "+report);
             if(!report) return;
             if(s.report) return;
             s.report=report;
             return;

             if(!report.name) report.name=s.report.name;
             if(!report.notes) report.notes=s.report.notes;
             s.report=report;
             });
             */


            s.newReport = function () {
                RS.getBlankReport();

				// clear out the query string
				if( $location.search().reportID ) $location.search('reportID','');
				if( $location.search().siteID ) $location.search('siteID','');
            };



            s.saveReport = function () {

                var allTreatmentsSaved = s.checkAllTreatmentCodeSaved();
                if (!allTreatmentsSaved) {
                    s.setAlert("Please Select Treatments First", { type: 'd' });
                    return;
                }

                var saveRequest = RS.saveReport();
                saveRequest.then(function (data) {
                    data.reportID += '';
                    RS.reportBackup= angular.copy(s.report);
                    // If you change the value of s.report,make sure that
                    // RS.reportBackup must be reinitialized after all change in s.report has done AND before $location call.
                    if (data && data.reportID && $location.search().reportID !== data.reportID) {
                        $location.search({ reportID: data.reportID});
                    }
                });
                RS.reportBackup= angular.copy(s.report); // This is for faster case save and navigate instantly.
            };

            s.initEmailModal = function () {
                s.saveReport();
                if (s.report.contact) {
                    var toName = s.report.contact.trim();
                    var tmp = toName.split(' ');
                    if (tmp.length > 1) {
                        toName = tmp[0];
                    }
                }
                alreadySkipped=[];
                s.type = 'sendReport';
                s.modalTitle = "Email: " + s.report.name;
                s.emailRpt.reportID = s.report.reportID;
                s.emailRpt.siteID = s.report.siteID;
                s.emailRpt.contactEmail = s.report.contactEmail;
                s.emailRpt.cc_email = '';

                s.emailRpt.ccEmails = [];

                s.emailRpt.senderEmail = Auth.data().email;

                s.emailRpt.subject = cfg.getEntity().name + " Estimate #" + s.report.reportID + " - " + s.report.name;
                s.emailRpt.disableSendBtn = false;
                s.emailRpt.sendBtnText = 'Send';

                Api.getSiteUsers(s.emailRpt.siteID, 'customer')
                    .then(function (res) {
                        if (!res) {
                            return;
                        }
                        var emList = [];
                        _.each(res, function (r) {
                            if (r && r.email) {
                                emList.push(r.email);
                            }
                        });
                        if (emList) {
                            s.emailRpt.contactEmail = emList.join(', ');
                            s.emailRpt.contactEmails = emList;
                            contactEmailsBackup = angular.copy(emList);
                        }
                    });

				Api.getEmailTemplate().then(function(res){
					if(res){
						s.emailRpt.message = res;
					}
				});
            };

            s.sendPortalLink=function(){
                s.saveReport();
                if (s.report.contact) {
                    var toName = s.report.contact.trim();
                    var tmp = toName.split(' ');
                    if (tmp.length > 1) {
                        toName = tmp[0];
                    }
                }
                alreadySkipped=[];
                s.type = 'sendPortalLink';
                s.modalTitle = "Email Portal Link";
                s.emailRpt.reportID = s.report.reportID;
                s.emailRpt.siteID = s.report.siteID;
                s.emailRpt.contactEmail = s.report.contactEmail;
                s.emailRpt.cc_email = '';

                s.emailRpt.ccEmails = [];

                s.emailRpt.senderEmail = Auth.data().email;

                s.emailRpt.subject = 'Manage your trees - Portal Login';
                s.emailRpt.disableSendBtn = false;
                s.emailRpt.sendBtnText = 'Send';

                Api.getSiteUsers(s.emailRpt.siteID, 'customer')
                    .then(function (res) {
                        if (!res) {
                            return;
                        }
                        var emList = [];
                        _.each(res, function (r) {
                            if (r && r.email) {
                                emList.push(r.email);
                            }
                        });
                        if (emList) {
                            s.emailRpt.contactEmail = emList.join(', ');
                            s.emailRpt.contactEmails = emList;
                            contactEmailsBackup = angular.copy(emList);
                        }
                    });
                Api.getEmailPortalLink().then(function(data){
                    s.emailRpt.message = data;
                })
            }

            var enterUserInfo = function(email){
                var sm= s.$new();
                sm.email=email;
                if (sm.popover && typeof sm.popover.hide === 'function') {
                    sm.popover.hide();
                }
                // create new one
                var el = $('#emailField');
                if(!sm.popover)
                    sm.popover = $popover(el, {
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
                        el.off();
                        sm.popover.hide();
                    }
                };
                sm.ok = function(){
                    var idx = _.findObj(s.emailRpt.contactEmails, 'text', sm.email, true);
                    s.emailRpt.contactEmails[idx].fname = this.fname;
                    s.emailRpt.contactEmails[idx].lname = this.lname;
                    s.emailRpt.contactEmails[idx].phone = this.phone;
                    alreadySkipped.push(email);
                    if (sm.popover && typeof sm.popover.hide === 'function') {
                        el.off();
                        sm.popover.hide();
                    }
                };
            }

            var alreadySkipped= [];

            var isNewEmails = function(){
                var deferred = $q.defer();
                var newAdded = [];
                console.log(contactEmailsBackup)
                console.log(s.emailRpt.contactEmails)
                _.each(s.emailRpt.contactEmails,function(item){
                   var idx = contactEmailsBackup.indexOf(item.text);
                    //var idx = _.findObj(contactEmailsBackup, 'text', item.text,true);
                    if (idx == -1){
                        var alreadySkippedIdx = alreadySkipped.indexOf(item.text);
                        if(alreadySkippedIdx == -1) {
                            newAdded.push(item.text);
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
            s.sendEmailPortalLink=function($hide, $show){
                s.emailRpt.disableSendBtn = true;
                s.emailRpt.sendBtnText = 'Sending...';
                isNewEmails().then(function(data){
                    if(data.indexOf(true)!=-1) {
                        s.emailRpt.disableSendBtn = false;
                        s.emailRpt.sendBtnText = 'Send';
                        return;
                    };
                    _.each(s.emailRpt.contactEmails,function(item){
                       item.email = item.text;
                    });
                   // s.emailRpt.contactEmail = _.pluck(s.emailRpt.contactEmails, 'text').join(', ');
                    s.emailRpt.contactEmail =angular.copy(s.emailRpt.contactEmails);
                    s.emailRpt.cc_email = _.pluck(s.emailRpt.ccEmails, 'text').join(', ');
//
                    Api.sendEmailPortalLink(s.emailRpt)
                        .then(function (msg) {
                            s.emailRpt.disableSendBtn = false;
                            s.emailRpt.sendBtnText = 'Send';
                            $hide();
                        });
                    $timeout(function(){ updateEmailLogs(); },2000);
                    $timeout(function(){ updateEmailLogs(); },4000);
                    $timeout(function(){ updateEmailLogs(); },12000);
                    $timeout(function(){ updateEmailLogs(); },30000);
                });

            }
            s.sendReport = function (hideFn, showFn) {
                s.emailRpt.disableSendBtn = true;
                s.emailRpt.sendBtnText = 'Sending and verifying...';

                isNewEmails().then(function(data){
                    if(data.indexOf(true)!=-1) {
                        s.emailRpt.disableSendBtn = false;
                        s.emailRpt.sendBtnText = 'Send';
                        return;
                    };
                    _.each(s.emailRpt.contactEmails,function(item){
                        item.email = item.text;
                    });
                    // s.emailRpt.contactEmail = _.pluck(s.emailRpt.contactEmails, 'text').join(', ');
                    s.emailRpt.contactEmail =angular.copy(s.emailRpt.contactEmails);
                    s.emailRpt.cc_email = _.pluck(s.emailRpt.ccEmails, 'text').join(', ');
//
                    Api.sendReport(s.emailRpt)
                        .then(function (msg) {
                            s.emailRpt.disableSendBtn = false;
                            s.emailRpt.sendBtnText = 'Send';
                            if (msg.msg.trim().toLowerCase() == ('emails sent successfully')) {
                                hideFn();
                            }
                        });
                    $timeout(function(){ updateEmailLogs(); },2000);
                    $timeout(function(){ updateEmailLogs(); },4000);
                    $timeout(function(){ updateEmailLogs(); },12000);
                    $timeout(function(){ updateEmailLogs(); },30000);
                });
            };

			var updateEmailLogs = function(){
				Api.getEmailLogs(s.emailRpt.reportID).then(function(d){
					if(d && d[0] && d[0].senderID) s.report.emailLogs=d;
				});
			}

            s.addMiscService = function (desc, qty, price) {
                RS.addMiscService(desc, qty, price);
                s.service.desc = "";
                s.service.quantity = 1;
                s.service.price = "";
            };
            s.setServiceDetails=function(service){
                s.service.desc=service.name;
                s.service.price=service.price;
            }
            s.approveEstimate = function(){
                s.disableApproveButton = true;
                s.setAlert('Processing...', {time: 5});
                Api.approveReport(s.report.reportID).then(function(data){
                    s.report.status = 'approved';
                    s.disableApproveButton = false;
					updateReportStatusUI();
                });
            }

            // Remove treatment from estimate
            s.removeTreatmentFromEstimate = function (treeID, treatmentTypeCode) {
                // Remove treatment only if there is more than one treatment. Otherwise remove the item
//                console.log('Tree index: %s, treatment index: %s', treeID, treatmentTypeCode);


                var tree=_.findObj(s.groupedItems, 'treeID', treeID);
                var indexOfTree=_.findIndex(s.groupedItems, function(t) { return t.treeID == treeID; })
                if (tree.treatments.length && tree.treatments.length > 1) { // remove only selected treatment
                    var idx=_.findIndex(tree.treatments, function(t) { return t.treatmentTypeCode == treatmentTypeCode; })
                    tree.treatments.splice(idx, 1);
                    s.groupedItems[indexOfTree] = tree;
                } else { // remove item
                    s.groupedItems.splice(indexOfTree, 1);
                }

                s.report.items = ReportService.ungroupReportItems();
                s.groupedItems = ReportService.groupReportItems();
            };

            // remove item from array of items
            s.removeItem = function (hashKey, type) {
                if (type === null) {
                    type = 'items';
                }

                s.report[type] = s.report[type].filter(function (item) {
                    return (item.$$hashKey !== hashKey);
                });
            };

            var animateMarker = function (marker, animationType) {
                if(!google.maps || !google.maps.Animation) { return; }
                var animation = google.maps.Animation[animationType];

                if (animationType === null) {
                    animation = null;
                }

                if (marker) {
                    marker.setAnimation(animation);
                }
            };

            // Handles animation of google map tree pins...
            // When user rolls over a tree result, the pin drops
            var hoveredItem = {
                animationCompleted: false
            };
            var setSalesUsers = function(){
                s.salesUsers = [];

                Api.getSalesUsers().then(function(saleUsers){
                    _.each(saleUsers, function(saleUser){
                        var shortEmail = saleUser.email.substr(0, saleUser.email.indexOf('@'));

                        s.salesUsers.push({id: saleUser.userID, email: saleUser.email,fName:saleUser.fName,
                            lName:saleUser.lName, phone: saleUser.phone,shortEmail: shortEmail});
                    })
                })
            };
            s.getSalesUsers = function(){
                if (!s.salesUsers){
                    setSalesUsers();
                }
                return s.salesUsers;
            };
            s.onItemRollOver = function (marker) {
                if (!hoveredItem.animationCompleted) {
                    animateMarker(marker, 'BOUNCE');
                }
                hoveredItem.animationCompleted = true;
            };

            s.onItemRollOut = function (marker) {
                animateMarker(marker, null);
                hoveredItem.animationCompleted = false;
            };
            s.reloadReport=function(){
                RS.loadReport(s.report.reportID);
            };
            s.updateSalesRep=function(rpt){
                var newSalesUser = _.findObj(s.salesUsers, 'id', rpt.sales_userID);
                if (newSalesUser){
                    rpt.sales_fname = newSalesUser.fName;
                    rpt.sales_lname = newSalesUser.lName;
                    rpt.sales_email = newSalesUser.email;
                    rpt.sales_phone = newSalesUser.phone;
                }
                //Api.saveReport(rpt).then(function(data1){
                //    RS.loadReport(s.report.reportID);
                //})
            };
            //refreshSiteUsers(scope.site.siteID,data,'add');
            s.updateContact=function(siteID,data,type){
                if(type=='add'){
                    s.report.customers.push(data[0]);

                }
                else if(type=='delete'){
                    for(var i=0;i<s.report.customers.length;i++){
                        if(s.report.customers[i].userID==data.userID){
                            s.report.customers.splice(i,1);
                            break;
                        }
                    }
                }
            };
            // only if in trees state...
            if (s.renderPath[0] === 'trees') {
                RS.loadRecent();
                if (!s.report || !s.report.items) {
                    s.report = RS.getBlankReport();
                }
            }

            // add New TreatmentCode
            s.addNewTreatment = function (treatments) {
                treatments.push({
                    treatmentTypeCode: "Select TreatmentCode",
                    price: "0.00"
                });
            };

            s.checkAllTreatmentCodeSaved = function () {
                var isAllSavedTreatments = true;
                for (var index = 0; index <= s.groupedItems.length - 1; index++) {
                    var item = s.groupedItems[index];
                    for (var innerIndex = 0; innerIndex <= item.treatments.length - 1; innerIndex++) {
                        var treatMent = item.treatments[innerIndex];
                        if (treatMent.treatmentTypeCode !== undefined &&
                            treatMent.treatmentTypeCode.toString().toLocaleLowerCase() === "select treatmentcode") {
                            isAllSavedTreatments = false;
                        }
                        //Break Inner loop if there is any un-saved treatment exist
                        if (!isAllSavedTreatments)
                            break;
                    }
                    //Break Outer loop if there is any un-saved treatment exist
                    if (!isAllSavedTreatments)
                        break;
                }
                return isAllSavedTreatments;
            };
        }]
);
