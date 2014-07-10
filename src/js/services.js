/**
	Service for updates to various site models.
**/
app.service('SiteModelUpdateService', 
	[
	function() {
	
	var site = {};
	var sites = {};
	var reportSite = {};

	this.updateSiteModels=function(mysite){
		if (!$.isEmptyObject(this.sites)){
			this.site = mysite;
			$.each(this.sites, function(index, curSite){
				if (mysite.siteID == curSite.siteID) {
					curSite.siteName = mysite.siteName;
					return false; //break
				}
			});
			this.updateReportSiteModel();
		}
	}
	this.setSites=function(sites){
		this.sites = sites;
	}

	this.setReportSiteModel=function(report){
		this.reportSite = report;
	}

	this.updateReportSiteModel=function(){
		this.reportSite.siteName = this.site.siteName;
	}
}]);
