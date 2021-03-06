angular.module('arborPlusFilters', [])

  // Usage in template markup:
  // {{ someArray.length>0 | ifElse: 'there is something' : 'nothing'
  .filter('ifElse', function () {
    'use strict';
    return function (data, a1, a2) {
      return data ? a1 : a2;
    };
  })


  // question to ask airpair - should we do it this way? filter directly on the list,
  // or have a holding property?
  // heres one way... what if we filter by clients inside the actual ng-repeat
  .filter('filterClients', function () {
    'use strict';
    return function (data, currentClientTypeID) {
      if (!currentClientTypeID) { return data; }
      return _.filter(data, function (obj) {
        if (obj.clientTypeID === currentClientTypeID) { return true; }
      });
    };
  })

  // Filter a collection (array of objects) by searching a given objects property, by a given string
  // Need to pass in the propertyName, because differnet lists have different property names
  // Example in angular HTML template:  ng-repeat="tree in trees | filterByString:'commonName':search_string"
  .filter('filterByString', function () {
    'use strict';
    return function (dataArray, propertyName, searchString) {
      if (searchString === '') { return dataArray; }
      return _.filter(dataArray, function (obj) {
        if (obj[propertyName].toLowerCase().indexOf(searchString.toLowerCase()) >= 0) { return true; }
      });
    };
  })

  // Convert "rec" to "Recomended", etc...
  .filter('treatmentStatusName', function () {
    'use strict';
    return function (code, scope) {
      if (scope.initData.treatmentStatuses) {
        var obj = _.findObj(scope.initData.treatmentStatuses, 'treatmentStatusCode', code);
        if (obj) { return obj.treatmentStatus; }
      }
      return code;
    };
  })

  // Convert treatmentTypeID to treatmentType Name
  .filter('treatmentTypeID2Name', function () {
    return function (ID, scope) {
      'use strict';
      if (_.extract(scope.initData, 'filters.treatments')) {
        var obj = _.findObj(scope.initData.filters.treatments, 'treatmentTypeID', ID);
        if (obj) { return obj.treatmentType; }
      }
      // -9 = new item.. or just created... not yet assigned
      if (ID === -9) { return '(new treatment)'; }
      return "TreatmentTypeID:" + ID;
    };
  })

  .filter('parseYear', function () {
    'use strict';
    return function (sDate) {
      if (sDate && typeof sDate === 'string') {
        return sDate.slice(0, 4);
      }
      return sDate;
    };
  })

  .filter('formatDate', function () {
    'use strict';
    return function (input) {
      if (!input) { return ''; }
      input = input + ' +00';
      return moment(input).utc().format('MMM D, YYYY h:mma');
    };
  })

  .filter('formatDateOnly', function () {
    'use strict';
    return function (input) {
      if (!input) { return ''; }
      return moment(input).format('YYYY-MM-DD');
    };
  })

  .filter('formatDateFromNow', function () {
    'use strict';
    return function (input, opt) {
      if (!input) {
        if (opt === 'showNone') { return '(none)'; }
        return '';
      }
      return moment(input).utc().fromNow();
    };
  })

  .filter('speciesID2Name', function () {
    'use strict';
    return function (ID, opt, scope) {
      if (!ID) { return ''; }
      var s = _.extract(scope.initData, 'filters.species');
      if (s) {
        var obj = _.findObj(s, 'speciesID', ID);
        if (obj && obj.commonName) {
          if (opt === 'bot' && obj.botanicalName) {
            return obj.botanicalName;
          } else if (opt === 'both' && obj.botanicalName) {
            return '{0} ({1})'.format(obj.commonName, obj.botanicalName);
          } else {
            return obj.commonName;
          }
        }
      }
      return "SpeciesID: " + ID;
    };
  })

  .filter('ratingID2Name', function () {
    'use strict';
    return function (ID, scope) {
      var s = _.extract(scope.initData, 'filters.ratings');
      if (s) {
        var obj = _.findObj(s, 'ratingID', ID);
        if (obj && obj.rating_desc) { return obj.rating_desc; }
      }
      return ID;
    };
  })

  .filter('treatmentTypeCode2Name', function () {
    'use strict';
    return function (code, scope) {
      var t = _.extract(scope.initData, 'filters.treatments');
      if (t) {
        if (angular.isNumber(code)) {
          if (t[code] && t[code].treatmentType) {
            return t[code].treatmentType;
          }
        } else {
          var obj = _.findObj(t, 'code', code);
          if (obj && obj.treatmentType) {
            return obj.treatmentType;
          }
        }
      }
      return code;
    };
  })

  .filter('clientTypeName', function () {
    'use strict';
    return function (id, scope) {
      var t = _.extract(scope.initData, 'clientTypes');
      if (t) {
        var obj = _.findObj(t, 'clientTypeID', id);
        if (obj && obj.name) { return obj.name; }
      }
      return 'Not specified';
    };
  })

  .filter('clientName', function () {
    'use strict';
    return function (id, scope) {
      var t = _.extract(scope.initData, 'clients');
      if (t) {
        var obj = _.findObj(t, 'clientID', id);
        if (obj && obj.name) { return obj.name; }
      }
      return 'Not specified';
    };
  })

  .filter('treatmentTypePriceGetter', function () {
    'use strict';
    return function (itm) {
      var found = _.find(this.treatmentPrices, function (itm) {
        if (itm.dbhID === dbhID && itm.treatmentTypeCode === treatmentTypeCode) { return true; }
      });
      if (found) { return found.price; }
    };
  })

  // convert treatment type id or code to ane
  .filter('getTreatmentTypeName', function () {
    'use strict';
    return function (id, scope) {
      var obj;
      var t = _.extract(scope.initData, 'filters.treatments');
      if (!t) { return ''; }
      if (isNaN(id)) {  // search by code
        obj = _.findObj(t, 'code', id);
        if (obj && obj.treatmentType) { return obj.treatmentType; }
      } else {  // search by id
        obj = _.findObj(t, 'treatmentTypeID', id);
        if (obj && obj.treatmentType) { return obj.treatmentType; }
      }
      return '';
    };
  })

  .filter('treeRatingGetter', function () {
    'use strict';
    return function (id, scope) {
      var t = _.extract(scope.initData, 'filters.ratings');
      if (t) {
        var obj = _.findObj(t, 'ratingID', id);
        if (obj && obj.ratingID) { return obj.rating_desc; }
      }
    };

  })

  .filter('dbhID2Name', function () {
    'use strict';
    return function (ID, scope) {
      if (!ID) { return '(not specified)'; } // this is because in the tree edit screen
      // if the dbh didnt exist, the component would be
      // blank, and the user couldnt set a dbh.
      var s = _.extract(scope.initData, 'filters.dbh');
      if (s) {
        var obj = _.findObj(s, 'dbhID', ID);
        if (obj && obj.diameter) { return obj.diameter + '"'; }
      }
      return '(not specified)';
    };
  })


  // return either:
  // the nearest YEAR of recomendation for treatment,
  // OR if opt=='css', then return "thisYear" or "nextYear"
  .filter('showRecoYear', function () {
    'use strict';
    return function (hist, opt) {
      var yr = 9999;
      if (hist && hist.length) {
        _.each(hist, function (h) {
          if (h.treatmentStatusCode === 'rec' && h.year < yr) { yr = h.year; }
        });
        if (opt === 'css') {
          if (yr === moment().format('YYYY')) { return 'thisYear'; }
          if (yr === moment().add(1, 'year').format('YYYY')) { return 'nextYear'; }
        } else {
          return yr;
          //return "<span style='color:red;' class='recYear'>{0}</span>".format(yr);
        }
      }
      return '';
    };
  })


  // add commas to number, and remove ".00" at end
  .filter('formatPrice', function () {
    'use strict';
    return function (val, opt) {
      if (!val) { return val; }
      val = parseFloat(val).toFixed(2).toString();

      if (opt === 'noCents') {
        val = val.replace(/\.[0-9]+/, '');
      }

      while (/(\d+)(\d{3})/.test(val)) {
        val = val.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
      }
      return val;
      //return val.replace(/\.00$/,''); // this removes .00 ...
    };
  })


	/**
	 * Shorten Price, whether Thousands or Millions
	 *   989.89 		==> 989			// < 1000 = take off cents und
	 *   7893.33 		==> 7.8k		// < 10,000 = abbreviate with one digit
	 *   29001.11 	==> 29k			// < 1 Million ... 
	 *   3600000		==> 3.6M		// > 1 Million
	 *   5000000		==> 5M		// > 1 Million, but even
	 *   11500000		==> 11M		// > 10 Million... event
	 */
	.filter('shortenNumber', function (){
		return function($pr){
		 if($pr<1000) return Math.round($pr);		
		 if($pr<10000) return parseInt($pr).toString().substring(0, parseInt($pr).toString().length-3)+'k';
		 if($pr<1000000) return Math.floor(parseInt($pr)/1000)+"k";
		 if($pr<10000000){ 
		 	var n = ''+(parseInt($pr)/1000000).toFixed(1);
			if(n.substr(-1)=='0') return n.substr(0,n.length-2) + 'M';
			return n+'M';
		 }
		 // over 10M
		 return (parseInt($pr)/1000000).toFixed(0)+'M';
		}
	})


  // add commas to number, and remove ".00" at end
  .filter('statusText', function () {
    'use strict';
    return function (val) {
      var o = {
        sent: 'NEEDS APPROVAL'
      };
      var v = o[val];
      if (v) { return v; }
      return val.toUpperCase().replace(/_/, ' ');
    };
  })


  // format phone like 510-331-1080 ext. 123
  .filter('formatPhoneNumber', function () {
    'use strict';
    return function (val) {
      if (!val || val === '') { return ''; }

      var numRegex = /^(\()?([0-9]{3})(\))?( |-|.)?([0-9]{3})( |-|.)?([0-9]{4})[ ]*(( |x|X|ex.|ex|ext|ext.|extension|Ext|Ext.|Extension|#){1}[ ]?([0-9]{1,7})){0,1}[ ]?(cell)?$/;

      if (!numRegex.test(val)) {
        return val; // regex invalid
      }

      var formatted_number = val.replace(numRegex, '$2-$5-$7 $9 $10 $11');
      //replace ex/ext/... variations
      formatted_number = formatted_number.replace(/extension|ext.|ext|ex.|ex|x|#/gi, 'ext.');

      //console.info('initial ' + val + ' result ' + formatted_number);
      return formatted_number;
    };
  })
  .filter('escape', function () {
    'use strict';
    return function (val) {
      return window.encodeURIComponent(val);
    };
  })
  .filter('reverse', function () {
    'use strict';
    return function (items) {
      return (items || []).slice().reverse();
    };
  })

  .filter('slice', function () {
    'use strict';
    return function (arr, start, end) {
      return (arr || []).slice(start, end);
    };
  })

  // Used for the /#trees page "year filter" drop down list.
  // Any years which dont have counts... remove them
  .filter('filterYearFilters', function () {
    'use strict';
    return function (data) {
      var out = [];
      _.each(data, function (d) {
        if (d.count > 0) { out.push(d); }
      });
      return out;
    };
  });
