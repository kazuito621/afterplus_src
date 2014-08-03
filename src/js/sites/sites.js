var SitesCtrl = app.controller('SitesCtrl',
    ['$scope', '$route', '$modal', '$location', 'SiteModelUpdateService', 'Api', '$popover',
        function ($scope, $route, $modal, $location, SiteModelUpdateService, Api, $popover) {
            'use strict';
            var s = window.scs = $scope;
            var myStateID = 'sites';
            var siteDeletePopover;
            s.mode = '';
            s.type = 'site';
            s.newSite = {clientID: ''};
            s.items = {};
            s.displayedSites = [];
            s.activePopover = {};

            var init = function () {
                s.displayedSites = s.initData.sites.slice(0, 49);
                return;	// using initData list for now... may need this later if we want more data
            };

            var pre_init = function () {
                if ($route.current.params.stateID === myStateID) {
                    init();
                }
            };

            // Pre-fetch an external template populated with a custom scope
            var siteEditModal = $modal({scope: $scope, template: '/js/sites/edit.tpl.html', show: false});

            var siteDeletePopoverFactory = function (el) {
                return $popover(el, {
                    scope: $scope,
                    template: '/js/partial_views/delete.tpl.html', // production
                    show: false,
                    animation: 'am-flip-x',
                    placement: 'left',
                    trigger: 'focus'
                });
            };

            s.showMoreSites = function () {
                var count = s.displayedSites.length;
                if (s.initData === undefined || s.initData.sites === undefined || count === s.initData.sites.length) {
                    return;
                }

                var addon = s.initData.sites.slice(count, count + 50);
                s.displayedSites = s.displayedSites.concat(addon);
            };

            s.select = function (siteID) {
                return;
                //todo - make this work... there is a bug here
                s.selected.siteID = siteID;
                $location.url('/trees');
            };

            s.saveNewSite = function () {
                if (!s.newSite.clientID) {
                    return s.setAlert('Choose a client for the new property', {type: 'd'});
                }

                Api.saveNewSite(s.newSite).then(function (data) {});
                siteEditModal.hide();
                // is this needed? this may have been in evrens 07 branch
                // if($route.current.params.stateID=='sites') {
                Api.refreshInitData();
            };

            s.saveExistingSite = function () {
                var obj = s.site;

                obj.post().then(function () {
                    Api.refreshInitData();
                });
                // Update all other sites models, eg. the sites dropdown on the trees report
                SiteModelUpdateService.updateSiteModels(obj);
                siteEditModal.hide();
            };

            s.newSiteModalOpen = function (siteID) {
                s.site = {};
                s.newSite = {clientID: ''};
                s.mode = 'new';
                siteEditModal.show();
            };

            s.existingSiteModalOpen = function (siteID) {
                s.site = {};
                Api.updateSite(siteID)
                    .then(function (data) {
                        s.site = data;
                    });
                s.mode = 'edit';
                siteEditModal.show();
            };

            s.deleteCurrentItem = function () {
                Api.removeSiteById(s.activePopover.siteID).then(function () {
                    Api.refreshInitData();
                });
                Api.refreshInitData();
                siteDeletePopover.hide();
                delete s.activePopover.siteID;
            };

            s.queueOrDequeueItemForDelete = function (itemID, event) {
                if (siteDeletePopover && typeof siteDeletePopover.hide === 'function') {
                    delete s.activePopover.siteID;
                    siteDeletePopover.hide();
                }

                if (!s.activePopover.siteID && event && event.target) {
                    s.activePopover.siteID = itemID
                    siteDeletePopover = siteDeletePopoverFactory($(event.target));

                    siteDeletePopover.$promise.then(function () {
                        siteDeletePopover.show();
                    });
                }

                s.type = 'site';
            };

            s.$on('$locationChangeSuccess', pre_init);
            pre_init();
        }]);
