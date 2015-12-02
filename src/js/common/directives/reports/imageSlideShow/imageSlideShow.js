/**
 * Created by usert on 12-Nov-15.
 */

/**
 * Created by Imdadul Huq on 17-Jan-15.
 */
app.directive('imageSlideShow',
    ['$modal',
        function ($modal) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {
                    scope.carouselIndex = 1;
                    var hideOnEscape = function(e){
                        if(e.keyCode === 27) scope.hide();
                    };
                    var modal;
                    $(el).click(function () {
                        scope.images = scope.$eval(attrs.images);
                        // create new one
                        if(!modal) 
                            modal =  $modal({scope: scope, template: '/js/common/directives/reports/imageSlideShow/imageSlideShow.tpl.html', show: false});
                        //show popover
                        modal.$promise.then(function () {
                            modal.show();
                            $(document).keyup(hideOnEscape);
                        });
                    });
                }
            }

        }]);
