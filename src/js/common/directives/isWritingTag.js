/**
 * Created by Imdadul Huq on 05-May-15.
 */

app.directive('isWritingTag',
    [function () {
            'use strict';
            var linker = function (scope, el, attrs) {
                scope.$watch( function(){ return $("div[ng-class='{focused: hasFocus}']").find('span.input').text()}, function(n,o){
                    if(n && n=='Add email'){//
                        scope.emailRpt.disableSendBtn = false;
                    }
                    else {
                        scope.emailRpt.disableSendBtn = true;
                    }
                });
            };
            return {
                restrict: 'EA',
                replace: false,
                scope:true,
                compile: function () {
                    return linker;
                }
            };
        }]);