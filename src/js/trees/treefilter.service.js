/**
	Service for handling all filtering if tree/client/site data
	How this service interacts with the TreeController:

                                 +--------+
                                 |  API   |
                                 +---+----+
                                     |
                                     +
                                trees[] array
    $scope.trees[] <<--+             +
        AND            |             |                                  FILTERS
    event broadcast    |     +-------------------+                  +--------------+
 "onTreeFilterUpdate"  |     | TreeFilterService |                  | Species...   |
          |            |     +-------------------+                  |              |
          +            +-----+ -set trees[].hide | <<-------------- +--------------+
                             |  based on selected|  onChange()      | Rating...    |
     TREE RESULTS            |  filters          |                  |              |
   +--------------+          |                   |                  +--------------+
   |              |          | -set filters      |                  | Size...      |
   | Render based |          |       .species    |--------------->> |              |
   +--------------+          |          .count   |                  +--------------+
   |              |          |  and other filter |                  |              |
   | on           |          |  counts.          |                  |  ...         |
   +--------------+          +-------------------+                  |              |
   |              |                                                 |              |
   | trees[].hide |                                                 +--------------+
   +--------------+
														(edit at asciiflow.com)

	SEE bottom for diagram about filtering process

**/


app.service('TreeFilterService', ['$timeout', '$rootScope', function($timeout, $rootScope) {

	// private properties
	var selectedFilters=[]		


	// public properties
									// always store public data that will be shared with the $scope
									// in an object, so its passed by reference
	this.data={treeResultsCount:0	// total trees after being filtered
		     ,filterTypeCounts:{}	// counts for various types of filters available based on tree result,
			 ,selectedFilters:selectedFilters			// ie. if a result is 1 pine, and 3 redwoods, it might be:
			 ,lastFilterCount:0}						// { species:2 }  (ie. there are 2 different types of species)
	this.trees;						


	// public methods
	this.init = function(idata) {
		this.initData=idata;
	}

	this.setTreeResults = function(trees){
		this.trees=trees;
        this.resetFilterTypeCounts();
		this.rebuildFilterTree(this.trees, selectedFilters);
		this.data.treeResultsCount = trees.length;
        $rootScope.$broadcast('onTreeFilterUpdate', this.trees);
		if(selectedFilters.length>0) this.filterTrees();
	}


	/**
	 * Based on tree results, only show filters that are relevant...
	 * ie. if there are no Pine trees in the results, then dont show any F'ing
	 * pine tree filters! 
	 * This is done by looping through the tree results array and tallying up into an "exist[]" array.
	 * Once thats done, the 2nd helper method (filterTheFilters2) will apply the exist array to the initData item count properties
	 * which the html templates will react to
	 */
	this.filterTheFilters = function() {
        //debugger;
        //console.info('filterTheFilters, trees = ' + this.trees);
		if(!this.trees || !this.trees.length) return;

		this.resetFilterTypeCounts();
		this.exist={species:{}, dbh:{}, rating:{}, treatments:{}, caDamage:{}, building:{},powerline:{}}     //ie. {species:{'1':3}, rating:'4':1}I
        var exist=this.exist,that=this 			              	//     -- there are 3 trees with speciesID 1, one with rating 4

		// loop through each tree and tally up the possible filter counts
		_.each(this.trees, function(tree){

            if (tree.hide){
                console.info('hide');
                return true;
            }

            console.info('display!');

			// increment counts for each, if count exists,
			// else, set it to 1, and increment the filterTypeCounts 

			if( exist.species[tree.speciesID] ) exist.species[tree.speciesID]++;
			else {
				exist.species[tree.speciesID]=1;
				that.data.filterTypeCounts.species++;
			}

			if( tree.dbhID>0 ){
				if( exist.dbh[tree.dbhID] ) exist.dbh[tree.dbhID]++;
				else { 
					exist.dbh[tree.dbhID]=1;
					that.data.filterTypeCounts.dbh++;
				}
			}

			if( tree.ratingID>0 ){
				if( exist.rating[tree.ratingID] ) exist.rating[tree.ratingID]++;
				else {
					exist.rating[tree.ratingID]=1;
					that.data.filterTypeCounts.rating++;
				}
			}

			if( tree.history && tree.history.length ){
			        _.each(tree.history, function(th){
			                if( exist.treatments[th.treatmentTypeID] ) exist.treatments[th.treatmentTypeID]++;
			                else {
			                        exist.treatments[th.treatmentTypeID]=1;
			                        that.data.filterTypeCounts.treatments++;
			                }
			        });
			}

			if( tree.building.toLowerCase()=="yes" ){
				if( exist.building[tree.treeID] ) exist.building[tree.treeID]++;
				else {
					exist.building[tree.treeID]=1;
					that.data.filterTypeCounts.building++;
				}
			}

			if( tree.caDamage.toLowerCase()=="yes" ){
				if( exist.caDamage[tree.treeID] ) exist.caDamage[tree.treeID]++;
				else {
					exist.caDamage[tree.treeID]=1;
					that.data.filterTypeCounts.caDamage++;
				}
			}

			if( tree.powerline.toLowerCase()=="yes" ){
				if( exist.powerline[tree.treeID] ) exist.powerline[tree.treeID]++;
				else {
					exist.powerline[tree.treeID]=1;
					that.data.filterTypeCounts.powerline++;
				}
			}

		});

		this.filterTheFilters2();
	}

	/**
	 * Use the exist[] array, and apply those tallies to the initData count objects
	 * @param reset BOOL - whether to reset the counts
	 */
	this.filterTheFilters2 = function(reset) {
		var exist=this.exist;
		// loop through each tally of existing tree filter types
		// and set the correspoding ng-model data for each filter
		var idata=this.initData, seachObj, idName, filterArray, c;
		_.each(exist, function(countsObj, filterName) {
			filterArray = _.extract(idata.filters, filterName);	
			if(!filterArray || !exist[filterName]) return;

			idName = (filterName=='treatments') ? 'treatmentTypeID' : filterName + "ID";

			_.each(filterArray, function(filterItm) {
				// if the count is in exist, then set it, else set to 0
				c = exist[filterName][filterItm[idName]];
				if(reset) filterItm.count=null;
				else{
					if(c) filterItm.count = c;
					else filterItm.count = 0;
				}
			});
		});
	}


	// called anytime one of the filter checkboxes along the right side are called
	this.onChange = function(type, ID, value){
        this.resetFilterTypeCounts();
        this._updateSelectedFilters(type, ID, value);
		if(this.trees && this.trees.length && this.trees.length>0){
			this.filterTrees();
        }
	}


	// Filter tree results by selected filters
	this.filterTrees = _.throttle(function() {
		if(!this.trees || !this.trees.length) return;
		this.data.treeResultsCount=0;
		
		var isActiveFilters = (selectedFilters.length>0);
		// loop through each tree, and see if a filter applies to it
		for( var i=0; i<this.trees.length; i++ ){
			
			// if no active filters, then show all trees
			if( !isActiveFilters ){ 
				this.trees[i].hide=false; 
				this.data.treeResultsCount++;
				continue; 
			}

			if( this._isTreeInFilter(this.trees[i]) ){
				this.trees[i].hide=false;
				this.data.treeResultsCount++;
			}else{
				this.trees[i].hide=true;
			}
		}
        //this.filterTheFilters();
        this.rebuildFilterTree(this.trees, selectedFilters);

		$rootScope.$broadcast('onTreeFilterUpdate', this.trees);	
	} , 500, {leading:false});

	this.clearFilters = function(clearTrees){
        this.resetFilterTypeCounts();
		if(clearTrees && this.trees && this.trees.length){
			this.trees.splice(0,this.trees.length);
			this.data.treeResultsCount=0
		}
		// clear the checkbox models
		var filt=this.initData.filters;
		_.each(selectedFilters, function(itm){
            switch (itm.type){
                case('species'):
                case('rating'):
                case('dbh'):
                case('year'):
                    var filterAr = filt[itm.type];
                    var idName=(itm.type=='year')?'id':itm.type+'ID';
                    var obj = _.findObj(filterAr, idName, itm.id);
                    if(obj && obj.selected==true){
                         obj.selected=false;
                    }
                    break;
                case('treatments'):
                    var filterAr = filt[itm.type];
                    var idName='treatmentTypeID';
                    var obj = _.findObj(filterAr, idName, itm.id);
                    if(obj && obj.selected==true){
                        obj.selected=false;
                    }
                    break;
                case('building'):
                case('caDamage'):
                case('caDamagePotential'):
                case('powerline'):
                    var filterAr = filt['hazards'];
                    if (filterAr[itm.type]) {
                        filterAr[itm.type].selected = false;
                    }
                    break;
            }
		});
		this.data.lastFilterCount=selectedFilters.length;
		selectedFilters.splice(0, selectedFilters.length);
		this.filterTheFilters2(clearTrees);
		if(!clearTrees) this.filterTrees();
	}

    this.resetFilterTypeCounts = function(){
        this.data.filterTypeCounts={species:0, dbh:0, rating:0, treatments:0, caDamage:0, caDamagePotential:0, building:0, powerline:0};
    }

	// ---------------------------------------------------------  PRIVATE HELPER METHODS 




	// @return BOOL - whether or not this tree is within a selected filter
	// to be SHOWN, a tree must satisfy atleast 1 of each type of different filter
	// so if species, and size is set, then it must match at least one of each
	this._isTreeInFilter = function(tree){
		var sf=selectedFilters;
		var filterCounts={};			//ie. {'species':3, 'dbg':1}
		var satisfiedFilterCounts={};
		var totalFilterTypes=0, totalSatisfiedFilterTypes=0, yearFilterOk, treatmentFilterOk;
                var buildingFilter, caDamageFilter, powerlineFilter, caDamagePotentialFilter;
                 

		// loop through each filter, and see if it applies to the tree
		_.each(selectedFilters, function(filter) {

			// Record each unique filter type, and counts, so we know if a tree satisfy's all types
			if( filterCounts[filter.type] ) filterCounts[filter.type]++;
			else{ totalFilterTypes++; filterCounts[filter.type]=1; }

			// check treatment year filter
            yearFilterOk=treatmentFilterOk=false

            // building, hardscape damage, and powerline flags
            buildingFilter=caDamageFilter=powerlineFilter=nonePropFilter=false;

            if(filter.type == "caDamage"){
                caDamageFilter = (tree.caDamage == 'yes')?true:false;
            }
            if(filter.type == 'caDamagePotential'){
                caDamagePotentialFilter = (tree.caDamage == 'potential')?true:false;
            }
            if(filter.type == 'building'){
                buildingFilter = (tree.building == 'yes')?true:false;
            }
            if(filter.type == 'powerline'){
                powerlineFilter = (tree.powerline == 'yes')?true:false;
            }
            if( filter.type=='year' ) {
                    if( tree.recoYears && tree.recoYears.indexOf( filter.id ) >= 0 ) yearFilterOk=true;
            }else if( filter.type=='treatments' ){
                    _.each(tree.history, function(th){
                            if( th.treatmentTypeID == filter.id ){
                                    treatmentFilterOk=true;
                                    return false;
                            }
                    });
            }

			// now evaluate the tree against this particular filter
  			var idName=filter.type + "ID"; 		//ie. "species" + "ID" = "speciesID"
			if( tree[idName] == filter.id || buildingFilter || caDamageFilter || powerlineFilter || caDamagePotentialFilter ||  yearFilterOk || treatmentFilterOk ){
				// if we havent recored this as a "satisfied filter", then do so...
				if( !satisfiedFilterCounts[filter.type] ){
					totalSatisfiedFilterTypes++;
					satisfiedFilterCounts[filter.type]=1;
				}
			}

		})
		return (totalSatisfiedFilterTypes >= totalFilterTypes);
	}


	/** 
	 * Format of selectedFilter, is an array of objects:
	 * 	[
	 *    {type:'species', id:4},
	 *	  {type:'rating',  id:3}
	 *	]
	 * Note: For filtering of SITES (which is when no specific site has been chosen, 
	 * aka no tree results exist.... this is handled by tree.js class (see onFilterChange() func)
	 */	
	this._updateSelectedFilters = function(type, id, value){
		this.data.lastFilterCount=selectedFilters.length;
		var sf=selectedFilters;
		if( value ){ 	//if ON, then add
            sf.push({type:type, id:id});
		}else{			//else, REMOVE it from array, check for duplicates
			// note, when looping an array and removing, items you must start from the end, not beginning
			for( var i=sf.length-1; i>=0; i-- ){
				if( sf[i].type==type && sf[i].id==id ) sf.splice(i,1);
			}
		}	
	}

    //ALGORITHM
    this.rebuildFilterTree = function(trees, selectedFilters){

        //this.exist={species:{}, dbh:{}, rating:{}, treatments:{}, caDamage:{}, caDamagePotential:{}, building:{},powerline:{}}
        var newExist = {};

        var filtersToCountTogether = ['species', 'dbh', 'rating', 'treatments', 'caDamage', 'caDamagePotential', 'building', 'powerline'];
        var filtersToCountSeparately = [];
        _.each(selectedFilters, function(sf){
             if (filtersToCountSeparately.indexOf(sf.type) == -1){
                 filtersToCountSeparately.push(sf.type);
             }
             if (filtersToCountTogether.indexOf(sf.type) != -1){
                 filtersToCountTogether.splice(filtersToCountTogether.indexOf(sf.type), 1);
             }
        });

        var selectedFiltersExceptOne, filteredTreesForFilterType, filterCountsForFilterType;
        var that = this;

        //remove filters, which contradict to filters from another filter-groups
        //ToDo clear filters, functionally it's ok, but may confuse users

        //count each filterType separately
        _.each(filtersToCountSeparately, function(filterType){
            selectedFiltersExceptOne = that.clearSelectedFiltersFromType(selectedFilters, filterType);

            filteredTreesForFilterType = that.filterTrees2(trees, selectedFiltersExceptOne);

            filterCountsForFilterType = that.calcOneFilterCounts(filteredTreesForFilterType, filterType);

            newExist[filterType] = filterCountsForFilterType[filterType];
        })

        //rest of filterTypes will be counted together(optimisation1)
        var filteredTreesForNotUsedFilters = this.filterTrees2(trees, selectedFilters);
        var filterCountsForNotUsedFilters = this.calcSeveralFiltersCounts(filteredTreesForNotUsedFilters, filtersToCountTogether);
        for (var ft in filterCountsForNotUsedFilters){
           newExist[ft] = filterCountsForNotUsedFilters[ft];
        }

        this.exist = newExist;

        this.filterTheFilters2();
    }

    this.clearSelectedFiltersFromType = function(selectedFilters, escapeType){
        var result = [];
        _.each(selectedFilters, function(sf){
            if (sf.type != escapeType) result.push(sf);
        })
        return result;
    }

    //the idea of dynamic filtering is to count filter values without query including current filter
    //for example to count species-filter we need to:
    // 1) exclude species filter from query
    // 2) filter trees with all other filters(except species-filter)
    // 3) each(tree) loop counts species filter values
    this.filterTrees2 = function(trees, filters){
        // check if there are no trees to filter
        if (!trees || trees.length < 1) return [];
        // if there no filters, then all trees satisfy filter condition
        if (!filters || filters.length < 1) return trees;

        var result = []; // collection to store trees, which satisfy filters
        for( var i = 0; i < trees.length; i++ ){

            if( this._isTreeInFilter2(trees[i], filters) ){
                result.push(trees[i]);
            }
        }
        return result;
    }

    //checks whether the tree satisfies to filters set
    //@params: tree, set of filters
    this._isTreeInFilter2 = function(tree, filters){
        var filterCounts={};			//ie. {'species':3, 'dbg':1}
        var satisfiedFilterCounts={};
        var totalFilterTypes=0, totalSatisfiedFilterTypes=0, yearFilterOk, treatmentFilterOk;
        var buildingFilter, caDamageFilter, powerlineFilter, caDamagePotentialFilter;


        // loop through each filter, and see if it applies to the tree
        _.each(filters, function(filter) {

            // Record each unique filter type, and counts, so we know if a tree satisfy's all types
            if( filterCounts[filter.type] ) filterCounts[filter.type]++;
            else{ totalFilterTypes++; filterCounts[filter.type]=1; }

            // check treatment year filter
            yearFilterOk=treatmentFilterOk=false

            // building, hardscape damage, and powerline flags
            buildingFilter=caDamageFilter=powerlineFilter=caDamagePotentialFilter=false;

            if(filter.type == "caDamage"){
                caDamageFilter = (tree.caDamage == 'yes')?true:false;
            }
            if(filter.type == 'caDamagePotential'){
                caDamagePotentialFilter = (tree.caDamage == 'potential')?true:false;
            }
            if(filter.type == 'building'){
                buildingFilter = (tree.building == 'yes')?true:false;
            }
            if(filter.type == 'powerline'){
                powerlineFilter = (tree.powerline == 'yes')?true:false;
            }
            if( filter.type=='year' ) {
                if( tree.recoYears && tree.recoYears.indexOf( filter.id ) >= 0 ) yearFilterOk=true;
            }else if( filter.type=='treatments' ){
                _.each(tree.history, function(th){
                    if( th.treatmentTypeID == filter.id ){
                        treatmentFilterOk=true;
                        return false;
                    }
                });
            }

            // now evaluate the tree against this particular filter
            var idName=filter.type + "ID"; 		//ie. "species" + "ID" = "speciesID"
            if( tree[idName] == filter.id || buildingFilter || caDamageFilter || powerlineFilter || caDamagePotentialFilter ||  yearFilterOk || treatmentFilterOk ){
                // if we havent recored this as a "satisfied filter", then do so...
                if( !satisfiedFilterCounts[filter.type] ){
                    totalSatisfiedFilterTypes++;
                    satisfiedFilterCounts[filter.type]=1;
                }
            }

        })
        return (totalSatisfiedFilterTypes >= totalFilterTypes);
    }

    this.calcOneFilterCounts = function(trees, filterName){
        if(!trees || !trees.length || trees.length < 1) return {};

        //var resultCount = {species:0, dbh:0, rating:0, treatments:0, caDamage:0, building:0, powerline:0}
        var exist = {};
        exist[filterName] = {};
        var that=this;

        // loop through each tree and tally up the possible filter counts (based on filterName)
        _.each(trees, function(tree){
            switch (filterName){
                case ('species'):{
                    if( exist.species[tree.speciesID] ) exist.species[tree.speciesID]++;
                    else {
                        exist.species[tree.speciesID] = 1;
                        that.data.filterTypeCounts.species++;
                    }
                    break;
                }
                case ('dbh'):{
                    if( tree.dbhID>0 ){
                        if( exist.dbh[tree.dbhID] ) exist.dbh[tree.dbhID]++;
                        else {
                            exist.dbh[tree.dbhID] = 1;
                            that.data.filterTypeCounts.dbh++;
                        }
                    }
                    break;
                }
                case ('rating'):{
                    if( tree.ratingID>0 ){
                        if( exist.rating[tree.ratingID] ) exist.rating[tree.ratingID]++;
                        else {
                            exist.rating[tree.ratingID] = 1;
                            that.data.filterTypeCounts.rating++;
                        }
                    }
                    break;
                }
                case ('treatments'):{
                    if( tree.history && tree.history.length ){
                        _.each(tree.history, function(th){
                            if( exist.treatments[th.treatmentTypeID] ) exist.treatments[th.treatmentTypeID]++;
                            else {
                                exist.treatments[th.treatmentTypeID] = 1;
                                that.data.filterTypeCounts.treatments++;
                            }
                        });
                    }
                    break;
                }
                case ('caDamage'):{
                    if( tree.caDamage.toLowerCase()=="yes" ){
                        if( exist.caDamage[tree.treeID] ) exist.caDamage[tree.treeID]++;
                        else {
                            exist.caDamage[tree.treeID]=1;
                            that.data.filterTypeCounts.caDamage++;
                        }
                    }
                    break;
                }
                case ('caDamagePotential'):{
                    if( tree.caDamage.toLowerCase()=="potential" ){
                        if( exist.caDamagePotential[tree.treeID] ) exist.caDamagePotential[tree.treeID]++;
                        else {
                            exist.caDamagePotential[tree.treeID]=1;
                            that.data.filterTypeCounts.caDamagePotential++;
                        }
                    }
                    break;
                }
                case ('building'):{
                    if( tree.building.toLowerCase()=="yes" ){
                        if( exist.building[tree.treeID] ) exist.building[tree.treeID]++;
                        else {
                            exist.building[tree.treeID]=1;
                            that.data.filterTypeCounts.building++;
                        }
                    }
                    break;
                }
                case ('powerline'):{
                    if( tree.powerline.toLowerCase()=="yes" ){
                        if( exist.powerline[tree.treeID] ) exist.powerline[tree.treeID]++;
                        else {
                            exist.powerline[tree.treeID]=1;
                            that.data.filterTypeCounts.powerline++;
                        }
                    }
                    break;
                }
            }
        });

        return exist;
    }

    this.calcSeveralFiltersCounts = function(trees, filterNames){
        if(!trees || !trees.length || trees.length < 1) return {};

        var exist = {};
        var that=this;

        // loop through each tree and tally up the possible filter counts (based on filterName)
        _.each(trees, function(tree){
            _.each(filterNames, function(filterName) {
                switch (filterName) {
                    case ('species'):{
                        if (!exist.species) exist.species = {};
                        if (exist.species[tree.speciesID]) exist.species[tree.speciesID]++;
                        else {
                            exist.species[tree.speciesID] = 1;
                            that.data.filterTypeCounts.species++;
                        }
                        break;
                    }
                    case ('dbh'):{
                        if (!exist.dbh) exist.dbh = {};
                        if (tree.dbhID > 0) {
                            if (exist.dbh[tree.dbhID]) exist.dbh[tree.dbhID]++;
                            else {
                                exist.dbh[tree.dbhID] = 1;
                                that.data.filterTypeCounts.dbh++;
                            }
                        }
                        break;
                    }
                    case ('rating'):{
                        if (!exist.rating) exist.rating = {};
                        if (tree.ratingID > 0) {
                            if (exist.rating[tree.ratingID]) exist.rating[tree.ratingID]++;
                            else {
                                exist.rating[tree.ratingID] = 1;
                                that.data.filterTypeCounts.rating++;
                            }
                        }
                        break;
                    }
                    case ('treatments'):{
                        if (!exist.treatments) exist.treatments = {};
                        if (tree.history && tree.history.length) {
                            _.each(tree.history, function (th) {
                                if (exist.treatments[th.treatmentTypeID]) exist.treatments[th.treatmentTypeID]++;
                                else {
                                    exist.treatments[th.treatmentTypeID] = 1;
                                    that.data.filterTypeCounts.treatments++;
                                }
                            });
                        }
                        break;
                    }
                    case ('caDamage'):{
                        if (!exist.caDamage) exist.caDamage = {};
                        if (tree.caDamage.toLowerCase() == "yes") {
                            if (exist.caDamage[tree.treeID]) exist.caDamage[tree.treeID]++;
                            else {
                                exist.caDamage[tree.treeID] = 1;
                                that.data.filterTypeCounts.caDamage++;
                            }
                        }
                        break;
                    }
                    case ('caDamagePotential'):{
                        if (!exist.caDamagePotential) exist.caDamagePotential = {};
                        if (tree.caDamage.toLowerCase() == "potential") {
                            if (exist.caDamagePotential[tree.treeID]) exist.caDamagePotential[tree.treeID]++;
                            else {
                                exist.caDamagePotential[tree.treeID] = 1;
                                that.data.filterTypeCounts.caDamagePotential++;
                            }
                        }
                        break;
                    }
                    case ('building'):{
                        if (!exist.building) exist.building = {};
                        if (tree.building.toLowerCase() == "yes") {
                            if (exist.building[tree.treeID]) exist.building[tree.treeID]++;
                            else {
                                exist.building[tree.treeID] = 1;
                                that.data.filterTypeCounts.building++;
                            }
                        }
                        break;
                    }
                    case ('powerline'):{
                        if (!exist.powerline) exist.powerline = {};
                        if (tree.powerline.toLowerCase() == "yes") {
                            if (exist.powerline[tree.treeID]) exist.powerline[tree.treeID]++;
                            else {
                                exist.powerline[tree.treeID] = 1;
                                that.data.filterTypeCounts.powerline++;
                            }
                        }
                        break;
                    }
                }
            });
        });

        return exist;
    }

}]);

