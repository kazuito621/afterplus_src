var ReportCtrl = app.controller(
    'ReportCtrl',
    ['$scope', 'Restangular', '$route', '$timeout', 'ReportService', '$location', '$anchorScroll', 'Auth',
        function ($scope, Restangular, $route, $timeout, ReportService, $location, $anchorScroll, Auth) {
            'use strict';

            // local and scoped vars
            var s = window.rcs = $scope;
            var myStateID = 'trees'; //this is trees because its embedded in trees controller
            var Rest = Restangular;
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

            var init = function () {
                RS.loadRecent();
                if (!s.report || !s.report.items) {
                    s.report = RS.getBlankReport();
                }
            };

            var groupReportItems = function () {
                console.log('about to group report items', s.report.items);
                var items = angular.copy(s.report.items);
                var res = [];
                var keys = [];

                var getTreatment = function (item) {
                    return {
                        treatmentTypeCode: item.treatmentTypeCode,
                        price: item.price
                    };
                };

                angular.forEach(items, function (item) {
                    var index = keys.indexOf(item.treeID);
                    if (index !== -1) { // another action for this tree
                        res[index].treatments.push(getTreatment(item));
                    } else {
                        var i = angular.copy(item);
                        keys.push(i.treeID);
                        i.treatments = [];
                        i.treatments.push(getTreatment(item));
                        res.push(i);
                    }
                });

                console.log('after grouping', res);
                console.log('report items initial after grouping', s.report.items);
                return res;
            };

            var ungroupReportItems = function () {
                console.log('about to ungroup report items', s.groupedItems);
                var items = angular.copy(s.groupedItems);
                var res = [];

                var setTreatment = function (item, treatment) {
                    item.treatmentTypeCode = treatment.treatmentTypeCode;
                    item.price = treatment.price;

                    return item;
                };

                angular.forEach(items, function (item) {
                    angular.forEach(item.treatments, function (treatment) {
                        res.push(setTreatment(item, treatment));
                    });
                });

                return res;
            };

            // let's watch the recentReportList property, and update on scope if it changes
            s.$on('onLoadRecent', function (evt, list) {
                s.recentReportList = list;
            });

            s.$on('onSignIn', function (evt, list) {
                RS.loadRecent();
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
                s.groupedItems = groupReportItems();
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

                Rest.all('site/' + s.emailRpt.siteID + '/contacts').getList()
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
                Rest.all('sendEstimate').post(s.emailRpt)
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

            // remove item from array of items
            s.removeItem = function (hashKey, type) {
                console.log('remove item', hashKey, type);
                if (type === null) {
                    type = 'items';
                }
                s.report[type] = s.report[type].filter(function (item) {
                    console.log('filtering report', item.$$hashKey, hashKey, item);
                    return (item.$$hashKey !== hashKey);
                });

                if (type === 'items') {
                    s.groupedItems = groupReportItems();
                }
            };

            var pre_init = function () {
                if ($route.current.params.stateID === myStateID) {
                    init();
                }
            };
            s.$on('$locationChangeSuccess', pre_init);
            pre_init();
        }]
);
