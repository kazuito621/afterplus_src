angular.module('GoogleMapsInitializer', [])
.factory('gMapInitializer', function ($window, $q) {

    //Google's url for async maps initialization accepting callback function
    var asyncUrl = '//www.google.com/jsapi?key=AIzaSyAOrd_TjjjRm8mryWBHKboSG89YpUgRqlQ&callback='//'https://maps.googleapis.com/maps/api/js?callback=',
    mapsDefer = $q.defer();

    //Callback function - resolving promise after maps successfully loaded
    window.googleMapsInitialized = function () {        
        mapsDefer.resolve();
    };
    //mapsDefer.resolve; // removed ()

    //Async loader
    var asyncLoad = function (asyncUrl, callbackName) {
        var script = document.createElement('script');
        //script.type = 'text/javascript';
        script.src = asyncUrl + callbackName;
        
        document.body.appendChild(script);
    };
    //Start loading google maps
    asyncLoad(asyncUrl, 'googleMapsInitialized');

    //Usage: Initializer.mapsInitialized.then(callback)
    return {
        mapsInitialized: mapsDefer.promise
    };
})