/**
		HOW _isTreeInFilter() works:


                         +------------------------------------+
                         |  FILTERING PROCESS (for each tree) |        +--------------------------+
                         +------------------------------------+        | SelectedFilters[]        |
                         |     (totalFilterTypes variable)    |        | (array of filter objects)|
                         |                                    |        +--------------------------+
                         |  1. Record total different         |        |                          |
                         |     types of filters:              |        | {type:'species', id:4}   |
                         |                                    |        | {type:'species', id:5}   |
                         |        species                     | <<-----+                          |
                         |        rating                      |        | {type:'rating',  id:6}   |
                         |        dbh                         |        |                          |
                         |        --------                    |        | {type:'dbh',     id:2}   |
                         |        Total: 3                    |        | {type:'dbh',     id:7}   |
                         |                                    |        |                          |
 +-----------+           +------------------------------------+        +-------------+------------+
 |Tree Item  |+          |     (filterCounts variable)        |                      |
 |-----------||+         |                                    |                      |
 |ID=1       |||+        |  2. Record how many different      |                      |
 |speciesID=5+-------->> |     types of filters is satisfied  |                      |
 |ratingID=6 ||||        |     by the Tree Item               |                      |
 |dbhID=7    ||||        |                                    | <<-------------------+
 +-----------+|||        |         species: YES               |
  +-----------+||        |         rating:  YES               |
   +-----------+|        |         dbh:     YES               |
    +-----------+        |         ------------               |
                         |         Total: 3                   |
                         |                                    |
                         +------------------------------------+
										|
										|
										V

								If both TOTALS match,
								then the tree is shown.



**/
