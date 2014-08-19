app.directive('userAutoComplete', function (Api) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.userAutoComplete] || angular.noop;

        scope.emailLookup = function (email) {
            if (!email || email.length < 1) { return []; }

            return Api.usersLookUp({ email: email }).then(function (data) {
                autocompleteData = data;
                return data;
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
        compile: function (el, attrs) {
            var options = "user.email as user.email for user in emailLookup($viewValue)";
            attrs.$set('ngOptions', options);
            return linker;
        }
    };
});
