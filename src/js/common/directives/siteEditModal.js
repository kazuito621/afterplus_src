app.directive('siteEditModal', function ($modal, SiteModelUpdateService, Api, $timeout) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var modal;
        var newSite = {clientID: ''};

        window.ses = scope;

        scope.onSave = function () {
            var funcName = attrs.onSave;
            var func = scope.$parent[funcName];

            if (funcName && angular.isFunction(func)) {
                func();
            }
        };

        scope.openModal = function (id) {
            if (!modal) {
                modal = $modal({scope: scope, template: '/js/common/directives/templates/siteEditModal.tpl.html', show: false});
            }

            scope.site = angular.copy(newSite);

            if (id) {
                Api.updateSite(id).then(function (data) {
                    scope.site = data;
                });
            }

            modal.$promise.then(function () {
                modal.show();
            });
        };

        scope.saveSite = function (cb, nohide) {
            if (!scope.site.clientID) {
                return scope.setAlert('Choose a client for the new property', {type: 'd'});
            }

            var site = angular.copy(scope.site);

            if (scope.site.siteID) {
                scope.site.post().then(function () {
//                    Api.refreshInitData();
                    scope.onSave();
                });
                // Update all other sites models, eg. the sites dropdown on the trees report
                SiteModelUpdateService.updateSiteModels(scope.site);
            } else {
                Api.saveNewSite(scope.site).then(function (data) {
                    console.log('New site created', data);

                    scope.site = data;

                    modal.hide();

                    if (cb) {
                        scope.openModal(data.siteID);
                    }

//                    $timeout(function () {
//                        cb(data, modal);
//                    }, 250);

//                    Api.refreshInitData();
                    scope.onSave();
                });
            }

            if (!nohide) {
                modal.hide();
            }
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
