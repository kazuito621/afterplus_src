app.directive('userAutoComplete', function (Api) {
    'use strict';

    var linker = function (scope) {
        scope.emailLookup = function (email) {
            if (!email || email.length < 1) { return []; }

            return Api.usersLookUp({ email: email }).then(function (data) {
                return data;
            });
        };
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        compile: function () {
            return linker;
        }
    };
});
