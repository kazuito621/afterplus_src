var UserCtrl = app.controller('UserCtrl',
    ['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper', '$timeout', 'FilterHelper',
        function ($scope, $route, Api, $location, Auth, SortHelper, $timeout, FilterHelper) {
            'use strict';
            var s = window.ecs = $scope;
            var users=[],  		// array of original estimates
                userFiltered=[],  		// filtered list of estimates sites... which s.displayedSites uses as its source
                filterTextTimeout,
                self = this,
                columnMap = {
                    'sessionCount': 'number'
                },
                colSortOrder = {
                    sessionCount: 'desc'
                };
            s.displayedUsers = [];
            s.data={}; //overwritten later

            this.fh = FilterHelper.fh();
            var filterGroups=[['userRole','assignment'],['email','name', 'role', 'sessionCount']];
            this.fh.setFilterGroups(filterGroups);

            var init = function (cb) {
                var search = $location.search();
                cb = cb || angular.noop;
                Api.getUsers().then(function (data) {
                    _.each(data, function(d){
                        if(d.fName){
                            d.name=d.fName;
                        }
                        if(d.lName){
                            d.name=d.name+' '+d.lName;
                        }
                        d.userRole= d.role;
                        //d.siteCount=Math.floor((Math.random() * 2) + 0);
                        //d.clientCount=Math.floor((Math.random() * 2) + 0);

                        if(d.siteCount == 0 && d.clientCount == 0){
                            d.assignment='unassigned';
                        }
                        else {
                            d.assignment='assigned';
                        }
                    });
                    s.users = users = userFiltered = data;
                    self.sh = SortHelper.sh(users, '', columnMap, colSortOrder);
                    s.displayedUsers = userFiltered.slice(0, 49);
                    cb();
                });

                Api.getSiteList().then(function (data) {
                    s.sites=data; // This will passed to add-edit-user directive
                });

                if(s.initData.sites==undefined){ // Will optimize this call . IMDAD
                    Api.getAllSites().then(function(data){
                        s.initData.sites=data.sites;
                    })
                }
            };

            s.activePopover = {elem:{}, itemID: undefined};

            s.setStatusFilter=function(role){
                if(role=='All')role='';
                self.fh.setFilter({userRole:role,assignment:''});
                applyFilter();
            };

            s.setAssignmentFilter = function(bool){
                //self.fh.setFilter({userRole:''});
                self.fh.setFilter({assignment:bool,userRole:''});
                applyFilter();
            };

            s.sendPortalLink=function(user){
                s.emailRpt={};
                s.mode='addEditUsers';
                s.type = 'sendPortalLink';
                s.modalTitle = "Email Portal Link";
                s.emailRpt.contactEmails = [];
                s.emailRpt.cc_email = '';

                s.emailRpt.ccEmails = [];

                s.emailRpt.senderEmail = Auth.data().email;

                s.emailRpt.subject = 'Manage your trees - Portal Login';
                s.emailRpt.disableSendBtn = false;
                s.emailRpt.sendBtnText = 'Send';
                s.emailRpt.contactEmails.push(user.email);
                Api.getEmailPortalLink().then(function(data){
                    s.emailRpt.message = data;
                })
            };

            s.sendEmailPortalLink=function($hide, $show){
                s.emailRpt.disableSendBtn = true;
                s.emailRpt.sendBtnText = 'Sending...';

                s.emailRpt.contactEmail = _.pluck(s.emailRpt.contactEmails, 'text').join(', ');
                s.emailRpt.cc_email = _.pluck(s.emailRpt.ccEmails, 'text').join(', ');

                Api.sendEmailPortalLink(s.emailRpt)
                    .then(function (msg) {
                        s.emailRpt.disableSendBtn = false;
                        s.emailRpt.sendBtnText = 'Send';
                        $hide();
                    });
            }


            /*s.filterBy = function(type){
              if(type=='unassigned'){
                  userFiltered=[];
                  _.each(users,function(user){
                      if(user.siteCount == 0 && user.clientCount == 0){
                          userFiltered.push(user);
                      }
                  });
                  if(userFiltered.length==0) userFiltered=[{name:'No Results', email:'No Results', role:'No Results', sessionCount:'0'}]
                  s.sh.applySort();
                  s.displayedUsers = userFiltered.slice(0, 49);
              }
            },*/
            s.showMoreUsers = function () {
                var count = s.displayedUsers.length;
                if (count === users.length) {
                    return;
                }

                var addon = users.slice(count, count + 50);
                s.displayedUsers = s.displayedUsers.concat(addon);
            };

            s.data = {
                filterText: ''
                ,getCount: function () {
                    if (userFiltered && userFiltered.length) {
                        return userFiltered.length;
                    }
                    return 0;
                }
            };

            s.sh = {
                sortByColumn: function (col) {
                    applyFilter();
                    self.sh.setData(userFiltered);
                    userFiltered = self.sh.sortByColumn(col);
                    s.displayedUsers = userFiltered.slice(0, 49);
                },
                columnClass: function (col) {
                    return self.sh.columnClass(col);
                },
                applySort: function () {

                    //@@todo - we git a bug here when radio buttons are used
                    //estFiltered = self.sh.makeSort(estFiltered);
                }
            };

            var clearFilter = function () {
                self.fh.setFilter({userRole:'',assignment:''});
                self.fh.setFilter({email:'', name:'', role:'', sessionCount:''});
                userFiltered = users;
                s.sh.applySort();
                s.displayedUsers = userFiltered.slice(0, 49);
            };

            var applyFilter = function () {
                userFiltered = self.fh.applyFilter(users);
                // without this line here, the filter gets messed up on the next filter execution
                if(userFiltered.length==0) userFiltered=[{name:'No Results', email:'No Results', role:'No Results', sessionCount:'0'}]
                s.sh.applySort();
                s.displayedUsers = userFiltered.slice(0, 49);
            };

            s.reset = function(){
                $('#userFilters').find('label').removeClass('active');
                s.data.filterTextEntry = '';
                clearFilter();
                applyFilter();
            };

            s.sendLoginInfo=function(userID){
                Api.sendLoginInfo(userID).then(function(data){

                })
            }

            s.$watch('data.filterTextEntry', function (txt, old) {
                if (filterTextTimeout) { $timeout.cancel(filterTextTimeout); }
                filterTextTimeout = $timeout(function () {
                    if (txt === '' || !txt) {
                        if(old){
                            self.fh.setFilter({email:'', name:'', role:'',sessionCount:''});
                            applyFilter();
                        }
                    } else if (!isNaN(txt)) {
                        // if search entry is a number, search by siteID and name
                        self.fh.setFilter({email: txt, name: txt,role:txt,sessionCount:txt});
                        applyFilter();
                    } else {
                        // if just letters, then search by name and city, and sales person
                        self.fh.setFilter({email: txt, name:txt,role:txt,sessionCount:txt});
                        applyFilter();
                    }
                }, 500);
            });


            init();
            s.$on('nav', function (e, data) {
                if (data.new === myStateID) init();
            });

        }]);


