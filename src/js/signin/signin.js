'use strict';

var SigninCtrl = app.controller('SigninCtrl', 
['$scope', '$timeout', '$route','md5', '$location', 'Auth', 'storage',
function ($scope, $timeout, $route, md5, $location, Auth, storage ){

	var s = window.scs = $scope
		,url
		s.login={};

	var lastEm = storage.get('lastEmailUsed');
	if(lastEm) s.login.email=lastEm;

	var q=$location.search()

	if(q.redirect && q.redirect.match(/estimate/)){
		// todo.. this is not right
		Auth.data({sessionID:'111'});
		$location.url(q.redirect);
		return;
	}

	//check for a token, and sign them in
	var token = $location.path().substr(1).split("/");
	if(token && token[1]){
		token=token[1];
		Auth.signInCustToken(token);
	}


	s.signIn = function(){
		if(!s.login.email || !s.login.pswd) return;

		// store last emails used
		storage.set('lastEmailUsed', s.login.email);

		Auth.signIn(s.login.email, s.login.pswd)
			.then(function(result){
				s.afterLogin();
			});
	}

	s.forgotPassword = function(){
		window.location=cfg.host()+'/go/password?e='+s.login.email;
	}


	s.afterLogin = function(){
		if(q.redirect){ 
			var url;
			if(q.redirect.match(/^http/)){
				url=q.redirect;
			}else if(q.redirect.match(/^\/go/)){
				url=cfg.host() + q.redirect;
				var t=Auth.data().token;
				if(t && url.match(/\?/)){
					url+='&token='+t;
				}else if(t){
					url+='?token='+t;
				}
			}else{
				url=cfg.hostAndPort() + '/#' + q.redirect;
			}

			document.location=url;
			// in the past before we changed the old div/hide method back to 
			// traditional angular routeProvider, this reload was here because
			// the map would not load when the div was hidden... so when we signed in, the map was blank
			// but i think this is not necessary now
			// document.location.reload();
		}
		else s.goTrees();
	}

	s.goTrees=function(){
		s.sendEvt('trees.reset');		
		var url=cfg.hostAndPort() + '/#/trees';
		document.location=url;
		// BUG TODO - why do we need this here? because if we dont have it,
		// the google map wont load! 
		document.location.reload();
	}

	// if customer is signed in, forward to trees
	if(Auth.isSignedIn() && Auth.is('customer')){
		s.goTrees();	
	}

	// if this is the demo site, put in the info immediately
	if(cfg.host().match(/demo.arborplus/)){
		s.login.email='demo@arborplus.com';
		s.login.msg='Password is "demo"';
	}


}]);

