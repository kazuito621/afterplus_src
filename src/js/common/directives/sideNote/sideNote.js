/**
 * Created by Imdadul Huq on 25-Jun-15.
 */

app.directive('sideNote',
    ['Api','Auth',function (Api,Auth) {
        'use strict';

        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            templateUrl: 'js/common/directives/sideNote/sideNote.tpl.html',
            scope:{
                reportID:'@reportId',
					 noteType:'@noteType'
            },
            link:function (scope, el, attrs) {
                scope.noteInput='';
                scope.addingNote = false;
                scope.notes= [];
                scope.editNoteID = -1;

                scope.ok=function(){
                    scope.addingNote = true;
                    Api.addNote(scope.noteType, scope.reportID,scope.noteInput).then(function(data){
                        scope.addingNote = false;
                        scope.addNote = false;
                        if(data == 'Note created.'){
                            scope.notes.push({
                                note:scope.noteInput,
                                history:'Just Now',
                                name:Auth.authData.fName+' '+Auth.authData.lName
                            });
                            scope.noteInput='';
                        }
                    }).catch(function(res){
								// there was an error
						  });
                }
                scope.update=function(noteItem){
                    scope.addingNote = true;
                    Api.editNote(scope.noteType, scope.reportID, noteItem.noteID, scope.updatedText).then(function(data){
                        scope.addingNote = false;
                        scope.addNote = false;
                        scope.editNoteID = -1;
                        noteItem.note = angular.copy(scope.updatedText);
                        scope.updatedText = '';
                    });
                }

                scope.cancelEdit = function(){
                    scope.addingNote=false;
                    scope.addNote=false;
                    scope.updatedText='';
                    scope.editNoteID=-1;
                }
                scope.$watch('reportID',function(n,o){
                    if(n && n!='')
                    {
                        Api.getNotes(scope.noteType, n).then(function(data){
                            scope.notes = data;
                            angular.forEach(scope.notes,function(note){
                                var updateTime = moment(note.tstamp_updated).format('YYYY-MM-DD HH:mm:ss');
                                var minAgo = moment.duration(moment().diff(updateTime)).asMinutes();
                                minAgo = Math.floor(minAgo);
                                var min = minAgo % (60);
                                var hour = Math.floor((minAgo % (60*24))/60);
                                var day = Math.floor(minAgo / (60*24));
                                note.history='';
                                if(day>0)
                                    note.history += day+' days ';
                                if(hour>0)
                                    note.history += hour+' hours ';
                                if(min>0)
                                    note.history += min+' min ';
                                note.history += ' ago';
                            })
                        })
                    }
                });

                scope.activePopover = {elem:{}, itemID: undefined};

                //delete item method
                scope.deleteCurrentItem = function () {
                    if (!scope.activePopover.itemID) return;
                    var itemID=scope.activePopover.itemID;
                    Api.deleteNote(scope.noteType, scope.reportID, itemID).then(function () {
                        if(false){ //TODO  if msg don't  indicates success,

                        }
                        else {
                            var index = _.findObj(scope.notes, 'reportID', itemID,true);
                            scope.notes.splice(index,1);
                        }
                    }, function err(){

                    });
                    scope.activePopover.elem.hide();
                    delete scope.activePopover.itemID;
                };

                scope.editNote = function(noteItem){
                    scope.editNoteID = noteItem.noteID;
                    scope.updatedText = angular.copy(noteItem.note);
                }
            }
        };
    }]);


