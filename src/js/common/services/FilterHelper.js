app.factory('FilterHelper', function () {
    'use strict';

    var FilterHelper = function () {
        var self = this;

        this.matchFilter = function (item, filter) { // returns true if item matches ANY of the filter conditions
            var res = false;

            _.each(filter, function (val, key) {
                if (val) {
					try{
						if (key.substr(-2).toLowerCase() === 'id') { // filtering *ID as numbers
							if (item[key] === val) {
								res = true;
								return true;
							}
						} else if (item[key].toLowerCase().search(val.toLowerCase()) > -1) {
							res = true;
							return true;
						}
					}catch(e){
						return false;
					}
                }
            });

            return res;
        };

        this.applyFilter = function (data, filter) {
            if (_.objSize(filter) === 0) { // empty filter
                return data;
            }

            _.each(filter, function (val, key) {
                if (!isNaN(val)) {
                    filter[key] = val.toLowerCase();
                }
            });

            return _.filter(data, function (item) {
                return self.matchFilter(item, filter);
            });
        };
    };

    return {
        fh: function () {
            return new FilterHelper();
        }
    };
});
