app
    .factory('sendBulkEstimatesService', sendBulkEstimatesService);

sendBulkEstimatesService.$inject = ['$rootScope', '$modal', 'Restangular', 'Api', 'Auth'];

function sendBulkEstimatesService($rootScope, $modal, Rest, Api, Auth) {

    var modalScope = $rootScope.$new();

    modalScope.estimates = [];
    modalScope.config = {};

    modalScope.steps = ['contacts', 'send'];
    modalScope.step = 0;

    modalScope.isCurrentStep = function (step) {
        return modalScope.step === step;
    };

    modalScope.setCurrentStep = function (step) {
        console.log(modalScope.estimates);
        modalScope.step = step;
    };

    modalScope.getCurrentStep = function () {
        return modalScope.steps[modalScope.step];
    };

    modalScope.bulkSendEstimates = function () {

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

        var modalInstance = $modal({
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