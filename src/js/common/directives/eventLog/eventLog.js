app.directive('eventLog', 
['Restangular', '$sce',
function (Rest, $sce) {
	'use strict';

  	var linker = function (scope /*scope*/, el, attrs) {
		var init = function(){
			Rest.one('eventlog').get().then(function(r){
				if(r && r.html){
					$('div#eventLog').html(r.html);
				
				}
			});
		}
		window.evLog_init=init;
		init();

		setTimeout(function(){ init(); }, 3000000);
	} // linker

  return {
		restrict: 'EA',
		replace: true,
		transclude: false,
		templateUrl: 'js/common/directives/eventLog/eventLog.tpl.html',
		/*scope: {
			 //selectedSites: '='
		},*/
		compile: function() {
			return linker;
		}
  };
}]);

