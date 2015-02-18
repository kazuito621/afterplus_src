/**
 * Created by Imdadul Huq on 04-Feb-15.
 */

app.directive('addressAutoComplete', function (Api,$interval) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.addressAutoComplete] || angular.noop;
        var address=angular.copy(scope.$eval(attrs.address));
        scope.addressLookup = function (str) {
            if(str=="" && address.street!='' && address.street!=undefined){ // It is true when the modal is opened in edit mode.
                var stop=$interval(function() {
                    if(el.val()==address.street){
                        $interval.cancel(stop);
                        address.street=undefined; // So that it can not again enter this block
                    }
                    else {
                        el.val(address.street);  // Updates bs-typeahead !!
                    }
                }, 100);
            }
            if (!str || str.length < 1) { return []; }

            var params = {
                address: str,
                components:'country:USA'
            };

            return Api.getGoogleAddress(params).then(function (data) {
                var res=data.data.results;
                autocompleteData = res;
                return res;
            });
        };

        scope.$on('$typeahead.select', function (event, email, index) {

            var selectedAddress={};
            selectedAddress.street='';
            selectedAddress.state='';
            selectedAddress.city='';
            selectedAddress.zip='';
            var i=0;
            _.each(autocompleteData[index].address_components,function(item){
                i++;
                if((i==1 || i==2 || i==3) && item.types.toString()!="locality,political" 
					&& item.types.indexOf('administrative_area_level_1')==-1)
				{
                    // First 3 levels of details address(if exists) except the city,state name
                   if(i>2){
                       selectedAddress.street+=', ';
                   }
                    selectedAddress.street += item.long_name+" ";
                   return;
                }
                if(item.types.toString()=="locality,political"){
                    selectedAddress.city = item.long_name;
                    return;
                }
                else if(item.types.toString()=="administrative_area_level_1,political"){
                    selectedAddress.state = item.short_name;
                    return;
                }
                else if(item.types.toString()=="postal_code"){
                    selectedAddress.zip = item.long_name;
                    return;
                }
            });
            callback(selectedAddress);
            var stop=$interval(function() {
                if(el.val()==selectedAddress.street){
                    $interval.cancel(stop);
                }
                else {
                    el.val(selectedAddress.street); // Updates bs-typeahead to street address instead of full address!!
                }
            }, 100);
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
