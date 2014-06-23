
//todo... this doesnt owrk. ESC to clear something
// see :https://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs
/*
app.directive('ngEscape', function(){
	return function(scope, element, attrs){
dbg(attrs,'attrs')
		element.bind("keydown keypress", function(event){
dbg(event,'evt')
			if(event.which===27){	//escape key
dbg('got esc',attrs.ngEscape)
				scope.$apply(function(){
					var m = scope.$eval(attrs.ngModel);
					m='';
					scope.$eval(attrs.ngEscape);
				});
				//event.preventDefault();
			}
		});
	}
});
*/


// set focus on input field
app.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
});
