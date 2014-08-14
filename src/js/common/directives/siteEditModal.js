app.directive('siteEditModal', function ($modal, SiteModelUpdateService, Api) {
    'use strict';

    var linker = function (scope, el) {
        var modal;
        var newSite = {clientID: ''};

        scope.mode = '';

        scope.openModal = function (id) {
            if (!modal) {
                modal = $modal({scope: scope, template: '/js/common/directives/templates/siteEditModal.tpl.html', show: false});
            }

            scope.site = angular.copy(newSite);

            if (id) {
                scope.mode = 'edit';
                Api.updateSite(id).then(function (data) {
                    scope.site = data;
                });
            } else {
                scope.mode = 'new';
            }

            modal.$promise.then(function () {
                modal.show();
            });
        };

        scope.saveSite = function () {
            if (!scope.site.clientID) {
                return scope.setAlert('Choose a client for the new property', {type: 'd'});
            }

            if (scope.site.id) {
                var obj = scope.site;

                obj.post().then(function () {
                    Api.refreshInitData();
                });
                // Update all other sites models, eg. the sites dropdown on the trees report
                SiteModelUpdateService.updateSiteModels(obj);
            } else {
                Api.saveNewSite(scope.site).then(function () {
                    Api.refreshInitData();
                });
            }

            modal.hide();
        };

        var init = function () {
            el.on('click', function (event) {
                event.preventDefault();
                scope.openModal(scope.siteId);
            });
        };

        init();
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        scope: {
            siteId: '=',
            clients: '='
        },
        compile: function () {
            return linker;
        }
    };
});
