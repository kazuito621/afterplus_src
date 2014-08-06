var ActionCtrl = app.controller('ActionCtrl', ['$scope', function ($scope) {
	'use strict';

	setTimeout(function()
	{
		$('#action-container').affix(
		{
			offset: 
			{
				top: $('#action-container').offset().top
			}
		});
	} , 1000);	
}]);
