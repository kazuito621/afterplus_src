app.directive('paymentPopup',
    ['$modal', 'Restangular',
        function ($modal, Rest) {
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

					 scope.paymentInfo='';

                var init = function () {
                    scope.approved = false;

            			Rest.one('entity/paymentInfo').get().then(function(r){
								scope.paymentInfo=r;
							});


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
