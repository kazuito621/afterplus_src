/*global dbg, cfg*/
/**
    Service for handling Rest gateway for Reports (estimates and invoices)
    A service is global - so Tree Controller and add items to the report,
    and Report Controller can build a UI based on the data
**/
app.factory('Api', ['Restangular', '$rootScope', '$q', 'storage', function (Rest, $rootScope, $q, storage) {
    'use strict';
    dbg("api serv ");
    window.Api = this;

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


    return {
        getInitData: function (cb) {
            sendEvt('alert', {msg: 'Loading...', time: 3, type: 'ok'});
            // Since this is an async call which may take time, we return
            // a dummy $object which will be populated when the data comes out
            Rest.one('init').get()
                .then(function (data, x) {
                    dbg(data, x, 'Api.getinitdata');
                    cb(data);
                    sendEvt('onInitData', data);
                });
        },
        getSites: function (opts) {
            return Rest.all('siteID').getList(opts);
        },
        updateSite: function (siteID, data) {
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