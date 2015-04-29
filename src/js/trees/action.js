var ActionCtrl = app.controller('ActionCtrl', ['$scope', '$location', function (s, $location) {
	'use strict';

	// set "basic page" link
	var lnk=window.location.hash;
	var hr=jQuery('#basic_pg_link');
	if(lnk && hr){ 
		// hide if this is not an estimate link
		if(!lnk.match(/\/estimate\//)) jQuery("#basicAlert").hide();

		// change link from #/estimate/XXX ---> to ---> /go/estimate/XXX
		if(lnk.substr(0,1)=='#') lnk=lnk.substr(1);
		lnk='/go'+lnk;
		hr.attr('href',lnk);
	}

	setTimeout(function(){
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

}]);
