'use strict';

var EditTreeCtrl = app.controller('EditTreeCtrl', 
	['$scope', '$http', 'Restangular', '$route', '$location',
	function ($scope, $http, Restangular, $route, $location) {
	var s = window.ets = $scope
		,myStateID='tree-edit';
		s.treeID;
		s.tree;
		s.ratingTypes = '';
		s.ynOptions=['yes','no'];
		s.ynpOptions=['yes','no','potential'];
		s.tree_cachebuster='?ts='+moment().unix();
		s.yearOptions=function(){ 
			var y=[]; for( var i=2012;i<2012+6;i++ ){ y.push(''+i); }
			return y; }();

	var init = function(treeID, mode) {
		// todo -- editmode should be controlled by user privilege
		if(!mode) mode='edit';

		if(treeID){
			s.treeID=treeID;
		}else{ 
			s.treeID = $route.current.params.param1;
		}
		if(!s.treeID) return;
		Restangular.one('trees', s.treeID).get()
			.then(function(data){
				s.tree=data	
				s.tree.mode=mode;
			});
	}

	s.$on('onTreeResultImageRollover', function(evt, treeID){
		init(treeID, 'rollover');		
	});


//todo - watch tree history obj, and only send on save, if it has changed?
//todo - add deleting and adding of tree history items

	s.updateTreeName = function(){
		s.tree.commonName=_.findObj(s.initData.filters.species, 'speciesID', s.tree.speciesID).commonName
	}

	s.save = function() {
		s.tree.post().then(function(){
			s.sendEvt('onTreeUpdate', s.tree);
		});
		//todo - show save message
		//SMALL NOTE.. IF A TREE IS SELECTED/CHECKED, AND THEN EDIT IS PUSHED, GOING BACK TO PREVIOUS PAGE (TREES) WILL DESELECT/UNCHECK THE TREE
		$location.path('/trees');
	}

	var pre_init = function() {
		if($route.current.params.stateID==myStateID) init();
	}
	s.$on('$locationChangeSuccess', pre_init);
	pre_init();


 s.removeTreeRec = function(array,index){
	array.splice(index,1)
	// TODO.. add array[index].delete=1;...  instead of removing
 }
 
 s.addTreeRec = function(array){
	 array.push("newItem")
 }

}]);


