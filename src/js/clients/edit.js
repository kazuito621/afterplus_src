
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
            }, 700);

            var initClientData = function(){
                s.client={};
            }

            s.$on('nav', function (e, data) {
                if (data.new === myStateID) init();
            });

            //validate client object before save, return true/false
            //todo think about refactoring to built-in angular validation
            s.validate = function(client){
                if (typeof(client) === 'undefined') {
                    s.setAlert('Unable to save', {type: 'd'});
                    return false;
                }

                if (!client.clientTypeID) {
                    s.setAlert('Choose a client type for the new client', {type: 'd'});
                    return false;
                }
                if (!client.clientName || s.client.clientName=='') {
                    s.setAlert('Set name for the new client', {type: 'd'});
                    return false;
                }

                return true;
            }

            s.save = function () {
                var isValid = s.validate(s.client);

                if (!isValid) return;

                Api.saveOrUpdateClient(s.client).then(function (data) {
                        //not sure do we need to send events from stand-alone mobile page
                        s.sendEvt('onClientUpdate', s.client);

                        //refresh page
                        initClientData();

                        //show feedback for user
                        return s.setAlert('Client was saved', {type: 'ok'});
                    });
            };

            init();

        }]);


