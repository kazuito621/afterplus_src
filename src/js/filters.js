
angular.module('arborPlusFilters', [])

	// Usage in template markup:
	// {{ someArray.length>0 | ifElse: 'there is something' : 'nothing'
	.filter('ifElse',function(){
		return function(data, a1, a2){
			return (data) ? a1 : a2;
		}
	})


	// question to ask airpair - should we do it this way? filter directly on the list,
	// or have a holding property?
	// heres one way... what if we filter by clients inside the actual ng-repeat
	.filter('filterClients', function() {
		return function(data, currentClientTypeID) {
			if( !currentClientTypeID ) return data;
			return _.filter(data, function(obj) {
				if(obj.clientTypeID == currentClientTypeID) return true;
			});
		}
	})
	
	// Filter a collection (array of objects) by searching a given objects property, by a given string
	// Need to pass in the propertyName, because differnet lists have different property names
	// Example in angular HTML template:  ng-repeat="tree in trees | filterByString:'commonName':search_string"
	.filter('filterByString', function() {
		return function(dataArray, propertyName, searchString) {
			if( searchString == '' ) return dataArray;
			return _.filter(dataArray, function(obj) {
				if(obj[propertyName].toLowerCase().indexOf(searchString.toLowerCase()) >= 0) return true;
			});
		}
	})

	// Convert "rec" to "Recomended", etc...
	.filter('treatmentStatusName', function() {
		return function(code, scope) {
			if(scope.initData.treatmentStatuses) {
				var obj=_.findObj(scope.initData.treatmentStatuses, 'treatmentStatusCode', code);
				if(obj) return obj.treatmentStatus;
			}
			return code;
		}
	})

	// Convert treatmentTypeID to treatmentType Name
	.filter('treatmentTypeID2Name', function() {
        return function(ID, scope) {
           	if(_.extract(scope.initData, 'filters.treatments')) {
                var obj=_.findObj(scope.initData.filters.treatments, 'treatmentTypeID', ID);
                if(obj) return obj.treatmentType;
            }
			// -9 = new item.. or just created... not yet assigned
			if(ID==-9) return '(new treatment)';
            return "TreatmentTypeID:"+ID;;
        }
    })

	.filter('parseYear', function() {
		return function(sDate) {
			if(sDate && typeof sDate == 'string')
				return sDate.slice(0,4);
			return sDate;
		}
	})

	.filter('formatDate', function(){
		return function(input) {  
			if(!input) return '';
			input=input+' +00';
			return moment(input).utc().format('MMM D, YYYY h:mma');
		};  
	})

	.filter('formatDateFromNow', function(){
		return function(input) {  
			if(!input) return '';
			return moment(input).utc().fromNow();
		};  
	})

	.filter('speciesID2Name', function() {
        return function(ID, opt, scope) {
			if(!ID) return '';
			var s = _.extract(scope.initData, 'filters.species');
			if(s){
                var obj=_.findObj(s, 'speciesID', ID);
                if(obj && obj.commonName){ 
					if(opt=='bot' && obj.botanicalName)
						return obj.botanicalName
					else if(opt=='both' && obj.botanicalName)
						return '{0} ({1})'.format(obj.commonName, obj.botanicalName);
					else
						return obj.commonName;
				}
            }
            return "SpeciesID: "+ID;
        }
    })
	
	.filter('ratingID2Name', function() {
        return function(ID, scope) {
			var s = _.extract(scope.initData, 'filters.ratings');
			if(s){
                var obj=_.findObj(s, 'ratingID', ID);
                if(obj && obj.rating_desc) return obj.rating_desc;
            }
            return ID;
        }
    })

	.filter('treatmentTypeCode2Name', function() {
        return function(code, scope) {
			var t = _.extract(scope.initData, 'filters.treatments');
			if(t){
                var obj=_.findObj(t, 'code', code);
                if(obj && obj.treatmentType) return obj.treatmentType;
            }
            return code;
        }
    })

    .filter('clientTypeName', function() {
        return function(id, scope) {
            var t = _.extract(scope.initData, 'clientTypes');
            if(t){
                var obj=_.findObj(t, 'clientTypeID', id);
                if(obj && obj.name) return obj.name;
            }
            return 'Not specified';
        }
    })

    .filter('clientName', function() {
        return function(id, scope) {
            var t = _.extract(scope.initData, 'clients');
            if(t){
                var obj=_.findObj(t, 'clientID', id);
                if(obj && obj.name) return obj.name;
            }
            return 'Not specified';
        }
    })

    .filter('treatmentTypePriceGetter', function(){
	 	
	 	return function(itm){
		 	var found = _.find(this.treatmentPrices, function(itm){
				if(itm.dbhID==dbhID && itm.treatmentTypeCode==treatmentTypeCode) return true;
			})
		if(found) return found.price;
		}
    })
    
	// convert treatment type id or code to ane
     .filter('getTreatmentTypeName', function(){
	 	 return function(id, scope) {
			var t = _.extract(scope.initData, 'filters.treatments');
			if(!t) return '';
			if(isNaN(t)){		// search by code
                var obj=_.findObj(t, 'code', id);
                if(obj && obj.treatmentType) return obj.treatmentType;
			}else{				// search by id
                var obj=_.findObj(t, 'treatmentTypeID', id);
                if(obj && obj.treatmentType) return obj.treatmentType;
            }
        }
		return '';
    })
    
    .filter('treeRatingGetter', function(){
	    return function(id, scope) {
			var t = _.extract(scope.initData, 'filters.ratings');
			if(t){
                var obj=_.findObj(t, 'ratingID', id);
                if(obj && obj.ratingID) return obj.rating_desc;
            }
        }

    })

	.filter('dbhID2Name', function() {
        return function(ID, scope) {
			if(!ID) return '(not specified)';	// this is because in the tree edit screen
												// if the dbh didnt exist, the component would be
												// blank, and the user couldnt set a dbh.
			var s = _.extract(scope.initData, 'filters.dbh');
			if(s){
                var obj=_.findObj(s, 'dbhID', ID);
                if(obj && obj.diameter) return obj.diameter + '"';
            }
			return '(not specified)';
        }
    })

	
	// return either:
	//		the nearest YEAR of recomendation for treatment,
	// OR if opt=='css', then return "thisYear" or "nextYear"
	.filter('showRecoYear', function(){
		return function(hist, opt){
			var yr=9999;
			if(hist && hist.length){
				_.each(hist, function(h){
					if(h.treatmentStatusCode=='rec' && h.year<yr) yr=h.year 
				});
				if(opt=='css'){
					if(yr==moment().format('YYYY')) return 'thisYear';
					if(yr==moment().add('year',1).format('YYYY')) return 'nextYear';
				}else{
					return yr;
					//return "<span style='color:red;' class='recYear'>{0}</span>".format(yr);
				}
			}
			return '';
		}
	})


	// add commas to number, and remove ".00" at end
	.filter('formatPrice', function(){
		return function( val ){
			val=''+val;
    		while (/(\d+)(\d{3})/.test(val.toString())){
	    		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
		   	}
			return val;
			return val.replace(/\.00$/,'');	// this removes .00 ...
		}
	})

    // format phone like 510-331-1080 ext. 123
    .filter('formatPhoneNumber', function(){
        return function( val ){
            if (!val || val==='') return '';

            var numRegex = /^(\()?([0-9]{3})(\))?( |-|.)?([0-9]{3})( |-|.)?([0-9]{4})[ ]*(( |x|X|ex.|ex|ext|ext.|extension|Ext|Ext.|Extension|#){1}[ ]?([0-9]{1,7})){0,1}[ ]?(cell)?$/;

            if(!numRegex.test(val)) {
                return val; // regex invalid
            } else {
                var formatted_number = val.replace(numRegex,'$2-$5-$7 $9 $10 $11');
                //replace ex/ext/... variations
                formatted_number = formatted_number.replace(/extension|ext.|ext|ex.|ex|x|#/gi, 'ext.');
            }
            //console.info('initial ' + val + ' result ' + formatted_number);
            return formatted_number;
        }
    });


