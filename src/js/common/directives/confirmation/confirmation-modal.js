(function(){
    app.directive('confirmationDialog',
        ['$modal', 
        function ($modal) {
            return {
                restrict: 'EA',
                link: function (scope, el, attrs) {
                    var modal;
                    scope.clickConfirm = function () {
                        if (angular.isDefined(attrs.onConfirmCallback)) {
                            scope.onConfirmCallback = scope.$eval(attrs.onConfirmCallback);
                            modal.hide();
                        }
                    }

                    if (angular.isDefined(attrs.msg)) {
                        scope.msg = attrs.msg;
                    }

                    $(el).click(function () {

                        if(modal==undefined){
                            modal = $modal({
                                scope: scope,
                                templateUrl: '/js/common/directives/confirmation/confirmation-modal.tpl.html',
                                show: false,
                            });
                        }
                        
                        modal.$promise.then(function () {
                            modal.show();
                        });

                    });

                    scope.cancel = function () {
                     modal.hide();
                 }
             }
         }

     }]);

})();