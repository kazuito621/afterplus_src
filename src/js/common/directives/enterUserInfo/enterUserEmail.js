app
    .provider('enterUserEmailService', enterUserEmailService);

function enterUserEmailService() {
    this.$get = function($rootScope, $modal, Api) {
        function ModalFactory() {
            var $userModal = {};
            var modalInstance;
            var modalScope = $rootScope.$new();

            modalScope.validEmail = true;

            modalScope.save = function () {
                if( validateEmail(modalScope.user.email)) {

                    if (modalScope.user.userID != undefined) {
                        Api.user.update(modalScope.user, modalScope.user.userID);
                    }

                    modalInstance.hide();
                } else {
                    modalScope.validEmail = false;
                }
            };

            var validateEmail = function(email) {
                if(email.match(/^[^@]+@[^\.]+\..+$/)){
                    return true;
                }
                return false;
            };

            $userModal.showModal = function(user) {
                modalScope.user = user;
                modalInstance = $modal({
                    scope: modalScope,
                    template: '/js/common/directives/enterUserInfo/enterUserEmailModal.tpl.html',
                    show: false
                });

                modalInstance.$promise.then(modalInstance.show);
            };

            return $userModal;
        }

        return ModalFactory;
    };
};