/*global moment*/
app.directive('sitesSelector',
    [function () {
        'use strict';

        var linker = function (scope) {
            scope.toggle = function (opt) {
                if (opt) {
                    scope.selected = _.pluck(scope.items, 'siteID');
                } else {
                    scope.selected.length = 0;
                }
            };
        };

        return {
            restrict: 'EA',
            replace: false,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/sites.selector/sites.selector.tpl.html',
            scope: {
                items: '=',
                selected: '=',
                name: '@'
            },
            link: linker
        };
    }]);

app.filter('selectedSummaryTrees', function () {
    return function (data, selected) {
        var treeCount = 0;
        _.each(selected, function(selectedSite) {
            var site = _.findWhere(data, { 'siteID' : selectedSite });

            treeCount += parseInt(site.matchedTreesCount);
        });

        return treeCount;
    }
});

app.filter('selectedSummaryEstimatePrice', function () {
    return function (data, selected) {
        var price = 0;
        _.each(selected, function(selectedSite) {
            var site = _.findWhere(data, { 'siteID' : selectedSite });

            price += parseInt(parseFloat(site.estimatePrice));
        });

        return price;
    }
});
