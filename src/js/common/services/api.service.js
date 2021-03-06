/*global dbg, cfg*/
/**
 Service for handling Rest gateway for Reports (estimates and invoices)
 A service is global - so Tree Controller and add items to the report,
 and Report Controller can build a UI based on the data
 **/
app.factory('Api', ['Restangular', '$rootScope', '$q', '$location', 'storage', '$http', 'storedData',
  function (Rest, $rootScope, $q, $location, storage, $http, storedData) {
    'use strict';
    window.Api = this; // TODO: this is a strict antipattern. We should get rid of this.
    var initData = {};
    var sendEvt = function (id, obj) {
      $rootScope.$broadcast(id, obj);
    };

    var isSignedIn = function () {
      // check window name if we should use customer login info or not...  *** duplicated code in auth.service.js! ***
      var n = '' + window.name;
      var isCust = (n.match(/^cust_/)) ? true : false;
      var authObjName = isCust ? 'authData_cust' : 'authData_staff';

      var authData = storage.get(authObjName);
      return (authData && authData.userID > 0);
    };

    var loadSites = function () {
      var deferred = $q.defer();
      if (!isSignedIn()) {
        deferred.resolve();
      } else if (!_.isEmpty(initData.sites)) {
        deferred.resolve(initData);
      } else {
        //sendEvt('alert', { msg: 'Loading...', time: 3, type: 'ok' });
        var t = storedData.getSiteOnlyTimeStamp();
        Rest.one('init?siteonly=1&timestamp=' + t).get().then(function (data) {
          storedData.setInitData(data, t, 'siteOnly');
          storedData.setSiteOnlyTimeStamp(data.timestamp);
          initData.sites = data;
          //$rootScope.initData.sites = data;
          deferred.resolve(data);
        });
      }
      return deferred.promise;
    };

    /**
     * @param useAuthData - OPTIONAL ... in some cases this could be passed in, so use the token in there
     */
    var init = function (forceRefresh, useAuthData) {
      var deferred = $q.defer();
      if (!isSignedIn()) {
        deferred.resolve();
      } else if (!_.isEmpty(initData) && forceRefresh !== true) {
        deferred.resolve();
      } else {
        sendEvt('alert', {msg: 'Loading...', time: 3, type: 'ok'});
        var t = storedData.getNoSiteTimeStamp();

        // this tokenStr is actually probably not needed, since in theory it should be added
        // as a header through the Restangular interceptor in app.js... but just in case...
        // if the useAuthData, is passed along, lets use it.
        var tokenStr = (useAuthData && useAuthData.token) ? '&token=' + useAuthData.token : '';
        Rest.one('init?nosite=1&timestamp=' + t + tokenStr).get().then(function (data) {
          //extend filters, maybe better move this logic to server side
          storedData.setInitData(data, t, 'nosite');
          storedData.setNoSiteTimeStamp(data.timestamp);
          data.sites = undefined; //
          if (data.filters) {
            data.filters.hazards = {
              'building': {selected: false}, 'caDamage': {selected: false},
              'caDamagePotential': {selected: false}, 'powerline': {selected: false}
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
    $rootScope.$on('onSignin', function () {
      init(true);
    });

    return {
      getAllSites: function () {
        return loadSites();
      },
      getPromise: function () {
        return init();
      },
      getInitData: function () {
        return initData;
      },
      // returns a promise... for .then() when refresh is done
      refreshInitData: function (data) {
        return init(true, data);
      },
      getEmailPortalLink: function (uid) { //GET /template/emailPortalLink
        return Rest.one('template/emailPortalLink/' + uid).get();
      },
      getSites: function (opts) {
        return Rest.all('siteID').getList(opts);
      },
      getSiteList: function () {
        return Rest.all('site').getList({users: 1});
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
        return Rest.all('trees').getList({siteID: siteID});
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
        return Rest.all('user').getList({roles: 'sales'});
      },
      getForemanUsers: function () {
        return Rest.all('user').getList({roles: 'foreman,staff,sales,admin'});
      },
      getForemanTimeclockUsers: function () {
        return Rest.all('user').getList({roles: 'foreman,staff,crew,admin'});
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
        if (opt === 'invoice') {
          return Rest.one('template/emailInvoice').get();
        }
        return Rest.one('template/emailReport').get();
      },
      getBulkEditInfo: function (opt) {
        return Rest.one('bulkedit').get(opt);
      },
      getBulkItemSummary: function (obj) {
        var type;
        var id;
        if (obj.reportID) {
          id = obj.reportID;
          type = 'estimate';
        } else if (obj.siteID) {
          id = obj.siteID;
          type = 'site';
        }
        return Rest.one(type + '/' + id + '/bulk_item_summary').get();
      },
      modifyBulkEditInfo: function (param, obj) {
        return Rest.all('bulkedit').post(obj, param);
      },
      saveReport: function (reportObj) {
        // if its a Restangular obj, then post it...
        if (reportObj.post && typeof reportObj.post === 'function') {
          return reportObj.post();
        }
        //else, its a new one
        return Rest.all('estimate').post(reportObj);
      },
      updateEstimateTime: function (reportID, tstamp) {
        return Rest.all('estimate/' + reportID).post(tstamp);
      },
      getEntityInfo: function () {
        return Rest.one('entity').get();
      },
      saveEntityInfo: function (data) {
        return Rest.all('entity').post(data);
      },
      setReportStatus: function (rptID, status) {
        return Rest.one('estimate', rptID).post(status);
      },
      sendReport: function (rpt) {
        return Rest.all('sendEstimate?from_sales_rep=1').post(rpt);
      },
      lookupTaxByZip: function (zip) {
        return Rest.one('tax/zip/' + zip).get();
      },
      sendEmailPortalLink: function (rpt) {
        return Rest.all('sendPortalLink').post(rpt);
      },
      sendLoginInfo: function (userID) {
        return Rest.all('user/' + userID + '/sendLogin').post({});
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

      //Notes
      // 'notetype' refers to note.type in db... ie. 'report_internal', 'site_internal'
      getNotes: function (noteType, reportID) {
        return Rest.one('note/' + noteType + '/' + reportID).get();
      },
      addNote: function (noteType, reportID, text) {
        return Rest.all('note/' + noteType + '/' + reportID).post({note: text});
      },
      deleteNote: function (noteType, reportID, noteID) {
        console.debug('delnote noteid: ' + noteID);
        // DELETE /note/report/123/456
        return Rest.one('note/' + noteType + '/' + reportID + '/' + noteID).remove();
      },
      editNote: function (noteType, reportID, noteID, text) {
        // POST /note/report/123/456
        return Rest.all('note/' + noteType + '/' + reportID + '/' + noteID).post({note: text});
      },
      // @param ids ARRAY of IDs to get
      getTreatmentDesc: function (ids) {
        return Rest.one('service_desc', 'treatmenttype').get({id: ids.toString()});
      },
      getServiceDesc: function () {
        return Rest.one('service').get();
      },
      addNewMiscService: function (obj) {
        return Rest.all('service').post(obj);
      },
      editServiceDesc: function (id, obj) {
        return Rest.all('service/' + id).post(obj);
      },
      deleteServiceById: function (id) {
        return Rest.one('service', id).post('delete');
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
          Rest.one('signincusttoken').get({custToken: token})
            .then(angular.bind(context, callback, deferred));
        } else {
          return Rest.one('signincusttoken').get({custToken: token});
        }

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
      getUserRoles: function () {
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
        create: function (param) {
          return Rest.all('site/multi/users').post(param);
        },
        getUserById: function (param) {
          return Rest.one('user').get(param);
        },
        update: function (param, userID) {
          return Rest.all('user/' + userID).post(param);
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
          {params: params}
        );
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

      getAllStaff: function () {
        // GET  /users?role=XXX
        return Rest.all('user').getList({roles: 'foreman,crew,admin,staff'});
      },

      getForemen: function () {
        // GET  /users?role=XXX
        return Rest.all('user').getList({roles: 'foreman'});
      },
      changeEstimateProperty: function (id, params) {
        // POST / estimate / 123
        return Rest.one('estimate', id).post(undefined, params);
      },
      setEstimateSent: function (id, params) {

        // POST /estimate/123/sent
        return Rest.one('estimate', id).post('sent');
      },

      // Timeclock
      getTimeclockUsers: function () {
        return Rest.one('timeclock/users').get();
      },
      getTimeclockUsersInfo: function (params) {
        return Rest.one('timeclock/info').get(params);
      },
      saveTimeclockSchedules: function (params) {
        return Rest.one('timeclock/edit').post(undefined, params);
      },
      findReport: function (params) {
        return Rest.one('report').customGET('paged', {json: JSON.stringify(params)});
      },
      
      // Deductions
      addDeduction: function (reportID, params) {
        return Rest.one('estimate', reportID).one('deduction').post(undefined, params);
      },
      updateDeduction: function (reportID, deductionID, params) {
        return Rest.one('estimate', reportID).one('deduction', deductionID).post(undefined, params);
      },
      removeDeduction: function (reportID, deductionID) {
        return Rest.one('estimate', reportID).one('deduction', deductionID).remove();
      },

      // Tree reports
      markReportItemAsComplete: function (rptID, itemID) {
        var params = {'completed' : 1};

        return Rest.one('estimate', rptID).one('item', itemID).post(undefined, params);
      },
      markReportItemAsIncomplete: function (rptID, itemID) {
        var params = {'completed' : 0};

        return Rest.one('estimate', rptID).one('item', itemID).post(undefined, params);
      }
    };
  }]);


app.factory('ApiInterceptors', ['Restangular', '$rootScope', 'Auth', function (Rest, $rootScope, Auth) {
  'use strict';

  var sendEvt = function (id, obj) {
    $rootScope.$broadcast(id, obj);
  };

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
