app.directive('paymentPopup',
    ['$modal',
        function ($modal) {
            'use strict';

            var linker = function (scope, el, attrs) {
                var modal;

                scope.openModal = function () {
                    if (!modal) {
                        modal = $modal({scope: scope, template: '/js/common/directives/paymentPopup/paymentPopup.tpl.html', show: false});
                    }

                    modal.$promise.then(function () {
                        modal.show();
                    });
                };

                scope.closeModal = function () {
                    modal.hide();
                };

                var init = function () {
                    scope.approved = false;

                    el.on('click', function (event) {
                        event.preventDefault();
                        scope.openModal();
                    });
                };

                init();

                scope.test = function(){
                    scope.onConfirmCallback();
                    scope.closeModal();
                };
            };

            return {
                restrict: 'EA',
                scope: {
                    onConfirmCallback: '&'
                },
                compile: function () {
                    return linker;
                }
            };
        }]);
