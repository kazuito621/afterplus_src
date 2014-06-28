/**
	Service for handling Rest gateway for Reports (estimates and invoices)
	A service is global - so Tree Controller and add items to the report,
	and Report Controller can build a UI based on the data
**/
app.service('Auth', 
	['Restangular', '$location', '$timeout', '$rootScope', 'md5', '$q', '$rootScope', 'storage',
	function(Rest, $location, $timeout, $rootScope, md5, $q, $rootScope, storage) {

	// private properties
	var defaultUserData={userID:0, email:'', token:'', role:'guest'};

	// public properties
	this.authData={};
	storage.bind(this, 'authData', {defaultValue:defaultUserData});
	this.userRoles={
					public: 	1, 
					customer:   2,
					staff:		3,
					admin:  	5,
					superadmin: 10
					};

	this.data = function(){
		if(!this.authData || !this.authData.token) return defaultUserData;
		return this.authData;
	};

	this.isSignedIn = function(){ return (this.data().userID>0); };

	var onDataBackFromSignIn = function(d){
	dbg('on data back')
		if(d && d.userID > 0){
			th.setAuth(d);
			this.sendEvt('onSignin');
			return deferred.resolve(d);
		}else{
			var msg=d.msg || 'Login failed';
			return deferred.reject(msg);
		}
	}

	this.signInCustToken = function(custToken){
		var deferred=$q.defer();
		if(!custToken){ deferred.reject('Invalid token'); return deferred.promise; }
		Rest.one('signincusttoken').get({custToken:custToken})
			.then(onDataBackFromSignIn);
		return deferred.promise;
	}

	this.signIn = function(email, pswd){
	dbg('signin called')
		var deferred = $q.defer();
		Rest.one('signin').get({e:email, p:pswd})
			.then( onDataBackFromSignIn );
		deferred.resolve(true);
		return deferred.promise;
	}

	this.signOut = function(){ 
		this.data({});
		// todo clear init data some how maybe with an event onSignOut
		$location.url('/signin') 
	}

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


	this.sendEvt = function(id, obj){ $rootScope.$broadcast(id, obj); };




}]);


