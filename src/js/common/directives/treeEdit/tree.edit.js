/*global moment, $*/
/**
 * Note: this directive is used in 2 different applications:
 * 1. when user navigates to #/tree_edit/<TREEID>
 * 2. When user rolls over a thumbnail of a tree icon in the tree results page in #/tree (which then temporarily
 * opens this view up in place of the map
 */

app.directive('treeEdit', ['Api', '$location', function (Api, $location) {
    'use strict';

    var linker = function (s, el, attrs) {
        window.ets = s;
        var myStateID = 'tree_edit';    // matches with the templateID
        s.ratingTypes = '';
        s.ynOptions = ['yes', 'no'];
        s.ynpOptions = ['yes', 'no', 'potential'];
        s.tree_cachebuster = '?ts=' + moment().unix();
        s.yearOptions = ["2012", "2013", "2014", "2015", "2016", "2017"];
        var initTreeData = function () {
            s.tree = {};
            s.tree.img = s.tree.imgSm = s.tree.imgMed = '/img/blank.gif';
        };

        var cancelOnEscape = function (e) {
            if (e.keyCode === 27) { s.onCancel(); }
        };

        // added throttle, because on fist load, it might fire twice, once from init() on load,
        // and once from the $on(nav) event above
        var init = _.throttle(function (treeID, mode) {
            initTreeData();
            // todo -- editmode should be controlled by user privilege
            if (!mode) {
                mode = 'edit';
            }

            if (treeID) {
                s.treeID = treeID;
            } else {
                s.treeID = s.renderPath[1];
            }
            if (!s.treeID) {
                return;
            }

            Api.getTree(s.treeID)
                .then(function (data) {
                    s.tree = data;
                    s.tree.mode = mode;
                });

            // setup ESCAPE key
            $(document).keyup(cancelOnEscape);
        }, 700);

        s.updateTreeName = function () {
            s.tree.commonName = _.findObj(s.initData.filters.species, 'speciesID', s.tree.speciesID).commonName;
        };

        s.save = function () {
            s.tree.post().then(function () {
                s.sendEvt('onTreeUpdate', s.tree);
            });
            //todo - show save message
            //SMALL NOTE.. IF A TREE IS SELECTED/CHECKED, AND THEN EDIT IS PUSHED, GOING BACK TO PREVIOUS PAGE (TREES) WILL DESELECT/UNCHECK THE TREE
            $location.path('/trees');
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

        s.onCancel = function () {
            $(document).unbind('keyup', cancelOnEscape);
            $location.url('/trees');
        };

        s.$on('onTreeResultImageRollover', function (evt, treeID) {
            init(treeID, 'rollover');
        });

        s.$on('onTreeResultImageRollout', function (evt) {
            initTreeData();
        });

        s.$on('nav', function (e, data) {
            if (data.new === myStateID) { init(); }
        });

        s.activePopover = { elem: {}, itemID: undefined };

        s.deleteTree = function (treeId) {
            s.setAlert('Deleting tree', { busy: true, time: "false" });            
            Api.deleteTree(treeId).then(function () {
                s.hideAllAlert();
                $location.path('trees');
            });
        };

        init();
    };

    return {
        restrict: 'EA',
        templateUrl: 'js/common/directives/treeEdit/tree.edit.tpl.html',
        scope: true,
        compile: function () {
            return linker;
        }
    };
}]);