'use strict';

var MainCtrl = app.controller('MainCtrl', 
['$scope', 'Restangular', '$routeParams', '$route', '$alert', 'storage', '$timeout','$rootScope','$location','$q','Restangular', 'Auth',
function ($scope, Rest, $routeParams, $route, $alert, storage, $timeout, $rootScope, $location, $q, Restangular, Auth) {
	var s = window.mcs = $scope;
	s.routeParams={};
	s.appData={};
	s.initData={};
	s.whoami='MainCtrl'
	s.alertBox;
	s.localStore={};
	storage.bind(s, 'localStore', {defaultValue:{token:false}});


	// global wrapper for broadcasting, so that each controller doesnt need $rootScope
	// why? because $broadcast() only goes DOWN to child scopes, $emit() goes UP,
	// this way you dont have to keep track of where everything is in relation to everything else... 
	s.sendEvt = function(id, obj){ $rootScope.$broadcast(id, obj); }


	// -------------------------------------------------  Setup REST API service 
	Rest.setBaseUrl(cfg.apiBaseUrl())
		//.setDefaultRequestParams({ apiKey: 'xx' })
		.setRestangularFields({ selfLink: 'self.link'})		// todo ... explore this option
		.setResponseExtractor(function(res, op) {
			if( !res ){
				s.setAlert('Error talking to the server (2)',{type:'danger'});
				return {};
			}
			if( typeof res == 'string' ) res={result:0, msg:res};
			res.data=res.data||{}		//make sure data exists
			var msg=res.msg||res.message||res.data.msg||res.data.message, type='success'
			if(res.result != 1){
				if(op=='getList' && typeof res != 'Array') res.data=[];
				if(!msg) msg='Error talking to the server';
				type='danger';
			}
			if(msg) s.setAlert(msg, {type:type});
			return res.data;
		})
		.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig){
			if(Auth.data().token){
				headers=headers||{};
				headers['X-token']=s.authData.token;
			}
			return {
				headers:headers
				,element:element
				,params:params
				,httpConfig:httpConfig
			}
		})
		/*
		.addResponseInterceptor(function(data, op, what, url, response, deferred){
				if(data && data.result!=0 && op=='getList' && typeof data != 'Array')
					data=[];
			})
			*/
		.setErrorInterceptor(function(){
			s.setAlert('Error talking to the server (3)',{type:'danger'});
			dbg('REST error found in setErrorInterceptor');
			//return true;	//todo -- what to do here? display error to user?
			})

	Rest.configuration.getIdFromElem = function(elem) {
			// ie. clientID, instead of "id", or treeID instead of "id"
			// todo ... seems like theres a bug.. when you call Rest.one('client',123'), 
				// the elementID gets set as "id"... instead of resepecting this...
				// need to add changes, ie "getIdName"... should do a REST pull request?
  			var id=elem[elem.route + "ID"];
			if(!id) id=elem['reportID'];
			if(!id) return elem.id;
			return id;
		}






	// this is triggered when user signs in, or if they already are signed in
	// todo, cache initData into local storage... and only check for updates
	var getInitData = function() {
			if(s.setAlert) s.setAlert('Loading...', {time:3, type:'ok'});
			// Since this is an async call which may take time, we return
			// a dummy $object which will be populated when the data comes out
			Rest.one('init').get()
				.then(function(data){
					s.initData=data
					s.sendEvt('onInitData', data);
				});
	}
	s.refreshInitData=function(){ getInitData(); }
	if(Auth.isSignedIn()) getInitData();
	else s.$on('onSignin', angular.bind(this, getInitData))



	s.$on("$routeChangeSuccess", function(current) {
		var rp=$routeParams;
		var authReq = $route.current && 
				$route.current.$$route && 
				$route.current.$$route.auth;
		if (authReq && !Auth.isSignedIn() && $route.current.params.stateID!='estimate') {
			//note: estimate handles its own signin
			var currentUrl = $location.url();
			$location.url("/signin?redirect=" + encodeURIComponent(currentUrl));
			return;
		} 

		s.routeParams=$routeParams;
			
	});










	// ---------------------------------------- UTILS 


    /**
     * Sets text in a dropdown status box ... todo.. replace with angular-growl?
     * 
     * @param txt {str} - the status text, if null, or false - erase current status box
     * @param options {obj} - optional: Object containing: 
     *              - type: "success|danger|info"  (default:info) - the color of the background
     *              - time: {int} - seconds to wait to dissappear, default 4.
     *              - busy: {bool} - if true, show loading animation
     *              - pri: {INT} - priority - if set, only another status of equal or higher val can overwrite
     *              - pri_len {INT} - priority length - time in seconds of how long priority lasts
     */
	var alertCfg={placement:'top', keyboard:true, show:true, type:'info', template:'js/main/alert.tpl.html'}
	s.setAlert = function(txt, opt) {
		if(!txt || txt==''){ 
			return;
			if( s.alertBox && s.alertBox.hide && _.isFunction(s.alertBox.hide) ){
				s.alertBox.hide();
				return;
			}
		}

		// set default values
		opt=opt||{}; opt.type=opt.type||'info'; opt.pri=opt.pri||0;
		opt.pri_len=opt.pri_len||4;
		if (opt.time == 'false') {
			opt.duration = false;
		} else {
			opt.duration=opt.time||5;
		}
		if(opt.type=='d'){opt.type='danger'}; if(opt.type=='ok'){opt.type='success'};

		if(s.currentAlertPri && s.currentAlertPri > opt.pri) return;     

        s.currentAlertPri = opt.pri;
        clearInterval(s.iv_setAlert)
        s.iv_setAlert = setTimeout(function(){
			s.currentAlertPri=0;
            }, opt.pri_len*1000)

		alertCfg=_.merge(alertCfg, opt);	
		if( opt.busy )txt='<img src="img/ajax-loader.gif"> &nbsp; '+txt;
		alertCfg.content=txt;
		s.alertBox=$alert(alertCfg);
	};

	s.hideAlert = function() {
		s.alertBox.hide();
	}

	s.safeApply = function(fn) {
	  var phase = this.$root.$$phase;
	  if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		  fn();
		}
	  } else {
		this.$apply(fn);
	  }
	};

	// A safe way to call a func that was generated by a non-angular event
	// Usage: var x=safeApplyFn(function(a,b,c){ do_something(); }, this);
	// x(a,b,c);
	s.safeApplyFn = function(fn,scope){
		return function(){
			var args=arguments;
			var phase = this.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				fn.apply(scope,args);
			}else{
				s.$apply(function(){fn.apply(scope,args)});
			}
		}
	}






	// prevent navigation when a form is unsaved (dirty)
	// how it works... 
	//		1. ReportService registers a "dirty" check function
	//		2. then _prevent is set to TRUE
	//		3. on location change, if prevent is true, the "dirty" func is called... if
	//			returned true, then a notification is sent asking user confirmation
	//			B. if user ignores, an event is setn to Service "preventNavIgnored"
	//		4. Trees.js which as a "onNav" event, also checks in here to setn the _prevent flag
	//		todo... this hsould all be cleaned up into a service, and hosted on github??
	var _prevent=false;
	var _preventUrl=null;
	var _dirtyChkFuncs=[];
	s.preventNav = function(val){
		if(val !== false) val=true;
		_prevent=val;
		if(val) _preventUrl=$location.absUrl();
	}
	s.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
		return;
		// Allow navigation if our old url wasn't where we prevented navigation from
		if (_preventUrl != oldUrl || _preventUrl == null) {
			if(_prevent) return s.preventNav(false);
		}

		if (_prevent && _preventIsDirty() ){ 	//check for dirty forms
				if(!confirm("You have unsaved changes, continue?")) 
					event.preventDefault();
				else{
					s.preventNav(false);
					s.sendEvt('preventNavIgnored');
				}
		}
	});

	var _preventIsDirty = function(){
		return false;
		var isDirty=false;
		// todo - the dirtFunc checks should be associated with a specific URL
		// this will probably break when there is more than one registered
		_.each(_dirtyChkFuncs,function(isDirtyF){
			if(isDirtyF()) isDirty=true;
		});
		return isDirty;
	}

	s.$on('registerPreventNav', function(evt, fn) {
		if(_.isFunction(fn)) _dirtyChkFuncs.push(fn);
			s.preventNav();
	});

	window.onbeforeunload = function(){
		if(_prevent && $location.absUrl() == _preventUrl){
			if(_preventIsDirty())
				return "You have unsaved changes, continue?";
		}
	}




}]); 		// 	}}} MainCtrl





/*
for login fyi -- how to call RESt for login

app.controller('LoginCtrl',  function LoginCtrl( $scope, Restangular ) {
  $scope.credentials = { username: "", password: ""};

  $scope.login = function () {
    user = Restangular.one('user');
    user.post('login', $scope.credentials);
    console.log('Posted to login method');
  };
});
*/

