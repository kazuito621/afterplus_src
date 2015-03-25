'use strict';


var app = angular.module('arborPlusApp', 
	['ngRoute', 'restangular', 'arborPlusFilters', 'ngTable', 'angular-md5',
	 'xeditable', 'ngSanitize', 'ngAnimate', 'mgcrea.ngStrap', 'angularLocalStorage', 'checklist-model',
     'ngCkeditor', 'pasvaz.bindonce', 'infinite-scroll', 'ngTagsInput', 'templates-main', 'GoogleMapsInitializer']);

app.config(['$routeProvider', '$locationProvider',
	function ($routeProvider, $locationProvider) {
        $routeProvider  

			// routes for mobile app
			.when("/client_edit/:clientID?", {
				templateUrl: "js/clients/edit.mobile.tpl.html",
				auth: false, reloadOnSearch:false, isMobile:true, resolve: {
					signin:['Auth', '$location', function(Auth, $location){
							return Auth.signInUserToken($location.search().token);
						}]
					,deps:['Api', function(Api){ return Api.getPromise(); }]
				}
        	})
			.when("/site_edit/:siteID?", {
				templateUrl: "js/sites/edit.mobile.tpl.html",
				auth: false, reloadOnSearch:false, isMobile:true, resolve: {
					signin:['Auth', '$location', function(Auth, $location){
							return Auth.signInUserToken($location.search().token);
						}]
					,deps:['Api', function(Api){ return Api.getPromise(); }]
				}
        	})
			.when("/site_users_edit/:siteID?", {
				templateUrl: "js/sites/siteUsers.mobile.tpl.html",
				auth: false, reloadOnSearch:false, isMobile:true, resolve: {
					signin:['Auth', '$location', function(Auth, $location){
							return Auth.signInUserToken($location.search().token);
						}]
					,deps:['Api', function(Api){ return Api.getPromise(); }]
				}
			})

			// web app routes

            .when("/signin/:token?", {
                templateUrl: "js/signin/signin.tpl.html",
                auth:false, reloadOnSearch:false
				})

            .when('/estimate/:rptID', {
                	templateUrl: "js/trees/trees.tpl.html"
                    ,auth:false, reloadOnSearch:false
                    ,resolve: {
                      	//deps:['Api', function(Api){  return Api.getPromise(); }],
						signin:['Auth', '$route', function(Auth, $route){
								var rptID=$route.current.params.rptID;
								return Auth.signInCustToken(rptID, true);
							}]
                    }
                })
            .when("/trees", {
                templateUrl: "js/trees/trees.tpl.html"
                ,auth:true, reloadOnSearch:false
                ,resolve: {
                    deps:['Api', function(Api){  return Api.getPromise(); }]
                }})
            //.when("/tree_edit/:treeID", {
            //    templateUrl: "js/trees/edit.tpl.html"
            //    ,auth:true, reloadOnSearch:false
            //    ,resolve: {
            //        deps:['Api', function(Api){  return Api.getPromise(); }]
            //    }})
            .when("/estimates", {
                templateUrl: "js/estimates/estimates.tpl.html"
                ,auth:true, reloadOnSearch:false
                ,resolve: {
                    deps:['Api', function(Api){  return Api.getPromise(); }]
                }})
            .when("/sites", {
                templateUrl: "js/sites/sites.tpl.html"
                ,auth:true, reloadOnSearch:false
                ,resolve: {
                    deps:['Api', function(Api){  return Api.getPromise(); }]
                }})
            .when("/clients", {
                templateUrl: "js/clients/clients.tpl.html"
                ,auth:true, reloadOnSearch:false
                ,resolve: {
                    deps:['Api', function(Api){  return Api.getPromise(); }]
                }})
            .otherwise({redirectTo: "/signin"});
	}])
	.run(['Restangular', '$rootScope','storedData',
		function (RestProvider, rs, storedData) {
			RestProvider
				.setBaseUrl(cfg.apiBaseUrl())
				//.setDefaultRequestParams({ apiKey: 'xx' })
				.setRestangularFields({ selfLink: 'self.link'})		// todo ... explore this option
				.setResponseExtractor(function(res, op) {
					if( !res ){
						rs.$broadcast('alert', {msg:'Error talking to the server (2)', type:'danger'}); 
						return {};
					}
					//if(res.request && res.fetchtime) dbg(res.request+' - '+res.fetchime+'s');
					if( typeof res == 'string' ) res={result:0, msg:res};
					res.data=res.data||{}		//make sure data exists
					var msg=res.msg||res.message||res.data.msg||res.data.message, type='success'
					if(res.result != 1){
						if(op=='getList' && typeof res.data != 'Array') res.data=[];
						// this was erroring sometimes when calling /estimates, and an array was expected back
						// but nothing came back. this happened quite often, maybe the message is not necessary
						//if(!msg) msg='Error talking to the server';
						type='danger';
					}
					if(msg) rs.$broadcast('alert', {msg:msg, type:type});
                    storedData.timeStampValInRespone=res.timestamp;
					return res.data;
				})
				.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig){
					headers=headers||{};
					headers['X-token']=Auth.data().token;
					return {
						headers:headers
						,element:element
						,params:params
						,httpConfig:httpConfig
					}
				})
				.setErrorInterceptor(function(){
					rs.$broadcast('alert', {msg:'Error talking to the server (3)', type:'danger'});
					dbg('REST error found in setErrorInterceptor');
					//return true;	//todo -- what to do here? display error to user?
					})
			RestProvider.configuration.getIdFromElem = function(elem) {
				// ie. clientID, instead of "id", or treeID instead of "id"
				// todo ... seems like theres a bug.. when you call Rest.one('client',123'), 
					// the elementID gets set as "id"... instead of resepecting this...
					// need to add changes, ie "getIdName"... should do a REST pull request?
				var id=elem[elem.route + "ID"];
				if(!id) id=elem['reportID'];
				if(!id) return elem.id;
				return id;
			}

			//var url;
			//for (var i in $route.routes) {
			//    if (url = $route.routes[i].templateUrl) {ngCookies
			//        $http.get(url, { cache: $templateCache });
			//    }
			//}

		}]);


