app.directive(
			"arborPlusAppLoading",
			function ($animate) {

			    // Return the directive configuration.
			    return ({
			        link: link,
			        restrict: "C"
			    });


			    // I bind the JavaScript events to the scope.
			    function link(scope, element, attributes) {

			        scope.$on('$routeChangeStart', function (scope, next, current) {
			            element.show();
			        });

			        scope.$on('$routeChangeSuccess', function (scope, next, current) {
			            var timer = setTimeout(function () {
			                element.hide();
			                clearTimeout(timer);
			            }, 1100);
			        });
			        
			        // Due to the way AngularJS prevents animation during the bootstrap 
			        // of the application, we can't animate the top-level container; but,
			        // since we added "ngAnimateChildren", we can animated the inner 
			        // container during this phase.
			        // --
			        // NOTE: Am using .eq(1) so that we don't animate the Style block.
			        var a = element.children();
			        $animate.leave(element.children().eq(1)).then(
						function cleanupAfterAnimation() {

						    // Remove the root directive element.
						    //element.remove();
						    element.hide();

						    // Clear the closed-over variable references.
						    // scope = element = attributes = null;

						}
					);

			    }

			}
		);