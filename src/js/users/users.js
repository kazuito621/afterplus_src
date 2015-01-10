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
            var filterGroups=[['userRole'],['email','name', 'role', 'sessionCount']];
            this.fh.setFilterGroups(filterGroups);

            var init = function (cb) {
                var search = $location.search();
                cb = cb || angular.noop;
                Api.getUsers().then(function (data) {
                    var isCust=Auth.is('customer');
                    _.each(data, function(d){
                        if(d.fName){
                            d.name=d.fName;
                        }
                        if(d.lName){
                            d.name=d.name+' '+d.lName;
                        }
                        d.userRole= d.role;
                    });
                    users = userFiltered = data;
                    self.sh = SortHelper.sh(users, '', columnMap, colSortOrder);
                    s.displayedUsers = userFiltered.slice(0, 49);
                    cb();
                });
            };

            s.activePopover = {elem:{}, itemID: undefined};

            s.setStatusFilter=function(role){
                if(role=='All')role='';
                self.fh.setFilter({userRole:role});
                applyFilter();
            }

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
                //remove filter status on UI
                // there is a weird behavior of angular strap bs-radio component (view->model binding doesn't work),
                // so using jquery here
                $('#userFilters').find('label').removeClass('active');
                clearFilter();
                //clear search box
                s.data.filterTextEntry = '';
                applyFilter();
            };

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


