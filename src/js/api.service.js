/*global dbg, cfg*/
/**
    Service for handling Rest gateway for Reports (estimates and invoices)
    A service is global - so Tree Controller and add items to the report,
    and Report Controller can build a UI based on the data
**/
app.factory('Api', ['Restangular', '$rootScope', '$q', '$location', 
function (Rest, $rootScope, $q, $location) {
    'use strict';
    window.Api = this;

	var initData={};
    var sendEvt = function (id, obj) { $rootScope.$broadcast(id, obj); };

    // -------------------------------------------------  Setup REST API service
    Rest.setBaseUrl(cfg.apiBaseUrl())
        //.setDefaultRequestParams({ apiKey: 'xx' })
        .setRestangularFields({ selfLink: 'self.link'}) // todo ... explore this option
        .setResponseExtractor(function (res, op) {
            if (!res) {
                sendEvt('alert', {msg: 'Error talking to the server (2)', type: 'danger'});
            }
            if (typeof res === 'string') {
                res = {result: 0, msg: res};
            }
            res.data = res.data || {};  //make sure data exists
            var msg = res.msg || res.message || res.data.msg || res.data.message;
            var type = 'success';
            if (res.result !== 1) {
                if (op === 'getList' && !(res instanceof Array)) {
                    res.data = [];
                }
                if (!msg) {
                    msg = 'Error talking to the server';
                }
                type = 'danger';
            }
            if (msg) {
                sendEvt('alert', {msg: msg, type: type});
            }
            return res.data;
        });

    Rest.configuration.getIdFromElem = function (elem) {
            // ie. clientID, instead of "id", or treeID instead of "id"
            // todo ... seems like theres a bug.. when you call Rest.one('client',123'),
            // the elementID gets set as "id"... instead of resepecting this...
            // need to add changes, ie "getIdName"... should do a REST pull request?
        var id = elem[elem.route + "ID"];
        if (!id) {
            id = elem.reportID;
        }
        if (!id) {
            return elem.id;
        }
        return id;
    };

	// Make api call to get initdata, return a promise for when the async call comes back
	var init=function(){  
	dbg('init')
	console.trace();
		var deferred=$q.defer();
     	sendEvt('alert', {msg: 'Loading...', time: 3, type: 'ok'});
		Rest.one('init').get()
			.then(function (data) {
				initData=data;
				$rootScope.initData=data;
				//cb(data);
				sendEvt('onInitData', data);
				deferred.resolve(); 
			});
		return deferred.promise;	
	};

    return {
		getPromise:function(){ return init(); },
		getInitData: function(){ return initData; },
		// returns a promise... for .then() when refresh is done
		refreshInitData: function(){ return init(); },	
        getSites: function (opts) {
            return Rest.all('siteID').getList(opts);
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
        getSiteContacts: function (siteID) {
            return Rest.all('site/' + siteID + '/contacts').getList();
        },
        getReport: function (reportID, opts) {
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
