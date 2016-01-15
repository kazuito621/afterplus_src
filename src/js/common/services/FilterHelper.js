/*
 HOW FILTERING / FILTER GROUPING WORKS
 -------------------------------------
 When filter types are grouped, then in order for an item to match a filter,
 it must match at least one requirement in each group.

 Examples, If the grouping is:  [  ['name','address'],  ['status'] ]

 Then if only a "name" filter is set, then only a name must match
 If a "name" and "address" filter set, then either filter can match a record, to be considered a match.
 but if a 'name' and 'status' are set, then both must match, for the record be considered a match.
 */
app.factory('FilterHelper', function () {
  'use strict';

  var FilterHelper = function () {
    var self = this;
    var filterGroups = [];  //ie. [['name','address'],['status']]
    var activeFilters = [[]];  //ie. [{filterName:STRING, value:STRING},...]

    this.setFilterGroups = function (grps) {
      if (!grps) { return; }
      filterGroups = grps;
    };

    // @parma obj - ie. {name:'tim', address:'123'}
    // which converts into activeFilters[] array ie. [ [{filterName:STRING, value:MIXED},...], [{filterName:STRING, value:MIXED},...] ]
    this.setFilter = function (obj) {
		activeFilters=[[]];
	   if(!obj) return;

      var filterItem, filterIdx, filterGroupIdx, thisGroup;
      _.each(obj, function (val, key) {							// loop through the filter object
        filterGroupIdx = self.getFilterGroup(key);
        if (!activeFilters[filterGroupIdx]) {
          activeFilters[filterGroupIdx] = [];
        }
        thisGroup = activeFilters[filterGroupIdx];

        if( val !== false && val !== '' && typeof val != 'undefined' ){
          filterItem = _.findObj(thisGroup, 'filterName', key);
          if (filterItem) {
            filterItem.value = val;
          } else {
            thisGroup.push({filterName: key, value: val});
          }
        } else {			
          filterIdx = _.findObj(thisGroup, 'filterName', key, true);
          if (filterIdx !== false) {
            thisGroup.splice(filterIdx, 1);
          }
        }
      });
    };

    this.getFilterGroup = function (filterName) {
      var grpIdx = 0;
      _.each(filterGroups, function (grp, idx) {
        if (grp.indexOf(filterName) >= 0) {
          grpIdx = idx;
          return false;
        }
      });
      return grpIdx;
    };

    // returns true if item matches ANY of the filter conditions
    this.matchFilter = function (item, filter) {
      var res = false, fg, filterName, value;
      _.each(filter, function (obj) {
        if (obj.value === false || obj.value === '' || typeof obj.value == 'undefined') { return; }
		  var itemVal = item[obj.filterName];
        try {

			 // check if filter value is an object (ie. {gt:5} //greater than 5
			 if( typeof obj.value == 'object' && (typeof obj.value.gt != 'undefined' || typeof obj.value.lt != 'undefined') ){
				itemVal = parseFloat(itemVal);

				if(typeof obj.value.gt != 'undefined') obj.value.gt = parseFloat(obj.value.gt);
				else obj.value.gt=false;
				
				if(typeof obj.value.lt != 'undefined') obj.value.lt = parseFloat(obj.value.lt);
				else obj.value.lt=false;

				if( obj.value.gt !== false && itemVal <= obj.value.gt ) return false;
				
				if( obj.value.lt !== false && itemVal >= obj.value.lt ) return false;
				
				res = true;
				return false;
			 }

			 // check for number
          else if( itemVal == obj.value ){
				res = true;
				return false;
			 }

			 // check id's for numbers
          else if(obj.filterName.substr(-2).toLowerCase() === 'id' ) {
            if (itemVal === obj.value) {
              res = true;
              return false;
            }
          }

          // filtering  as text
          else if( itemVal.toLowerCase().search(obj.value.toLowerCase()) > -1 ){
            res = true;
            return false;
          }
        } catch (e) {
        }
      });
      return res;
    };

    this.applyFilter = function (data) {
      var filter = activeFilters;
      var rtn = _.filter(data, function (item) {
        var filterGroupMatches = 0, matches = 0, activeFilterCount = 0;
        _.each(activeFilters, function (filterGrp, idx) {
          if (filterGrp && filterGrp.length) {
            activeFilterCount += 1;
            if (self.matchFilter(item, filterGrp)) { matches += 1; }
          }
        });
        if (activeFilterCount === 0) { return true; }
        return (matches > 0 && matches === activeFilterCount);
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
