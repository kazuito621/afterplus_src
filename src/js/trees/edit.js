'use strict';
/**
 * Note: this controller is used in 2 different applications:
 * 1. when user navigates to #/tree_edit/<TREEID>
 * 2. When user rolls over a thumbnail of a tree icon in the tree results page in #/tree (which then temporarily
 *		opens this view up in place of the map
 */

var EditTreeCtrl = app.controller('EditTreeCtrl', 
	['$scope', '$http', 'Api', '$route', '$location',
	function ($scope, $http, Api, $route, $location) {
	var s = window.ets = $scope;
		s.treeID;
		s.tree;
		s.ratingTypes = '';
		s.ynOptions=['yes','no'];
		s.ynpOptions=['yes','no','potential'];
		s.tree_cachebuster='?ts='+moment().unix();
		s.yearOptions=function(){ 
			var y=[]; for( var i=2012;i<2012+6;i++ ){ y.push(''+i); }
			return y; 
		}();

	var init = function(treeID, mode) {
		// todo -- editmode should be controlled by user privilege
		if(!mode) mode='edit';

		if(treeID) s.treeID=treeID;
		else s.treeID = s.renderPath[1];

		if(!s.treeID) return;
		Api.getTree(s.treeID)
			.then(function(data){
				s.tree=data	
				s.tree.mode=mode;
			});
	}

	s.$on('onTreeResultImageRollover', function(evt, treeID){
		init(treeID, 'rollover');		
	});

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

	// Normally i would just go by hashkey, but for some reason during testing, the hashkey was changing!
	// so we'll go by treehistoryid for previously existing items... and hashkey for new items which dont 
	// have a tree historyid yet
	s.removeTreeRec = function(treeHistoryID, hashKey){
		if(treeHistoryID){
			var idx=_.findObj(s.tree.history, 'treeHistoryID', treeHistoryID, true);
		}else{
			var idx=_.findObj(s.tree.history, '$$hashKey', hashKey, true);
		}
		if (idx!==false){ 
			if(!s.tree.deletedHistoryIDs) s.tree.deletedHistoryIDs=[];
			s.tree.deletedHistoryIDs.push(s.tree.history[idx].treeHistoryID);
			s.tree.history.splice(idx,1);
		}
	 }
	 
	 s.addTreeRec = function(){
		var itm={treatmentStatusCode:'rec', treatmentTypeCode:'new', treatmentTypeID:-9, 
					treeHistoryID:0, year:moment().format('YYYY')};
		s.tree.history.splice(0,0,itm);
	 }


	init();

}]);


