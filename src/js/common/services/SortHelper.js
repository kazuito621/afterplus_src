app.factory('SortHelper', function () {
  'use strict';

  var SortHelper = function (sortObject, defaultCol, columnMap, colSortMap) {
    dbg(columnMap, colSortMap, 'sorthlper start');
    var self = this;
    this.data = sortObject || [];

    this.sortCol = defaultCol;
    this.sortDir = 'asc';
    this.columnMap = columnMap;
    this.colSortMap = colSortMap || {};

    this.convertType = function (value, type) {
      var res;
      switch (type) {
      case 'number':
        res = parseFloat(value);
        if (isNaN(res)) {
          res = 0;
        }
        return res;
      default:
        return value.toLowerCase();
      }
    };

    this.sortFunction = function (item) {
      var compare, type;

      if (angular.isArray(self.sortCol)) {
        compare = '';
        angular.forEach(self.sortCol, function (col) {
          compare += item[col];
        });
        type = self.columnMap[self.sortCol.join('+')];
      } else {
        compare = item[self.sortCol] || '';
        type = self.columnMap[self.sortCol];
      }

      if (type === undefined) {
        compare = compare.toLowerCase();
      } else {
        compare = self.convertType(compare, type);
      }
      return compare;
    };

    this.makeSort = function (data) {
      if (data) {
        self.data = data;
      }
      var tmp = _.sortBy(self.data, self.sortFunction);
      if (self.sortDir === 'desc') {
        tmp.reverse();
      }

      self.data = tmp;
      return tmp;
    };

    this.sortByColumn = function (col) {
      if (angular.equals(self.sortCol, col)) {
        if (self.sortDir === 'asc') {
          self.sortDir = 'desc';
        } else {
          self.sortDir = 'asc';
        }
      } else {
        self.sortCol = col;
        // if there is a default sort order, use it
        if (self.colSortMap[col]) {
          self.sortDir = self.colSortMap[col];
        } else {
          self.sortDir = 'asc';
        }
      }

      return this.makeSort();
    };

    this.columnClass = function (col, sortDir) {
      if (sortDir === 'desc') { self.sortDir = 'desc'; }
      if (!angular.equals(self.sortCol, col)) {
        return 'fa fa-sort';
      }

      if (self.sortDir === 'asc') {
        return 'fa fa-sort-up';
      }

      return 'fa fa-sort-down';
    };

    this.setData = function (data) {
      this.data = data;
    };
  };

  return {
    sh: function (sortObject, defaultCol, columnMap, colSortOrder) {
      return new SortHelper(sortObject, defaultCol, columnMap, colSortOrder);
    }
  };
});
