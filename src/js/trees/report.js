var ReportCtrl = app.controller(
    'ReportCtrl',
    ['$scope', 'Api', '$route', '$timeout', 'ReportService', '$location', '$anchorScroll', 'Auth',
        function ($scope, Api, $route, $timeout, ReportService, $location, $anchorScroll, Auth) {
            'use strict';

            // local and scoped vars
            var s = window.rcs = $scope;
            var myStateID = 'trees'; //this is trees because its embedded in trees controller
            var RS = ReportService;
            s.whoami = 'ReportCtrl';
//            s.recentReportList; // I don't understand the purpose of this so I commented it. Nikita.
            s.rdata = { recentReportID: ''};
            s.service = {};
//            s.service.desc;
//            s.service.price;
            s.emailRpt = {};
            s.groupedItems = [];
            s.estimateTreatmentCodes = [];
            s.treatmentDescriptions = [];
            var changedItems = [];

            s.editorOptions = {
                filebrowserBrowseUrl: '/browser/browse.php',
                filebrowserUploadUrl: '/uploader/upload.php',
                disableNativeSpellChecker: false
            };

            s.getRecentReportTitle = function (report) {
                var res = '';

                if (report.approved == 1) {
                    res += '[APPROVED] ';
                }

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
                // todo -- if changes were made, but not saved to the report, we should probably
                // ask them if they want to save
                RS.loadReport(ID);
            });

            // When a new report is loaded, bind it to this scope
            s.$on('onLoadReport', function (evt, rpt) {
                s.report = rpt;
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
                RS.saveReport();
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
                s.emailRpt.senderEmail = Auth.data().email;
                s.emailRpt.subject = "A Plus Tree Estimate #" + s.report.reportID + " - " + s.report.name;
                s.emailRpt.message = "Hi,\n\nThank you for providing us the opportunity to care for your trees!  In the link below you will find a customized estimate engineered by one of our Certified Arborist specifically for your trees.\n\n" + "Please review our proposal and get back to us at your earliest convenience as we look forward to thoroughly impressing you with our professional work and outstanding customer service.\n\n" + "From planting to removals, and everything in between, we've got you covered.  If you have any questions, feel free to contact us toll free at (866) 815-2525 or office@aplustree.com.\n\n" + "Sincerely,\n";
                if (Auth.data().fname) {
                    s.emailRpt.message += Auth.data().fname;
                } else {
                    s.emailRpt.message += "A Plus Tree Service";
                }
                s.emailRpt.emailCC = "";
                s.emailRpt.disableSendBtn = false;
                s.emailRpt.sendBtnText = 'Send';

                Api.getSiteContacts(s.emailRpt.siteID)
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
                        }
                    });
            };

            s.sendReport = function (hideFn, showFn) {
                s.emailRpt.disableSendBtn = true;
                s.emailRpt.sendBtnText = 'Sending and verifying...';
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
            };

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
                    s.report.approved = '1';
                    s.disableApproveButton = false;
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

            s.goToEstimatesList = function () {
                $location.url('/estimates?siteID=' + s.report.siteID);
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
