/**
 * Created by Imdadul Huq on 11-Mar-15.
 */
/**
 Service for storing data to increase performance
 **/

app.service('storedData',
  ['storage',
    function (storage) {
      'use strict';
      var self = this;
      this.storedData = null;
      this.noSiteTimeStamp = null;
      this.siteOnlyTimeStamp = null;
      this.estimateTimeStamp = null;
      this.timeStampValInRespone = null;
      this.initialized = false;
      this.differenceOfTime = 10800; // 3 hours in milliseconds // You mean in seconds, right?

      var propertiesToCheck = ['clients', 'sites', 'filters.treatments', 'filters.treatmentPrices', 'filters.species'];

      this.getInitData = function () {
        self.storedData = storage.get('initData');
        if (self.storedData === null) { // For the first time in life
          self.storedData = {};
          _.each(propertiesToCheck, function (item) {
            if (item.indexOf('.') !== -1) {
              var parts = item.split('.');
              if (self.storedData[parts[0]] === null) {
                self.storedData[parts[0]] = {};
              }
              self.storedData[parts[0]][parts[1]] = {};
            } else {
              self.storedData[item] = {};
            }
          });
        }
        return self.storedData;
      };

      this.setInitData = function (data, lastTimeStamp, type) {
        var parts;
        self.getInitData();
        _.each(propertiesToCheck, function (item) {
          //if(type=='nosite' && item == 'sites') return;
          //if(type=='siteOnly' && item != 'sites') return;
          if (data.partial_data.indexOf(item) === -1 && lastTimeStamp !== 1) { // if item name not exist in changed item list (partial_data), take from localstorage
            if (item.indexOf('.') !== -1) {
              parts = item.split('.'); //  'filters.treatments','filters.treatmentPrices','filters.species'
              if (data[parts[0]] === undefined || data[parts[0]][parts[1]] === undefined) { return; }
              data[parts[0]][parts[1]] = self.storedData[parts[0]][parts[1]];
            } else {  //'clients','sites'
              if (data[item] === undefined) { return; }
              data[item] = self.storedData[item];
            }
          } else { // changed, save new data to localStorage
            if (item.indexOf('.') !== -1) { //  'filters.treatments','filters.treatmentPrices','filters.species'
              parts = item.split('.');

              if (data[parts[0]] === undefined || data[parts[0]][parts[1]] === undefined) { return; }

              if (self.storedData[parts[0]] === null) {
                self.storedData[parts[0]] = {};
              }

              self.storedData[parts[0]][parts[1]] = {};
              self.storedData[parts[0]][parts[1]] = data[parts[0]][parts[1]];
            } else {  //'clients','sites'
              if (data[item] === undefined) { return; }

              self.storedData[item] = data[item];
            }
          }
        });
        storage.set('initData', self.storedData);
      };

      this.getNoSiteTimeStamp = function () {
        self.noSiteTimeStamp = storage.get('noSiteTimeStamp');
        if (self.noSiteTimeStamp && (Math.floor(new Date().getTime() / 1000) - self.noSiteTimeStamp < self.differenceOfTime)) {
          return self.noSiteTimeStamp;
        }

        self.noSiteTimeStamp = 1;
        return self.noSiteTimeStamp;
        //return new Date().getTime();
      };

      this.getSiteOnlyTimeStamp = function () {
        self.siteOnlyTimeStamp = storage.get('siteOnlyTimeStamp');
        if (self.siteOnlyTimeStamp && (Math.floor(new Date().getTime() / 1000) - self.siteOnlyTimeStamp < self.differenceOfTime)) {
          return self.siteOnlyTimeStamp;
        }
        self.siteOnlyTimeStamp = 1;
        return self.siteOnlyTimeStamp;
      };
      this.getEstimateTimeStamp = function () {
        self.estimateTimeStamp = storage.get('estimateTimeStamp');
        if (self.estimateTimeStamp && (Math.floor(new Date().getTime() / 1000) - self.estimateTimeStamp < self.differenceOfTime)) {
          return self.estimateTimeStamp;
        }
        self.estimateTimeStamp = 1;
        return self.estimateTimeStamp;
        //return new Date().getTime();
      };


      this.getEstimateData = function () {
        //if(self.storedEstimateData==null )   //For the first time
        //    self.storedEstimateData=storage.get('estimateData');
        return storage.get('estimateData');
      };

		// @param opts: {force:1}  -- force overwrite of current array in memory}
      this.setEstimateData = function (data, opts) {
			if(!opts) opts={};
     		if(opts.force || (data.length!=0 && self.estimateTimeStamp==1)){
          storage.set('estimateData', data);
        } else if (data.length !== 0 && self.estimateTimeStamp !== 1) {
          var storedEstimateData = self.getEstimateData();
          var merged = [];
          _.each(data, function (report, reportIdx) {
            _.each(storedEstimateData, function (storedReport, storedReportIdx) {
              if (report.reportID === storedReport.reportID) {
                storedEstimateData[storedReportIdx] = data[reportIdx]; // replace th changed Item
                merged.push(reportIdx);
              }
            });
          });
          if (data.length !== 0) {
            _.each(data, function (report, reportIdx) {
              if (merged.indexOf(reportIdx) === -1) { // Don't push those already replaced items
                storedEstimateData.unshift(report);
              }
            });
          }
          //storedEstimateData=data.concat(storedEstimateData);
          storage.set('estimateData', storedEstimateData);
          data = storedEstimateData;
        } else if (data.length === 0) {
          data = storage.get('estimateData');
        }
        self.setEstimateTimeStamp(self.timeStampValInRespone);
        return data;
      };

      this.setSiteOnlyTimeStamp = function (value) {
        self.siteOnlyTimeStamp = value;
        storage.set('siteOnlyTimeStamp', value);
      };
      this.setNoSiteTimeStamp = function (value) {
        self.noSiteTimeStamp = value;
        storage.set('noSiteTimeStamp', value);
      };

      this.setEstimateTimeStamp = function (value) {
        self.estimateTimeStamp = value;
        storage.set('estimateTimeStamp', value);
      };

      this.removeAllStoredData = function () {
        self.setNoSiteTimeStamp(null);
        self.setSiteOnlyTimeStamp(null);
        self.setEstimateTimeStamp(null);

        self.storedData = null;
        storage.set('initData', {});

        storage.set('estimateData', []);
      };

      this.setTimeStamp = function (api) {

      };

    }]);



