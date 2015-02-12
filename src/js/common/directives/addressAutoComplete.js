/**
 * Created by Imdadul Huq on 04-Feb-15.
 */

app.directive('addressAutoComplete', function (Api) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.addressAutoComplete] || angular.noop;
        var address=scope.$parent[attrs.address];
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
            address.street='';
            address.state='';
            address.city='';
            address.zip='';
            var i=0;
            _.each(autocompleteData[index].address_components,function(item){
                i++;
                if((i==1 || i==2 || i==3) && item.types.toString()!="locality,political" && item.types.indexOf('administrative_area_level_1')==-1){
                    // First 3 levels of details address(if exists) except the city,state name
                    if(i>1){
                        address.street+=', ';
                    }
                    address.street += item.long_name+" ";
                    return;
                }
                if(item.types.toString()=="locality,political"){
                    address.city = item.long_name;
                    return;
                }
                else if(item.types.toString()=="administrative_area_level_1,political"){
                    address.state = item.long_name;
                    return;
                }
                else if(item.types.toString()=="postal_code"){
                    address.zip = item.long_name;
                    return;
                }
            });
            callback(address);
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
