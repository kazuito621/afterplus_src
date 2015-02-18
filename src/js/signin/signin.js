'use strict';

var SigninCtrl = app.controller('SigninCtrl', 
['$scope', '$timeout', '$route','md5', '$location', 'Auth', 
function ($scope, $timeout, $route, md5, $location, Auth ){

	var s = window.scs = $scope
		,url
		s.login={};
		if(s.localStore.lastEmailUsed) s.login.email=s.localStore.lastEmailUsed;

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
		s.login.btnDisabled=true;
		if(!s.login.email || !s.login.pswd) return;
		s.localStore.lastEmailUsed=s.login.email;
		Auth.signIn(s.login.email, s.login.pswd)
			.then(function(result){
				s.login.btnDisabled=false;
				if(q.redirect){ 
					var url=cfg.hostAndPort() + '/#' + q.redirect;
					document.location=url;
					// in the past before we changed the old div/hide method back to 
					// traditional angular routeProvider, this reload was here because
					// the map would not load when the div was hidden... so when we signed in, the map was blank
					// but i think this is not necessary now
					// document.location.reload();
				}
				else s.goTrees();
			}, function (err){ 	//if theres an error. is this needed? todo - use reject/resolve in more places
									//that could possibly throw errors
				s.login.btnDisabled=false;
			})
	}

	s.forgotPassword = function(){
		window.location=cfg.host()+'/go/password?e='+s.login.email;
	}

	s.goTrees=function(){
		s.sendEvt('trees.reset');		
		var url=cfg.hostAndPort() + '/#/trees';
		document.location=url;
		// BUG TODO - why do we need this here? because if we dont have it,
		// the google map wont load! 
		document.location.reload();
	}

}]);
