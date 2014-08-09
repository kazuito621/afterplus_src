app.factory('SortHelper', function () {
    'use strict';

    var SortHelper = function (sortObject, defaultCol, columnMap) {
        var self = this;
        this.data = sortObject || [];

        this.sortCol = defaultCol;
        this.sortDir = 'asc';
        this.columnMap = columnMap;

        this.convertType = function (value, type) {
            var res;
            switch (type) {
            case 'number':
                res = parseFloat(value);
                if (isNaN(res)) { res = 0; }
                return res;
            default:
                return value.toLowerCase();
            }
        };

        this.sortFunction = function (item) {
            var compare = item[self.sortCol] || '';
            var type = self.columnMap[self.sortCol];

            if (type === undefined) {
                compare = compare.toLowerCase();
            } else {
                compare = self.convertType(compare, type);
            }
            return compare;
        };

        this.makeSort = function () {
            var tmp = _.sortBy(self.data, self.sortFunction);
            if (self.sortDir === 'desc') {
                tmp.reverse();
            }

            self.data = tmp;
            return tmp;
        };

        this.sortByColumn = function (col) {
            if (self.sortCol === col) {
                if (self.sortDir === 'asc') {
                    self.sortDir = 'desc';
                } else {
                    self.sortDir = 'asc';
                }
            } else {
                self.sortCol = col;
                self.sortDir = 'asc';
            }

            return this.makeSort();
        };

        this.columnClass = function (col) {
            if (self.sortCol !== col) {
                return 'fa fa-sort';
            }

            if (self.sortDir === 'asc') {
                return 'fa fa-sort-up';
            }

            return 'fa fa-sort-down';
        };
    };

    return {
        sh: function (sortObject, defaultCol, columnMap) {
            return new SortHelper(sortObject, defaultCol, columnMap);
        }
    };
});