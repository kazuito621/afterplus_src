/**
 * Created by Imdadul huq on 13-Jan-15.
 */

/*global moment, $*/
/**
 * Note: this directive is only for opening tree in edit mode.:
 * 1. When user click on the edit button>
 */

app.directive('treeEditModal', ['$modal','Api', '$location', function ($modal,Api, $location) {
    'use strict';

    var linker = function (s, el, attrs) {
        //scope.itemId = scope.$eval(attrs.itemId);
       // var treeID=s.$eval("tree").treeID;
        var tree=s.$eval(attrs.treeEditModal);
        var _mode;
        window.ets = s;
        var myStateID = 'tree_edit';    // matches with the templateID
        s.ratingTypes = '';
        s.ynOptions = ['yes', 'no'];
        s.ynpOptions = ['yes', 'no', 'potential'];
        s.tree_cachebuster = '?ts=' + moment().unix();
        s.yearOptions = []; 
		  s.monthOptions= [];
		  for(var yr=moment().format('YYYY')-2,i=0; i<10; i++,yr++){
				s.yearOptions.push(yr);
		  }
		  for(var i=1; i<=12; i++){
				s.monthOptions.push(i);
		  }


        var modal;

        var cancelOnEscape = function (e) {
            if (e.keyCode === 27) { s.onCancel(); }
        };
        var hideOnEscape = function(e){
            if(e.keyCode === 27) modal.hide();
        };
        s.openModal=function(){
            modal = $modal({scope: s, template: '/js/common/directives/treeEdit/tree.edit.modal.tpl.html', show: false});
            modal.$promise.then(function () {
                modal.show();
                // setup ESCAPE key
                $(document).keyup(hideOnEscape);
            });
        };

        // added throttle, because on fist load, it might fire twice, once from init() on load,
        // and once from the $on(nav) event above
        var init = _.throttle(function (tree, mode) {
            if(mode=='edit'){
                s.openModal();
            }
            //initTreeData();
            // todo -- editmode should be controlled by user privilege
            if (!mode) {
                mode = 'edit';
            }
            s.tree = tree;
				s.tTreeID=tree.treeID
				console.debug("tree: "+tree.treeID);

            s.slides6 = [];
            s.carouselIndex6 = 1;
				s.tree.mode=mode;
				s.mode=mode;
				console.debug("init ...  ");
            s.colors = ["#fc0003", "#f70008", "#f2000d", "#ed0012", "#e80017", "#e3001c", "#de0021", "#d90026", "#d4002b", "#cf0030", "#c90036", "#c4003b", "#bf0040", "#ba0045", "#b5004a", "#b0004f", "#ab0054", "#a60059", "#a1005e", "#9c0063", "#960069", "#91006e", "#8c0073", "#870078", "#82007d", "#7d0082", "#780087", "#73008c", "#6e0091", "#690096", "#63009c", "#5e00a1", "#5900a6", "#5400ab", "#4f00b0", "#4a00b5", "#4500ba", "#4000bf", "#3b00c4", "#3600c9", "#3000cf", "#2b00d4", "#2600d9", "#2100de", "#1c00e3", "#1700e8", "#1200ed", "#0d00f2", "#0800f7", "#0300fc"];
            var index=0;

            _.each(s.tree.images,function(i){ 
                index++;
              	var iData = {
                        id: (index),
                        label: 'slide #' + (index),
                        img: i.imgMed + s.tree_cachebuster, 
								link: i.imgLrg + s.tree_cachebuster,
                        color: s.colors[ (index*10) % s.colors.length],
                        odd: (index % 2 === 0)
                    };
                s.slides6.push(iData);
            })

            // setup ESCAPE key
            $(document).keyup(cancelOnEscape);
        }, 700);

        s.updateTreeName = function () {
            s.tree.commonName = _.findObj(s.initData.filters.species, 'speciesID', s.tree.speciesID).commonName;
        };

        s.save = function () {
		  		Api.saveTree(s.tree).then(function () {
					 s.sendEvt('onTreeUpdate', s.tree);
				});
				modal.hide();
        };

        // Normally i would just go by hashkey, but for some reason during testing, the hashkey was changing!
        // so we'll go by treehistoryid for previously existing items... and hashkey for new items which dont
        // have a tree historyid yet
        s.removeTreeRec = function (treeHistoryID, hashKey) {
            var idx;
            if (treeHistoryID) {
                idx = _.findObj(s.tree.history, 'treeHistoryID', treeHistoryID, true);
            } else {
                idx = _.findObj(s.tree.history, '$$hashKey', hashKey, true);
            }
            if (idx !== false) {
                if (!s.tree.deletedHistoryIDs) {
                    s.tree.deletedHistoryIDs = [];
                }
                s.tree.deletedHistoryIDs.push(s.tree.history[idx].treeHistoryID);
                s.tree.history.splice(idx, 1);
            }
        };

        s.addTreeRec = function () {
            var itm = {treatmentStatusCode: 'rec', treatmentTypeCode: 'new', treatmentTypeID: -9,
                treeHistoryID: 0, year: moment().format('YYYY'), price: '0.00'};
            s.tree.history.splice(0, 0, itm);
        };

        //when user change type of treatment, we should change treatment code
        s.updateTreatmentCode = function (t) {
            var treatment = _.findObj(s.initData.filters.treatments, 'treatmentTypeID', t.treatmentTypeID);
            t.treatmentTypeCode = treatment.code;
        };

        s.deleteTree = function (treeId) {
            s.setAlert('Deleting tree', { busy: true, time: "false" });
            Api.deleteTree(treeId).then(function () {
                s.hideAllAlert();
                $location.path('trees');
            });
            $(document).unbind('keyup', cancelOnEscape);
            modal.hide();

        };

       
        s.onCancel = function () {
            $(document).unbind('keyup', cancelOnEscape);
            modal.hide();
        };

        el.on('click', function (event) {
            init(tree, 'edit');
        });

        //init();
    };

    return {
        restrict: 'EA',
        replace: false,
        transclude:false,
        //templateUrl: 'js/common/directives/treeEdit/tree.edit.tpl.html',
        //scope: true,
        compile: function () {
            return linker;
        }
    };
}]);
