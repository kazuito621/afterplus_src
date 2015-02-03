/**
 * Created by Imdadul Huq on 04-Feb-15.
 */

app.directive('addressAutoComplete', function (Api) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.addressAutoComplete] || angular.noop;

        scope.addressLookup = function (address) {
            if (!address || address.length < 1) { return []; }

            var params = {
                address: address
            };

            return Api.getGoogleAddress(params).then(function (data) {
                var res=data.data.results;
                autocompleteData = res;
                return res;
            });
        };

        scope.$on('$typeahead.select', function (event, email, index) {
            callback(autocompleteData[index]);
        });
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        priority: 500,
        scope: true,
        compile: function (el, attrs) {
            var options = "address.formatted_address as address.formatted_address for address in addressLookup($viewValue)";
            attrs.$set('ngOptions', options);
            return linker;
        }
    };
});
