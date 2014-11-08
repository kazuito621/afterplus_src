
var EditClientCtrl = app.controller('EditSiteCtrl',
    ['$scope', '$http', 'Api', '$route', '$location',
        function ($scope, $http, Api, $route, $location) {
            'use strict';
            var s = window.ets = $scope;
            var myStateID = 'site_edit';    // matches with the templateID
            s.mode='';
            s.siteID='';

            var init = _.throttle(function () {
                initSiteData();

                //get client id from url
                s.siteID = s.renderPath[1];

                //if not specified => new site
                if (!s.siteID || s.siteID=='') {
                    s.mode='new';
                }
                else { //if specified => edit site
                    Api.getSiteById(s.siteID)
                        .then(function (data) {
                            if (data){
                                s.site = data;
                                s.mode = 'edit';
                            }
                            else{
                                $location.path('/site_edit');
                            }
                        });
                }
            }, 700);

            //validate site object before save, return true/false
            //todo think about refactoring to built-in angular validation
            s.validate = function(site){
                if (typeof(site) === 'undefined') {
                    s.setAlert('Unable to save', {type: 'd'});
                    return false;
                }

                if (!site.clientID) {
                    s.setAlert('Choose a client', {type: 'd'});
                    return false;
                }
                if (!site.siteName) {
                    s.setAlert('Set name for the new property', {type: 'd'});
                    return false;
                }

                return true;
            }

            s.saveSite = function (cb, nohide) {
                var isValid = s.validate(s.site);

                if (!isValid) return;

                if (s.site.siteID) {
                    s.site.post().then(function () {
                       // s.onSave();
                    });

                    // Update all other sites models, eg. the sites dropdown on the trees report
                    //todo think do we need to send update events from mobile view
                    //SiteModelUpdateService.updateSiteModels(scope.site);
                } else {
                    Api.saveNewSite(s.site).then(function (data) {
                        s.site = data;
                        s.siteId = data.siteID;

                        $location.path('/site_edit/' + s.siteId);
                    });
                }

            };

            s.newSite = function(){
                initSiteData();
                $location.path('/site_edit');
            };

            //when user creates new property and selects Client:
            //system should copy address fields from Client to new property
            s.copyAddressFromClientToNewSite = function(id){
                if (s.mode && s.mode=='new'){ //if mode!='new'('edit') => we don't need to copy address
                    //find client info
                    var clientInfo = [];
                    for (var i = 0; i < s.initData.clients.length; i++){
                        if (s.initData.clients[i].clientID==id){
                            clientInfo = s.initData.clients[i];
                            break;
                        }
                    }

                    //copy address fields
                    s.site.street = clientInfo.street;
                    s.site.city = clientInfo.city;
                    s.site.state = clientInfo.state;
                    s.site.zip = clientInfo.zip;
                }
            }

            var initSiteData = function(){
                s.site={};
            }

            s.$on('nav', function (e, data) {
                if (data.new === myStateID) init();
            });

            init();

        }]);


