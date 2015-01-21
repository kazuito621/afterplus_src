var ReportCtrl = app.controller(
    'ReportCtrl',
    ['$scope', 'Api', '$route', '$timeout', 'ReportService', '$location', '$anchorScroll', 'Auth','$modal','$q',
        function ($scope, Api, $route, $timeout, ReportService, $location, $anchorScroll, Auth,$modal,$q) {
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
            var reportBackUp;
            var changedItems = [];

            s.editorOptions = {
//                filebrowserBrowseUrl: '/browser/browse.php',
//                filebrowserUploadUrl: '/uploader/upload.php',
                disableNativeSpellChecker: false
            };

            s.getRecentReportTitle = function (report) {
                var res = '';
                if (report.status=='approved') 
                    res += '[APPROVED] ';

                res += report.name + ' - ' + report.tstamp_updated;
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
                reportBackUp=undefined;
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
                s.siteOfReport={}
                s.report.customers=[]
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

                reportBackUp= angular.copy(s.report);

                Api.getSiteById(s.report.siteID).then(function (data) {
                    if (data){
                        s.siteOfReport = data;
                    }
                }),
                    Api.getSiteUsers(s.report.siteID, 'customer')
                        .then(function (res) {
                            s.report.customers=res;
                        })
            });


			var updateReportStatusUI = function(){
				s.disableApproveButton=false;
				if(!s.report.status || s.report.status=='sent' || s.report.status=='draft' || s.report.status=='change_requested') s.report.actionButton=1;
				else s.report.actionButton=0;
			}

            s.$on('$locationChangeStart', function (event, next, current) {
                if(Auth.is('customer')==true || reportBackUp==undefined ||
                    (ReportService.isChanged(reportBackUp, s.report)) == false) {
                    reportBackUp=undefined;
                    return;
                };
                $location.url($location.url(next).hash());
                event.preventDefault();
                var sm= s.$new();
                sm.leaveCurrentPage=function(){
                    reportBackUp=undefined;
                    $location.url($location.url(next).hash());
                }
                sm.stayOnCurrentPage=function(){
                }
                return $modal({ scope: sm, template: 'js/common/directives/templates/pageNavConfirm.tpl.html', show: true });
            });


            s.$on('itemsAddedToReport', function () {
                s.groupedItems = ReportService.groupReportItems();
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
            };



            s.saveReport = function () {
                var saveRequest = RS.saveReport();
                saveRequest.then(function (data) {
                    data.reportID += '';
                    if (data && data.reportID && $location.search().reportID !== data.reportID) {
                        $location.search({ reportID: data.reportID});
                    }
                });
                reportBackUp= s.report;
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
                        }
                    });

				Api.getEmailTemplate().then(function(res){
					if(res){
						s.emailRpt.message = res;
						if (Auth.data().fname) 
							s.emailRpt.message += Auth.data().fname;
						s.emailRpt.message+="\n"+cfg.getEntity().name;
					}

				});
            };

            s.sendReport = function (hideFn, showFn) {
                s.emailRpt.disableSendBtn = true;
                s.emailRpt.sendBtnText = 'Sending and verifying...';

                console.log('s.emailRpt', s.emailRpt);

                s.emailRpt.contactEmail = _.pluck(s.emailRpt.contactEmails, 'text').join(', ');
                s.emailRpt.cc_email = _.pluck(s.emailRpt.ccEmails, 'text').join(', ');

                Api.sendReport(s.emailRpt)
                    .then(function (msg) {
                        s.emailRpt.disableSendBtn = false;
                        s.emailRpt.sendBtnText = 'Send';

                        if (msg === 1) {
                            hideFn();
                            msg = 'Sent successfully';
                        }
                        s.setAlert(msg, {type: 'd'});
                    });
				$timeout(function(){ updateEmailLogs(); },2000);
				$timeout(function(){ updateEmailLogs(); },4000);
				$timeout(function(){ updateEmailLogs(); },10000);
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
            s.removeTreatmentFromEstimate = function (treeIndex, treatmentIndex) {
                // Remove treatment only if there is more than one treatment. Otherwise remove the item
//                console.log('Tree index: %s, treatment index: %s', treeIndex, treatmentIndex);

//                console.log(
//                    'Removing treatment from a tree',
//                    s.groupedItems[treeIndex],
//                    s.groupedItems[treeIndex].treatments[treatmentIndex]
//                );

                var tree = s.groupedItems[treeIndex];

                if (tree.treatments.length && tree.treatments.length > 1) { // remove only selected treatment
                    tree.treatments.splice(treatmentIndex, 1);
                    s.groupedItems[treeIndex] = tree;
                } else { // remove item
                    s.groupedItems.splice(treeIndex, 1);
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
        }]
);
