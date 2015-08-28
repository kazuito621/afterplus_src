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
					if(deferred){
                    	sendEvt('onSignin');
						deferred.resolve(d);
					}
					return;
                }
                var msg = (d && d.msg) ? d.msg : 'Login failed';
                if(deferred) deferred.reject(msg);
            };

            // Returns a promise with either a resolve or a reject
			// @param returnData BOOL - if false, call onDataBackFromSignin directly
            this.signInCustToken = function (custToken, waitForInit) {

                // if custToken is just a number (reportID), and a user is already signed in,
                // then just use existing login info
                if (!isNaN(custToken) && this.isSignedIn()) {
               		var def = $q.defer();
                    def.resolve(this.data());
                    return def.promise;
                }
			
				if( waitForInit ){
               		var def = $q.defer();
					var that=this;
					Api.signInCustToken(custToken, false).then(function(d){
						that.onDataBackFromSignIn(false, d);
						Api.refreshInitData().then(function(res){
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
                return Api.user.get({ userToken: token }, this, this.onDataBackFromSignIn);
            };

            this.signOut = function () {
                Api.signOut(this);
            };

				this.getDefaultUserRoles = function(){
					return {
						admin:{id:50},
						api:{id:50},
						sales:{id:30},
						inventory:{id:20},
						public:{id:1},
						quickbooks:{id:40},
						qbestimate:{id:20},
						staff:{id:20},
						superadmin:{id:100},
						customer:{id:10}
					};
				}

				// defaultRoleLevel - if you are checking for what a reuired role is, you should default to
				// a high number like 100... so that if it doesnt exists, a user doesnt accidentally get access to something
            this.role2id = function (role, defaultRoleLevel) {
					var userRoles = (this.userRoles && this.userRoles.admin) ? this.userRoles : this.getDefaultUserRoles();

					if(!defaultRoleLevel) defaultRoleLevel=0;
                if( !userRoles[role] ) return defaultRoleLevel;

                var n = userRoles[role].id;
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
                var userRoleLevel = this.role2id(this.getUserRole());
                var requiredRoleLevel = this.role2id(role, 100);

                //console.log('isAtleast:', role, this.getUserRole(), userRoleLevel, requiredRoleLevel);
                if (userRoleLevel >= requiredRoleLevel) {
                    return true;
                }
                return false;
            };

				// Check if user has a permission
				this.hasPerm = function(id) {
					var p = this.data().perms || [];
					return (p.indexOf(id) >= 0);
				}

            this.getLoginName = function () {
                if (this.isSignedIn()) {
					var fn=this.data().fName;
					if(fn && fn.length>1) return fn;
                    if (this.data().email) {
						var em=this.data().email.match(/^[^@]*/);
						if(em && em[0]) return em[0];
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


