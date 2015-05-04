var ClientsCtrl = app.controller('ClientsCtrl',
    ['$scope', '$route', '$modal', 'Api', '$popover', 'Auth', 'SortHelper',
        function ($scope, $route, $modal, Api, $popover, Auth, SortHelper) {
            'use strict';

            var s = window.cts = $scope;
            var myStateID = 'clients';
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
            s.auth = Auth;

            var init = function () {
                self.sh = SortHelper.sh(s.initData.clients, '', columnMap);
                s.displayedClients = s.initData.clients.slice(0, 49);
            };

            //we use this object as a 'singletone' property for delete-with-confirm-button directive
            //note, only one popover can be active on page
            s.activePopover = {elem:{}, itemID: undefined};

            //delete item method
            s.deleteCurrentItem = function () {
                if (!s.activePopover.itemID) return;

                Api.removeClientById(s.activePopover.itemID).then(function () {
                    if(false){ //TODO  if msg don't  indicates success,
                        s.setAlert("There was an error deleting the property.",{type:'d',time:5});
                    }
                    else {
                        if(idx>=0) {
                            s.initData.clients.splice(idx, 1);
                        }
                        s.setAlert('Deleted successfully.',{type:'ok',time:5});
                    }
                }, function err(){
                    s.setAlert("Client can't be deleted, try again later.",{type:'d',time:5});
                });
                var idx=_.findObj(s.initData.clients, 'clientID', s.activePopover.itemID, true);
                if(idx>=0) {
                    s.displayedClients.splice(idx, 1);
                }
                s.activePopover.elem.hide();
                delete s.activePopover.itemID;
            };

            // Pre-fetch an external template populated with a custom scope
            var clientEditModal = $modal({scope: $scope, template: '/js/clients/edit.tpl.html', show: false});

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

            s.updateAddess=function(address){
                s.client.street=address.street;
                s.client.state=address.state;
                s.client.city=address.city;
                s.client.zip=address.zip;
            };
			s.saveClient = function(mode){
				if(!mode) mode = s.mode;
				if( mode == 'edit' ){
					var obj = s.client;
					obj.post().then(function () {
                        Api.refreshInitData().then(function (data) {
                            s.displayedClients = s.initData.clients.slice(0, s.displayedClients.length);
                        });
					});
				}else{
					if (!s.client.clientTypeID) {
						return s.setAlert('Choose a client type for the new client', {type: 'd'});
					}

					Api.saveNewClient(s.client).then(function (data) {
						console.log(s.client);
						console.log("Post new client response:");
                        Api.refreshInitData().then(function (data) {
                            s.displayedClients = s.initData.clients.slice(0, s.displayedClients.length);
                        });
					});
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
