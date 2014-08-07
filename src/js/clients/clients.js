var ClientsCtrl = app.controller('ClientsCtrl',
    ['$scope', '$route', '$modal', 'Api', '$popover', 'Auth',
        function ($scope, $route, $modal, Api, $popover, Auth) {
            'use strict';

            var s = window.cts = $scope;
            var myStateID = 'clients';
            var clientDeletePopover;
            s.mode = '';
            s.type = 'client';
            s.newClient = {};
            s.items = {};
            s.displayedClients = [];
            s.activePopover = {};
            s.auth = Auth;

            var init = function () {
                s.displayedClients = s.initData.clients.slice(0, 49);
                return; // use this method only if you need to get more data than what initData provides...
            };

            var pre_init = function () {
                if ($route.current.params.stateID === myStateID) {
                    init();
                }
            };

            // Pre-fetch an external template populated with a custom scope
            var clientEditModal = $modal({scope: $scope, template: '/js/clients/edit.tpl.html', show: false});

            var deletePopoverFactory = function (el) {
                return $popover(el, {
                    scope: $scope,
                    template: '/js/partial_views/delete.tpl.html',
                    show: false,
                    animation: 'am-flip-x',
                    placement: 'left',
                    trigger: 'focus'
                });
            };

            //s.Rclient.push() .. to push new data...

            s.showMoreClients = function () {
                var count = s.displayedClients.length;
                if (s.initData === undefined || s.initData.clients === undefined || count === s.initData.clients.length) {
                    return;
                }

                var addon = s.initData.clients.slice(count, count + 50);
                s.displayedClients = s.displayedClients.concat(addon);
            };

            s.saveNewClient = function () {
                if (!s.newClient.clientTypeID) {
                    return s.setAlert('Choose a client type for the new client', {type: 'd'});
                }

                Api.saveNewClient(s.newClient).then(function (data) {
                    console.log(s.newClient);
                    console.log("Post new client response:");
                    console.dir(data);
                });

                clientEditModal.hide();
                Api.refreshInitData();
            };

            s.saveExistingClient = function () {
                var obj = s.client;
                obj.post().then(function () {
                    //in the old HEAD of evren07, this if statement existed priort to the "refresh" call
                    //is this necessary? would "saveExistingClient" every be executed if the state was NOT clients??
                    //if($route.current.params.stateID=='clients') {
                    Api.refreshInitData();
                });
                clientEditModal.hide();
            };

            // HOW TO Add a new client
            //s.newClient={clientName:'tim2', clientTypeID:1, street:'123 main'};
            //save(s.newClient)

            // Update an existing client
            /*
             s.Rest.one('client', 38).get().then(function(data){
             data.clientName='tim44xx55';
             data.post();
             })
             */

            s.newClientModalOpen = function (clientID) {
                s.client = {};
                s.newClient = {};
                s.mode = 'new';
                clientEditModal.show();
            };

            s.existingClientModalOpen = function (clientID) {
                s.client = {};
                Api.getClientById(clientID)
                    .then(function (data) {
                        s.client = data;
                    });
                s.mode = 'edit';
                clientEditModal.show();
            };

            s.deleteCurrentItem = function () {
                Api.removeClientById(s.activePopover.clientID)
                    .then(function () {
                        Api.refreshInitData();
                    }, function err() {
                        //todo ... how do we get this?
                        // todo -- ad this same functionality to delete of client
                    });
                Api.refreshInitData();
                clientDeletePopover.hide();
                delete s.activePopover.clientID;
            };

            s.queueOrDequeueItemForDelete = function (itemID, event) {
                if (clientDeletePopover && typeof clientDeletePopover.hide === 'function') {
                    delete s.activePopover.clientID;
                    clientDeletePopover.hide();
                }

                if (!s.activePopover.clientID && event && event.target) {
                    s.activePopover.clientID = itemID
                    clientDeletePopover = deletePopoverFactory($(event.target));

                    clientDeletePopover.$promise.then(function () {
                        clientDeletePopover.show();
                    });
                }

                s.type = 'client';
            };

            s.$on('$locationChangeSuccess', pre_init);
            pre_init();
        }]);
