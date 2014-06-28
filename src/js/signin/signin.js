'use strict';

var SigninCtrl = app.controller('SigninCtrl', 
['$scope', 'Restangular', '$timeout', '$route','md5', '$location', 'Auth',
function ($scope, Restangular, $timeout, $route, md5, $location, Auth) {

dbg('ctr signing')
	var s = window.scs = $scope
		,Rest=Restangular
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

	s.signIn = function(){
		s.login.btnDisabled=true;
		if(!s.login.email || !s.login.pswd) return;
		s.localStore.lastEmailUsed=s.login.email;
		Auth.signIn(s.login.email, s.login.pswd)
			.then(function(result){
				s.login.btnDisabled=false;
				dbg('sign in ok - signin.js')
				if(q.redirect) $location.url(q.redirect);
				else s.goTrees();
			}, function err(err){
				s.login.btnDisabled=false;
				dbg('err - sign in in singin.js')
			})
	}

	s.forgotPassword = function(){
		window.location=cfg.host()+'/go/password?e='+s.login.email;
	}

	s.goTrees=function(){
		$location.url('/trees');
	}

}]);
