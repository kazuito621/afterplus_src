/*global moment*/
app.directive('treesSelector',
    [function () {
        'use strict';

        var linker = function (scope) {
            scope.thisYear = moment().format('YYYY');
		 scope.auth=Auth;
        };

        return {
            restrict: 'EA',
            replace: false,
            transclude: false,
            templateUrl: 'js/common/directives/treesRightBlock/trees.selector/trees.selector.tpl.html',
            scope: {
                toggleCheckedTrees: '&', // func (opt)
                setStatus: '&',
                selectedTrees: '=',
                count: '=', // TFSdata.treeResultsCount
                editModeCss: "@",
                siteID:'@siteId',
                treatments:'=treatments'
            },
            link: linker            
        };
    }]);
