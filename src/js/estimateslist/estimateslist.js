/***
TODO -- make this show a list of estimates for this user (currently logged in)
// when they select one to view it, you should forward them to #/estimate/<estimateID>

**/
var EstimatesListCtrl = app.controller('EstimatesListCtrl', ['$scope', '$route', function ($scope, $route) {
    'use strict';
    var s = $scope,
        myStateID = 'sites';

    var init = function () {
        Rest.all('site').getList().then(function (data) {
            s.list = data;
        });
    };

    var save = function (obj) {
        var endpoint = 'site';
        var id = obj[endpoint + 'ID'];
        if (id) {
            endpoint += '/' + id; // updating existing....
        }

        Rest.all(endpoint).post(obj).then(function (data) {
            dbg(data, 'return - saved object');
        });
    };


    var pre_init = function () {
        if ($route.current.params.stateID === myStateID) {
            init();
        }
    };

    s.$on('$locationChangeSuccess', pre_init);
    pre_init();

    // HOW TO Add a new
    //s.newObj={siteName:'tim2', clientID:1, street:'123 main', contact:'contact'};
    //save(s.newObj)

    // Update an existing client
    /*
    Restangular.one('site', 336).get().then(function(data){
        data.siteName='timx444444444433333';
        data.post();
    })
    */


}]);


