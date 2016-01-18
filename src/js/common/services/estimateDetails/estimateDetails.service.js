app
    .service('estimateDetailsService', [ '$rootScope', '$modal', 'Api', 'Restangular', function ($rootScope, $modal, Api, Rest) {
        scope = $rootScope.$new();

        scope.statuses = [
            {value:'completed', txt:'Completed'},
            {value:'invoiced', txt:'Invoiced'},
            {value:'paid', txt:'Paid'},
        ];

        scope.groups = [];

        var show = function (report) {
            scope.report = report;
            loadSite(report.siteID);
            loadGroups();
            loadContacts();
            prepareReportData(report);

            var detailsModal = $modal({
                scope: scope,
                template: '/js/common/services/estimateDetails/estimateDetails.tpl.html',
                show: false,
                controller: 'estimateDetailsController',
                controllerAs: 'ctrl'
            });

            detailsModal.$promise.then(detailsModal.show);
        };

        var loadSite = function(siteID) {
            Api.getSiteById(siteID, {}).then(function (site) {
                scope.site = site;
            });
        };

        var loadGroups = function (deferred) {
            // create email short for report foreman and sales
            scope.report.foreman_email_short = (scope.report.foreman_email != undefined) ? scope.report.foreman_email.split('@')[0] : null;
            scope.report.sales_email_short = (scope.report.sales_email != undefined) ? scope.report.sales_email.split('@')[0] : null;

            // load groups
            if(scope.groups.length>0) return;
            Api.GetForemans()
                .then(function (response) {

                    angular.forEach(response, function (item) {
                        scope.groups.push({ "userID": item.userID, "text": item.email.split('@')[0],"fName":item.fName,lName:item.lName,email: item.email});
                    });
                    if(deferred) {
                        deferred.resolve(scope.groups);
                    }
                    console.log(scope.groups);
                });
        };

        var loadContacts = function() {
            Rest.one('site/'+scope.report.siteID+'/users?role=customer').get().then(function(res){
                if(!res){
                    var txt="<div class='estContacts'>"+scope.site.contact+"<br>"
                        +"<a href='mailto:"+scope.site.email+"' target=_new>"+scope.site.email+"</a><BR>"
                        +"Tel: "+scope.site.phone+"</div>";
                }else{
                    var txt='';
                    var ct=0;
                    _.each(res, function(r){
                        ct++; if(ct>3) return false;
                        txt += '<div class="estContacts">'+r.fName + ' ' + r.lName + '<br>'
                            +'<a href="mailto:'+r.email+'" target=_new>'+r.email+'</a><br>'
                            +'Tel: '+r.phone + '</div>';
                    });
                }
                scope.contacts=txt;
            });
        };

        var prepareReportData = function(report) {
            scope.status = report.status;
            scope.jobdescription = report.price;
            scope.price = report.total_price.replace(",", "");
            if(report.todo_price == undefined) {
                report.todo_price = scope.price;
            }
            scope.todo_price = parseFloat(report.todo_price.replace(",", ""));
            scope.status = (report.status);
        };

        scope.saveJobToForeman = function () {
            Api.changeEstimateProperty(scope.report.reportID, {
                job_userID: scope.report.job_userID
            }).then(function (response) {
                var newForeman = _.findObj(scope.groups, 'userID', scope.report.job_userID);
                scope.report.foreman_email=newForeman.email;
                scope.report.foreman_fname=newForeman.fName;
                scope.report.foreman_lname=newForeman.lName;
                scope.report.foreman_email_short=newForeman.email.split('@')[0];
            });
        };

        scope.saveJobToSalesUser = function () {

            Api.changeEstimateProperty(scope.report.reportID, {
                sales_userID: scope.report.sales_userID
            }).then(function (response) {
                var newSalesman = _.findObj(scope.groups, 'userID', scope.report.sales_userID);
                scope.report.sales_email=newSalesman.email;
                scope.report.sales_fname=newSalesman.fName;
                scope.report.sales_lname=newSalesman.lName;
                scope.report.sales_email_short=newSalesman.email.split('@')[0];
            });
        };

        scope.updateStatus = function(s){
            Api.setReportStatus(scope.reportID, scope.report.status).then(function(d){
                scope.report.status  = scope.status;
                scope.setAlert(d);
            });
        }

        var showModal = function (report) {
            return show(report);
        };

        return {
            showModal: showModal
        };
    }
    ])
    .directive('estimateDetail', function(estimateDetailsService) {

        return {
            restrict: 'EAC',
            scope: true,
            link: function postLink(scope, element, attr) {

                var report = scope.$eval(attr.estimateDetail)

                // Trigger
                element.bind('click', function() {
                    estimateDetailsService.showModal(report);
                });
            }
        };

    });