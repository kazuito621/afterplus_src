app.directive('sitesAutoComplete', ['Api',function (Api) {
    'use strict';

    var linker = function (scope, el, attrs) {
        var autoCompleteData = [];
        var callback = scope.$parent[attrs.callback] || angular.noop;
        var sites = scope.$parent[attrs.sites] || [];

        if(sites.length==0){ // In case sites are not provided by the calling scope.
            Api.getSiteList().then(function (siteData) {
                sites=siteData;
            })
        }
        scope.sitesLookup = function (name) {
            callback({}, false);

            if (!name || !name.length) { return; }
            autoCompleteData = _.filter(sites, function (site) {
                name = name.toLowerCase();
                var siteName = site.siteName.toLowerCase();
                return  siteName.search(name) > -1;
            });

            return autoCompleteData;
        };

        scope.$on('$typeahead.select', function () {
            callback(autoCompleteData[0], true);
        });
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude: false,
        priority: 500,
        scope: true,
        compile: function (el, attrs) {
            var options = "site.siteName as site.siteName for site in sitesLookup($viewValue)";
            attrs.$set('ngOptions', options);
            return linker;
        }
    };
}]);
