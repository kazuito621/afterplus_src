/*
	Explanation of User Roles
	=========================

	History
	-------
	At first we thought users would just be a single role. ie. customer, admin or sales
	Later the system evolved to need users to be multiple roles, ie. foreman and sales
	** So we only had one column: "role" **

	Migration
	---------
	After needing multiple rows, we decided to create a new "roles" column, 
	as a comma-delimited field, ie. "foreman,sales"
	Until we fully migrate all areas of the system,
	we will keep the old "role" column during the transition.

	They will serve these purposes:

	  - "roles" = the real comma delimited list of roles
	      - admin: access to everything
			- sales: can "own" an estimate in the sales postion, and listed in the sales list
			- foreman: can "own" a job, as a crew leader
			- crew: only for listing in the timeclock

	  - "role" 
	     - if roles contains admin, role = "admin"
		  - if roles contains sales,foreman,crew, but no admin, role = "staff"
		  - if roles contains customer, role = "customer"


*/

var UserCtrl = app.controller('UserCtrl',
    ['$scope', '$route', 'Api', '$location', 'Auth', 'SortHelper', '$timeout', 'FilterHelper',
        function ($scope, $route, Api, $location, Auth, SortHelper, $timeout, FilterHelper) {
            'use strict';
            var s = window.ecs = $scope
               	, myStateID = 'users'
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
				var filterData = {};

            this.fh = FilterHelper.fh();
            var filterGroups=[['userRole','userRoles','assignment'],['email','name','role','roles','userID']];
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
								d.userRoles=d.roles.split(',');
								d.userRoles_text=d.userRoles.join(', ');
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

            s.setStatusFilter=function(col, role){

					filterData.assignment='';
					if(col=='userRoles'){
					 	filterData.userRoles=role;
						filterData.userRole='';
					}else{
					 	filterData.userRole=role;
						filterData.userRoles='';
					}
                
					 self.fh.setFilter(filterData);
                applyFilter();
            };

            s.setAssignmentFilter = function(bool){
                //self.fh.setFilter({userRole:''});
                self.fh.setFilter({assignment:bool,userRole:''});
                applyFilter();
            };

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
                if (count === userFiltered.length) {
                    return;
                }

                var addon = userFiltered.slice(count, count + 50);
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
					 init();
            };

            s.sendLoginInfo=function(userID){
                Api.sendLoginInfo(userID).then(function(data){

                })
            }

            s.$watch('data.filterTextEntry', function (txt, old) {
                if (filterTextTimeout) { $timeout.cancel(filterTextTimeout); }
                filterTextTimeout = $timeout(function () {
                    if (txt === '' || !txt) {
								filterData.email='';
								filterData.name='';
								filterData.userID='';
                    } else {
								filterData.email=txt;
								filterData.name=txt;
								filterData.userID=txt;
                    } 
                
					 console.debug(filterData  );
						 self.fh.setFilter(filterData);
					  	 applyFilter();
                }, 500);
            });


            init();
            s.$on('nav', function (e, data) {
                if (data.new === myStateID) init();
            });

        }]);


