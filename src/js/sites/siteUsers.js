
var EditClientCtrl = app.controller('SiteUsersCtrl',
    ['$scope', '$window', 'Api', '$route', '$location',
        function ($scope, $window, Api, $route, $location) {
            'use strict';
            var s = window.ets = $scope;
            var myStateID = 'site_users_edit';    // matches with the templateID
            s.siteID='';

            var newContact = { role: 'customer', email:''};
            var newRep = { role: 'sales', email:''};


            var init = _.throttle(function () {
                initSiteData();

                //get client id from url
                s.siteID = s.renderPath[1];

                //if not specified => redirect to new site page
                if (!s.siteID || s.siteID=='') {
                    $location.path('/site_edit');
                }
                else { //if specified => edit site
                    Api.getSiteById(s.siteID)
                        .then(function (data) {
                            if (data){
                                s.site = data;

                                //load site users
                                //todo think how to do it without cascade api calls (how to get site object with site users in 1 api call)
                                Api.getSiteUsers(s.siteID).then(function (data) {
                                    var separatedUsers = separateUsers(data);
                                    s.contacts = separatedUsers.contacts;
                                    s.reps = separatedUsers.reps;
                                });
                            }
                            else{
                                $location.path('/site_edit');
                            }
                        });
                }
            }, 700);

            var initSiteData = function(){
                s.site={};
            }

            init();

            //moved from siteUsersEditModal directive

            var separateUsers = function (users) {
                var res = { contacts: [], reps: []};

                angular.forEach(users, function (user) {
                    if (user.role === 'customer') {
                        res.contacts.push(user);
                    } else {
                        res.reps.push(user);
                    }
                });

                return res;
            };

            s.contactSelect = function (user) {
                s.newContact = angular.copy(user);
            };

            s.repSelect = function (user) {
                if(user.role=='admin') user.role='sales';
                s.newRep = angular.copy(user);
            };

            s.addNewSiteContact = function (event) {
                event.preventDefault();
                event.stopPropagation();
                s.showAddNewSiteContact = false;

                var tmp = angular.copy(s.newContact);
                var user = { role: tmp.role, email: tmp.email };

                user.fName = tmp.fName;
                user.lName = tmp.lName;
                user.phone = tmp.phone;
                if (tmp.userID) user.userID = tmp.userID;

                console.log('Add new site contact', user);
                Api.userSite.assign(s.site.siteID, user).then(function (data) {
                    if (data[0]) {
                        s.contacts.push(data[0]);
                        s.site.userCustCount++;
                    }
                    s.newContact = angular.copy(newContact);
                });
            };

            s.addNewSiteRep = function (event) {
                event.preventDefault();
                event.stopPropagation();

                s.showAddNewSiteRep = false;

                var tmp = angular.copy(s.newRep);
                var user = { role: tmp.role, email: tmp.email };

                user.fName = tmp.fName;
                user.lName = tmp.lName;
                user.phone = tmp.phone;
                if (tmp.userID) user.userID = tmp.userID;

                console.log('Add new site rep', user);
                Api.userSite.assign(s.site.siteID, user).then(function (data) {
                    if (data[0]) {
                        s.reps.push(data[0]);
                        s.site.userStaffCount++;
                    }
                    s.newRep = angular.copy(newRep);
                });
            };

            s.unassign = function (userID, email, type) {
                if ($window.confirm('User ' + email + ' will be unassigned. Please confirm.')) {
                    Api.userSite.unassign(s.site.siteID, userID);

                    if(type=='customer'){
                        s.site.userCustCount--;
                        s.contacts = _.filter(s.contacts, function (contact) {
                            return contact.userID !== userID;
                        });
                    }else{
                        s.site.userStaffCount--;
                        s.reps = _.filter(s.reps, function (rep) {
                            return rep.userID !== userID;
                        });
                    }
                }
            };

            s.finishUserEdit = function(type){
                $location.path('/'+type);
            }

        }]);


