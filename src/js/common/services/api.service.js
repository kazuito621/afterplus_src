/*global dbg, cfg*/
/**
    Service for handling Rest gateway for Reports (estimates and invoices)
    A service is global - so Tree Controller and add items to the report,
    and Report Controller can build a UI based on the data
**/
app.factory('Api', ['Restangular', '$rootScope', '$q', '$location', 'storage','$http','storedData',
function (Rest, $rootScope, $q, $location, storage,$http,storedData) {
    'use strict';
    window.Api = this;
    var initData = {};
    var sendEvt = function (id, obj) { $rootScope.$broadcast(id, obj); };

    var isSignedIn = function () {
        var authData = storage.get('authData');
        return (authData && authData.userID > 0);
    };

    var loadSites = function () {
        var deferred = $q.defer();
        if (!isSignedIn()) {
            deferred.resolve();
        }
        else if (!_.isEmpty(initData.sites)) {
            deferred.resolve(initData);
        }
        else {
            //sendEvt('alert', { msg: 'Loading...', time: 3, type: 'ok' });
            var t=storedData.getSiteOnlyTimeStamp();
            Rest.one('init?siteonly=1&timestamp='+t).get().then(function (data) {
                storedData.setInitData(data,t,'siteOnly');
                storedData.setSiteOnlyTimeStamp(data.timestamp);
                initData.sites = data;
                //$rootScope.initData.sites = data;
                deferred.resolve(data);
            });
        }
        return deferred.promise;
    };

    var init = function (forceRefresh) {
        var deferred = $q.defer();
        if (!isSignedIn()) {
            deferred.resolve();
        } else if (!_.isEmpty(initData) && forceRefresh !== true) {
            deferred.resolve();
        } else {
            sendEvt('alert', { msg: 'Loading...', time: 3, type: 'ok' });
            var t=storedData.getNoSiteTimeStamp();
            Rest.one('init?nosite=1&timestamp='+t).get().then(function (data) {
                //extend filters, maybe better move this logic to server side
                storedData.setInitData(data,t,'nosite');
                storedData.setNoSiteTimeStamp(data.timestamp);
                data.sites=undefined; //
                if (data.filters) {
                    data.filters.hazards = {
                        'building': { selected: false }, 'caDamage': { selected: false },
                        'caDamagePotential': { selected: false }, 'powerline': { selected: false }
                    };
                }

                initData = data;
                $rootScope.initData = data;

                sendEvt('onInitData', data);
                deferred.resolve();
            });
        }
        return deferred.promise;
    };

    // after a user signs in, refresh init data
    $rootScope.$on('onSignin', function () { init(true); });

    return {
        getAllSites: function () { return loadSites(); },
        getPromise: function () { return init(); },
        getInitData: function () { return initData; },
        // returns a promise... for .then() when refresh is done
        refreshInitData: function () { return init(true); },
        getEmailPortalLink:function(){ //GET /template/emailPortalLink
            return  Rest.one('template/emailPortalLink').get();
        },
        getSites: function (opts) {
            return Rest.all('siteID').getList(opts);
        },
        getSiteList: function () {
            return Rest.all('site').getList({ users: 1 });
        },
        getSiteById: function (id) {
            return Rest.one('site', id).get();
        },
        getSitesByClientId: function (clientID) {
            return Rest.all('client/' + clientID + '/sites').getList();
        },
        updateSite: function (siteID) {
            return Rest.one('site', siteID).get();
        },
        getTrees: function (siteID) {
            return Rest.all('trees').getList({ siteID: siteID });
        },
        getTree: function (treeID) {
            return Rest.one('trees', treeID).get();
        },
        getTreatmentPrice: function () {
            return Rest.all('treatmentprice').getList();
        },
        getSiteUsers: function (siteID, roles) {
            var params = {};

            if (roles) {
                params.role = roles;
            }

            return Rest.all('site/' + siteID + '/users').getList(params);
        },
        getSalesUsers: function () {
            return Rest.all('user').getList({ role: 'sales,inventory' });
        },
        getReport: function (reportID, opts) {
            var r = $rootScope.requestedReportID;
            if (r && r > 1) {
                reportID = r;
                delete $rootScope.requestedReportI;
            }
            dbg(reportID, opts, 'get report');
            return Rest.one('estimate', reportID).get(opts);
        },
        getRecentReports: function (opt) {
            return Rest.all('estimate').getList(opt);
        },
        getEmailTemplate: function (opt) {
            return Rest.one('template/emailReport').get(opt);
        },
        getBulkEditInfo:function(opt){
            return Rest.one('bulkedit').get(opt);
        },
        getBulkItemSummary:function(obj){
            var type;
            var id;
            if(obj.reportID){
                id=obj.reportID;
                type='estimate'
            }
            else if(obj.siteID){
                id=obj.siteID;
                type='site';
            }
            return Rest.one(type+'/'+id+'/bulk_item_summary').get();
        },
        modifyBulkEditInfo : function(param,obj){
            return Rest.all('bulkedit').post(obj,param);
        },
        saveReport: function (reportObj) {
            // if its a Restangular obj, then post it...
            if (reportObj.post && typeof reportObj.post === 'function') {
                return reportObj.post();
            }
            //else, its a new one
            dbg(reportObj, "save rep ");
            return Rest.all('estimate').post(reportObj);
        },
        updateEstimateTime: function (reportID, tstamp) {
            return Rest.all('estimate/' + reportID).post(tstamp);
        },
        setReportStatus: function (rptID, status) {
            return Rest.one('estimate', rptID).post(status);
        },
        sendReport: function (rpt) {
            return Rest.all('sendEstimate').post(rpt);
        },
        sendEmailPortalLink: function (rpt) {
            return Rest.all('sendPortalLink').post(rpt);
        },
        sendLoginInfo: function (userID) {
            return Rest.all('user/'+userID+'/sendLogin').post({});
        },
        removeEstimateById: function (id) {
            return Rest.one('estimate', id).post('delete');
        },
        updateEstimateSalesUser: function (rptID, userID) {
            var params = {};
            params.sales_userID = userID;

            return Rest.one('estimate', rptID).post(params);
        },
        getEmailLogs: function (rptID) {
            return Rest.all('estimate/' + rptID + '/emaillogs').getList();
        },
        approveReport: function (rptID) {
            return Rest.one('estimate', rptID).post('approve');
        },
        duplicateReports: function (ids) {
            var promises = [];
            angular.forEach(ids, function (id) {
                //              POST /estimate/<estimateID>/copy
                promises.push(Rest.one('estimate', id).post('copy'));
            });

            return $q.all(promises);
        },
        // @param ids ARRAY of IDs to get
        getTreatmentDesc: function (ids) {
            return Rest.one('service_desc', 'treatmenttype').get({ id: ids.toString() });
        },

        // Auth via customer token
        // @param context - scope of where the callback resides
        // @param callback - FUNCTION
        signInCustToken: function (token, context, callback) {
            var deferred = $q.defer();
            if (!token) {
                deferred.reject('Invalid token');
                return deferred.promise;
            }
            if (context && callback) {
                Rest.one('signincusttoken').get({ custToken: token })
					.then(angular.bind(context, callback, deferred));
            } else {
                return Rest.one('signincusttoken').get({ custToken: token })
            }

            return deferred.promise;
        },
        signIn: function (email, password, context, callback) {
            var deferred = $q.defer();
            Rest.one('signin').get({ e: email, p: password })
                .then(angular.bind(context, callback, deferred));
            return deferred.promise;
        },
        signOut: function (Auth) {
            Auth.data({});
            storedData.removeAllStoredData();
            Rest.one('signout').get();
            // TODO: clear init data some how maybe with an event onSignOut
            $location.url('/signin');
        },
        // Clients
        saveNewClient: function (client) {
            return Rest.all('client').post(client);
        },
        getClientById: function (id) {
            return Rest.one('client', id).get();
        },
        removeClientById: function (id) {
            return Rest.one('client', id).remove();
        },
        // Estimates
        getSitesList: function () {
            return Rest.all('site').getList();
        },
        saveSite: function (endpoint, data) {
            return Rest.all(endpoint).post(data);
        },
        // Sites
        saveNewSite: function (site) {
            return Rest.all('site').post(site);
        },
        removeSiteById: function (id) {
            return Rest.one('site', id).remove();
        },
        //users
        getUsers: function () {
            return Rest.all('user').getList();
        },
        getUserRoles:function(){
          return Rest.all('userroles').getList();
        },
        // User / Site relationship
        userSite: {
            assign: function (siteId, user) {
                //                POST /site/456/users
                //                JSON BODY: {email:'bob@hotmail.com', fname:'bob', lname:'jones', role:'customer'}
                //                RETURNS: ARRAY of user Obj: [{userID:INT, ...},{userID:INT, ...}]
                //                (this would be useful when creating new users, and you need their userID)

                //                POST /site/456/users
                //                JSON BODY: {userID:123, role:'sales'}
                return Rest.one('site', siteId).post('users', user);
            },

            assignMulti: function (user) {
                return Rest.one('site').one('multi').post('users', user);
            },

            unassign: function (siteId, userId) {
                //                POST /site/123/user/999/unassign
                return Rest.one('site', siteId).one('user', userId).post('unassign');
            }
        },
        // Users
        user: {
            // get a user by a token
            get: function (params, context, callback) {
                var deferred = $q.defer();
                Rest.one('user').get(params).then(angular.bind(context, callback, deferred));
                return deferred.promise;
            },
            remove: function (id) {
                return Rest.one('user', id).remove();
            },
            lookUp: function (params) {
                if (params.email && params.email[params.email.length - 1] !== '*') {
                    params.email += '*';
                }
                return Rest.all('user').getList(params);
            },
            create:function(param){
                return Rest.all('site/multi/users').post(param);
            },
            getUserById: function (param) {
                return Rest.one('user').get(param);
            },
            update:function(param,userID){
                return Rest.all('user/'+userID).post(param);
            }
        },

        saveTree: function (tree) {
            return Rest.all('tree').post(tree);
        },

        deleteTree: function (treeId) {
            return Rest.one('tree', treeId).post('delete');
        },

        updateTree: function (tree) {
            var params = {};
            params.longitude = tree.longitude;
            params.lattitude = tree.lattitude;
            params.lat = tree.lat;
            params.lng = tree.lng;
            params.siteID = tree.siteID;

            //(elemFunction, this)("post", undefined, params, undefined, headers);
            return Rest.one('tree', tree.treeID).post(undefined, params);
        },
        getGoogleAddress: function (params) {
            return $http.get(
                'http://maps.googleapis.com/maps/api/geocode/json',
                { params: params }
            )
        },

        //Scheduling Jobs/Estimates
        ScheduleJob: function (id, params) {
            // POST / estimate / 123
            //sendEvt('alert', { msg: 'Job has been Scheduled', time: 3, type: 'ok' });
            console.log(params);
            return Rest.one('estimate', id).post(undefined, params);
        },
        UnscheduledJob: function (id, params) {

            // POST /estimate/123/unscheduled
            //sendEvt('alert', { msg: 'Job has been Unscheduled', time: 3, type: 'ok' });
            return Rest.one('estimate', id).post('unscheduled');

        },
        GetForemans: function (role) {
            // GET  /users?role=XXX
            return Rest.all('user').getList({ role: 'staff' });
        },
        AssignJobToForeman: function (id, params) {
           // POST / estimate / 123
            return Rest.one('estimate', id).post(undefined,params);
        }

    };
}]);


app.factory('ApiInterceptors', ['Restangular', '$rootScope', 'Auth', function (Rest, $rootScope, Auth) {
    'use strict';

    var sendEvt = function (id, obj) { $rootScope.$broadcast(id, obj); };

    Rest.addFullRequestInterceptor(function (element, operation, route, url, headers, params, httpConfig) {
        headers = headers || {};
        headers['X-token'] = Auth.data().token;
        return {
            headers: headers,
            element: element,
            params: params,
            httpConfig: httpConfig
        };
    })
        /*
         .addResponseInterceptor(function(data, op, what, url, response, deferred){
         if(data && data.result!=0 && op=='getList' && typeof data != 'Array')
         data=[];
         })
         */
        .setErrorInterceptor(function () {
            sendEvt('alert', { msg: 'Error talking to the server (3)', type: 'danger' });
            dbg('REST error found in setErrorInterceptor');
            //return true;  //todo -- what to do here? display error to user?
        });
}]);
