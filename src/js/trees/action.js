var ActionCtrl = app.controller('ActionCtrl', ['$scope', '$location', function (s, $location) {
	'use strict';

	setTimeout(function(){
		$('#action-container').affix({
			offset: { top: $('#action-container').offset().top }
		});
	} , 1000);	

	s.goToEstimatesList = function () {
		$location.url('/estimates');	// adding ?siteID=XXX is not needed, since the API will already filter by
										// what the user is allowed to see
	};

}]);
