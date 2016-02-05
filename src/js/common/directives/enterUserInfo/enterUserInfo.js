app
    .provider('enterUserInfoService', enterUserInfoService);

function enterUserInfoService() {
    this.$get = function($rootScope, $modal, Api) {
        function ModalFactory() {
            var $userModal = {};
            var modalInstance;
            var modalScope = $rootScope.$new();

            modalScope.validEmail = true;

            modalScope.save = function () {
                modalScope.user.skipped = true;
                modalInstance.hide();
            };

            modalScope.skip = function () {
                modalScope.user.skipped = true;
                modalInstance.hide();
            };

            $userModal.showModal = function(user) {
                modalScope.user = user;
                modalInstance = $modal({
                    scope: modalScope,
                    template: '/js/common/directives/enterUserInfo/enterUserInfoModal.tpl.html',
                    show: false
                });

                modalInstance.$promise.then(modalInstance.show);
            };

            return $userModal;
        }

        return ModalFactory;
    };
};