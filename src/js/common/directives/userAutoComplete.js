app.directive('userAutoComplete', function (Api) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.userAutoComplete] || angular.noop;
        var roles = attrs.userRoles;

        scope.emailLookup = function (email) {
            if (!email || email.length < 2) { return []; }

            var params = {
                email: email
            };

            if (roles) {
                params.role = roles;
            }

            return Api.user.lookUp(params).then(function (data) {
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
