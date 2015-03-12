/**
 * Created by Imdadul Huq on 11-Mar-15.
 */
/**
 Service for storing data to increase performence
 **/

app.service('storedData',
    ['storage',
        function (storage) {
            'use strict';
            var self = this;
            this.storedData=null;
            this.initialized = false;
            var level=['clients','sites','filters.treatments','filters.treatmentPrices','filters.species'];
            this.getInitData=function(){
                self.storedData=storage.get('initData');
                if(self.storedData==null){ // For the first time in life
                    self.storedData={};
                    _.each(level,function(item){
                        if(item.indexOf('.')!=-1){
                            var parts=item.split('.');
                            if(self.storedData[parts[0]]==null)
                                self.storedData[parts[0]]={};
                            self.storedData[parts[0]][parts[1]]={};
                        }
                        else{
                            self.storedData[item]={};
                        }
                    });
                }
                return self.storedData;
            }

            this.setInitData=function(data){
                self.getInitData();
                _.each(level,function(item){
                    if(data.partial_data.indexOf(item)==-1){ // if item name not exist in changed item list (partial_data), take from localstorage
                        if(item.indexOf('.')!=-1){
                            var parts=item.split('.'); //  'filters.treatments','filters.treatmentPrices','filters.species'
                            if(data[parts[0]]==undefined || data[parts[0]][parts[1]]==undefined)
                                return;
                            data[parts[0]][parts[1]]=self.storedData[parts[0]][parts[1]];
                        }
                        else {  //'clients','sites'
                            if(data[item]==undefined)
                                return;
                            data[item]=self.storedData[item];
                        }
                    }
                    else { // changed, save new data to localStorage
                        if(item.indexOf('.')!=-1){ //  'filters.treatments','filters.treatmentPrices','filters.species'
                            var parts=item.split('.');

                            if(data[parts[0]]==undefined || data[parts[0]][parts[1]]==undefined)
                                return;

                            if(self.storedData[parts[0]]==null){
                                self.storedData[parts[0]]={};
                            };
                            self.storedData[parts[0]][parts[1]]={};
                            self.storedData[parts[0]][parts[1]]=data[parts[0]][parts[1]];
                        }
                        else {  //'clients','sites'
                            if(data[item]==undefined) return;

                            self.storedData[item]=data[item];
                        }
                    }
                });
                storage.set('initData', this.storedData);
                self.setInitTimeStamp(data.timestamp);
            }

            this.getInitTimeStamp=function(){
                //return new Date().getTime();
                var initTimeStamp = storage.get('initTimeStamp');
                if(initTimeStamp){
                    return initTimeStamp;
                }
                //return 1;
                return new Date().getTime();
            };

            this.setInitTimeStamp=function(value){
                storage.set('initTimeStamp',value);
            };
            $(window).unload(function() {
                self.setInitTimeStamp(null);
            });

        }]);



