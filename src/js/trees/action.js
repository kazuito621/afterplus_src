var ActionCtrl = app.controller('ActionCtrl', ['$scope', '$location', '$timeout', 'Auth',
function (s, $location, $timeout, Auth) {
	'use strict';

	$timeout(function(){
		$('#action-container').affix({
			offset: { top: $('#action-container').offset().top }
		});
	} , 1000);	

	s.goToEstimatesList = function () {
		$location.url('/estimates');	// adding ?siteID=XXX is not needed, since the API will already filter by
										// what the user is allowed to see
	};

	s.goToTrees = function () {
		$location.url('/trees');	// adding ?siteID=XXX is not needed, since the API will already filter by
										// what the user is allowed to see
	};


	// set "basic page" link
	function setBasicPageLink(){
		if(window.noBasicAlert==true) return jQuery("#basicAlert").hide();
		
		var d = (Auth.data) ? Auth.data() : {};
		var userID = (d.userID) ? d.userID : 0;

		var lnk=window.location.hash;
		var hr=jQuery('#basic_pg_link');
		if(lnk && hr){ 
			// hide if this is not an estimate link
			if(!lnk.match(/\/estimate\//)) jQuery("#basicAlert").hide();

			// change link from #/estimate/XXX ---> to ---> /go/estimate/XXX
			if(lnk.substr(0,1)=='#') lnk=lnk.substr(1);
			lnk='/go'+lnk+'?uid='+userID;
			hr.attr('href',lnk);
		}
	}
	setBasicPageLink();
	// this is needed because when navigating around, sometimes the code gets fired too quick
	// to hide the banner... using $timeout ensures it gets fired on the next digest cycle
   $timeout(function () { setBasicPageLink(); }, 300);
   $timeout(function () { setBasicPageLink(); }, 600);
   $timeout(function () { setBasicPageLink(); }, 4000);

}]);
