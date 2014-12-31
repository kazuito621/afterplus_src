/**
 Service for handling Rest gateway for Reports (estimates and invoices)
 A service is global - so Tree Controller and add items to the report,
 and Report Controller can build a UI based on the data
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

            window.Auth = this;
            // private properties
            var defaultUserData = {userID: 0, email: '', token: '', role: 'guest'};

            // public properties
            // check for stored auth data
            this.authData = storage.get('authData');
            if (!this.authData) {
                this.authData = defaultUserData;
            }
            this.userRoles = {};

            /**
             * SETTER:
             * @param data OBJECT - data to be set. If null, then return current data
             * @param addToData BOOL - if true, extend/overwrite only the given values, do not replace the entire data object
             */
            this.data = function (data, addToData) {
                if (data === undefined) { //get
                    if (!this.authData || !this.authData.token) {
                        return defaultUserData;
                    }
                    return this.authData;
                }
                //set
                if (addToData) {
                    _.assign(this.authData, data);
                } else {
                    this.authData = data;
                }
                storage.set('authData', this.authData);
            };

            this.isSignedIn = function () {
                return (this.data().userID > 0);
            };

            // After a login call, handle that and resolve the promise
            this.onDataBackFromSignIn = function (deferred, d) {
                if (d && d.userID > 0) {
                    this.data(d);
                    if (d.requestedReportID) {
                        $rootScope.requestedReportID = d.requestedReportID;
                    }
                    sendEvt('onSignin');
                    return deferred.resolve(d);
                }
                var msg = (d && d.msg) ? d.msg : 'Login failed';
                return deferred.reject(msg);
            };

            // Returns a promise with either a resolve or a reject
            this.signInCustToken = function (custToken) {
                // if custToken is just a number (reportID), and a user is already signed in,
                // then just use existing login info
                if (!isNaN(custToken) && this.isSignedIn()) {
                    var def = $q.defer();
                    def.resolve(this.data());
                    return def.promise;
                }
                return Api.signInCustToken(custToken, this, this.onDataBackFromSignIn);
            };

            // Returns a promise with either a resolve or a reject
            this.signIn = function (email, pswd) {
                return Api.signIn(email, pswd, this, this.onDataBackFromSignIn);
            };

            this.signInUserToken = function (token) {
                return Api.user.get({ token: token });
            };

            this.signOut = function () {
                Api.signOut(this);
            };

            this.role2id = function (role) {
                if( !this.userRoles[role] ) return 1;

                var n = this.userRoles[role].id;
                if( n ) return n;

				if( role=='staff' ) return this.role2id('inventory');

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
				if(role===this.getUserRole()) return true;
				if(role=='staff' && (this.getUserRole()=='inventory' || this.getUserRole()=='sales')) return true;
				return false;
            };

            /**
             * Check if a user "IS" a certain role (or higher)
             * ie. if user is an admin, Auth.is('customer') will return TRUE
             */
            this.isAtleast = function (role) {
                var urID = this.role2id(this.getUserRole());
                var rID = this.role2id(role);
//                console.log(role, urID, rID, urID >= rID);
                if (urID >= rID) {
                    return true;
                }
                return false;
            };


            this.getLoginName = function () {
                if (this.isSignedIn()) {
                    if (this.data().email) {
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


