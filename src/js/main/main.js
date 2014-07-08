'use strict';

var MainCtrl = app.controller('MainCtrl', 
['$scope', 'Restangular', '$routeParams', '$route', '$alert', 'storage', '$timeout','$rootScope','$location','$q', 'Auth', 
function ($scope, Rest, $routeParams, $route, $alert, storage, $timeout, $rootScope, $location, $q, Auth ) {
	var s = window.mcs = $scope;
	s.routeParams={};
	s.appData={};
	s.whoami='MainCtrl'
	s.alertBox;
	s.localStore={};
	storage.bind(s, 'localStore', {defaultValue:{token:false}});

	// links for $scope to Auth class (so templates can use them)
	s.auth={
		is: angular.bind(Auth, Auth.is)
		,isSignedIn: angular.bind(Auth, Auth.isSignedIn)
		,getLoginName: angular.bind(Auth, Auth.getLoginName)
		,signOut: angular.bind(Auth, Auth.signOut)
	}

	// global wrapper for broadcasting, so that each controller doesnt need $rootScope
	// why? because $broadcast() only goes DOWN to child scopes, $emit() goes UP,
	// this way you dont have to keep track of where everything is in relation to everything else... 
	s.sendEvt = function(id, obj){ $rootScope.$broadcast(id, obj); }



	// this is triggered when user signs in, or if they already are signed in
	// todo, cache initData into local storage... and only check for updates
    var getInitDataCB = function (data) {
        //Auth.gotInitData = true;
    };

	var getInitData = function() {
        Auth.gotInitData = true;
	};
	s.refreshInitData=function(){ dbg('refresh data requested!!!!!!!!!!!!!'); console.trace(); //Api.refreshInitData(); 
	}
	//if(Auth.isSignedIn()) getInitData();
	//else s.$on('onSignin', angular.bind(this, getInitData))


	var render = function() {
	dbg('render')
		// break up url path into array 
		// ie. "#/trees/edit/1234" = ['trees', 'edit', '1234']
		s.renderPath=$location.path().substr(1).split("/");

		// lazy load the property template based on the base path
		// ie. if "#/trees", then load "trees.tpl.html"
		// this is done by setting the tpl_XXXX variable, which is the value of the template path
		var tplPath=getTemplatePath(s.renderPath[0]);
		dbg(s.renderPath)
		dbg(tplPath)
		s['tpl_'+s.renderPath[0]]=tplPath;
	}

	var getTemplatePath = function(path){
		if(path=='trees-edit') return 'js/trees/edit.tpl.html';
		// for signin, trees, sites, and clients... used default
		return 'js/'+path+"/"+path+".tpl.html";
	}

	s.$on("$routeChangeSuccess", function(evt, current, previous) {
		var authReq = $route.current && 
				$route.current.$$route && 
				$route.current.$$route.auth;
		if (authReq && !Auth.isSignedIn() && $route.current.params.stateID!='estimate') {
			//todo - maybe this hsould be stored internally instead of going to the url
			//note: estimate handles its own signin
			var currentUrl = $location.url();
			$location.url("/signin?redirect=" + encodeURIComponent(currentUrl));
			return;
		} 

		s.routeParams=$routeParams;
       	if($route.current.resolve) render();
	});


	// so that services/factories can call the alert
	s.$on('alert', function(e,data){
		s.setAlert(data.msg,data);
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

