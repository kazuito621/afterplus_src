/*
	HOW FILTERING / FILTER GROUPING WORKS
	-------------------------------------
	When filter types are grouped, then in order for an item to match a filter,
	it must match at least one requirement in each group.

	Examples, If the grouping is:	[  ['name','address'],  ['status'] ]
	
	Then if only a "name" filter is set, then only a name must match
	If a "name" and "address" filter set, then either filter can match a record, to be considered a match.
	but if a 'name' and 'status' are set, then both must match, for the record be considered a match.
*/
app.factory('FilterHelper', function () {
    'use strict';

    var FilterHelper = function () {
        var self = this;
		var filterGroups=[];		//ie. [['name','address'],['status']]
		var activeFilters=[[]];		//ie. [{filterName:STRING, value:STRING},...]

		this.setFilterGroups = function(grps){
			if(!grps) return ;
			filterGroups=grps;
		}

		// @parma obj - ie. {name:'tim', address:'123'}
		// which converts into activeFilters[] array ie. [ [{filterName, value},...], [{filterName, value},...] ] 
		this.setFilter = function(obj){
			var filterItem, filterIdx, filterGroupIdx, thisGroup;
			_.each(obj, function(val, key){
				filterGroupIdx=self.getFilterGroup(key);
				if(!activeFilters[filterGroupIdx]) activeFilters[filterGroupIdx]=[];
				thisGroup = activeFilters[filterGroupIdx];

				if(val){ 
					filterItem = _.findObj(thisGroup, 'filterName', key);
					if(filterItem) filterItem.value=val;
					else thisGroup.push({filterName:key, value:val});
				}else{
					filterIdx = _.findObj(thisGroup, 'filterName', key, true);
					if(filterIdx!==false) thisGroup.splice(filterIdx,1);
				}
			});
		}

		this.getFilterGroup = function(filterName){
			var grpIdx=0;
			_.each(filterGroups, function(grp, idx){
				if(grp.indexOf(filterName) >= 0){
					grpIdx=idx;
					return false;
				}
			});
			return grpIdx;
		}

		// returns true if item matches ANY of the filter conditions
        this.matchFilter = function (item, filter) { 
            var res = false, fg, filterName, value;
            _.each(filter, function (obj) {
                if (!obj.value) return;
				try{
					// filtering *ID as numbers
					if (obj.filterName.substr(-2).toLowerCase() === 'id') { 
						if (item[obj.filterName] === obj.value) {
							res = true;
							return false;
						}
					} 
					// filtering  as text
					else if (item[obj.filterName].toLowerCase().search(obj.value.toLowerCase()) > -1) 
					{
						res = true;
						return false;
					}
				}catch(e){}
            });
            return res;
        };

        this.applyFilter = function (data) {
			var filter=activeFilters;
            var rtn= _.filter(data, function (item) {
				var filterGroupMatches=0, matches=0, activeFilterCount=0;
				_.each(activeFilters, function(filterGrp, idx){
					if(filterGrp.length){
						activeFilterCount++;
                		if( self.matchFilter(item, filterGrp) ) matches++;
					}
				});

				if(activeFilterCount==0) return true;
				return (matches>0 && matches == activeFilterCount);
            });

			return rtn;
        };
    };

    return {
        fh: function () {
            return new FilterHelper();
        }
    };
});
