'use strict';

var SigninCtrl = app.controller('SigninCtrl', 
['$scope', 'Restangular', '$timeout', '$route','md5', '$location',
function ($scope, Restangular, $timeout, $route, md5, $location) {

	var s = window.scs = $scope
		,Rest=Restangular
		,url
		s.login={};
		if(s.localStore.lastEmailUsed) s.login.email=s.localStore.lastEmailUsed;

	
	var q=$location.search()
	if(q.redirect && q.redirect.match(/estimate/)){
		s.auth.setAuth({sessionID:'111'});
		$location.url(q.redirect);
		return;
	}

	s.signIn = function(){
		s.login.btnDisabled=true;
		if(!s.login.email || !s.login.pswd) return;
		s.localStore.lastEmailUsed=s.login.email;
		Restangular.one('signin').get({e:s.login.email, p:s.login.pswd})
			.then( function(d){
				s.login.btnDisabled=false;
				if(d && d.userID > 0){
					s.auth.setAuth(d);
					s.sendEvt('onSignin');
					if(q.redirect) $location.url(q.redirect);
					else s.goTrees();
				}
			});
	}

	s.forgotPassword = function(){
		window.location=cfg.host()+'/go/password?e='+s.login.email;
	}

	s.goTrees=function(){
		$location.url('/trees');
	}

}]);
