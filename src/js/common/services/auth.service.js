/**

 Service for handling Rest gateway for Reports (estimates and invoices)
 A service is global - so Tree Controller and add items to the report,
 and Report Controller can build a UI based on the data


 IMPORTANT NOTE ABOUT MULTI-LOGINS
 =================================

 One feature we have is we allow an admin/staff user to login,
 then "login as a customer" through a special link... such as:

 /#/estimate/1111-33333-d3rdf   (known as a customer token)

 When this happens we want to MAINTAIN THE STAFF LOGIN CREDNTIALS
 and have a SIMULTANEOUS CUSTOMER LOGIN.

 Why?
 ----
 In the past, for a sales person to check a customer link, they would
 click it, then they would be logged out of themsevles, so they would have
 to re-login everytime.

 HOW THIS WORKS
 --------------
 - If a customer logs in, then we rename the current window to prefix: "cust_" + existing_window_name
 - Possible customer entry points:

 /#/estimate/<cust_token>
 /#/signin/<cust_token>   (portal login)
 /#/trees/?custToken=<cust_token>
 (normal login via passowrd at /#/signin)

 - If a regular/staff login occurs, and the resulting user.role is not a customer, then we remove the "cust_" in the window name

 - THEN... When the credentials are retreived (via Auth.data()) ...
 We check for the existance of "cust_" in the window name, and either retrieve:

 - authData_staff
 - authData_cust

 **/
