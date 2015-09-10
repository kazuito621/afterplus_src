app.directive('iframePopup',
    ['$modal','$sce',
        function ($modal,$sce) {
            'use strict';

            var linker = function (scope, el, attrs) {
                var modal;
                scope.url = attrs.url;
					 scope.title = attrs.ititle;
                if (angular.isDefined(attrs.title)) {
                    scope.title = scope.$eval(attrs.title);
                }
                scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                }
                scope.openModal = function () {
                    if (!modal) {
                        modal = $modal({ 
									scope: scope, 
									template: '/js/common/directives/iFramePopup/iFramePopup.tpl.html', 
									show: false
								});
                    }
                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
					 			$('iframe#iframe-modal').height( $(window).height() * .85 )
                    });
                };

                scope.closeModal = function () {
                    scope.showAddNewSiteContact = false;
                    scope.showAddNewSiteRep = false;
                    modal.hide();
                };
                scope.hide = function () {
                    $(document).unbind('keyup', hideOnEscape);
                    modal.hide();
                };
                var hideOnEscape = function (e) {
                    if (e.keyCode === 27) modal.hide();
                };
                var init = function () {
                    el.on('click', function (event) {
                        event.preventDefault();
                        scope.openModal();
                    });
                };
                init();
            };

            return {
                restrict: 'EA',
                replace: false,
                transclude: false,
                //scope: {
                //    site: '='
                //},
                compile: function () {
                    return linker;
                }
            };
        }]);
