/**
 * Created by Imdadul Huq on 04-Feb-15.
 */

app.directive('reportAutoComplete', function (Api,$interval) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.addressAutoComplete] || angular.noop;
        var address=angular.copy(scope.$eval(attrs.address));

        scope.addressLookup = function (str) {
            if(str=="" && address!='' && address!=undefined){ // It is true when the modal is opened in edit mode.
                var stop=$interval(function() {
                    if(el.val()==address){
                        $interval.cancel(stop);
                        address=undefined; // So that it can not again enter this block
                    }
                    else {
                        el.val(address);  // Updates bs-typeahead !!
                    }
                }, 100);
            }
            if (!str || str.length < 1) { return []; }



            var opts = {};
            opts.search = str;

            return Api.findReport(opts).then(function (data) {
                var res=data.reports;
                autocompleteData = res;
                return res;
            })
        };
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        priority: 500,
        scope: true,
        compile: function (el, attrs) {
            var options = "address.reportID as address.name for address in addressLookup($viewValue)";
            attrs.$set('bsOptions', options);
            return linker;
        }
    };
});
