app
    .factory('sendBulkEstimatesService', sendBulkEstimatesService);

sendBulkEstimatesService.$inject = ['$q', '$rootScope', '$modal', '$popover', 'Restangular', 'Api', 'Auth', 'enterUserEmailService', 'enterUserInfoService'];

function sendBulkEstimatesService($q, $rootScope, $modal, $popover, Rest, Api, Auth, enterUserEmailService, enterUserInfoService) {

    var modalScope = $rootScope.$new();

    var modalInstance;

    modalScope.estimates = [];
    modalScope.config = {};

    modalScope.steps = ['contacts', 'send'];
    modalScope.step = 0;

    modalScope.isCurrentStep = function (step) {
        return modalScope.step === step;
    };

    modalScope.setCurrentStep = function (step) {
        if (modalScope.step == 0) {
            var validUsersPromise = isValidEmails(modalScope.estimates);
            var existedUsersPromise = isExistedUsers(modalScope.estimates);

            var contactsChecked = $q.all([validUsersPromise, existedUsersPromise]);

            contactsChecked.then(function(promises) {
                if (promises.indexOf(false) == -1) {
                    modalScope.step = step;
                }
            });
        }

    };

    modalScope.getCurrentStep = function () {
        return modalScope.steps[modalScope.step];
    };

    modalScope.bulkSendEstimates = function () {
        sendEstimates();
    };

    var isValidEmails = function (estimates) {
        var deferred = $q.defer();

        var allPromises=[];
        console.log('check for valid');
        _.each(estimates,function(estimate){
            console.log(estimate.contacts.length);
            if (estimate.contacts.length == 0) {
                console.log('null contacts');
                var contactDeferred = $q.defer();
                contactDeferred.resolve(false);
                allPromises.push(contactDeferred.promise);
            }
            _.each(estimate.contacts,function(contact) {
                var contactDeferred = $q.defer();

                if (!validateEmail(contact.email)) {
                    enterUserEmail(contact);
                    contactDeferred.resolve(false);
                } else {
                    contactDeferred.resolve(true);
                }

                allPromises.push(contactDeferred.promise);
            });
        });

        $q.all(allPromises).then(function(values) {
            if (values.indexOf(false) == -1) {
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

        });

        return deferred.promise;
    };

    var validateEmail = function(email) {
        if(email.match(/^[^@]+@[^\.]+\..+$/)){
            return true;
        }
        return false;
    };

    var isExistedUsers = function (estimates) {
        var deferred = $q.defer();

        var allPromises=[];

        _.each(estimates,function(estimate){
            _.each(estimate.contacts,function(contact) {
                var contactDeferred = $q.defer();

                if (contact.userID == undefined && !contact.skipped) {
                    enterUserInfo(contact);
                    contactDeferred.resolve(false);
                } else {
                    contactDeferred.resolve(true);
                }

                allPromises.push(contactDeferred.promise);
            });
        });

        $q.all(allPromises).then(function(values) {
            if (values.indexOf(false) == -1) {
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }

        });

        return deferred.promise;
    };

    var enterUserEmail = function (customer, deferred) {
        modal = enterUserEmailService();
        modal.showModal(customer);
    };

    var enterUserInfo = function (customer, deferred) {
        modal = enterUserInfoService();
        modal.showModal(customer);
    };

    var sendEstimates = function () {
        _.each(modalScope.estimates, function(estimate) {
            var estimateData = {};
            estimateData.reportID = estimate.id;
            estimateData.siteID = estimate.siteID;
            estimateData.contactEmail = estimate.contacts;
            estimateData.message = modalScope.config.message;
            estimateData.subject = modalScope.config.subject;

            Api.sendReport(estimateData)
                .then(function (res) {
                    console.log(res);
                });
        });

        modalScope.estimates = {};
        modalScope.step = 0;

        modalInstance.hide();
    };

    var initScope = function(estimatesIds) {

        _.each(estimatesIds, function(id) {
            loadEstimate(id);
        });


        // init config
        modalScope.config.senderEmail = Auth.data().email;
        modalScope.config.subject = cfg.getEntity().name;
        Api.getEmailTemplate('bulkEstimate').then(function(res){
            if(res){
                modalScope.config.message = res;
            }
        });
    };

    var loadEstimate = function (id) {
        Api.getReport(id).then(function(report) {
            var estimate = {};
            estimate.id = id;
            estimate.siteID = report.siteID;
            estimate.name = report.name;
            estimate.contacts = [];

            modalScope.estimates.push(estimate);

            loadContacts(estimate.siteID, id);
        });
    };

    var loadContacts = function(siteID, estimateID) {
        var contacts = [];
        Rest.one('site/'+siteID+'/users?role=customer').get().then(function(res){
            var estimate = _.findWhere(modalScope.estimates, { id: estimateID });

            if (res) {
                _.each(res, function(user) {
                    var contact = {};
                    contact.userID = user.userID;
                    contact.email = user.email;
                    contact.fName = user.fName;
                    contact.lName = user.lName;

                    if (!_.findWhere(estimate.contacts, {email: user.email})) {
                        contacts.push(contact);
                    }
                });

                estimate.contacts = contacts;
            }
        });
    };

    var showModal = function (estimates) {
        initScope(estimates.ids);

        modalInstance = $modal({
            scope: modalScope,
            template: '/js/common/services/estimates/sendBulkEstimates.tpl.html',
            show: false
        });

        modalInstance.$promise.then(modalInstance.show);
    };

    return {
        showModal: showModal
    };
}