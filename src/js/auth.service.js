/**
	Service for handling Rest gateway for Reports (estimates and invoices)
	A service is global - so Tree Controller and add items to the report,
	and Report Controller can build a UI based on the data
**/
app.service('Auth', 
	['$location', '$timeout', '$rootScope', 'md5', '$q', 'storage', 'Api',
	function($location, $timeout, $rootScope, md5, $q, storage, Api) {

	window.Auth=this;
	// private properties
	var defaultUserData={userID:0, email:'', token:'', role:'guest'};

	// public properties
	// check for stored auth data
	this.authData = storage.get('authData');
	if(!this.authData) this.authData=defaultUserData;
	this.userRoles={
					public: 	1, 
					customer:   2,
					staff:		3,
					admin:  	5,
					superadmin: 10
					};

	/**
	 * SETTER: 
	 * @param data OBJECT - data to be set. If null, then return current data
	 * @param addToData BOOL - if true, extend/overwrite only the given values, do not replace the entire data object
	 */
	this.data = function(data, addToData){
		if(data===undefined){	//get
			if(!this.authData || !this.authData.token) return defaultUserData;
			return this.authData;
		}else{					//set
			if(addToData) _.assign(this.authData, data);
			else this.authData=data;
			storage.set('authData', this.authData);
		}
	};

	this.isSignedIn = function(){ return (this.data().userID>0); };

	// After a login call, handle that and resolve the promise
	var onDataBackFromSignIn = function (deferred, d) {
		if (d && d.userID > 0) {
			this.data(d);
			if(d.requestedReportID) $rootScope.requestedReportID=d.requestedReportID;
			sendEvt('onSignin');
			return deferred.resolve(d);
		} else {
			var msg = (d && d.msg) ? d.msg : 'Login failed';
			return deferred.reject(msg);
		}
	};

	// Returns a promise with either a resolve or a reject
	this.signInCustToken = function (custToken){
        return Api.signInCustToken(custToken, this, onDataBackFromSignIn);
	};

	// Returns a promise with either a resolve or a reject
	this.signIn = function (email, pswd) {
        return Api.signIn(email, pswd, this, onDataBackFromSignIn);
	};

	this.signOut = function () {
        Api.signOut(this);
	};

	this.role2id = function(role){
		var n=this.userRoles[role];
		if(n) return n;
		return 1;
	}

	this.getUserRole = function(){
		if(this.data().role) return this.data().role;
		else return 'public';
	}

	/** 
	 * Check if a user "IS" a certain role (or higher)
	 * ie. if user is an admin, Auth.is('customer') will return TRUE
	 */
	this.is = function(role){
		var urID=this.role2id(this.getUserRole());
		var rID=this.role2id(role);
		if(urID >= rID) return true;
		else return false;
	}

	this.getLoginName = function(){ 
		if(this.isSignedIn()){
			if( this.data().email ) return "Hi, "+this.data().email+".";
			else return "You are logged in.";
		}
		return 'Not logged in';
	};


	var sendEvt = function(id, obj){ $rootScope.$broadcast(id, obj); };




}]);


