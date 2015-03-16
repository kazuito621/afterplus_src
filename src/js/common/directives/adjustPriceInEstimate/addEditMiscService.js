/**
 * Created by Imdadul Huq on 15-Mar-15.
 */

app.directive('addEditMiscService',
    ['Api','$modal',
        function (Api,$modal) {

            var link=function (scope, el, attrs) {
                var modal;
                scope.newsvc={};
                scope.activePopover = {elem:{}, itemID: undefined};

                scope.editService=function(svc){
                    Api.editServiceDesc(svc.miscServiceID,svc).then(function(res){

                    })
                };
                scope.addNewService=function(){
                    Api.addNewMiscService(scope.newsvc).then(function(res){
                        scope.newsvc.miscServiceID=res.miscServiceID;
                        scope.services.push(angular.copy(scope.newsvc));
                        scope.newsvc={};
                    })

                }
                scope.deleteCurrentItem=function(miscServiceID){
                    Api.deleteServiceById(miscServiceID).then(function(res){
                        var index=-1;
                        for(var i=0;i<scope.services.length;i++){
                            if(scope.services[i].miscServiceID==miscServiceID){
                                index = i;
                                break;
                            }
                        }
                        scope.services.splice(index,1);
                        scope.activePopover.elem.hide();
                    });
                };

                scope.openModal=function(){
                    if(!modal)
                        modal = $modal({scope: scope, template: '/js/common/directives/adjustPriceInEstimate/addEditMiscService.html', show: false});
                    modal.$promise.then(function () {
                        modal.show();
                        // setup ESCAPE key
                        $(document).keyup(hideOnEscape);
                    });
                };
                scope.hide=function(){
                    modal.hide();
                };
                var hideOnEscape = function(e){
                    if(e.keyCode === 27) modal.hide();
                };

                $(el).click(function () {
                    scope.openModal();
                });


            }

            return {
                restrict: 'EA',
                link: link,
                scope: {
                    services: "=data"
                }
            }

        }]);
