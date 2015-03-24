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
            this.noSiteTimeStamp=null;
            this.siteOnlyTimeStamp=null;
            this.initialized = false;
            var propertiesToCheck=['clients','sites','filters.treatments','filters.treatmentPrices','filters.species'];

            this.getInitData=function(){
                self.storedData=storage.get('initData');
                if(self.storedData==null){ // For the first time in life
                    self.storedData={};
                    _.each(propertiesToCheck,function(item){
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

            this.setInitData=function(data,lastTimeStamp){
                self.getInitData();
                _.each(propertiesToCheck,function(item){
                    if(data.partial_data.indexOf(item)==-1 && lastTimeStamp!==1){ // if item name not exist in changed item list (partial_data), take from localstorage
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
                storage.set('initData', self.storedData);
            }

            this.getNoSiteTimeStamp=function(){
                self.noSiteTimeStamp = storage.get('noSiteTimeStamp');
                if(self.noSiteTimeStamp){
                    return self.noSiteTimeStamp;
                }
                self.noSiteTimeStamp=1;
                return self.noSiteTimeStamp;
                //return new Date().getTime();
            };

            this.getSiteOnlyTimeStamp=function(){
                self.siteOnlyTimeStamp = storage.get('siteOnlyTimeStamp');
                if(self.siteOnlyTimeStamp){
                    return self.siteOnlyTimeStamp;
                }
                self.siteOnlyTimeStamp=1;
                return self.siteOnlyTimeStamp;
            }

            this.setSiteOnlyTimeStamp=function(value){
                self.siteOnlyTimeStamp = value;
                storage.set('siteOnlyTimeStamp',value);
            };
            this.setNoSiteTimeStamp=function(value){
                self.noSiteTimeStamp = value;
                storage.set('noSiteTimeStamp',value);
            };

            $(window).unload(function() {
                self.noSiteTimeStamp=null;
                self.siteOnlyTimeStamp=null;
                self.setSiteOnlyTimeStamp(null);
                self.setNoSiteTimeStamp(null);
            });

        }]);