app.service('Auth',
  ['$location', '$timeout', '$rootScope', 'md5', '$q', 'storage', 'Api',
    function ($location, $timeout, $rootScope, md5, $q, storage, Api) {
      'use strict';
      var self = this;

      this.initialized = false;

      var sendEvt = function (id, obj) {
        $rootScope.$broadcast(id, obj);
      };

      window.Auth = this; // TODO: this is a strict antipattern - we should get rid of that
      // private properties
      var defaultUserData = {userID: 0, email: '', token: '', role: 'guest'};

      // public properties
      // check for stored auth data
      this.authData_staff = storage.get('authData_staff');
      if (!this.authData_staff) {
        this.authData_staff = angular.copy(defaultUserData);
      }
      this.authData_cust = storage.get('authData_cust');
      if (!this.authData_cust) {
        this.authData_cust = angular.copy(defaultUserData);
      }


      this.userRoles = {};

      /**
       * SETTER:
       * @param data OBJECT - data to be set. If null, then return current data
       * @param addToData BOOL - if true, extend/overwrite only the given values, do not replace the entire data object
       */
      this.data = function (data, addToData) {
        // check window name if we should use customer login info or not...  *** duplicated code in api.service.js! ***
        var n = '' + window.name; // TODO: replace window with $window here and everywhere in the app
        var isCust = (n.match(/^cust_/)) ? true : false;
        var authObjName = isCust ? 'authData_cust' : 'authData_staff';

        var useAuthData = this[authObjName];

        if (data === undefined) { //get
          if (!useAuthData || !useAuthData.token) {
            return defaultUserData;
          }
          return useAuthData;
        }
        //set
        if (addToData) {
          _.assign(useAuthData, data);
        } else {
          useAuthData = data;

        }
        this[authObjName] = useAuthData;
        storage.set(authObjName, useAuthData);
      };

      this.isSignedIn = function () {
        return (this.data().userID > 0);
      };

      // After a login call, handle that and resolve the promise
      this.onDataBackFromSignIn = function (deferred, d) {
        if (d && d.userID > 0) {
          var role = (d.role && d.role === 'customer') ? 'cust' : 'staff';
          this.updateWindowName(role);

          this.data(d);
          if (d.requestedReportID) {
            $rootScope.requestedReportID = d.requestedReportID;
          }
          if (deferred) {
            sendEvt('onSignin');
            deferred.resolve(d);
          }
          return;
        }
        var msg = (d && d.msg) ? d.msg : 'Login failed';
        if (deferred) {
          deferred.reject(msg);
        }
      };


      /**
       * This is how we know if the current window holds a customer or staff login
       * (Since we retain both credentials simultaneously(
       * @param type: "cust" or "staff"
       */
      this.updateWindowName = function (type) {
        var n = '' + window.name;
        if (!n) { // if no window name, make one up
          n = '' + Math.random();
          n = 'ap_' + n.substr(-10);
        }

        if (type === 'cust') { // set to cust if needed
          if (!n.match(/^cust_/)) {
            n = 'cust_' + n;
          }
        } else { // unset cust if needed
          if (n.match(/^cust_/)) {
            n = n.substr(5);
          }
        }
        window.name = n; // TODO: why?
      };


      // Returns a promise with either a resolve or a reject
      // @param returnData BOOL - if false, call onDataBackFromSignin directly
      this.signInCustToken = function (custToken, waitForInit) {
        var def;
        this.updateWindowName('cust');

        // if custToken is just a number (reportID), and a user is already signed in,
        // then just use existing login info
		  // REMOVED !! 1/8/2016 (tim). ... reason:
		  // if user was already logged in, and this executed, then the initData would be
		  // blank!! ... because the next block doesnt get called...
		  /*
        if (!isNaN(custToken) && this.isSignedIn()) {
          def = $q.defer();
          def.resolve(this.data());
          return def.promise;
        }*/

        if (waitForInit) {
          def = $q.defer();
          var that = this;
          Api.signInCustToken(custToken, false).then(function (d) {
            that.onDataBackFromSignIn(false, d);
            Api.refreshInitData(d).then(function (res) {
              def.resolve(d);
            });
          });
          return def.promise;
        }

        return Api.signInCustToken(custToken, this, this.onDataBackFromSignIn);
      };

      // Returns a promise with either a resolve or a reject
      this.signIn = function (email, pswd) {
        return Api.signIn(email, pswd, this, this.onDataBackFromSignIn);
      };

      this.signInUserToken = function (token) {
        return Api.user.get({userToken: token}, this, this.onDataBackFromSignIn);
      };

      this.signOut = function () {
        Api.signOut(this);
      };

      this.getDefaultUserRoles = function () {
        return {
          admin: {id: 50},
          api: {id: 50},
          sales: {id: 30},
          inventory: {id: 20},
          public: {id: 1},
          quickbooks: {id: 40},
          qbestimate: {id: 20},
          staff: {id: 20},
          superadmin: {id: 100},
          customer: {id: 10}
        };
      };

      // defaultRoleLevel - if you are checking for what a reuired role is, you should default to
      // a high number like 100... so that if it doesnt exists, a user doesnt accidentally get access to something
      this.role2id = function (role, defaultRoleLevel) {
        var userRoles = (this.userRoles && this.userRoles.admin) ? this.userRoles : this.getDefaultUserRoles();

        if (!defaultRoleLevel) { defaultRoleLevel = 0; }
        if (!userRoles[role]) { return defaultRoleLevel; }

        var n = userRoles[role].id;
        if (n) { return n; }

        if (role === 'staff') { return this.role2id('inventory'); }

        return 1;
      };

      this.getUserRole = function () {
        if (this.data().role) {
          return this.data().role;
        }
        return 'public';
      };

      /**
       * Check if a user is exactly a certain role, with some exceptions
       * cust==customer
       * staff, can == "inventory" or "sales"
       */
      this.is = function (role) {
        if (role === this.getUserRole()) { return true; }
        return role === 'staff' && (this.getUserRole() === 'inventory' || this.getUserRole() === 'sales');
      };

      /**
       * Check if a user "IS" a certain role (or higher)
       * ie. if user is an admin, Auth.is('customer') will return TRUE
       */
      this.isAtleast = function (role) {
        var userRoleLevel = this.role2id(this.getUserRole());
        var requiredRoleLevel = this.role2id(role, 100);

        //console.log('isAtleast:', role, this.getUserRole(), userRoleLevel, requiredRoleLevel);
        return userRoleLevel >= requiredRoleLevel;
      };

      // Check if user has a permission
      this.hasPerm = function (id) {
        var p = this.data().perms || [];
        return (p.indexOf(id) >= 0);
      };

      this.getLoginName = function () {
        if (this.isSignedIn()) {
          var fn = this.data().fName;
          if (fn && fn.length > 1) { return fn; }
          if (this.data().email) {
            var em = this.data().email.match(/^[^@]*/);
            if (em && em[0]) { return em[0]; }
            return this.data().email;
          }
          return "You are logged in.";
        }
        return 'Not logged in';
      };

      this.isInitialized = function () {
        return self.initialized;
      };

      $rootScope.$on('onInitData', function (event, data) {
        if (data.roles) {
          self.userRoles = data.roles;
          self.initialized = true;
        }
      });
    }]);


