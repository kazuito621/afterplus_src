var ClientsCtrl = app.controller('ClientsCtrl',
    ['$scope', '$route', '$modal', 'Api', '$popover', 'Auth', 'SortHelper',
        function ($scope, $route, $modal, Api, $popover, Auth, SortHelper) {
            'use strict';

            var s = window.cts = $scope;
            var myStateID = 'clients';
            var clientDeletePopover;
            var self = this;
            var columnMap = {
                clientID: 'number',
                siteCount: 'number'
            }
            s.mode = '';
            s.type = 'client';
            s.newClient = {};
            s.items = {};
            s.displayedClients = [];
            s.activePopover = {};
            s.auth = Auth;

            var init = function () {
                self.sh = SortHelper.sh(s.initData.clients, '', columnMap);
                s.displayedClients = s.initData.clients.slice(0, 49);
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

            s.sh = {
                sortByColumn: function (col) {
                    s.initData.clients = self.sh.sortByColumn(col);
                    s.displayedClients = s.initData.clients.slice(0, s.displayedClients.length);
                },
                columnClass: function (col) {
                    return self.sh.columnClass(col);
                }
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


			s.saveClient = function(mode){
				if(!mode) mode = s.mode;
				if( mode == 'edit' ){
					var obj = s.client;
					obj.post().then(function () {
						Api.refreshInitData();
					});
				}else{
					if (!s.client.clientTypeID) {
						return s.setAlert('Choose a client type for the new client', {type: 'd'});
					}

					Api.saveOrUpdateClient(s.client).then(function (data) {
						console.log(s.client);
						console.log("Post new client response:");
						console.dir(data);
					});

                	Api.refreshInitData();
				}
				clientEditModal.hide();
			}

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
						s.mode = 'edit';
						clientEditModal.show();
                    });
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

            init();

            s.$on('onClientUpdate', function (e, data) {
                console.info('client added/updated');
                Api.refreshInitData().then(function (data) {
                    s.displayedClients = s.initData.clients.slice(0, s.displayedClients.length);
                });
            });

            s.$on('nav', function (e, data) {
//                if ($route.current.params.stateID === myStateID) {
                if (data.new === myStateID) {
                    init();
                }
            });
        }]);