app.run(function(editableOptions){
 	editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});


angular.element(document).ready(function () {
    angular.bootstrap(document, ['arborPlusApp']);
});

// ----------------------------------------------- global helper funcs

/**
 * Shortcut for console.debug, to do multiple arguments and pring a seperator line
 * Usage: 	dbg(a)
 *			dbg(a,'This is a')
 *			dbg(a,b,c)
 *			dbg(a,bc,d,e,'Output a bunch of stuff')
 */
function dbg(){
	var loopLen=arguments.length;
	if(arguments.length>1) {
		var lastArg = arguments[arguments.length-1];
		if( typeof lastArg  == 'string') {
			loopLen -= 1
			//console.error( lastArg + ' ------------' )
		}
	}
	for( var i=0; i<loopLen; i++) {
		//console.error( arguments[i] )
	}
}

function empty(v){
  if(typeof v == "undefined" || v==null || v==undefined) return true;
  else return false;
}
function isDefined(obj){
	return !empty(obj);
}

function isNumeric(n){
	return !isNaN(n);
}



_.mixin({

	/**
	 * Safely retrieve a property or properties deep in an object or array of objects
	 * For example - 
	 *    To get x.y.z, getprop(x, 'y.z')
	 *    To get all the names of an array of users:
	 *      getprop( data.users, 'name' ) -- returns an array of names
	 * You might be asking, why is this function needed? why not just access x.y.z?
	 * Because in javascript, it is not safe to do so without wrapping that call in a
	 * try/catch. if y did not exist, an error would be thrown.
	 * You could also call if(x && x.y && x.y.z) return x.y.z
	 *
	 * @param obj OBJECT or ARRAY of OBJECTS - the base object from wihch to retrieve the property out of
	 * @param path_string STRING - a string of dot notation of the property relative to
	 *       obj, or array of objects.
	 * @return MIXED - value of obj.eval(path_string), or array of values, OR FALSE
	 */
	extract:function(obj, path_string) {
		if(!path_string) return obj
	   
		if (obj instanceof Array) {
			var len=obj.length, out=[], tmp;
			for (var i=0; i<len; i++) {
				tmp=getprop(obj[i], path_string);
				if (tmp) out.push(tmp);
			}
			return out;
		}

		var arr = path_string.split('.'),
			val = obj || window;

		for (var i = 0; i < arr.length; i++) {
			val = val[arr[i]];
			if ( typeof val == 'undefined' ) return false;
			if ( i==arr.length-1 ) {
				if (val=="") return false
				return val
			}
		}
		return false;
	}

	// truncate an array
	,trunc:function(arr){
		if(arr instanceof Array){
			arr.splice(0,arr.length);
		}
	}

	// Search and return the object in an array of object which contains
	// a key that matches val
	,findObj:function( array1, key, val, getIndexOnly){
		if( !(array1 instanceof Array) ) {
			if( typeof array1 != 'string' ) return false;
			var v=array1.split(',',1);
			if(!v[0]) arr=eval(array1);
			else if( !v[1] ) array1=eval(v[0]);
			else array1=_.extract(eval(v[0]), v[1]);
			if(!array1 || !array1.length) return false;
		}

		for( var i=0; i<array1.length; i++ ){
			if( array1[i][key] && array1[i][key]==val ){ 
				if( getIndexOnly ) return i;
				else return array1[i];
			}
		}	
		return false;
	}

	// Copy a list of properties from one object to another
	// @param propNames = comma deliminted list
	// ie. _.copyProps(newCust, oldCust, 'firstname,lastname,address');
	,copyProps:function( fromObj, toObj, propNames ){
		if(!fromObj || !toObj || !propNames) return;
		if( typeof propNames == 'string' )	propNames=propNames.split(',');
		_.each(propNames, function(p){
			if(p && p.trim) p=p.trim();
			else return;
			if( !fromObj[p] ) return;
			if( typeof fromObj[p] == 'object' && angular && angular.copy )
				toObj[p]=angular.copy(fromObj[p]);
			else 
				toObj[p]=fromObj[p];
		});
		return toObj;
	}
	,objSize: function(obj){
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	}
    //deep copy object->object
    ,deepCopy : function(destination, source) {
        //$.extend()
        for (var property in source) {
            if (typeof source[property] === "object" && source[property] !== null) {
                //console.info(property + ' obj');
                if (source[property] instanceof Array){
                    destination[property] = [];
                }
                else{
                    destination[property] = {};
                }
                _.deepCopy(destination[property], source[property]);
            } else {
                destination[property] = source[property];
                //console.info(property + ' not obj');
            }
        }
        return destination;
    }
});
		
	
	

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

