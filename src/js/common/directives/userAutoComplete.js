app.directive('userAutoComplete', function (Api) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autocompleteData = [];
        var callback = scope.$parent[attrs.userAutoComplete] || angular.noop;
        var ignoreList = [];
        var makeIgnoreList = function (data) {
            return _.pluck(data, 'email');
        };

        scope.emailLookup = function (email) {
            if (!email || email.length < 1) { return []; }

            var params = {
                email: email
            };

            if (attrs.userRoles) {
                params.role = attrs.userRoles;
            }

			// no need for an ignore list now, since a user can be assigned twice to once site
            //if (attrs.userIgnore) {
            //    ignoreList = makeIgnoreList(scope.$parent[attrs.userIgnore]);
            //}

            return Api.user.lookUp(params).then(function (data) {
                var res = _.filter(data, function (item) {
                    return ignoreList.indexOf(item.email) === -1;
                });

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
            var options = "user.email as user.email for user in emailLookup($viewValue)";
            attrs.$set('bsOptions', options);
            return linker;
        }
    };
});
