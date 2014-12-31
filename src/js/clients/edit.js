
var EditClientCtrl = app.controller('EditClientCtrl',
    ['$scope', '$http', 'Api', '$location', 'Auth', '$q', '$rootScope',
        function ($scope, $http, Api, $location, Auth, $q, $rootScope) {
            'use strict';
            var s = window.ets = $scope;
            var myStateID = 'client_edit';    // matches with the templateID
            var self = this || {};
            s.mode = '';
            s.clientID = '';

            var initClientData = function () {
                s.client = {};
            };

            self.removeUserToken = function () {
                console.log('Removing user token');
                $location.search('token', '');
            };

            self.getUserCB = function (data) {
                var defer = $q.defer();
                console.log('Get user CB', data);
                data.token = s.userToken;
                Auth.onDataBackFromSignIn(defer, data);
                defer.promise.then(function () {
                    self.getClient().then(self.removeUserToken);
                });
            };

            self.getClientByIdCB = function (data) {
                console.log('Get client by id callback', data);
                if (data) {
                    s.client = data;
                    s.mode = 'edit';
                } else {
                    $location.path('/client_edit');
                }
            };

            self.getClient = function () {
                var req = Api.getClientById(s.clientID);
                req.then(self.getClientByIdCB);
                return req;
            };

            var init = _.throttle(function () {
                initClientData();

                //get client id from url
                s.clientID = s.renderPath[1];
                s.userToken = $location.search().token;

                //if not specified => new client
                if (!s.clientID || s.clientID === '') {
                    s.mode = 'new';
                } else { //if specified => edit client
                    if (s.userToken && s.userToken.length) { // need to log in first
                        $rootScope.isMobile = true;
                        Api.user.get({ token: s.userToken }).then(self.getUserCB);
                    } else {
                        self.getClient();
                    }
                }
            }, 700);
/*
            s.$on('nav', function (e, data) {
                if (data.new === myStateID) {
                    init();
                }
            });
*/
            //validate client object before save, return true/false
            //todo think about refactoring to built-in angular validation
            s.validate = function (client) {
                if (client === undefined) {
                    s.setAlert('Unable to save', {type: 'd'});
                    return false;
                }

                if (!client.clientTypeID) {
                    s.setAlert('Choose a client type for the new client', {type: 'd'});
                    return false;
                }

                if (!client.clientName || s.client.clientName === '') {
                    s.setAlert('Set name for the new client', {type: 'd'});
                    return false;
                }

                return true;
            };

            s.save = function () {
                var isValid = s.validate(s.client);

                if (!isValid) { return; }

                if (s.client.clientID) {
                    s.client.post().then(function () {
                        // s.onSave();
                        $location.path('/client_edit/');
                    });
                } else {
                    Api.saveNewClient(s.client).then(function (data) {
                        //not sure do we need to send events from stand-alone mobile page
                        s.sendEvt('onClientUpdate', s.client);

                        //refresh page
                        initClientData();

                        //show feedback for user
                        return s.setAlert('Client was saved', {type: 'ok'});
                    });
                }
            };

            init();
        }]);


