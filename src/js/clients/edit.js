
var EditClientCtrl = app.controller('EditClientCtrl',
    ['$scope', '$http', 'Api', '$route', '$location',
        function ($scope, $http, Api, $route, $location) {
            'use strict';
            var s = window.ets = $scope;
            var myStateID = 'client_edit';    // matches with the templateID
            s.mode='';
            s.clientID='';

            var init = _.throttle(function () {
                initClientData();

                //get client id from url
                s.clientID = s.renderPath[1];

                //if not specified => new client
                if (!s.clientID || s.clientID=='') {
                    s.mode='new';
                }
                else { //if specified => edit client
                    Api.getClientById(s.clientID)
                        .then(function (data) {
                            if (data){
                                s.client = data;
                                s.mode = 'edit';
                            }
                            else{
                                $location.path('/client_edit');
                            }
                        });
                }
                // setup ESCAPE key
                //$(document).keyup(cancelOnEscape);
            }, 700);

            var initClientData = function(){
                s.client={};
            }

            s.$on('nav', function (e, data) {
                if (data.new === myStateID) init();
            });

            s.save = function () {
                if (s.mode == 'edit'){
                    s.client.post().then(function () {
                        s.sendEvt('onClientUpdate', s.client);
                    });
                }
                else{
                    if (!s.client.clientTypeID) {
                        return s.setAlert('Choose a client type for the new client', {type: 'd'});
                    }
                    if (!s.client.clientName || s.client.clientName=='') {
                        return s.setAlert('Set name for the new client', {type: 'd'});
                    }

                    Api.saveNewClient(s.client).then(function (data) {
                        s.sendEvt('onClientUpdate', s.client);
                    });
                }

                $location.path('/clients');
            };

            s.onCancel = function () {
                //$(document).unbind('keyup', cancelOnEscape);
                $location.url('/clients');
            };

            var cancelOnEscape = function(e){
                if(e.keyCode===27) s.onCancel();
            };

            init();

        }]);


