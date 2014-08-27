/*global dbg, cfg*/
/**
    Service for handling Rest gateway for Reports (estimates and invoices)
    A service is global - so Tree Controller and add items to the report,
    and Report Controller can build a UI based on the data
**/
app.factory('Api', ['Restangular', '$rootScope', '$q', '$location', 
function (Rest, $rootScope, $q, $location ) {
    'use strict';
    window.Api = this;
	var initData={};
    var sendEvt = function (id, obj) { $rootScope.$broadcast(id, obj); };

	var init=function(forceRefresh){  
		var deferred=$q.defer();
		if(!_.isEmpty(initData) && forceRefresh!=true) deferred.resolve();
		else{
			sendEvt('alert', {msg: 'Loading...', time: 3, type: 'ok'});
			Rest.one('init').get()
				.then(function (data) {
				dbg(data,'got init back')
					initData=data;
					$rootScope.initData=data;
					sendEvt('onInitData', data);
					deferred.resolve(); 
				});
		}
		return deferred.promise;	
	}

	// after a user signs in, refresh init data
	$rootScope.$on('onSignin', function(){ init(true); });

    return {
		getPromise:function(){ return init(); },
		getInitData: function(){ return initData; },
		// returns a promise... for .then() when refresh is done
		refreshInitData: function(){ return init(true); },	
        getSites: function (opts) {
            return Rest.all('siteID').getList(opts);
        },
        getSiteList: function () {
            return Rest.all('site').getList({users:1});
        },
        updateSite: function (siteID) {
            return Rest.one('site', siteID).get();
        },
        getTrees: function (siteID) {
            return Rest.all('trees').getList({siteID: siteID});
        },
        getTree: function (treeID) {
            return Rest.one('trees', treeID).get();
        },
        getSiteUsers: function (siteID, roles) {
            var params = {};

            if (roles) {
                params.role = roles;
            }

            return Rest.all('site/' + siteID + '/users').getList(params);
        },
        getReport: function (reportID, opts) {
			var r=$rootScope.requestedReportID;
			if(r && r>1){
				reportID=r;
				delete $rootScope.requestedReportI;
			}
            dbg(reportID, opts, 'get report');
            return Rest.one('estimate', reportID).get(opts);
        },
        getRecentReports: function (opt) {
            return Rest.all('estimate').getList(opt);
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
        sendReport: function (rpt) {
            return Rest.all('sendEstimate').post(rpt);
        },
		getEmailLogs: function( rptID ){
			return Rest.all('estimate/' + rptID + '/emaillogs').getList();
		},
		approveReport: function( rptID ){
			return Rest.one('estimate',rptID).post('approve');
		},
        // @param ids ARRAY of IDs to get
        getTreatmentDesc: function (ids) {
            return Rest.one('service_desc', 'treatmenttype').get({id: ids.toString()});
        },
        // Auth
        signInCustToken: function (token, context, callback) {
            var deferred = $q.defer();
            if (!token) {
                deferred.reject('Invalid token');
                return deferred.promise;
            }
            Rest.one('signincusttoken').get({custToken: token})
                .then(angular.bind(context, callback, deferred));
			return deferred.promise;
        },
        signIn: function (email, password, context, callback) {
            var deferred = $q.defer();
            Rest.one('signin').get({e: email, p: password})
                .then(angular.bind(context, callback, deferred));
            return deferred.promise;
        },
        signOut: function (Auth) {
            Auth.data({});
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

            unassign: function (siteId, userId) {
//                POST /site/123/user/999/unassign
                return Rest.one('site', siteId).one('user', userId).post('unassign');
            }
        },
        // Users
        user: {
            get: function (params) {
                return Rest.one('user').get(params);
            },
            remove: function (id) {
                return Rest.one('user', id).remove();
            },
            lookUp: function (params) {
                if (params.email && params.email[params.email.length -1] !== '*') {
                    params.email += '*';
                }
                return Rest.all('user').getList(params);
            }
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
            sendEvt('alert', {msg: 'Error talking to the server (3)', type: 'danger'});
            dbg('REST error found in setErrorInterceptor');
            //return true;  //todo -- what to do here? display error to user?
        });
}]);