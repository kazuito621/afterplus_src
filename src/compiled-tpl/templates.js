angular.module('templates-main', ['js/clients/clients.tpl.html', 'js/clients/edit.mobile.tpl.html', 'js/clients/edit.tpl.html', 'js/common/directives/centerTopBlock/center.top.block.tpl.html', 'js/common/directives/deleteWithConfirmButton/delete.tpl.html', 'js/common/directives/dropdowns/client.dropdown/client.dropdown.tpl.html', 'js/common/directives/dropdowns/client.type.dropdown/client.type.dropdown.tpl.html', 'js/common/directives/dropdowns/site.dropdown/site.dropdown.tpl.html', 'js/common/directives/filters/filter.hazards/filter.hazards.tpl.html', 'js/common/directives/filters/filter.health/filter.health.tpl.html', 'js/common/directives/filters/filter.size/filter.size.tpl.html', 'js/common/directives/filters/filter.species/filter.species.tpl.html', 'js/common/directives/filters/filter.treatment.type/filter.treatment.type.tpl.html', 'js/common/directives/filters/filter.years/filter.years.tpl.html', 'js/common/directives/filters/left.column.filters.section/left.column.filters.section.tpl.html', 'js/common/directives/maps/map.search.panel/map.search.panel.tpl.html', 'js/common/directives/maps/tree.map/tree.map.tpl.html', 'js/common/directives/reports/email.logs/email.logs.tpl.html', 'js/common/directives/reports/estimate.summary/estimate.summary.tpl.html', 'js/common/directives/reports/recent.estimates/recent.estimates.tpl.html', 'js/common/directives/reports/report.estimates.table/report.estimates.table.tpl.html', 'js/common/directives/reports/report.misc.services.table/report.misc.services.table.tpl.html', 'js/common/directives/reports/treeImagePopover/treeImagePopover.tpl.html', 'js/common/directives/siteEditModal/siteEditModal.tpl.html', 'js/common/directives/siteUsersEditModal/siteUsersEditModal.tpl.html', 'js/common/directives/siteUsersMultiEditModal/siteUsersMultiEditModal.tpl.html', 'js/common/directives/templates/newEstimatePromptModal.tpl.html', 'js/common/directives/templates/siteEditModal.tpl.html', 'js/common/directives/tosAcceptButton/tosAcceptButtonModal.tpl.html', 'js/common/directives/treeEdit/tree.edit.tpl.html', 'js/common/directives/treesRightBlock/override.treatment/override.treatment.tpl.html', 'js/common/directives/treesRightBlock/sites.list/sites.list.tpl.html', 'js/common/directives/treesRightBlock/sites.selector/sites.selector.tpl.html', 'js/common/directives/treesRightBlock/trees.list/trees.list.tpl.html', 'js/common/directives/treesRightBlock/trees.selector/trees.selector.tpl.html', 'js/estimates/estimates.tpl.html', 'js/main/alert.tpl.html', 'js/main/header.tpl.html', 'js/main/main.tpl.html', 'js/main/nav.staff.tpl.html', 'js/signin/signin.tpl.html', 'js/sites/edit.mobile.tpl.html', 'js/sites/edit.tpl.html', 'js/sites/siteUsers.mobile.tpl.html', 'js/sites/sites.tpl.html', 'js/trees/action.tpl.html', 'js/trees/edit.tpl.html', 'js/trees/emailReport.tpl.html', 'js/trees/report.tpl.html', 'js/trees/trees.tpl.html']);

angular.module("js/clients/clients.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/clients/clients.tpl.html",
    "<div class='container' ng-controller=\"ClientsCtrl\">\n" +
    "\n" +
    "	<button type=\"button\"\n" +
    "	ng:cloak\n" +
    "	data-placement=\"center\"\n" +
    "	ng-click=\"newClientModalOpen()\"\n" +
    "	class=\"btn btn-lg btn-primary pull-right topMargin5 bottomMargin5\"\n" +
    "    style=\"max-width: 100%; width: auto;\"\n" +
    "	data-animation=\"am-fade-and-scale\" >New Client</button>\n" +
    "\n" +
    "	<div class='table-responsive' ng-if=\"displayedClients.length > 0\">\n" +
    "		<h1>Clients</h1>\n" +
    "		<table class='table table-striped'>\n" +
    "			<thead>\n" +
    "				<tr>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('clientID')\" style=\"min-width: 50px;\">\n" +
    "                        ID <i ng-class=\"sh.columnClass('clientID')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('clientName')\">\n" +
    "                        Name <i ng-class=\"sh.columnClass('clientName')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn(['street', 'city', 'state'])\">\n" +
    "                        Address <i ng-class=\"sh.columnClass(['street', 'city', 'state'])\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn(['contact', 'contactPhone'])\">\n" +
    "                        Contact Info <i ng-class=\"sh.columnClass(['contact', 'contactPhone'])\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('siteCount')\" style=\"min-width: 70px;\">\n" +
    "                        Sites <i ng-class=\"sh.columnClass('siteCount')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "					<th style=\"min-width: 75px;\"></th>\n" +
    "				</tr>\n" +
    "			</thead>\n" +
    "            <tbody infinite-scroll=\"showMoreClients()\" infinite-scroll-distance=\"3\">\n" +
    "                <tr ng-repeat=\"c in displayedClients\" ng-class=\"{active : isSelected(c.clientID)}\" class='hoverHotspot'>\n" +
    "\n" +
    "                    <td>{{c.clientID}}</td>\n" +
    "                    <td>{{c.clientName}}</td>\n" +
    "                    <td>{{c.street}} {{c.city}}, {{c.state}}</td>\n" +
    "                    <td>{{c.contact}} {{c.contactPhone|formatPhoneNumber}}</td>\n" +
    "                    <td><a href='/#sites?clientID={{c.clientID}}' bs-tooltip title='View sites'>{{c.siteCount}}</a></td>\n" +
    "\n" +
    "                    <td>\n" +
    "                        <a ng-if=\"auth.isAtleast('inventory')\" ng-click=\"existingClientModalOpen(c.clientID)\" class=\"fa fa-pencil _grey _size7 hand hoverDisplay\" \n" +
    "								bs-tooltip title=\"Edit\" style=\"text-decoration: none;\"></a> &nbsp;\n" +
    "                        <a ng-if=\"auth.is('admin')\"\n" +
    "                           delete-with-confirm-button\n" +
    "                           type=\"client\"\n" +
    "                           item-id=\"c.clientID\"\n" +
    "                           active-popover=\"activePopover\"\n" +
    "                           on-confirm-callback=\"deleteCurrentItem()\"\n" +
    "                           class=\"fa fa-times _red _size7 hand hoverDisplay\"\n" +
    "						   bs-tooltip title=\"Delete\"\n" +
    "                           style=\"text-decoration: none;\"></a>\n" +
    "                    </td>\n" +
    "\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "		</table>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/clients/edit.mobile.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/clients/edit.mobile.tpl.html",
    "<div ng-controller='EditClientCtrl' class=\"mobile-view-container treeEditBox mobile-view\" >\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"content\">\n" +
    "            <h2>\n" +
    "                <span ng-if=\"mode=='new'\">New Client</span>\n" +
    "                <span ng-if=\"mode=='edit'\">{{client.clientName}}</span>\n" +
    "            </h2>\n" +
    "            <div class=\"col-sm-6 col\">\n" +
    "                <div class=\"label-prop\">Client type:</div>\n" +
    "                <div class=\"edit-prop\">\n" +
    "						<span ng-if=\"!initData || !initData.clientTypes\">Loading...</span>\n" +
    "						<select class='styled-select' ng-model=\"client.clientTypeID\" ng-if=\"initData.clientTypes\">\n" +
    "							<option value=\"\">(Select One)</option>\n" +
    "							<option ng-repeat=\"c in initData.clientTypes\" value=\"{{c.clientTypeID}}\">\n" +
    "								{{c.clientTypeID | clientTypeName:this}}\n" +
    "							</option>\n" +
    "						</select>\n" +
    "                </div>\n" +
    "                <br/>\n" +
    "                <div class=\"label-prop\">Name:</div>\n" +
    "                <div class=\"edit-prop\">\n" +
    "                        <input type=\"text\" ng-model=\"client.clientName\" required >\n" +
    "\n" +
    "                </div>\n" +
    "                <br/>\n" +
    "                <div class=\"label-prop\">Address:</div>\n" +
    "                <div class=\"edit-prop\">\n" +
    "                        <input type=\"text\" ng-model=\"client.street\" >\n" +
    "\n" +
    "                </div>\n" +
    "                <br/>\n" +
    "                <div class=\"label-prop\">City:</div>\n" +
    "                <div class=\"edit-prop\">\n" +
    "                        <input type=\"text\" ng-model=\"client.city\" >\n" +
    "\n" +
    "                </div>\n" +
    "                <br/>\n" +
    "                <div class=\"label-prop\">State:</div>\n" +
    "                <div class=\"edit-prop\">\n" +
    "                        <input type=\"text\" ng-model=\"client.state\" >\n" +
    "\n" +
    "                </div>\n" +
    "                <br/>\n" +
    "                <div class=\"label-prop\">Zip:</div>\n" +
    "                <div class=\"edit-prop\">\n" +
    "                        <input type=\"text\" ng-model=\"client.zip\" >\n" +
    "                </div>\n" +
    "\n" +
    "                <br/>\n" +
    "                <div class='leftSpace10'>\n" +
    "                    <button class='btn btn-primary' ng-click=\"save();\">Save</button>\n" +
    "                    <button class='btn btn-primary' ng-click=\"save(true);\">Save and Add a Property</button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/clients/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/clients/edit.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "\n" +
    "			<div class=\"modal-header\" ng-show=\"title\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\" ng-bind=\"title\"></h4>\n" +
    "			</div>\n" +
    "\n" +
    "			<div>\n" +
    "				<form class=\"form-inline\" ng-submit=\"saveClient(mode)\">\n" +
    "					<div class='panel panel-default bottomMargin0'>\n" +
    "						<div class='panel-heading'>\n" +
    "							<h3 class='panel-title' ng-if=\"mode=='edit'\">Edit Client</h3>\n" +
    "							<h3 class='panel-title' ng-if=\"mode!='edit'\">New Client</h3>\n" +
    "						</div>\n" +
    "						<div class='panel-body'>\n" +
    "\n" +
    "							<div>\n" +
    "                            	<button class=\"btn btn-default\" ng-model=\"client.clientTypeID\" ng-options=\"c.clientTypeID as c.name for c in initData.clientTypes\" \n" +
    "									bs-select placeholder=\"What type of client is this?\" onclick=\"return false;\">\n" +
    "									Client Type <span class=\"caret\"></span>\n" +
    "								</button>\n" +
    "                            </div>\n" +
    "\n" +
    "\n" +
    "                            <div class='silver'>Name:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.clientName\" required size=\"40\"></div>\n" +
    "\n" +
    "							<div class='silver'>Address:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.street\" size=\"40\"><div>\n" +
    "\n" +
    "							<div class='silver'>City:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.city\" size=\"40\"></div>\n" +
    "\n" +
    "							<div class='silver'>State:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.state\" size=\"10\"></div>\n" +
    "\n" +
    "							<div class='silver'>Zip:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.zip\" size=\"20\"></div>\n" +
    "<!--\n" +
    "							<div class='silver'>Contact Name:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.contact\" size=\"40\"></div>\n" +
    "\n" +
    "							<div class='silver'>Contact Phone:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.contactPhone\" size=\"40\"></div>\n" +
    "\n" +
    "							<div class='silver'>Contact Email:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"client.contactEmail\" size=\"40\"></div>\n" +
    "-->\n" +
    "							<!-- this is here so user can hit ENTER to submit form -->\n" +
    "							<input type=\"submit\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\n" +
    "\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"modal-footer topMargin0\">\n" +
    "						<input type=\"submit\" value=\"SAVE\" class='btn btn-primary'>\n" +
    "						<button type=\"button\" class=\"btn btn-default \" ng-click=\"$hide()\">CLOSE</button>\n" +
    "					</div>\n" +
    "				</form>\n" +
    "			</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/centerTopBlock/center.top.block.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/centerTopBlock/center.top.block.tpl.html",
    "<nav>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-sm-10\">\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"col-sm-4\">\n" +
    "                    <div class=\"input-group\">\n" +
    "                        <client-type-dropdown model=\"selected.clientTypeID\" on-change=\"onSelectClientTypeID()\" data=\"initData.clientTypes\"></client-type-dropdown>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"col-sm-4\">\n" +
    "                    <div class='input-group'>\n" +
    "                        <client-dropdown model=\"selected.clientID\" on-change=\"onSelectClientID(id)\" data=\"filteredClients\" all=\"clients\"></client-dropdown>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"col-sm-4\">\n" +
    "                    <div class='input-group'>\n" +
    "                        <site-dropdown model=\"selected.siteID\" on-change=\"onSelectSiteID(id)\" data=\"filteredSites\"></site-dropdown>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"col-sm-2\" style='margin-left:0; padding-left:0;'>\n" +
    "            <span ng-if=\"selected.siteID > 0\" style='color:#667; font-size:.85em;'>#{{selected.siteID}}</span>\n" +
    "            </span>\n" +
    "											<span class=\"lnk\" ng-if=\"selected.siteID > 0\">\n" +
    "													<i site-edit-modal clients=\"initData.clients\" site-id=\"selected.siteID\"\n" +
    "                                                       class=\"fa fa-pencil _grey _size8 hoverHighlight hand\"></i>\n" +
    "											</span>\n" +
    "											<span class=\"lnk\">\n" +
    "												<a href ng-click='reset()' bs-tooltip title='Reset'><i class=\"fa fa-rotate-left _red _size6 hoverHighlight\"></i></a>\n" +
    "											</span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</nav>\n" +
    "");
}]);

angular.module("js/common/directives/deleteWithConfirmButton/delete.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/deleteWithConfirmButton/delete.tpl.html",
    "<div class='popover-container' style=\"position: absolute;\">\n" +
    "	<div class=\"alert alert-warning alert-dismissable\" tabindex=\"-1\" role=\"dialog\">\n" +
    "		<div>\n" +
    "			Are you sure you want to delete this {{type}}?\n" +
    "			<form class=\"form-inline\">\n" +
    "				<div class='panel-body'>\n" +
    "					<button type=\"button\" class=\"btn\" ng-click=\"onConfirmCallback()\">CONFIRM</button>\n" +
    "					<button type=\"button\" class=\"btn btn-default \" ng-click=\"cancel()\">\n" +
    "                        CANCEL\n" +
    "                    </button>\n" +
    "				</div>\n" +
    "			</form>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("js/common/directives/dropdowns/client.dropdown/client.dropdown.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/dropdowns/client.dropdown/client.dropdown.tpl.html",
    "<select id=\"select_client\" class='inpt inpt-select' ng-disabled=\"all.length === 0\"\n" +
    "         ng-model=\"model\"\n" +
    "         ng-change=\"onChange({ id: model })\">\n" +
    "    <option class=\"option\" value=\"\">Client</option>\n" +
    "    <option bindonce class=\"option\" ng-repeat=\"client in data\" value=\"{{client.clientID}}\" bo-bind=\"client.clientName\"></option>\n" +
    "</select>\n" +
    "");
}]);

angular.module("js/common/directives/dropdowns/client.type.dropdown/client.type.dropdown.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/dropdowns/client.type.dropdown/client.type.dropdown.tpl.html",
    "<select id=\"select_clientType\" class='inpt inpt-select'\n" +
    "        ng-model=\"model\"\n" +
    "        ng-change=\"onChange()\"\n" +
    "        ng-disabled=\"data.length === 0\">\n" +
    "    <option class=\"option\" value=\"\">Client Type</option>\n" +
    "    <option bindonce class=\"option\" ng-repeat=\"clientType in data\" value=\"{{clientType.clientTypeID}}\" bo-bind=\"clientType.name\"></option>\n" +
    "</select>\n" +
    "");
}]);

angular.module("js/common/directives/dropdowns/site.dropdown/site.dropdown.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/dropdowns/site.dropdown/site.dropdown.tpl.html",
    "<select id=\"select_site\" class='inpt inpt-select' ng-disabled=\"data.length === 0\"\n" +
    "         ng-model=\"model\"\n" +
    "         ng-change=\"onChange({ id: model })\">\n" +
    "    <option class=\"option\" value=\"\">{{ data.length>0 | ifElse:'Property':'Loading...' }}</option>\n" +
    "    <option bindonce class=\"option\" ng-repeat=\"site in data\" value=\"{{site.siteID}}\" bo-bind=\"site.siteName\"></option>\n" +
    "</select>\n" +
    "");
}]);

angular.module("js/common/directives/filters/filter.hazards/filter.hazards.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/filter.hazards/filter.hazards.tpl.html",
    "<div class=\"filter-container\" ng-show=\"isShown()\">\n" +
    "    <div class=\"filterHeader filter-header\">\n" +
    "        <h3>Hazards:</h3>\n" +
    "    </div>\n" +
    "    <div class=\"filterBlock filter-block\">\n" +
    "        <div class=\"filter-items filter-items-inline filter-items-toggle\">\n" +
    "            <div class='filterItems filter-item' ng-repeat=\"h in hazards\" ng-show=\"tfsCounts[h.key]>0\">\n" +
    "                <label class=\"toggle-label\">\n" +
    "                    <input type=\"checkbox\"  value=\"{{h.value}}\"\n" +
    "                           ng-model=\"initDataHazards[h.key].selected\"\n" +
    "                           ng-change=\"onFilterChange({ filterType: h.key', ID: '', value: initDataHazards[h.key].selected })\" class=\"toggle-check\">\n" +
    "                    <span class=\"text btn btn-gray btn-xs\" ng-class=\"{'active' : initDataHazards[h.key].selected}\">\n" +
    "                        <i ng-class='h.class'></i> {{h.name}}\n" +
    "                        <span class='filterTypeCount' ng-if=\"tfsCounts[h.key]>0\">({{tfsCounts[h.key]}})</span>\n" +
    "                    </span>\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                </label>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("js/common/directives/filters/filter.health/filter.health.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/filter.health/filter.health.tpl.html",
    "<div class=\"filter-container\">\n" +
    "    <div class=\"filterHeader filter-header\">\n" +
    "        <h3>Health <span class='filterTypeCount' ng-show=\"tfsCountsRating>0\">({{tfsCountsRating}})</span></h3>\n" +
    "    </div>\n" +
    "    <div class=\"filterBlock filter-block\">\n" +
    "        <div class=\"filter-items filter-items-inline filter-items-toggle\">\n" +
    "            <div class=\"filterItems filter-item\" ng-repeat=\"r in initDataRatings\" ng-if=\"r.count!=0 || r.count>0\">\n" +
    "                <label class=\"toggle-label\">\n" +
    "                    <input type=\"checkbox\" id=\"checkBox_filter_rating_{{r.ratingID}}\" value=\"{{r.ratingID}}\"\n" +
    "                           ng-model=\"r.selected\"\n" +
    "                           ng-change=\"onFilterChange({ filterType: 'rating', ID: r.ratingID, value: r.selected })\" class=\"toggle-check\">\n" +
    "															<span class=\"text btn btn-gray btn-xs\" ng-class=\"{'active' : r.selected}\"\n" +
    "                                                                  bs-tooltip title=\"{{r.ratingID}} - {{r.rating_desc}}\">&nbsp;{{r.ratingID}}  <span class='filterCount' ng-if=\"r.count>0\">({{r.count}})</span>&nbsp;</span>\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                </label>\n" +
    "            </div> <!-- }}} ng-repeat -->\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/filters/filter.size/filter.size.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/filter.size/filter.size.tpl.html",
    "<div class=\"filter-container\">\n" +
    "    <div class=\"filterHeader filter-header\">\n" +
    "        <h3>Size <span class='filterTypeCount' ng-show=\"tfsCountsTreatments > 0\">({{tfsCountsTreatments}})</span></h3>\n" +
    "    </div>\n" +
    "    <div class=\"filterBlock filter-block\">\n" +
    "        <div class=\"filter-items filter-items-inline filter-items-toggle\">\n" +
    "            <div class=\"filter-item\" ng-repeat=\"(idx,size) in initDataDbh\" ng-if=\"size.count !== 0 || size.count > 0\">\n" +
    "                <label class=\"toggle-label\">\n" +
    "                    <input type=\"checkbox\" id=\"checkBox_filter_size_{{size.dbhID}}\" value=\"{{size.dbhID}}\"\n" +
    "                           ng-model=\"size.selected\"\n" +
    "                           ng-change=\"onFilterChange({ filterType: 'dbh', ID: size.dbhID, value: size.selected })\" class=\"toggle-check\">\n" +
    "															<span class=\"text btn btn-gray btn-xs\" ng-class=\"{'active' : size.selected}\">{{size.diameter}}\n" +
    "                                                                <span class='filterCount' ng-if=\"size.count > 0\">({{size.count}})</span></span>\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                </label>\n" +
    "                <div ng-if=\" $index > 0 && $index % 2 === 0\" style='clear:both'></div>\n" +
    "            </div> <!-- }}} ng-repeat -->\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/filters/filter.species/filter.species.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/filter.species/filter.species.tpl.html",
    "<div class=\"filter-container\">\n" +
    "    <div class=\"filterHeader filter-header\">\n" +
    "        <h3>Species <span class='filterTypeCount' ng-if=\"tfsSpecies > 0\">({{tfsSpecies}})</span></h3>\n" +
    "    </div>\n" +
    "    <div class=\"filter-input\">\n" +
    "        <input ng-model='filterSearchSpecies' type=\"text\" class=\"styled_input inpt inpt-text\" placeholder=\"Search Species\"/>\n" +
    "        <span class=\"inpt-clear\" ng-if=\"filterSearchSpecies.length > 0\">\n" +
    "            <a href ng-click=\"filterSearchSpecies = ''\"><i class=\"fa fa-times\"></i></a>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"filterBlock filter-block\">\n" +
    "        <div class=\"filter-items\">\n" +
    "            <div class=\"filterItems filter-item\"\n" +
    "                 ng-repeat=\"speciesType in initDataSpecies | filterByString:'commonName':filterSearchSpecies \"\n" +
    "                 ng-if=\"speciesType.count!=0 || speciesType.count>0\">\n" +
    "                <!-- NOTE: there are 2 ways in which a filter can be hidden...\n" +
    "                        1. if the user is searching for one.. and it doesnt match (filterByString)\n" +
    "                        2. if the tree results list doesnt include any of this particular species\n" +
    "                                (TreeFilterService will then modify the .hide property\n" +
    "                -->\n" +
    "                <label>\n" +
    "                    <input type=\"checkbox\" id=\"checkBox_filter_species_{{speciesType.speciesID}}\" value=\"{{speciesType.speciesID}}\"\n" +
    "                           ng-model=\"speciesType.selected\"\n" +
    "                           ng-change=\"onFilterChange({ filterType: 'species', ID: speciesType.speciesID, value: speciesType.selected })\">\n" +
    "                    <span class=\"text\">\n" +
    "                        {{speciesType.commonName}} <span class='filterCount' ng-if=\"speciesType.count > 0\">({{speciesType.count}})</span>\n" +
    "                    </span>\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                </label>\n" +
    "            </div> <!-- }}} .filterItems -->\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/filters/filter.treatment.type/filter.treatment.type.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/filter.treatment.type/filter.treatment.type.tpl.html",
    "<div class=\"filter-container\">\n" +
    "    <div class=\"filterHeader filter-header\">\n" +
    "        <h3>Treatments: <span class='filterTypeCount' ng-if=\"tfsTreatments > 0\">({{tfsTreatments}})</span></h3>\n" +
    "    </div>\n" +
    "    <div class=\"filter-input\">\n" +
    "        <input ng-model='filterSearchTreatments' type=\"text\" class=\"styled_input inpt inpt-text\" placeholder=\"Search Treatments\" ng-escape=\"filterSearchTreatments=''\"/>\n" +
    "        <span class=\"inpt-clear\" ng-if=\"filterSearchTreatments.length > 0\"><a href ng-click=\"filterSearchTreatments=''\"><i class=\"fa fa-times\"></i></a></span>\n" +
    "    </div>\n" +
    "    <div class=\"filterBlock filter-block\">\n" +
    "        <div class=\"filter-items\">\n" +
    "            <div class=\"filterItems filter-item\"\n" +
    "                 ng-repeat=\"t in initDataTreatments | filterByString:'treatmentType':filterSearchTreatments\"\n" +
    "                 ng-if=\"t.count !== 0 || t.count > 0\">\n" +
    "                <label>\n" +
    "                    <input type=\"checkbox\" id=\"checkBox_filter_treatment_{{t.treatmentTypeID}}\" value=\"{{t.treatmentTypeID}}\"\n" +
    "                           ng-model=\"t.selected\"\n" +
    "                           ng-change=\"onFilterChange({ filterType: 'treatments', ID: t.treatmentTypeID, value: t.selected })\">\n" +
    "                    <span class=\"text\">{{t.treatmentType}} <span class='filterCount' ng-if=\"t.count > 0\">({{t.count}})</span></span>\n" +
    "                    <div class=\"clearfix\"></div>\n" +
    "                </label>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/filters/filter.years/filter.years.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/filter.years/filter.years.tpl.html",
    "<div class=\"filter-container\">\n" +
    "    <div class=\"filterHeader filter-header\">\n" +
    "        <h3>By Year: &nbsp;\n" +
    "            <button class=\"btn btn-default\" ng-model=\"filtersYear\" placeholder=\"All Years\"\n" +
    "                    ng-disabled=\"!filtersYears.length\"\n" +
    "                    ng-change=\"onSelectYear({ id: filtersYear })\"\n" +
    "                    ng-options=\"y.id as y.desc for y in filtersYears\"\n" +
    "                    bs-select onclick=\"return false;\">\n" +
    "                Action <span class=\"caret\"></span>\n" +
    "            </button>\n" +
    "            <a ng:cloak ng-show=\"filtersYear\" href ng-click=\"onSelectYear({ id: false })\" class='fa fa-times _red _size4' ></a>\n" +
    "\n" +
    "        </h3>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/filters/left.column.filters.section/left.column.filters.section.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/filters/left.column.filters.section/left.column.filters.section.tpl.html",
    "<section ng-if=\"data.mode()=='trees'\">\n" +
    "\n" +
    "    <div class=\"filter-container-title\" ng:cloak ng-show=\"TFSdata.selectedFilters.length>0\">\n" +
    "        <span ng-if=\"!TFSdata.containsContradictingFilters\">{{TFSdata.selectedFilters.length}}&nbsp;</span>Filters Active &nbsp; <span class=\"lnk-clear\"><a href ng-click='clearFilters();'>\n" +
    "        <i class=\"fa fa-times\"></i></a></span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"row row-xss\">\n" +
    "        <div class=\"col-xs-6 col\">\n" +
    "\n" +
    "            <div class='filter-container' ng-if=\"auth.is('customer') && initData.sites.length>1\">\n" +
    "                <div class=\"row row-xs row-nopad\">\n" +
    "                    <div class=\"col-xs-5 col\">\n" +
    "                        <div class=\"filter-header\">\n" +
    "                            <h3>Property</h3>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"col-xs-7 col\">\n" +
    "                        <div class=\"filter-input\">\n" +
    "                            <select  id=\"select_site\" class='inpt inpt-select' ng-disabled=\"filteredSites.length === 0\"\n" +
    "                                     ng-model=\"selected.siteID\"\n" +
    "                                     ng-change=\"onSelectSiteID(selected.siteID)\">\n" +
    "                                <option bindonce class=\"option\" ng-repeat=\"site in filteredSites\" value=\"{{site.siteID}}\" bo-bind=\"site.siteName\"></option>\n" +
    "                            </select>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <!--FILTER SECTION: SPECIES-->\n" +
    "            <filter-species tfs-species=\"TFSdata.filterTypeCounts.species\" filter-search-species=\"filterSearch.species\" init-data-species=\"initData.filters.species\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-species>\n" +
    "            <!-- END SPECIES FILTER SECTION -->\n" +
    "\n" +
    "        </div>\n" +
    "        <div class=\"col-xs-6 col\">\n" +
    "\n" +
    "            <!--FILTER SECTION: TREATMENT TYPE-->\n" +
    "            <filter-treatment-type tfs-treatments=\"TFSdata.filterTypeCounts.treatments\" filter-search-treatments=\"filterSearch.treatments\" init-data-treatments=\"initData.filters.treatments\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-treatment-type>\n" +
    "            <!-- END TREATMENT TYPE FILTER SECTION -->\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"collapse-container\">\n" +
    "        <div class=\"collapse-head\">\n" +
    "            <a href=\"#\" onclick='return false;'>Filters <i class=\"fa fa-angle-double-down\"></i></a>\n" +
    "        </div>\n" +
    "        <div class=\"collapse-preview\">\n" +
    "            <!-- START YEAR FILTER SECTION -->\n" +
    "            <filter-years filters-year=\"filters.year\" filters-years=\"filters.years\" on-select-year=\"onSelectYear(id)\"></filter-years>\n" +
    "            <!-- END YEAR FILTER SECTION -->\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"collapse-body\">\n" +
    "            <div class=\"row row-xss\">\n" +
    "                <div class=\"col-xs-6 col\">\n" +
    "                    <!--FILTER SECTION: Building, Hardscape and Powerline -->\n" +
    "                    <filter-hazards tfs-counts=\"TFSdata.filterTypeCounts\" init-data-hazards=\"initdata.filters.hazards\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-hazards>\n" +
    "                    <!-- END Building, Hardscape, POWERLINE FILTER SECTION -->\n" +
    "\n" +
    "                    <!--FILTER SECTION: SIZE-->\n" +
    "                    <filter-size tfs-counts-treatments=\"TFSdata.filterTypeCounts.treatments\" init-data-dbh=\"initData.filters.dbh\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-size>\n" +
    "                    <!-- END SIZE FILTER SECTION -->\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"col-xs-6 col\">\n" +
    "                    <!--FILTER SECTION: HEALTH-->\n" +
    "                    <filter-health tfs-counts-rating=\"TFSdata.filterTypeCounts.rating\" init-data-ratings=\"initData.filters.ratings\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-health>\n" +
    "                    <!-- END HEALTH FILTER SECTION -->\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</section>\n" +
    "");
}]);

angular.module("js/common/directives/maps/map.search.panel/map.search.panel.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/maps/map.search.panel/map.search.panel.tpl.html",
    "<div id=\"searchPanel\" class=\"mtop3\" style=\"display:none;\">\n" +
    "    <a id=\"zoomToMappedTrees\" class=\"fa fa-tree _red _size7 search-panel-button mright3\"\n" +
    "       ng-click=\"zoomToMappedTrees()\" ng-if=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\" bs-tooltip title='Jump back to trees'></a>\n" +
    "    <input id=\"googleSearchbox\" class=\"controls\" type=\"text\" placeholder=\"Find Address\" ng-model=\"googleMapSearchBoxValue\">\n" +
    "    <a id=\"searchButtonForSearchBox\" class=\"fa fa-map-marker _red _size7 search-panel-button mleft3\"\n" +
    "       ng-show=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\"\n" +
    "       ng-click=\"zoomToSearchMarker()\"></a>\n" +
    "    <a id=\"clearButtonForSearchBox\" class=\"fa fa-times _red _size7 search-panel-button mleft3\"\n" +
    "       ng-show=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\"\n" +
    "       ng-click=\"cleanSearchMarkers();\"></a>\n" +
    "</div>\n" +
    "<div id=\"searchPanel\" class=\"mtop3\" style=\"display:none;\">\n" +
    "    <a id=\"zoomToMappedTrees\" class=\"fa fa-tree _red _size7 search-panel-button mright3\"\n" +
    "       ng-click=\"zoomToMappedTrees()\" ng-if=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\" bs-tooltip title='Jump back to trees'></a>\n" +
    "    <input id=\"googleSearchbox\" class=\"controls\" type=\"text\" placeholder=\"Find Address\" ng-model=\"googleMapSearchBoxValue\">\n" +
    "    <a id=\"searchButtonForSearchBox\" class=\"fa fa-map-marker _red _size7 search-panel-button mleft3\"\n" +
    "       ng-show=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\"\n" +
    "       ng-click=\"zoomToSearchMarker()\"></a>\n" +
    "    <a id=\"clearButtonForSearchBox\" class=\"fa fa-times _red _size7 search-panel-button mleft3\"\n" +
    "       ng-show=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\"\n" +
    "       ng-click=\"cleanSearchMarkers();\"></a>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("js/common/directives/maps/tree.map/tree.map.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/maps/tree.map/tree.map.tpl.html",
    "<section class=\"map-container mainContent top-margin-none {{'mode_'+data.mode()}}\" ng-class=\"'mode_' + data.mode()\">\n" +
    "\n" +
    "    <div id='treeDetails' ng:cloak ng-show=\"data.showTreeDetails && data.mode()=='trees'\" ng-include=\"'js/trees/edit.tpl.html'\"></div>\n" +
    "\n" +
    "    <div id=\"searchPanel\" class=\"mtop3\" style=\"display:none;\">\n" +
    "        <a id=\"zoomToMappedTrees\" class=\"fa fa-tree _red _size7 search-panel-button mright3\"\n" +
    "           ng-click=\"zoomToMappedTrees()\"></a>\n" +
    "        <input id=\"googleSearchbox\" class=\"controls\" type=\"text\" placeholder=\"Search Box\"\n" +
    "               ng-model=\"googleMapSearchBoxValue\">\n" +
    "        <a id=\"searchButtonForSearchBox\" class=\"fa fa-map-marker _red _size7 search-panel-button mleft3\"\n" +
    "           ng-show=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\"\n" +
    "           ng-click=\"zoomToSearchMarker()\"></a>\n" +
    "        <a id=\"clearButtonForSearchBox\" class=\"fa fa-times _red _size7 search-panel-button mleft3\"\n" +
    "           ng-show=\"googleMapSearchBoxValue && googleMapSearchBoxValue!=''\"\n" +
    "           ng-click=\"cleanSearchMarkers();\"></a>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng:cloak ng-show=\"data.showMap && data.mode()=='trees'\" id=\"treeMap\" ng-class=\"data.mode()\" class=\"map\"></div>\n" +
    "\n" +
    "</section>\n" +
    "");
}]);

angular.module("js/common/directives/reports/email.logs/email.logs.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/reports/email.logs/email.logs.tpl.html",
    "<div ng-if=\"report.emailLogs && report.emailLogs.length && data.mode()=='trees'\">\n" +
    "    Email logs:<BR>\n" +
    "    <table class='table ng-table-responsive ng-table'>\n" +
    "        <tr bindonce ng-table ng-repeat=\"itm in report.emailLogs\">\n" +
    "            <td>{{itm.senderEmail}} <i class='fa fa-arrow-right'></i> {{itm.recipientEmail}}\n" +
    "                &nbsp; <a ng-if=\"itm.link\" target='new' href='{{itm.link}}'>link</a>\n" +
    "            </td>\n" +
    "            <td bo-text=\"itm.tstamp_sent || ''\"></td>\n" +
    "            <td>\n" +
    "                <span ng-show=\"itm.resultMessage\" ng-class=\"'emaillogResult '+itm.resultMessage\" ng-bind='itm.resultMessage'></span>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/reports/estimate.summary/estimate.summary.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/reports/estimate.summary/estimate.summary.tpl.html",
    "<div class=\"estimate-summary\">\n" +
    "    <div class=\"row row-estimate\">\n" +
    "        <div class=\"col-md-6 col\">\n" +
    "            <div class=\"estimate-info\">\n" +
    "                <dl class=\"small\">\n" +
    "                    <dt>Created: <span ng-bind=\"report.tstamp_updated\"></span> &nbsp; &nbsp; &nbsp; &nbsp;\n" +
    "                        Estimate ID: <span ng-bind=\"report.reportID\"></span>\n" +
    "                    </dt>\n" +
    "                </dl>\n" +
    "                <h1 class=\"title\" ng-text=\"'Estimate for ' + report.siteName\"></h1>\n" +
    "                <p class=\"name\">\n" +
    "						<span ng-if=\"mode() === 'trees'\">\n" +
    "							<a href editable-text='report.name' class='reportName'>{{report.name}}</a> &nbsp;\n" +
    "						</span>\n" +
    "						<span ng-if=\"mode() !== 'trees'\">\n" +
    "							{{report.name}}\n" +
    "						</span>\n" +
    "                </p>\n" +
    "                <dl>\n" +
    "                    <dt>Contact: </dt>\n" +
    "                    <dd ng-bind=\"report.contact + ' ' + report.contactPhone|formatPhoneNumber\"></dd>\n" +
    "                </dl>\n" +
    "                <dl>\n" +
    "                    <dt>Client: </dt>\n" +
    "                    <dd ng-bind='report.clientName'></dd>\n" +
    "                </dl>\n" +
    "                <dl>\n" +
    "                    <dt>Property: </dt>\n" +
    "                    <dd ng-bind=\"report.siteName\"></dd>\n" +
    "                </dl>\n" +
    "                <dl>\n" +
    "                    <dt>Address: </dt>\n" +
    "                    <dd ng-bind=\"report.street + ', ' + report.city + ',' + report.state + ' ' + report.zip\"></dd>\n" +
    "                </dl>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"col-md-2 col\" ng-if='report.sales_email'>\n" +
    "            <div class=\"estimate-info\">\n" +
    "                <p class=\"name clr-orange\">Sales Rep</p>\n" +
    "                <dl ng-if=\"report.sales_fname\">\n" +
    "                    <dd ng-text=\"report.sales_fname + ' ' + report.sales_lname\"></dd>\n" +
    "                </dl>\n" +
    "                <dl>\n" +
    "                    <dd><a href='mailto:{{report.sales_email}}' target=_new ng-bind='report.sales_email' style='color:#fff;'></a></dd>\n" +
    "                </dl>\n" +
    "                <dl ng-if=\"report.sales_phone\">\n" +
    "                    <dd ng-bind='report.sales_phone|formatPhoneNumber'></dd>\n" +
    "                </dl>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <div class=\"col-md-4 col\">\n" +
    "            <div class=\"bid-info\">\n" +
    "                <div class=\"logos\">\n" +
    "                    <span class=\"logo\"><img src=\"img/logo_tcia.png\"></span>\n" +
    "                </div>\n" +
    "                <p class=\"bid\">Total Bid: ${{(report.total.grand || 0)|formatPrice}}</p>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/reports/recent.estimates/recent.estimates.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/reports/recent.estimates/recent.estimates.tpl.html",
    "<select title=\"Load Estimate\" id=\"reportSelector\" class=\"styled-select\" ng-model=\"model\">\n" +
    "    <option value=\"\">Recent Estimates</option>\n" +
    "    <!-- todo-bindonce - was removed from here: \"bindonce bo-value=\"r.reportID\"\" ... repalce this back if we can get the rebinder working -->\n" +
    "    <option bindonce bo-value=\"r.reportID\" ng-repeat=\"r in recentReportList\" ng-bind=\"getRecentReportTitle({ report: r })\">\n" +
    "    </option>\n" +
    "</select>\n" +
    "");
}]);

angular.module("js/common/directives/reports/report.estimates.table/report.estimates.table.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/reports/report.estimates.table/report.estimates.table.tpl.html",
    "<div class=\"table-responsive\">\n" +
    "    <table class=\"table table-striped table-bordered table-hover ng-scope ng-table mode_{{data.mode()}}\">\n" +
    "        <thead>\n" +
    "        <tr id=\"estimate_table_heading\">\n" +
    "            <td class=\"td-image\">Tree</td>\n" +
    "            <td class=\"td-id\">ID</td>\n" +
    "            <td class=\"td-name\">Name</td>\n" +
    "            <td class=\"td-treatment\">Treatment</td>\n" +
    "            <td class=\"td-bid\">Bid ($)</td>\n" +
    "            <td class=\"td-action\"></td>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "        <!-- todo-bindonce - i removed it from below... cuz it broke editing of values...\n" +
    "            if we can get rebind to work, then we need to rebind if the user is an admin (and they want to edit)\n" +
    "            and leave bindonce if the user is a customer t-->\n" +
    "        <tr ng-repeat=\"item in groupedItems\" ng-if=\"report.items.length>0\"\n" +
    "            ng-init=\"itemIndex = $index\"\n" +
    "            ng-class=\"rowHighlightClass(item)\"\n" +
    "            class='hoverHotspot'\n" +
    "            ng-mouseover=\"hover=true;onItemRollOver(TreesCtrl.findMarker(item.treeID))\"\n" +
    "            ng-mouseleave=\"hover=false;onItemRollOut(TreesCtrl.findMarker(item.treeID))\"\n" +
    "            id=\"rpt_item_{{item.treeID}}\">\n" +
    "            <td data-title=\"listing_image\" class=\"td-image\">\n" +
    "\n" +
    "                <tree-image-popover item=\"item\" cache-buster=\"tree_cachebuster\"/>\n" +
    "            </td>\n" +
    "            <td data-title=\"listing_ID\" class=\"td-id\">{{item.localTreeID}}</td>\n" +
    "            <td data-title=\"listing_species\" class=\"td-name\">\n" +
    "                {{item.dbhID | dbhID2Name:this }}\n" +
    "                {{item.commonName || 'Not specified'}} <span ng-if=\"item.botanicalName\">({{item.botanicalName}})</span>\n" +
    "                <span class=\"light\" bo-text=\"'[' + item.treeID + ']'\"></span>\n" +
    "                <a href='#/tree_edit/{{item.treeID}}' class='row-action leftSpace10' ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                    <i class=\"fa fa-pencil clr-primary _size5 hoverDisplay\"></i>\n" +
    "                </a>\n" +
    "                <div ng-if=\"item.notes\" id=\"estimate_table_notes\">{{item.notes}}</div>\n" +
    "            </td>\n" +
    "            <td data-title=\"listing_treatment\" colspan=\"3\" class=\"td-treatment-bid\">\n" +
    "                <table class=\"\">\n" +
    "                    <tr ng-repeat=\"treatment in item.treatments\" ng-init=\"treatmentIndex = $index\">\n" +
    "                        <td ng-if=\"auth.isAtleast('inventory') && !auth.is('customer')\" data-title=\"listing_treatment\" class=\"td-treatment\">\n" +
    "                            <a href e-ng-options=\"obj.code as obj.treatmentType for obj in initData.filters.treatments\"\n" +
    "                               editable-select=\"treatment.treatmentTypeCode\"\n" +
    "                               onshow=\"onShowEditItem(item.$$hashKey)\"\n" +
    "                               onaftersave=\"onTreatmentTypeUpdate(item, treatment)\"\n" +
    "                               onhide=\"onHideEditItem()\">\n" +
    "                                {{treatment.treatmentTypeCode|treatmentTypeCode2Name:this}}\n" +
    "                            </a>\n" +
    "                        </td>\n" +
    "                        <td ng-if=\"auth.is('customer')\">\n" +
    "                                                <span ng-bind=\"treatment.treatmentTypeCode|treatmentTypeCode2Name:this\">\n" +
    "                                                </span>\n" +
    "                        </td>\n" +
    "                        <td ng-if=\"auth.isAtleast('inventory') && !auth.is('customer')\" data-title=\"listing_price\" class=\"td-bid\">\n" +
    "                            &#36;<a href editable-text='treatment.price' onshow=\"onShowEditItem(item.$$hashKey)\" onhide=\"onHideEditItem()\" onaftersave=\"onTreatmentPriceUpdate()\">{{treatment.price|formatPrice}}</a>\n" +
    "                        </td>\n" +
    "                        <td ng-if=\"auth.is('customer')\">\n" +
    "                            <span ng-bind=\"treatment.price|formatPrice\"></span>\n" +
    "                        </td>\n" +
    "\n" +
    "                        <td data-title=\"listing_options\" class=\"td-action\">\n" +
    "                            <a href ng-click=\"removeTreatmentFromEstimate(itemIndex, treatmentIndex)\" class='row-action' ng-if=\"auth.is('admin')\">\n" +
    "                                <i class=\"fa fa-times clr-danger _size5 hoverDisplay\"></i>\n" +
    "                            </a>\n" +
    "                        </td>\n" +
    "                    </tr>\n" +
    "                </table>\n" +
    "            </td>	<!-- }}} listing_treatment colspan=3 -->\n" +
    "        </tr>\n" +
    "        <tr ng-if=\"report.total.items && data.mode()=='trees'\">\n" +
    "            <td colspan=\"4\" class=\"td-bid\">Subtotal:</td>\n" +
    "            <td class=\"td-bid\">&#36;{{report.total.items|formatPrice}}</td>\n" +
    "            <td>&nbsp;</td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/reports/report.misc.services.table/report.misc.services.table.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/reports/report.misc.services.table/report.misc.services.table.tpl.html",
    "<div class=\"table-responsive\">\n" +
    "    <table class=\"table ng-scope ng-table\" ng-if=\"data.mode()=='trees' || report.services.length > 0 \">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "            <td colspan=\"4\">Misc. Services</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td colspan=\"{{ data.mode()=='trees' && '1' || '2' }}\">Description</td>\n" +
    "            <td>Quantity</td>\n" +
    "            <td class=\"text-right\">Price</td>\n" +
    "            <td ng-if=\"data.mode()=='trees'\"></td>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"item in report.services\" class=\"hoverHotspot\">							   	<td data-title=\"service_desc\" colspan=\"{{ data.mode()=='trees' && '1' || '2' }}\">\n" +
    "            <a href editable-text='item.desc' ng-if='auth.isAtleast(\"inventory\")'>{{item.desc}}</a>\n" +
    "            <span ng-if='!auth.isAtleast(\"inventory\")'>{{item.desc}}</span>\n" +
    "        </td>\n" +
    "            <td data-title=\"service_quantity\">\n" +
    "                <a href editable-text='item.quantity' ng-if='auth.isAtleast(\"inventory\")'>{{item.quantity}}</a>\n" +
    "                <span ng-if='!auth.isAtleast(\"inventory\")'>{{item.quantity}}</span>\n" +
    "            </td>\n" +
    "            <td data-title=\"service_price\" class=\"text-right\">\n" +
    "                <a href editable-text='item.price' ng-if='auth.isAtleast(\"inventory\")'>{{item.price}}</a>\n" +
    "                <span ng-if='!auth.isAtleast(\"inventory\")'>{{item.price}}</span>\n" +
    "            </td>\n" +
    "            <td ng-if=\"data.mode()=='trees'\">\n" +
    "                <div ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                    <a href ng-click=\"removeItem(item.$$hashKey,'services')\"\n" +
    "                       class='fa fa-times _red _med hoverDisplay' ></a>\n" +
    "                </div>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "\n" +
    "        <tr ng-if=\"data.mode()=='trees'\">\n" +
    "            <td>\n" +
    "                <textarea ng-model=\"service.desc\" class=\"rightMargin10\" placeholder=\"Service Description\" style='width:490px;height:2em;'></textarea>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "									<span>\n" +
    "										x&nbsp;<input type=\"text\" ng-model=\"service.quantity\" class=\"rightMargin10\" placeholder=\"1\" style='width:30px;height:2em;' ng-init=\"service.quantity=1\"></input>\n" +
    "									</span>\n" +
    "            </td>\n" +
    "            <td style=\"padding-left:0px;padding-right:0px\"  class=\"text-right\">\n" +
    "									<span>\n" +
    "										$&nbsp;<input type=\"text\" ng-model=\"service.price\"  placeholder=\"0.00\" style='width:40px;height:2em;'></input>\n" +
    "									</span>\n" +
    "            </td>\n" +
    "            <td class=\"text-right\">\n" +
    "                <button class=\"btn btn-red clr-white\" ng-click=\"addMiscService(service.desc,service.quantity,service.price)\">ADD</button>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "\n" +
    "        <!-- // Subtotals // -->\n" +
    "        <tr ng-if=\"report.total.services\">\n" +
    "            <td align=right colspan=\"3\">Misc Services Subtotal:</td>\n" +
    "            <td class=\"text-right\">&#36;{{report.total.services|formatPrice}}</td>\n" +
    "        </tr>\n" +
    "        <tr ng-if=\"report.total.services\">\n" +
    "            <td align=right colspan=\"3\">Tree Services Subtotal:</td>\n" +
    "            <td class=\"text-right\">&#36;{{report.total.items|formatPrice}}</td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/reports/treeImagePopover/treeImagePopover.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/reports/treeImagePopover/treeImagePopover.tpl.html",
    "<img bo-src='item.imgSm + cacheBuster' class='item_thumb'\n" +
    "     data-content=\"<img style='width:100%; height:350px;' src='{{item.imgMed}}{{cacheBuster}}'>\"\n" +
    "     data-html=\"true\"\n" +
    "     data-toggle=\"popover\"\n" +
    "     data-trigger=\"hover\"\n" +
    "     data-placement=\"right\"\n" +
    "     data-template='<div class=\"popover\"><div class=\"popover-content\" ng-bind=\"content\"></div></div>'\n" +
    "        />");
}]);

angular.module("js/common/directives/siteEditModal/siteEditModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/siteEditModal/siteEditModal.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "\n" +
    "            <div class=\"modal-header\" ng-show=\"title\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-bind=\"title\"></h4>\n" +
    "            </div>\n" +
    "\n" +
    "            <div>\n" +
    "           		<form class=\"form-inline\" ng-submit=\"saveSite()\">\n" +
    "                    <div class='panel panel-default bottomMargin0'>\n" +
    "                        <div class='panel-heading'>\n" +
    "                            <h3 class='panel-title'>Property - {{site.siteName}}</h3>\n" +
    "                        </div>\n" +
    "                        <div class='panel-body' style='line-height:1.5em;'>\n" +
    "							<div>\n" +
    "                            	<button class=\"btn btn-default\" ng-model=\"site.clientID\" ng-options=\"c.clientID as c.clientName for c in clients\" \n" +
    "									bs-select placeholder=\"Which client owns this property?\" onclick=\"return false;\" required>\n" +
    "									Client <span class=\"caret\"></span>\n" +
    "								</button>\n" +
    "								<button class=\"btn btn-default\" ng-show=\"site.clientID\" ng-click=\"copyAddressFromClientToNewSite(site.clientID)\" \n" +
    "									onclick=\"return false;\"><i class='fa fa-copy'></i> Copy Address</button>\n" +
    "                            </div>\n" +
    "                            <div class='silver'>Name:</div>\n" +
    "							<div><input type=\"text\" ng-model=\"site.siteName\" size=\"40\" required></div>\n" +
    "                            <div class='silver'>Address:</div>\n" +
    "                            <div><input type=\"text\" ng-model=\"site.street\" size=\"50\"></div>\n" +
    "                            <div class='silver'>City:</div>\n" +
    "                            <div><input type=\"text\" ng-model=\"site.city\" size=\"50\"></div>\n" +
    "                            <div class='silver'>State:</div>\n" +
    "                            <div><input type=\"text\" ng-model=\"site.state\" size=\"10\"></div>\n" +
    "                            <div class='silver'>Zip:</div>\n" +
    "                            <div><input type=\"text\" ng-model=\"site.zip\" size=\"20\"></div>\n" +
    "\n" +
    "							<!-- this is here so user can hit ENTER to submit form -->\n" +
    "							<input type=\"submit\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer topMargin0\">\n" +
    "                        <span ng-show=\"site.siteID\">\n" +
    "                            <input type=\"submit\" value=\"UPDATE\" class='btn btn-primary'>\n" +
    "                            <button type=\"button\" class=\"btn btn-info\" site-users-edit-modal site=\"site\">\n" +
    "                                EDIT USERS\n" +
    "                            </button>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span ng-show=\"!site.siteID\">\n" +
    "                            <button type=\"button\" class='btn btn-primary' site-users-edit-modal before-open=\"saveSite\" site=\"site\">\n" +
    "                                SAVE AND ADD USERS\n" +
    "                            </button>\n" +
    "                            <input type=\"submit\" value=\"SAVE\" class='btn btn-primary'>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <button type=\"button\" class=\"btn btn-default\" ng-click=\"hide()\">CLOSE</button>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/siteUsersEditModal/siteUsersEditModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/siteUsersEditModal/siteUsersEditModal.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "\n" +
    "            <div class=\"modal-header\" ng-show=\"title\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-bind=\"title\"></h4>\n" +
    "            </div>\n" +
    "\n" +
    "            <div>\n" +
    "                <form class=\"form-inline\">\n" +
    "                    <div class='panel panel-default bottomMargin0'>\n" +
    "                        <div class='panel-heading'>\n" +
    "                            <h3 class='panel-title'>Edit users for {{site.siteName}}</h3>\n" +
    "                        </div>\n" +
    "                        <div class='panel-body'>\n" +
    "                            <div class=\"containter\">\n" +
    "\n" +
    "                                <div class=\"row\" style=\"margin-top: 12px;\">\n" +
    "                                    <div class=\"col-sm-8\" style=\"font-weight: bold;\">\n" +
    "                                        Property contacts for {{site.siteName}}\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                                <div class=\"row hoverHotspot\" ng-repeat=\"c in contacts\" \n" +
    "										style=\"margin: 9px 24px 3px 1px; padding:8px 2px 8px 8px; background:#eee;\" \n" +
    "										ng-show=\"contacts.length > 0\">\n" +
    "                                	<a ng-click=\"unassign(c.userID, c.email, 'customer')\" class=\"hand hoverDisplay\" bs-tooltip \n" +
    "											title=\"Remove assignment\" style=\"text-decoration: none; \">\n" +
    "                                		<i class=\"fa fa-times _red _size5\"></i></a> &nbsp; \n" +
    "                                        {{c.email}} - {{c.fName}} {{c.lName}}\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"row\" style=\"margin: 15px 2px 10px 5px;\">\n" +
    "									<form ng-submit=\"addNewSiteContact($event)\">\n" +
    "                                        <input type=\"text\" required placeholder=\"Email\" style=\"width: 135px;\" ng-model=\"newContact.email\" id='newContactEmail'\n" +
    "												user-auto-complete=\"contactSelect\" user-roles=\"customer\" user-ignore=\"contacts\" bs-typeahead>\n" +
    "                                        <input type=\"text\" placeholder=\"First name\" required style=\"width:90px\" ng-model=\"newContact.fName\">\n" +
    "                                        <input type=\"text\" placeholder=\"Last name\" required style=\"width:90px;\" ng-model=\"newContact.lName\">\n" +
    "                                        <input type=\"text\" placeholder=\"Phone\" style=\"width:105px;\" ng-model=\"newContact.phone\">\n" +
    "                                        <button ng-click=\"addNewSiteContact($event);\" type='button' class='btn btn-primary'><i class='fa fa-plus white _size4'></i></button>\n" +
    "									</form>\n" +
    "                                </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "								<hr> <!-- ================================================================== -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "                                <div class=\"row\" style=\"margin-top: 12px;\">\n" +
    "                                    <div class=\"col-sm-8\" style=\"font-weight: bold;\">\n" +
    "                                        AplusTree Reps\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"row hoverHotspot\" ng-repeat=\"r in reps\" \n" +
    "										style=\"margin: 9px 24px 3px 1px; padding:8px 2px 8px 8px; background:#eee;\" \n" +
    "										ng-show=\"reps.length > 0\">\n" +
    "                                	<a ng-click=\"unassign(r.userID, r.email, 'staff')\" class=\"hand hoverDisplay\" bs-tooltip \n" +
    "											title=\"Remove assignment\" style=\"text-decoration: none; \">\n" +
    "                                		<i class=\"fa fa-times _red _size5\"></i></a> &nbsp; \n" +
    "                                        {{r.email}} - {{r.fName}} {{r.lName}}  &nbsp; &nbsp; \n" +
    "											<span style='color:#fff;background:#333; padding:4px 8px; text-transform:uppercase; font-size:.7em'>{{r.role}}</span>\n" +
    "                                </div>\n" +
    "                                <div class=\"row\" style=\"margin: 15px 2px 10px 5px;\">\n" +
    "									<form ng-submit=\"addNewRepContact($event)\">\n" +
    "                                        <input type=\"text\" required placeholder=\"Email\" style=\"width: 105px;\" ng-model=\"newRep.email\" id='newRepEmail'\n" +
    "												user-auto-complete=\"repSelect\" user-roles=\"sales,inventory,admin\" user-ignore=\"reps\" bs-typeahead>\n" +
    "                                        <input type=\"text\" placeholder=\"First name\" required style=\"width:80px\" ng-model=\"newRep.fName\">\n" +
    "                                        <input type=\"text\" placeholder=\"Last name\" required style=\"width:80px;\" ng-model=\"newRep.lName\">\n" +
    "                                        <input type=\"text\" placeholder=\"Phone\" style=\"width:105px;\" ng-model=\"newRep.phone\">\n" +
    "                                        <select ng-model=\"newRep.role\" required>\n" +
    "                                            <option disabled value=\"\">Role</option>\n" +
    "                                            <option value=\"sales\">Sales</option>\n" +
    "                                            <option value=\"inventory\">Inventory</option>\n" +
    "                                        </select> &nbsp;\n" +
    "                                        <button ng-click=\"addNewSiteRep($event);\" type='button' class='btn btn-primary'><i class='fa fa-plus white _size4'></i></button>\n" +
    "									</form>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer topMargin0\">\n" +
    "                        <button type=\"button\" class=\"btn btn-default\" ng-click=\"$parent.closeModal();\">CLOSE</button>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/siteUsersMultiEditModal/siteUsersMultiEditModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/siteUsersMultiEditModal/siteUsersMultiEditModal.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "\n" +
    "            <div class=\"modal-header\" ng-show=\"title\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$parent.closeModal()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-bind=\"title\"></h4>\n" +
    "            </div>\n" +
    "\n" +
    "            <div>\n" +
    "                <form class=\"form-inline\">\n" +
    "                    <div class='panel panel-default bottomMargin0'>\n" +
    "                        <div class='panel-heading'>\n" +
    "                            <h3 class='panel-title'>Edit users</h3>\n" +
    "                        </div>\n" +
    "                        <div class='panel-body'>\n" +
    "                            <div class=\"containter\">\n" +
    "                                <div class=\"row\">\n" +
    "                                    <div class=\"col-sm-6\">\n" +
    "                                        <h4 ng-show=\"selectedSites.length\" style=\"font-weight: bold;\">\n" +
    "                                            Edit users for:\n" +
    "                                        </h4>\n" +
    "                                    </div>\n" +
    "                                    <div class=\"col-sm-6\">\n" +
    "                                        <button type=\"button\" class=\"btn btn-primary pull-right\"\n" +
    "                                                ng-click=\"showAddForm('site')\" >\n" +
    "                                            <i class='fa fa-plus white'></i> More Sites\n" +
    "                                        </button>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"row\" ng-show=\"selectedSites.length\" style=\"margin-top: 10px; margin-bottom: 10px;\">\n" +
    "                                    <div class=\"col-sm-12\">\n" +
    "                                        <span class=\"label label-primary\" ng-repeat=\"s in selectedSites\" style=\"display: inline-block; margin: 3px; padding: 5px; font-size: 14px; cursor: pointer;\" ng-click=\"deselect(s, $index)\">\n" +
    "                                            {{s.siteName}}\n" +
    "                                            <i class=\"fa fa-times-circle-o\"></i>\n" +
    "                                        </span>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div class=\"row\" ng-show=\"$parent.showAddNewSite === true\" style=\"margin-top: 10px;\">\n" +
    "                                    <form ng-submit=\"saveNewSite($event)\">\n" +
    "                                        <div class=\"col-sm-10\">\n" +
    "                                            <input type=\"text\" required placeholder=\"Site name\" style=\"width: 100%;\" ng-model=\"newSite.name\" id='newSiteName' sites-auto-complete sites=\"sites\" callback=\"siteSelect\" bs-typeahead>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"col-sm-2\">\n" +
    "                                            <button ng-click=\"saveNewSite($event)\">Add</button>\n" +
    "                                        </div>\n" +
    "                                    </form>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <div ng-show=\"selectedSites.length\">\n" +
    "                                    <div class=\"row\" style=\"margin-top: 12px;\">\n" +
    "                                        <div class=\"col-sm-8\" style=\"font-weight: bold;\">\n" +
    "                                            Site contacts\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "\n" +
    "									<div class=\"row hoverHotspot\" ng-repeat=\"c in contacts\" \n" +
    "											style=\"margin: 9px 24px 3px 1px; padding:8px 2px 8px 8px; background:#eee;\" \n" +
    "											ng-show=\"contacts.length > 0\">\n" +
    "										<!--\n" +
    "										<a ng-click=\"unassign(c.userID, c.email, 'customer')\" class=\"hand hoverDisplay\" bs-tooltip \n" +
    "												title=\"Remove assignment\" style=\"text-decoration: none; \">\n" +
    "											<i class=\"fa fa-times _red _size5\"></i></a> &nbsp; \n" +
    "										-->\n" +
    "											{{c.email}} - {{c.fName}} {{c.lName}}\n" +
    "									</div>\n" +
    "\n" +
    "									<div class=\"row\" style=\"margin: 15px 2px 10px 5px;\">\n" +
    "										<form ng-submit=\"addNewSiteContact($event)\">\n" +
    "											<input type=\"text\" required placeholder=\"Email\" style=\"width: 135px;\" ng-model=\"newContact.email\" id='newContactEmail'\n" +
    "													user-auto-complete=\"contactSelect\" user-roles=\"customer\" user-ignore=\"contacts\" bs-typeahead>\n" +
    "											<input type=\"text\" placeholder=\"First name\" required style=\"width:90px\" ng-model=\"newContact.fName\">\n" +
    "											<input type=\"text\" placeholder=\"Last name\" required style=\"width:90px;\" ng-model=\"newContact.lName\">\n" +
    "											<input type=\"text\" placeholder=\"Phone\" style=\"width:105px;\" ng-model=\"newContact.phone\">\n" +
    "											<button ng-click=\"addNewSiteContact($event);\" type='button' class='btn btn-primary'><i class='fa fa-plus white _size4'></i></button>\n" +
    "										</form>\n" +
    "									</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "                                    <hr> <!-- ================================================================== -->\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "                                    <div class=\"row\" style=\"margin-top: 12px;\">\n" +
    "                                        <div class=\"col-sm-8\" style=\"font-weight: bold;\">\n" +
    "                                            AplusTree Reps\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "									<div class=\"row hoverHotspot\" ng-repeat=\"r in reps\" \n" +
    "											style=\"margin: 9px 24px 3px 1px; padding:8px 2px 8px 8px; background:#eee;\" \n" +
    "											ng-show=\"reps.length > 0\">\n" +
    "										<!--\n" +
    "										<a ng-click=\"unassign(r.userID, r.email, 'staff')\" class=\"hand hoverDisplay\" bs-tooltip \n" +
    "												title=\"Remove assignment\" style=\"text-decoration: none; \">\n" +
    "											<i class=\"fa fa-times _red _size5\"></i></a> &nbsp; \n" +
    "										-->\n" +
    "											{{r.email}} - {{r.fName}} {{r.lName}}  &nbsp; &nbsp; \n" +
    "												<span style='color:#fff;background:#333; padding:4px 8px; text-transform:uppercase; font-size:.7em'>{{r.role}}</span>\n" +
    "									</div>\n" +
    "									<div class=\"row\" style=\"margin: 15px 2px 10px 5px;\">\n" +
    "										<form ng-submit=\"addNewRepContact($event)\">\n" +
    "											<input type=\"text\" required placeholder=\"Email\" style=\"width: 105px;\" ng-model=\"newRep.email\" id='newRepEmail'\n" +
    "													user-auto-complete=\"repSelect\" user-roles=\"sales,inventory,admin\" user-ignore=\"reps\" bs-typeahead>\n" +
    "											<input type=\"text\" placeholder=\"First name\" required style=\"width:80px\" ng-model=\"newRep.fName\">\n" +
    "											<input type=\"text\" placeholder=\"Last name\" required style=\"width:80px;\" ng-model=\"newRep.lName\">\n" +
    "											<input type=\"text\" placeholder=\"Phone\" style=\"width:105px;\" ng-model=\"newRep.phone\">\n" +
    "											<select ng-model=\"newRep.role\" required>\n" +
    "												<option disabled value=\"\">Role</option>\n" +
    "												<option value=\"sales\">Sales</option>\n" +
    "												<option value=\"inventory\">Inventory</option>\n" +
    "											</select> &nbsp;\n" +
    "											<button ng-click=\"addNewSiteRep($event);\" type='button' class='btn btn-primary'><i class='fa fa-plus white _size4'></i></button>\n" +
    "										</form>\n" +
    "									</div>\n" +
    "\n" +
    "\n" +
    "                                    \n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer topMargin0\">\n" +
    "                        <button type=\"button\" class=\"btn btn-default\" ng-click=\"$parent.closeModal();\">CLOSE</button>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/templates/newEstimatePromptModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/templates/newEstimatePromptModal.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div>\n" +
    "                    <div class='panel panel-default bottomMargin0'>\n" +
    "                        <div class='panel-heading'>\n" +
    "                            <h3 class='panel-title'>Create a new estimate?</h3>\n" +
    "                        </div>\n" +
    "                        <div class='panel-body'>\n" +
    "                            <span>You have an estimate open already.</span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer topMargin0\">\n" +
    "                        <span>\n" +
    "                            <input type=\"submit\" value=\"CREATE NEW ESTIMATE\" class='btn btn-primary' ng-click=\"createNewReportAndAddToEstimate(); $hide();\">\n" +
    "                            <input type=\"submit\" value=\"CANCEL\" class='btn btn-primary' ng-click=\"leaveOldReport(); $hide();\">\n" +
    "                        </span>\n" +
    "\n" +
    "                    </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/templates/siteEditModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/templates/siteEditModal.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "    <div class=\"modal-dialog\">\n" +
    "        <div class=\"modal-content\">\n" +
    "\n" +
    "            <div class=\"modal-header\" ng-show=\"title\">\n" +
    "                <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "                <h4 class=\"modal-title\" ng-bind=\"title\"></h4>\n" +
    "            </div>\n" +
    "\n" +
    "            <div>\n" +
    "                <form class=\"form-inline\" ng-submit=\"saveSite()\">\n" +
    "                    <div class='panel panel-default bottomMargin0'>\n" +
    "                        <div class='panel-heading'>\n" +
    "                            <h3 class='panel-title'>Edit Property</h3>\n" +
    "                        </div>\n" +
    "                        <div class='panel-body'>\n" +
    "                            <select class='styled-select' ng-model=\"site.clientID\"\n" +
    "                                    ng-change=\"copyAddressFromClientToNewSite(site.clientID)\">\n" +
    "                                <option value=\"\">Client</option>\n" +
    "                                <option ng-repeat=\"client in clients\" value=\"{{client.clientID}}\">\n" +
    "                                    {{client.clientName}}\n" +
    "                                </option>\n" +
    "                            </select>\n" +
    "                            (choose a client this property belongs to)<br>\n" +
    "                            <input type=\"text\" placeholder=\"Property Name\" ng-model=\"site.siteName\" required size=\"40\" auto-focus><br>\n" +
    "                            <input type=\"text\" placeholder=\"Address\" ng-model=\"site.street\" size=\"40\"><br>\n" +
    "                            <input type=\"text\" placeholder=\"City\" ng-model=\"site.city\" size=\"40\"><br>\n" +
    "                            <input type=\"text\" placeholder=\"State\" ng-model=\"site.state\" size=\"40\"><br>\n" +
    "                            <input type=\"text\" placeholder=\"Zip\" ng-model=\"site.zip\" size=\"40\"><br>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer topMargin0\">\n" +
    "                        <span ng-show=\"site.siteID\">\n" +
    "                            <input type=\"submit\" value=\"UPDATE\" class='btn btn-primary'>\n" +
    "                            <button type=\"button\" class=\"btn btn-info\" site-users-edit-modal site=\"site\">\n" +
    "                                EDIT USERS\n" +
    "                            </button>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span ng-show=\"!site.siteID\">\n" +
    "                            <input type=\"submit\" value=\"SAVE\" class='btn btn-primary'>\n" +
    "                            <button type=\"button\" class='btn btn-info' site-users-edit-modal before-open=\"saveSite\" site=\"site\">\n" +
    "                                SAVE AND ADD USERS\n" +
    "                            </button>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">CLOSE</button>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/tosAcceptButton/tosAcceptButtonModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/tosAcceptButton/tosAcceptButtonModal.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\" >\n" +
    "    <div class=\"modal-dialog\" style=\"width:400px;\">\n" +
    "        <div class=\"modal-content\">\n" +
    "\n" +
    "            <div>\n" +
    "                <form class=\"form-inline\">\n" +
    "                    <div class='panel panel-default bottomMargin0'>\n" +
    "                        <div class='panel-body' style=\"margin-top:20px;\">\n" +
    "                            <div class=\"containter\">\n" +
    "                                <div class=\"row\">\n" +
    "                                    <div class=\"col-sm-12\">\n" +
    "                                        <input type=\"checkbox\" ng-click=\"approved =!approved\" id=\"isApprovedCheckbox\">\n" +
    "                                        <label for=\"isApprovedCheckbox\">I Agree to <a href=\"/go/content/terms.html\" target=_new>Aplus Tree Terms of Service</a></label>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"modal-footer topMargin0\">\n" +
    "                        <button type=\"button\" class=\"btn btn-sm btn-block btn-green\" ng-click=\"test();\"\n" +
    "                                ng-disabled=\"!approved\"><i class=\"fa fa-check\"></i>Approve This Estimate</button>\n" +
    "                    </div>\n" +
    "                </form>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/treeEdit/tree.edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/treeEdit/tree.edit.tpl.html",
    "<div class=\"treeEditBox edit-tree-container\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-6\">\n" +
    "            <div class=\"image\"><a target=_new href='{{tree.imgLrg}}'><img ng-src=\"{{tree.imgMed + tree_cachebuster}}\"/></a></div>\n" +
    "        </div>\n" +
    "        <div class=\"col-md-6\">\n" +
    "            <div class=\"content\">\n" +
    "                <h2>\n" +
    "                    <a href ng-if=\"auth.isAtleast('inventory')\" editable-select='tree.speciesID' onaftersave=\"updateTreeName()\"\n" +
    "                       e-ng-options='obj.speciesID as obj.bothNames for obj in initData.filters.species'>\n" +
    "                        {{ tree.commonName || '(not specified)' }}\n" +
    "                    </a>\n" +
    "                    <span ng-if=\"!auth.isAtleast('inventory')\"\n" +
    "                          e-ng-options='obj.speciesID as obj.bothNames for obj in initData.filters.species'>\n" +
    "                        {{ tree.commonName || '(not specified)' }}\n" +
    "                    </span>\n" +
    "                </h2>\n" +
    "                <span ng-bind=\"tree.speciesID|speciesID2Name:'bot':this\"></span><br>\n" +
    "                <span ng-bind=\"'(treeID:' + treeID + ', SpeciesID:' + tree.speciesID + ', siteID:' + tree.siteID + ')'\"></span><br><br>\n" +
    "\n" +
    "                <dl class=\"dl-horizontal\">\n" +
    "                    <dt>Diameter:</dt>\n" +
    "                    <dd>\n" +
    "                        <div ng-if=\"tree.mode=='edit'\" class=\"pullright\">\n" +
    "                            <a href ng-if=\"auth.isAtleast('inventory')\" e-ng-options=\"obj.dbhID as obj.diameter for obj in initData.filters.dbh\" editable-select=\"tree.dbhID\">\n" +
    "                                {{ tree.dbhID | dbhID2Name:this  || \"(not specified)\"}}\n" +
    "                            </a>\n" +
    "                            <span ng-if=\"!auth.isAtleast('inventory')\" e-ng-options=\"obj.dbhID as obj.diameter for obj in initData.filters.dbh\">\n" +
    "                                {{ tree.dbhID | dbhID2Name:this  || \"(not specified)\"}}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"tree.mode!='edit'\" class=\"pullleft centerText\">&nbsp; {{tree.dbhID | dbhID2Name:this}}</div>\n" +
    "                    </dd>\n" +
    "                    <dt>Rating:</dt>\n" +
    "                    <dd>\n" +
    "                        <div ng-if=\"tree.mode=='edit'\" class=\"pullright centerText\">\n" +
    "                            <a href ng-if=\"auth.isAtleast('inventory')\" e-ng-options=\"obj.ratingID as obj.ratingID + ' - ' + obj.rating_desc for obj in initData.filters.ratings\" editable-select=\"tree.ratingID\">\n" +
    "                                {{tree.ratingID}} - {{ tree.ratingID | ratingID2Name:this  || \"(not specified)\"}}\n" +
    "                            </a>\n" +
    "                            <span ng-if=\"!auth.isAtleast('inventory')\" e-ng-options=\"obj.ratingID as obj.ratingID + ' - ' + obj.rating_desc for obj in initData.filters.ratings\">\n" +
    "                                {{tree.ratingID}} - {{ tree.ratingID | ratingID2Name:this  || \"(not specified)\"}}\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"tree.mode!='edit'\" class=\"pullleft centerText\">&nbsp; {{tree.ratingID|ratingID2Name:this}}</div>\n" +
    "                    </dd>\n" +
    "                    <dt>Near powerline?</dt>\n" +
    "                    <dd>\n" +
    "                        <div ng-if=\"tree.mode=='edit'\" class=\"pullright centerText\">\n" +
    "                            <a href ng-if=\"auth.isAtleast('inventory')\" e-ng-options=\"obj for obj in ynOptions\"  editable-radiolist=\"tree.powerline\">{{tree.powerline || \"(not specified)\"}}</a>\n" +
    "                            <span ng-if=\"!auth.isAtleast('inventory')\" e-ng-options=\"obj for obj in ynOptions\">{{tree.powerline || \"(not specified)\"}}</span>\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"tree.mode!='edit'\" class=\"pullleft centerText\">&nbsp; {{tree.powerline}}</div>\n" +
    "                    </dd>\n" +
    "                    <dt>Near building?</dt>\n" +
    "                    <dd>\n" +
    "                        <div ng-if=\"tree.mode=='edit'\" class=\"pullright centerText\">\n" +
    "                            <a href ng-if=\"auth.isAtleast('inventory')\" e-ng-options=\"obj for obj in ynOptions\"  editable-radiolist=\"tree.building\">{{tree.building || \"(not specified)\"}}</a>\n" +
    "                            <span ng-if=\"!auth.isAtleast('inventory')\" e-ng-options=\"obj for obj in ynOptions\">{{tree.building || \"(not specified)\"}}</span>\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"tree.mode!='edit'\" class=\"pullleft centerText\">&nbsp; {{tree.building}}</div>\n" +
    "                    </dd>\n" +
    "                    <dt>Hardscape damage?</dt>\n" +
    "                    <dd>\n" +
    "                        <div ng-if=\"tree.mode=='edit'\" class=\"pullright centerText\">\n" +
    "                            <a href ng-if=\"auth.isAtleast('inventory')\" e-ng-options=\"obj for obj in ynpOptions\"  editable-radiolist=\"tree.caDamage\">{{tree.caDamage || \"(not specified)\"}}</a>\n" +
    "                            <span ng-if=\"!auth.isAtleast('inventory')\" e-ng-options=\"obj for obj in ynpOptions\">{{tree.caDamage || \"(not specified)\"}}</span>\n" +
    "                        </div>\n" +
    "                        <div ng-if=\"tree.mode!='edit'\" class=\"pullleft centerText\">&nbsp; {{tree.caDamage}}</div>\n" +
    "                    </dd>\n" +
    "                </dl>\n" +
    "                <div class=\"clearfix\"></div>\n" +
    "                <h3>Notes <span ng-if=\"tree.mode=='edit'\">(click to edit)</span></h3>\n" +
    "                <a href=\"#\" editable-textarea=\"tree.notes\" e-rows=\"3\" e-cols=\"40\">\n" +
    "                    <pre>{{ tree.notes || '(no notes)' }}</pre>\n" +
    "                </a>\n" +
    "                <br/><br/>\n" +
    "\n" +
    "                <div class='table-responsive'>\n" +
    "                    <table class='table table-striped'>\n" +
    "                        <thead>\n" +
    "                        <tr>\n" +
    "                            <th colspan=\"4\">Recommendations/History</th>\n" +
    "                            <th ng-if=\"auth.isAtleast('inventory')\" align='right'>\n" +
    "                                <a href ng-click=\"addTreeRec()\" class=\"fa fa-plus-square _size10\"></a>\n" +
    "                            </th>\n" +
    "                        </tr>\n" +
    "                        <thead>\n" +
    "                        <tbody>\n" +
    "                        <tr id=\"treeHistoryItem\" ng-repeat=\"o in tree.history\" class=\"hoverHotspot\">\n" +
    "                            <td width='44%'>\n" +
    "                                <span ng-if=\"!auth.isAtleast('inventory')\" ng-bind=\"o.treatmentTypeID|treatmentTypeID2Name:this\"></span>\n" +
    "                                <a ng-if=\"auth.isAtleast('inventory')\" href e-ng-options='t.treatmentTypeID as t.treatmentType for t in initData.filters.treatments' editable-select='o.treatmentTypeID'\n" +
    "                                   onaftersave=\"updateTreatmentCode(o)\">\n" +
    "                                    {{o.treatmentTypeID|treatmentTypeID2Name:this}}\n" +
    "                                </a>\n" +
    "                            </td>\n" +
    "                            <td width='34%'>\n" +
    "                                <span ng-if=\"!auth.isAtleast('inventory')\" ng-bind=\"o.treatmentStatusCode|treatmentStatusName:this\"></span>\n" +
    "                                <a ng-if=\"auth.isAtleast('inventory')\" href e-ng-options='t.treatmentStatusCode as t.treatmentStatus for t in initData.treatmentStatuses' editable-select='o.treatmentStatusCode'>\n" +
    "                                    {{o.treatmentStatusCode|treatmentStatusName:this}}\n" +
    "                                </a>\n" +
    "                            </td>\n" +
    "                            <td>\n" +
    "                                <span ng-if=\"!auth.isAtleast('inventory')\" ng-bind=\"o.year\"></span>\n" +
    "                                <a ng-if=\"auth.isAtleast('inventory')\" href e-ng-options='y for y in yearOptions' editable-select='o.year'>\n" +
    "                                    {{o.year}}\n" +
    "                                </a>\n" +
    "                            </td>\n" +
    "                            <td>\n" +
    "                                        <span ng-if=\"!auth.isAtleast('inventory')\" ng-show=\"o.price !== null && o.price\">\n" +
    "                                            ${{o.price|formatPrice}}\n" +
    "                                        </span>\n" +
    "                                <a ng-if=\"auth.isAtleast('inventory')\" href editable-text='o.price' ng-show=\"o.price !== null && o.price\">\n" +
    "                                    ${{o.price|formatPrice}}\n" +
    "                                </a>\n" +
    "                            </td>\n" +
    "                            <td align='right'>\n" +
    "                                <a ng-if=\"auth.isAtleast('inventory')\" ng:cloak ng-show=\"auth.isAtleast('inventory')\" href ng-click=\"removeTreeRec(o.treeHistoryID,o.$$hashKey)\" class='fa fa-times _red _size5' ></a>\n" +
    "                            </td>\n" +
    "                        </tr>\n" +
    "                        </tbody>\n" +
    "                    </table>\n" +
    "                </div>\n" +
    "\n" +
    "                <div ng-if=\"tree.mode!='rollover'\" class=''>\n" +
    "                    <button class='navButton' ng-click=\"save();\">Save</button>\n" +
    "                    &nbsp;<a ng-click=\"onCancel()\" bs-tooltip class='hand' title=\"Hotkey: Press Escape to cancel\">Cancel</a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/treesRightBlock/override.treatment/override.treatment.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/treesRightBlock/override.treatment/override.treatment.tpl.html",
    "<span>\n" +
    "    <button class=\"btn btn-default\" ng-model=\"codes\" multiple max-length=0 all-none-buttons=1 ng-options=\"t[field] as t.treatmentType for t in treatments\" bs-select placeholder=\"Override Recommended Treatment\" onclick=\"return false;\">\n" +
    "        Treatments <span class=\"caret\"></span>\n" +
    "    </button>\n" +
    "    <a ng-if=\"codes.length\" class='fa fa-times _red _size8 hand' style='padding-left:.2em;' ng-click='clearCodes()'></a>\n" +
    "</span>\n" +
    "");
}]);

angular.module("js/common/directives/treesRightBlock/sites.list/sites.list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/treesRightBlock/sites.list/sites.list.tpl.html",
    "<div class=\"tree-list-outer\" id=\"tree-list-container\">\n" +
    "    <table class=\"tree-list-container\">\n" +
    "        <tbody>\n" +
    "        <tr bindonce ng-repeat=\"site in filteredSites\" ng-show=\"site.siteName\">\n" +
    "            <td class=\"td-check\">\n" +
    "                <input type=\"checkbox\" checklist-model=\"selectedSites\" checklist-value=\"site.siteID\" id=\"site-result-checkbox-{{site.siteID}}\">\n" +
    "            </td>\n" +
    "            <td>\n" +
    "                <label for=\"site-result-checkbox-{{site.siteID}}\">\n" +
    "                    <h6>{{site.siteName}}</h6>\n" +
    "                    <span ng-show=\"site.matchedTreesCount\">{{site.matchedTreesCount}} trees match filter</span>\n" +
    "                    <div ng-show=\"site.estimatePrice\" style=\"font-weight: bold; font-size: 12px; margin-top: 5px;\">\n" +
    "                        ${{site.estimatePrice | formatPrice}}\n" +
    "                    </div>\n" +
    "                </label>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/treesRightBlock/sites.selector/sites.selector.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/treesRightBlock/sites.selector/sites.selector.tpl.html",
    "<table class=\"tree-list-container\">\n" +
    "    <thead>\n" +
    "    <tr>\n" +
    "        <td>\n" +
    "            <div class=\"btn-group\">\n" +
    "                <button type=\"button\" class=\"btn btn-default btn-xs dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "                    <i class=\"fa fa-check-square-o\"></i>\n" +
    "                    <span class=\"caret\"></span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li><a href ng-click=\"toggle(true)\">ALL</a></li>\n" +
    "                    <li><a href ng-click=\"toggle(false)\">NONE</a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </td>\n" +
    "        <td colspan=\"3\"><h6>{{selected.length}} of {{items.length}} {{name}} selected </h6></td>\n" +
    "    </tr>\n" +
    "    </thead>\n" +
    "</table>\n" +
    "");
}]);

angular.module("js/common/directives/treesRightBlock/trees.list/trees.list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/treesRightBlock/trees.list/trees.list.tpl.html",
    "<div class=\"tree-list-outer\" id=\"tree-list-container\">\n" +
    "    <table class=\"tree-list-container\">\n" +
    "        <tbody>\n" +
    "        <tr bindonce ng-repeat=\"tree in trees\" ng-if=\"tree.hide != true\" id=\"tree-result-item-row-{{tree.treeID}}\"\n" +
    "            ng-mouseover=\"onTreeResultMouseOver(tree)\" ng-mouseleave=\"onTreeResultMouseLeave(tree)\">\n" +
    "            <td class=\"td-check\">\n" +
    "                <input type=\"checkbox\" checklist-model=\"selectedTrees\" checklist-value=\"tree.treeID\"\n" +
    "                       id=\"tree-result-checkbox-{{tree.treeID}}\">\n" +
    "            </td>\n" +
    "            <td class=\"td-img\">\n" +
    "                <label for=\"tree-result-checkbox-{{tree.treeID}}\">\n" +
    "                    <div tooltip-html-unsafe=\"{{listingPopoverContent}}\" popover-trigger=\"mouseenter\">\n" +
    "                        <img bo-src=\"tree.imgSm\" data-treeID='{{tree.treeID}}'\n" +
    "                             ng-click=\"onTreeImageRollover(tree.treeID);\"\n" +
    "                             ng-mouseover=\"onTreeImageRollover(tree.treeID);\"\n" +
    "                             ng-mouseleave=\"onTreeImageRollout(tree.treeID);\"\n" +
    "                             data-imgMed=\"{{tree.imgMed}}\"\n" +
    "                             style=\"border:2px solid #{{colors.bg[tree.colorID]}}\"/>\n" +
    "                    </div>\n" +
    "                </label>\n" +
    "            </td>\n" +
    "            <td>\n" +
    "                <label for=\"tree-result-checkbox-{{tree.treeID}}\">\n" +
    "                    <h6>{{tree.commonName}}</h6>\n" +
    "\n" +
    "                    <p>{{tree.dbhID|dbhID2Name:this}}</p>\n" +
    "                    <small><span class='recYear {{tree.history|showRecoYear:\"css\"}}'\n" +
    "                                 ng-bind-html=\"tree.history|showRecoYear\"></span>\n" +
    "                        <span bo-text=\"'(ID:' + tree.treeID + ')'\"></span></small>\n" +
    "                </label>\n" +
    "            </td>\n" +
    "            <td class=\"td-action\" style=\"padding: 0px;\">\n" +
    "                <label for=\"tree-result-checkbox-{{tree.treeID}}\">\n" +
    "                    <a href='#/tree_edit/{{tree.treeID}}' bs-tooltip title=\"View/Edit Details\" style=\"padding: 5px;\">\n" +
    "                        <i class=\"fa fa-pencil\"></i>\n" +
    "                    </a>\n" +
    "                </label>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/common/directives/treesRightBlock/trees.selector/trees.selector.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/common/directives/treesRightBlock/trees.selector/trees.selector.tpl.html",
    "<table class=\"tree-list-container\">\n" +
    "    <thead>\n" +
    "    <tr>\n" +
    "        <td>\n" +
    "            <div class=\"btn-group\">\n" +
    "                <button type=\"button\" class=\"btn btn-default btn-xs dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "                    <i class=\"fa fa-check-square-o\"></i>\n" +
    "                    <span class=\"caret\"></span>\n" +
    "                </button>\n" +
    "                <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                    <li><a href ng-click=\"toggleCheckedTrees({ opt: true })\">ALL</a></li>\n" +
    "                    <li><a href ng-click=\"toggleCheckedTrees({ opt: 'thisYear' })\">ALL {{thisYear}}</a></li>\n" +
    "                    <li><a href ng-click=\"toggleCheckedTrees({ opt: false })\">NONE</a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </td>\n" +
    "        <td colspan=\"3\"><h6>{{selectedTrees.length}} of {{count}} trees selected </h6></td>\n" +
    "    </tr>\n" +
    "    </thead>\n" +
    "</table>\n" +
    "");
}]);

angular.module("js/estimates/estimates.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/estimates/estimates.tpl.html",
    "<div ng-include=\"'js/trees/action.tpl.html'\" ng-if=\"auth.is('customer')\"></div>\n" +
    "<div class='container' ng-controller=\"EstimatesListCtrl\">    \n" +
    "\n" +
    "	<div ng-if=\"auth.isAtleast('inventory')\">\n" +
    "		<div class='pull-right topMargin5'>\n" +
    "			<div class=\"btn-group\" bs-radio-group id=\"estimatesFilters\" ng-model=\"status_filters_2\">\n" +
    "				<label ng-click=\"setStatusFilter('all')\"class=\"btn btn-default\">\n" +
    "                    <input type=\"radio\" value=\"all\"> All</label>\n" +
    "				<label ng-click=\"setStatusFilter('sent')\" class=\"btn btn-default\">\n" +
    "                    <input type=\"radio\" value=\"sent\"> Sent</label>\n" +
    "				<label ng-click=\"setStatusFilter('approved')\" class=\"btn btn-default\">\n" +
    "                    <input type=\"radio\" value=\"approved\"> Approved</label>\n" +
    "				<label ng-click=\"setStatusFilter('completed')\" class=\"btn btn-default\">\n" +
    "                    <input type=\"radio\" value=\"completed\"> Completed</label>\n" +
    "                <span class=\"lnk leftSpace10\">\n" +
    "                    <a href ng-click='reset()' bs-tooltip title='Reset'>\n" +
    "                        <b><i class=\"fa fa-rotate-left _red _size5 topMargin5 hoverHighlight\"></i></b>\n" +
    "                    </a>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "		</div>\n" +
    "		<br>\n" +
    "		<input type='text' ng-model='data.filterTextEntry' size=20 placeholder='Search'> \n" +
    "		<a ng-if=\"data.filterTextEntry.length\" ng-click=\"data.filterTextEntry=''\" class='fa fa-times _red _size5 hand'></a>\n" +
    "		<span class='gray' ng-if='data.getSiteCount()'> &nbsp; {{data.getSiteCount()}} properties being displayed.</span>\n" +
    "	</div>\n" +
    "	<BR><BR>\n" +
    "\n" +
    "    <div class='table-responsive' ng-if=\"displayedEstimates.length > 0\">\n" +
    "        <table class='table table-striped' id='estimatesList'>\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th class=\"td-check clickable-header text-center\" ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                        <input type=\"checkbox\" ng-checked=\"checkedEstimates.selectAll\" ng-click=\"toggleAllEstimatesSelection()\">\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('reportID')\">\n" +
    "                        ID <i ng-class=\"sh.columnClass('name')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('name')\">\n" +
    "                        Estimate Name <i ng-class=\"sh.columnClass('name')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('siteName')\">\n" +
    "                        Site Name <i ng-class=\"sh.columnClass('siteName')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th ng-if=\"auth.isAtleast('inventory')\" class=\"clickable-header\" ng-click=\"sh.sortByColumn('sales_email')\">\n" +
    "                        Sales Rep <i ng-class=\"sh.columnClass('sales_email')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('total_price')\">\n" +
    "                        Total <i ng-class=\"sh.columnClass('total_price')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('status')\">\n" +
    "                        Status <i ng-class=\"sh.columnClass('status')\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th ng-if=\"auth.isAtleast('inventory')\" class=\"clickable-header\" ng-click=\"sortDateCol()\">\n" +
    "                        {{getDateColHeader()}} <i ng-class=\"getDateColClass()\" class='silver'></i>\n" +
    "                    </th>\n" +
    "                    <th style=\"min-width: 75px;\"></th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "\n" +
    "\n" +
    "            <tbody infinite-scroll=\"showMoreEstimates()\" infinite-scroll-distance=\"3\">\n" +
    "                <tr ng-repeat=\"e in displayedEstimates\" class='hoverHotspot' id='item_{{e.reportID}}'>\n" +
    "                    <td class=\"td-check text-center\" ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                        <input type=\"checkbox\" ng-checked=\"isEstimateSelected(e.reportID)\" ng-click=\"toggleEstimateSelection(e.reportID)\">\n" +
    "                    </td>\n" +
    "                    <td ng-bind=\"e.reportID\"></td>\n" +
    "                    <td>\n" +
    "						<span ng-if=\"auth.isAtleast('inventory')\">\n" +
    "							<a href=\"#/trees?reportID={{e.reportID}}\" ng-bind=\"e.name_short\" bs-tooltip title=\"{{e.name}}\"></a>&nbsp;\n" +
    "							<a ng-if=\"e.saveCount>1\" href='/go/estimate/revisions/{{e.reportID}}' bs-tooltip title='{{e.saveCount}} revisions'><i class='fa fa-clock-o gray'></i></a>\n" +
    "						</span>\n" +
    "						<a ng-if=\"!auth.isAtleast('inventory')\" href=\"#/estimate/{{e.hashLink}}\" ng-bind=\"e.name_short\" bs-tooltip title=\"{{e.name}}\"></a>\n" +
    "					</td>\n" +
    "                    <td>\n" +
    "						<span title=\"{{e.siteName}}\">{{e.siteName_short}}</span> &nbsp; \n" +
    "						<i site-edit-modal clients=\"initData.clients\" site-id=\"e.siteID\" \n" +
    "                           class=\"fa fa-pencil _grey _size4 hoverDisplay\" title=\"Edit\" bs-tooltip style=\"cursor: pointer;\"></i>\n" +
    "					</td>\n" +
    "                    <td ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                        <a href e-ng-options=\"obj.id as obj.email for obj in salesUsers\"\n" +
    "                           onshow=\"getSalesUsers()\"\n" +
    "                           editable-select=\"e.sales_userID\"\n" +
    "                           onaftersave=\"updateEstimate(e)\">\n" +
    "                            {{e.sales_email_short}}\n" +
    "                        </a>\n" +
    "                    </td>\n" +
    "                    <td>${{e.total_price|formatPrice}}</td>\n" +
    "                    <td>\n" +
    "						<button ng-if=\"auth.isAtleast('inventory')\" class=\"btn btn-default\" ng-class=\"'clr-'+e.status\" \n" +
    "								ng-model=\"e.status\" ng-change=\"setReportStatus(e,this)\"\n" +
    "								placeholder=\"{{e.status}}\"\n" +
    "								ng-options=\"s.id as s.txt for s in data.statuses(e.status)\"\n" +
    "								bs-select onclick=\"return false;\">\n" +
    "						</button> \n" +
    "						<!--<a href='#/estimate/{{e.hashLink}}' ng-if=\"!auth.isAtleast('inventory')\" ng-bind='e.status' ng-class='\"small-tag \"+e.status'-->\n" +
    "							\n" +
    "					</td>\n" +
    "                    <td ng-if=\"auth.isAtleast('inventory')\">{{getTstamp(e) | formatDate}}</td>\n" +
    "                    <td>\n" +
    "                        <a ng-if=\"auth.isAtleast('inventory')\"\n" +
    "                           delete-with-confirm-button\n" +
    "                           type=\"estimate\"\n" +
    "                           item-id=\"{{e.reportID}}\"\n" +
    "                           active-popover=\"activePopover\"\n" +
    "                           on-confirm-callback=\"deleteCurrentItem()\"\n" +
    "                           class=\"fa fa-times _red _size7 hand hoverDisplay\"\n" +
    "                           bs-tooltip title=\"Delete\"\n" +
    "                           style=\"text-decoration: none;\"></a>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"action-float-bar\" ng-show=\"checkedEstimates.ids.length > 0\">\n" +
    "        <div class=\"container\">\n" +
    "            <div class=\"action-float-bar-inner\">\n" +
    "                <i class='fa fa-mail-forward fa-rotate-270 white'></i> &nbsp;\n" +
    "                <a href=\"#\" ng:cloak ng-click=\"duplicate($event)\" style=\"margin-left: 50px;\">\n" +
    "                    Duplicate\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/main/alert.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/main/alert.tpl.html",
    "<div class='alert-container'>\n" +
    "<div class=\"alert alert-inner\" tabindex=\"-1\" ng-class=\"[type ? 'alert-' + type : null]\">\n" +
    "  <button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "  <strong ng-bind=\"title\"></strong>&nbsp;<span ng-bind-html=\"content\"></span>\n" +
    "</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/main/header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/main/header.tpl.html",
    "<div class=\"header-inner\">\n" +
    "	<div class=\"cnt-logo\"><img src=\"img/entity/logo-{{entityID}}.png\"></div>\n" +
    "	<div class=\"nav-container\">\n" +
    "		<div ng-if=\"!auth.is('customer') && auth.isSignedIn()\">\n" +
    "			<div ng-include=\"'js/main/nav.staff.tpl.html'\"></div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	<div class='header-nav cnt-actions'>\n" +
    "		<div ng-if=\"auth.isSignedIn()\">\n" +
    "			<span>\n" +
    "				<b>{{auth.getLoginName()}}</b> \n" +
    "				<a ng-if=\"auth.isAtleast('inventory')\" href='/go/dash?token={{auth.data().token}}' target='_new' bs-tooltip title='Dashboard'>\n" +
    "					<span class=\"fa-stack\">\n" +
    "					  	<i class=\"fa fa-square fa-stack-2x\"></i>\n" +
    "						<i class=\"fa fa-dashboard fa-stack-1x fa-inverse\"></i>\n" +
    "					</span></a>\n" +
    "				<a href ng-click=\"auth.signOut()\" bs-tooltip title='Sign Out'>\n" +
    "					<span class=\"fa-stack\">\n" +
    "					  	<i class=\"fa fa-square fa-stack-2x\"></i>\n" +
    "						<i class=\"fa fa-sign-out fa-stack-1x fa-inverse\"></i>\n" +
    "					</span></a>\n" +
    "			</span>\n" +
    "		</div>\n" +
    "	</div>	\n" +
    "	<div class=\"clearfix\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/main/main.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/main/main.tpl.html",
    "main.tpl\n" +
    "");
}]);

angular.module("js/main/nav.staff.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/main/nav.staff.tpl.html",
    "<nav>\n" +
    "	<ul>\n" +
    "		<li><a href=\"#/trees\" title=\"Trees\" ng-class=\"{active: isActiveTab('trees')}\">\n" +
    "            <i class=\"fa fa-tree\"></i><span class=\"text\">Trees</span>\n" +
    "        </a></li>\n" +
    "		<li><a href=\"#/estimates\" title=\"Estimates\" ng-class=\"{active: isActiveTab('estimates')}\">\n" +
    "            <i class=\"fa fa-dollar\"></i><span class=\"text\">Estimates</span>\n" +
    "        </a></li>\n" +
    "		<li><a href=\"#/sites\" title=\"Properties\" ng-class=\"{active: isActiveTab('sites')}\">\n" +
    "            <i class=\"fa fa-home\"></i><span class=\"text\">Properties</span>\n" +
    "        </a></li>\n" +
    "		<li><a href=\"#/clients\" title=\"Clients\" ng-class=\"{active: isActiveTab('clients')}\">\n" +
    "            <i class=\"fa fa-user\"></i><span class=\"text\">Clients</span>\n" +
    "        </a></li>\n" +
    "	</ul>\n" +
    "</nav>	\n" +
    "");
}]);

angular.module("js/signin/signin.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/signin/signin.tpl.html",
    "<div ng-controller='SigninCtrl' class='container signin' style='width:500px; margin:50px auto;'>\n" +
    "\n" +
    "\n" +
    "<div class='panel panel-default'>\n" +
    "	<div class='panel-heading'>\n" +
    "		<h3 class='panel-title'>Sign In</h3>\n" +
    "	</div>\n" +
    "	<div class='panel-body' ng-if=\"auth.isSignedIn()\">\n" +
    "		You are signed in:  {{auth.getLoginName()}}<Br>\n" +
    "		<a href ng-click=\"goTrees()\">Continue</a> &nbsp;\n" +
    "		<a href ng-click=\"auth.signOut()\">Sign Out</a> \n" +
    "	</div>\n" +
    "	<div class='panel-body' ng-if=\"!auth.isSignedIn()\">\n" +
    "		<form ng-submit=\"signIn();\">\n" +
    "		<input type=\"text\" placeholder=\"email\" ng-model=\"login.email\" required><br>\n" +
    "		<input type=\"password\" placeholder=\"password\" ng-model=\"login.pswd\" required><BR><BR>\n" +
    "		<button  type=\"submit\" value=\"Login\" class='btn btn-primary topSpace10' ng-click=\"signIn()\"\n" +
    "			ng-disabled='login.btnDisabled'	>Sign In</button>\n" +
    "		<BR><BR>\n" +
    "		<a href ng-click=\"forgotPassword()\">I forgot my password</a>\n" +
    "		</form>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/sites/edit.mobile.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/sites/edit.mobile.tpl.html",
    "<div ng-controller='EditSiteCtrl' class=\"treeEditBox mobile-view-container\" >\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"content\">\n" +
    "            <h2>\n" +
    "                <span ng-if=\"mode=='new'\">New Site</span>\n" +
    "                <span ng-if=\"mode=='edit'\">Site - {{site.siteName}}</span>\n" +
    "            </h2>\n" +
    "            <div class=\"col-sm-6 col\">\n" +
    "                <form editable-form class=\"form-inline\" ng-submit=\"saveSite()\">\n" +
    "                    <div class=\"label-prop\">Client:</div>\n" +
    "                    <div class=\"edit-prop\">\n" +
    "                            <!--<a href e-ng-options=\"c.clientID as c.clientName for c in initData.clients\"-->\n" +
    "                               <!--editable-select=\"site.clientID\">-->\n" +
    "                                <!--{{ site.clientID | clientName:this  || \"(not specified)\"}}-->\n" +
    "                            <!--</a>-->\n" +
    "                        <button class=\"btn btn-default\" ng-model=\"site.clientID\" ng-options=\"c.clientID as c.clientName for c in initData.clients\"\n" +
    "                                bs-select placeholder=\"Which client owns this property?\" onclick=\"return false;\" required>\n" +
    "                            Client <span class=\"caret\"></span>\n" +
    "                        </button>\n" +
    "                        <button class=\"btn btn-default\" ng-show=\"site.clientID\" ng-click=\"copyAddressFromClientToNewSite(site.clientID)\"\n" +
    "                                onclick=\"return false;\"><i class='fa fa-copy'></i></button>\n" +
    "                    </div>\n" +
    "                    <br/>\n" +
    "                    <div class=\"label-prop\">Name:</div>\n" +
    "                    <div class=\"edit-prop\">\n" +
    "                            <input type=\"text\" ng-model=\"site.siteName\" >\n" +
    "\n" +
    "                    </div>\n" +
    "                    <br/>\n" +
    "                    <div class=\"label-prop\">Address:</div>\n" +
    "                    <div class=\"edit-prop\">\n" +
    "                            <input type=\"text\" ng-model=\"site.street\" >\n" +
    "\n" +
    "                    </div>\n" +
    "                    <br/>\n" +
    "                    <div class=\"label-prop\">City:</div>\n" +
    "                    <div class=\"edit-prop\">\n" +
    "                            <input type=\"text\" ng-model=\"site.city\" >\n" +
    "\n" +
    "                    </div>\n" +
    "                    <br/>\n" +
    "                    <div class=\"label-prop\">State:</div>\n" +
    "                    <div class=\"edit-prop\">\n" +
    "                            <input type=\"text\" ng-model=\"site.state\" >\n" +
    "\n" +
    "                    </div>\n" +
    "                    <br/>\n" +
    "                    <div class=\"label-prop\">Zip:</div>\n" +
    "                    <div class=\"edit-prop\">\n" +
    "                            <input type=\"text\" ng-model=\"site.zip\" >\n" +
    "                    </div>\n" +
    "\n" +
    "                    <br/>\n" +
    "                    <div class='leftSpace10'>\n" +
    "                        <span ng-show=\"site.siteID\">\n" +
    "                            <input type=\"submit\" value=\"UPDATE\" class='btn btn-primary'>\n" +
    "                            <button type=\"button\" class=\"btn btn-info\" site=\"site\" ng-click=\"editUsers()\">\n" +
    "                                EDIT USERS\n" +
    "                            </button>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <span ng-show=\"!site.siteID\">\n" +
    "                            <button type=\"button\" class='btn btn-primary' ng-click=\"saveSite(true)\" site=\"site\">\n" +
    "                                SAVE\n" +
    "                            </button>\n" +
    "                        </span>\n" +
    "\n" +
    "                        <button type=\"button\" class='btn btn-primary' ng-click=\"newSite()\">\n" +
    "                            RESET\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "\n" +
    "                </form>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/sites/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/sites/edit.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "\n" +
    "			<div class=\"modal-header\" ng-show=\"title\">\n" +
    "				<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "				<h4 class=\"modal-title\" ng-bind=\"title\"></h4>\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"mode!='edit'\">\n" +
    "				<form class=\"form-inline\" ng-submit=\"saveNewSite()\">\n" +
    "					<div class='panel panel-default bottomMargin0'>\n" +
    "						<div class='panel-heading'>\n" +
    "							<h3 class='panel-title'>New Property</h3>\n" +
    "						</div>\n" +
    "						<div class='panel-body'>\n" +
    "							<select class='styled-select' ng-model=\"newSite.clientID\">\n" +
    "								<option value=\"\">Client</option>\n" +
    "								<option ng-repeat=\"client in initData.clients\" value=\"{{client.clientID}}\">{{client.clientName}}</option>\n" +
    "							</select> (choose a client this property belongs to)<BR>\n" +
    "							<input type=\"text\" placeholder=\"Property Name\" ng-model=\"newSite.siteName\" required size=\"40\" auto-focus><br>\n" +
    "							<input type=\"text\" placeholder=\"Address\" ng-model=\"newSite.street\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"City\" ng-model=\"newSite.city\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"State\" ng-model=\"newSite.state\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Zip\" ng-model=\"newSite.zip\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Contact Name\" ng-model=\"newSite.contact\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Phone\" ng-model=\"newSite.contactPhone\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Email Address\" ng-model=\"newSite.contactEmail\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Regional Manager\" ng-model=\"newSite.regionalMgr\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Regional Email\" ng-model=\"newSite.regionalEmail\" size=\"40\"><br>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"modal-footer topMargin0\">\n" +
    "						<input type=\"submit\" value=\"SAVE\" class='btn btn-primary'>\n" +
    "						<button type=\"button\" class=\"btn btn-default \" ng-click=\"$hide()\">CLOSE</button>\n" +
    "					</div>\n" +
    "				</form>\n" +
    "			</div>\n" +
    "\n" +
    "			<div ng-if=\"mode=='edit'\">\n" +
    "				<form class=\"form-inline\" ng-submit=\"saveExistingSite()\">\n" +
    "					<div class='panel panel-default bottomMargin0'>\n" +
    "						<div class='panel-heading'>\n" +
    "							<h3 class='panel-title'>Edit Property</h3>\n" +
    "						</div>\n" +
    "						<div class='panel-body'>\n" +
    "							<select class='styled-select' ng-model=\"site.clientID\"\n" +
    "								<option value=\"\">Client</option>\n" +
    "								<option ng-repeat=\"client in initData.clients\" ng-selected=\"{{client.clientID}}\" value=\"{{client.clientID}}\">{{client.clientName}}</option>\n" +
    "							</select> (choose a client this property belongs to)<br>\n" +
    "							<input type=\"text\" placeholder=\"Property Name\" ng-model=\"site.siteName\" required size=\"40\" auto-focus><br>\n" +
    "							<input type=\"text\" placeholder=\"Address\" ng-model=\"site.street\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"City\" ng-model=\"site.city\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"State\" ng-model=\"site.state\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Zip\" ng-model=\"site.zip\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Contact Name\" ng-model=\"site.contact\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Phone\" ng-model=\"site.contactPhone\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Email\" ng-model=\"site.contactEmail\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Regional Manager\" ng-model=\"site.regionalMgr\" size=\"40\"><br>\n" +
    "							<input type=\"text\" placeholder=\"Regional Email\" ng-model=\"site.regionalEmail\" size=\"40\"><br>\n" +
    "						</div>\n" +
    "					</div>\n" +
    "					<div class=\"modal-footer topMargin0\">\n" +
    "						<input type=\"submit\" value=\"UPDATE\" class='btn btn-primary'>\n" +
    "						<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">CLOSE</button>\n" +
    "					</div>\n" +
    "				</form>\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/sites/siteUsers.mobile.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/sites/siteUsers.mobile.tpl.html",
    "<div ng-controller='SiteUsersCtrl' class=\"treeEditBox mobile-view-container\" >\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"content\">\n" +
    "            <h2>\n" +
    "                <span>Add/Edit users for {{site.siteName}}</span>\n" +
    "            </h2>\n" +
    "            <div class=\"col-sm-6 col\">\n" +
    "                <div class=\"row\" style=\"margin-top: 12px;\">\n" +
    "                    <div class=\"col-sm-8\" style=\"font-weight: bold;\">\n" +
    "                        Property contacts for {{site.siteName}}\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"row hoverHotspot\" ng-repeat=\"c in contacts\"\n" +
    "                     style=\"margin: 9px 24px 3px 1px; padding:8px 2px 8px 8px; background:#eee;\"\n" +
    "                     ng-show=\"contacts.length > 0\">\n" +
    "                    <a ng-click=\"unassign(c.userID, c.email, 'customer')\" class=\"hand hoverDisplay\" bs-tooltip\n" +
    "                       title=\"Remove assignment\" style=\"text-decoration: none; \">\n" +
    "                        <i class=\"fa fa-times _red _size5\"></i></a> &nbsp;\n" +
    "                    {{c.email}} - {{c.fName}} {{c.lName}}\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"row\" style=\"margin: 15px 2px 10px 5px;\">\n" +
    "                    <form ng-submit=\"addNewSiteContact($event)\">\n" +
    "                        <input type=\"text\" required placeholder=\"Email\" style=\"width: 135px;\" ng-model=\"newContact.email\" id='newContactEmail'\n" +
    "                               user-auto-complete=\"contactSelect\" user-roles=\"customer\" user-ignore=\"contacts\" bs-typeahead>\n" +
    "                        <input type=\"text\" placeholder=\"First name\" required style=\"width:90px\" ng-model=\"newContact.fName\">\n" +
    "                        <input type=\"text\" placeholder=\"Last name\" required style=\"width:90px;\" ng-model=\"newContact.lName\">\n" +
    "                        <input type=\"text\" placeholder=\"Phone\" style=\"width:105px;\" ng-model=\"newContact.phone\">\n" +
    "                        <button ng-click=\"addNewSiteContact($event);\" type='button' class='btn btn-primary'>Save</button>\n" +
    "                    </form>\n" +
    "                </div>\n" +
    "\n" +
    "                <br/> <!-- |||||||||||||||||-->\n" +
    "\n" +
    "                <div class=\"row\" style=\"margin-top: 12px;\">\n" +
    "                    <div class=\"col-sm-8\" style=\"font-weight: bold;\">\n" +
    "                        AplusTree Reps\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"row hoverHotspot\" ng-repeat=\"r in reps\"\n" +
    "                     style=\"margin: 9px 24px 3px 1px; padding:8px 2px 8px 8px; background:#eee;\"\n" +
    "                     ng-show=\"reps.length > 0\">\n" +
    "                    <a ng-click=\"unassign(r.userID, r.email, 'staff')\" class=\"hand hoverDisplay\" bs-tooltip\n" +
    "                       title=\"Remove assignment\" style=\"text-decoration: none; \">\n" +
    "                        <i class=\"fa fa-times _red _size5\"></i></a> &nbsp;\n" +
    "                    {{r.email}} - {{r.fName}} {{r.lName}}  &nbsp; &nbsp;\n" +
    "                    <span style='color:#fff;background:#333; padding:4px 8px; text-transform:uppercase; font-size:.7em'>{{r.role}}</span>\n" +
    "                </div>\n" +
    "                <div class=\"row\" style=\"margin: 15px 2px 10px 5px;\">\n" +
    "                    <form ng-submit=\"addNewRepContact($event)\">\n" +
    "                        <input type=\"text\" required placeholder=\"Email\" style=\"width: 105px;\" ng-model=\"newRep.email\" id='newRepEmail'\n" +
    "                               user-auto-complete=\"repSelect\" user-roles=\"sales,inventory,admin\" user-ignore=\"reps\" bs-typeahead>\n" +
    "                        <input type=\"text\" placeholder=\"First name\" required style=\"width:80px\" ng-model=\"newRep.fName\">\n" +
    "                        <input type=\"text\" placeholder=\"Last name\" required style=\"width:80px;\" ng-model=\"newRep.lName\">\n" +
    "                        <input type=\"text\" placeholder=\"Phone\" style=\"width:105px;\" ng-model=\"newRep.phone\">\n" +
    "                        <select ng-model=\"newRep.role\" required>\n" +
    "                            <option disabled value=\"\">Role</option>\n" +
    "                            <option value=\"sales\">Sales</option>\n" +
    "                            <option value=\"inventory\">Inventory</option>\n" +
    "                        </select> &nbsp;\n" +
    "                        <button ng-click=\"addNewSiteRep($event);\" type='button' class='btn btn-primary'>Save</button>\n" +
    "                    </form>\n" +
    "                </div>\n" +
    "\n" +
    "                <br/>\n" +
    "                <div class='leftSpace10'>\n" +
    "                    <button type=\"button\" class='btn btn-info' ng-click=\"finishUserEdit('site_edit')\">Add Another Property</button>\n" +
    "                    <button type=\"button\" class='btn btn-info' ng-click=\"finishUserEdit('client_edit')\">Add Another Client</button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/sites/sites.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/sites/sites.tpl.html",
    "<div class='container' ng-controller=\"SitesCtrl\">\n" +
    "    <button type=\"button\"\n" +
    "            ng:cloak\n" +
    "            data-placement=\"center\"\n" +
    "            class=\"btn btn-lg btn-primary pull-right topMargin5 bottomMargin5\"\n" +
    "            style=\"max-width: 100%; width: auto;\"\n" +
    "            site-edit-modal\n" +
    "            on-save=\"refreshSites\"\n" +
    "            clients=\"initData.clients\"\n" +
    "            mode=\"new\"\n" +
    "            data-animation=\"am-fade-and-scale\">New Property</button>\n" +
    "	<br>\n" +
    "	<input type='text' ng-model='data.filterTextEntry' size=20 placeholder='Search'> \n" +
    "	<a ng-if=\"data.filterTextEntry.length\" ng-click=\"data.filterTextEntry=''\" class='fa fa-times _red _size5 hand'></a>\n" +
    "	<span class='gray' ng-if='data.getSiteCount()'> &nbsp; {{data.getSiteCount()}} properties being displayed.</span>\n" +
    "\n" +
    "    <div class='table-responsive' ng-if=\"displayedSites.length > 0\">\n" +
    "        <table class='table table-striped'>\n" +
    "            <thead>\n" +
    "            <tr>\n" +
    "                <th class=\"td-check clickable-header text-center\" ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                    <input type=\"checkbox\" ng-checked=\"allSites.selected\" ng-click=\"toggleAllSitesSelection()\">\n" +
    "                </th>\n" +
    "                <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('siteID')\">\n" +
    "                    ID <i ng-class=\"sh.columnClass('siteID')\" class='silver'></i>\n" +
    "                </th>\n" +
    "                <th class=\"clickable-header\" ng-click=\"sh.sortByColumn('siteName')\">\n" +
    "                    Name <i ng-class=\"sh.columnClass('siteName')\" class='silver'></i>\n" +
    "                </th>\n" +
    "                <th class=\"clickable-header\" ng-click=\"sh.sortByColumn(['city', 'state'])\">\n" +
    "                        Location <i ng-class=\"sh.columnClass(['city', 'state'])\" class='silver'></i>\n" +
    "				</th>\n" +
    "				<th class=\"clickable-header\" ng-click=\"sh.sortByColumn('tstamp_created')\">\n" +
    "					Create Date <i ng-class=\"sh.columnClass('tstamp_created')\" class='silver'></i>\n" +
    "				</th>\n" +
    "				<th class=\"clickable-header\" ng-click=\"sh.sortByColumn('treeCount')\">\n" +
    "					<i class='fa fa-tree' bs-tooltip title='Total Tree Count'></i> <i ng-class=\"sh.columnClass('treeCount')\" class='silver'></i>\n" +
    "				</th>\n" +
    "				<th class=\"clickable-header\" ng-click=\"sh.sortByColumn('reportCount')\">\n" +
    "					<i class='fa fa-file-text-o' bs-tooltip title='Total Estimate Count'></i> <i ng-class=\"sh.columnClass('reportCount')\" class='silver'></i>\n" +
    "				</th>\n" +
    "				<th class=\"clickable-header\" ng-click=\"sh.sortByColumn('userCount')\">\n" +
    "					<i class='fa fa-user silver'></i> <i ng-class=\"sh.columnClass('userCount')\" class='silver'></i>\n" +
    "				</th>\n" +
    "				<th ng-if=\"auth.isAtleast('inventory')\"></th>\n" +
    "            </tr>\n" +
    "            </thead>\n" +
    "\n" +
    "\n" +
    "            <tbody infinite-scroll=\"showMoreSites()\" infinite-scroll-distance=\"3\">\n" +
    "            <tr ng-repeat=\"s in displayedSites\" ng-class=\"{active : isSelected(s.siteID)}\" class='hoverHotspot'>\n" +
    "                <td class=\"td-check text-center\" ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                    <input type=\"checkbox\" ng-checked=\"isSiteSelected(s.siteID)\" ng-click=\"toggleSiteSelection(s.siteID)\">\n" +
    "                </td>\n" +
    "                <td ng-bind=\"s.siteID\"></td>\n" +
    "                <td><a href='/#trees?siteID={{s.siteID}}'>{{s.siteName}}</a></td>\n" +
    "                <td>{{s.city}}, {{s.state}}</td>\n" +
    "                <td>{{s.tstamp_created_2}}</td>\n" +
    "                <td>{{s.treeCount}}</td>\n" +
    "                <td><a href='/#estimates?siteID={{s.siteID}}' bs-tooltip title='View estimates'>{{s.reportCount}}</a></td>\n" +
    "                <td>\n" +
    "                    <a ng-show=\"s.userCustCount>0\" site-users-edit-modal site=\"s\"\n" +
    "                       class='fa fa-user olive hand' bs-tooltip title='A CUSTOMER contact exists. Click to edit.'></a>\n" +
    "                    <a ng-show=\"s.userSalesCount>0\" site-users-edit-modal site=\"s\"\n" +
    "                       class='fa fa-user red hand' bs-tooltip title='A SALES contact exists. Click to edit.'></a>\n" +
    "                    <a ng-show=\"s.userInvCount>0\" site-users-edit-modal site=\"s\"\n" +
    "                       class='fa fa-user gray hand' bs-tooltip title='A INVENTORY contact exists. Click to edit.'></a>\n" +
    "                </td>\n" +
    "                <td ng-if=\"auth.isAtleast('inventory')\">\n" +
    "					<a ng-show=\"s.userCustCount<1 || s.userStaffCount<1\" site-users-edit-modal site=\"s\" \n" +
    "					   class=\"fa fa-frown-o _red _size6 hand\" bs-tooltip title=\"Property is missing client contacts or company sales reps!\"></a> \n" +
    "					&nbsp;\n" +
    "					<span>\n" +
    "						<i site-edit-modal clients=\"initData.clients\" site-id=\"s.siteID\" on-save=\"refreshSites\"\n" +
    "                           class=\"fa fa-pencil _grey _size6 hoverDisplay\" title=\"Edit\" bs-tooltip style=\"cursor: pointer;\"></i> &nbsp;\n" +
    "					</span>\n" +
    "                    <a ng-if=\"auth.isAtleast('inventory')\"\n" +
    "                       delete-with-confirm-button\n" +
    "                       type=\"site\"\n" +
    "                       item-id=\"s.siteID\"\n" +
    "                       active-popover=\"activePopover\"\n" +
    "                       on-confirm-callback=\"deleteCurrentItem()\"\n" +
    "                       class=\"fa fa-times _red _size6 hoverDisplay\"\n" +
    "                       bs-tooltip title=\"Delete\" style=\"text-decoration: none; cursor:pointer; cursor: hand;\">{{test.name}}</a>\n" +
    "\n" +
    "                </td>\n" +
    "            </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"action-float-bar\" ng-show=\"allSites.selectedIds.length > 0\">\n" +
    "        <div class=\"container\">\n" +
    "            <div class=\"action-float-bar-inner\">\n" +
    "				<i class='fa fa-mail-forward fa-rotate-270 white'></i> &nbsp; \n" +
    "                <a href=\"#\" ng-if=\"auth.isAtleast('inventory')\" ng:cloak site-users-multi-edit-modal\n" +
    "                   on-save=\"refreshSites()\" clients=\"initData.clients\" sites=\"initData.sites\" pre-selected=\"allSites.selectedIds\">\n" +
    "                    Assign Users\n" +
    "                </a>\n" +
    "                <a href=\"#\" ng:cloak ng-click=\"assignSelf('sales', $event)\" style=\"margin-left: 50px;\">\n" +
    "                    Assign Myself as Sales\n" +
    "                </a>\n" +
    "                <a href=\"#\" ng:cloak ng-click=\"assignSelf('inventory', $event)\" style=\"margin-left: 50px;\">\n" +
    "                    Assign Myself as Inventory\n" +
    "                </a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("js/trees/action.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/trees/action.tpl.html",
    "<div class=\"action-container\" id=\"action-container\" ng-controller=\"ActionCtrl\">\n" +
    "	<div class=\"row row-action\">\n" +
    "		<div class=\"col-sm-2 col\">\n" +
    "			<div class=\"action-block action-block-1\">\n" +
    "				<a href=\"#/trees\" class=\"btn btn-lg btn-red\">HOME</a>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"col-sm-4 col\">\n" +
    "			<div class=\"action-block action-block-2\">\n" +
    "				<ul class=\"stats list-unstyled list-inline row\">\n" +
    "					<li class=\"col-xs-4\" ng-click=\"goToEstimatesList()\" style=\"cursor: pointer;\" bs-tooltip title='View All Estimates'>\n" +
    "						<a href=\"#/estimates\" class=\"stat\">\n" +
    "							<p class=\"number\">{{initData.stats.reportCount}} <span class=\"supp\" ng-if=\"initData.stats.reportAlerts\" ng-bind=\"initData.stats.reportAlerts\"></span></p>\n" +
    "							<p class=\"text\">Estimates</p>\n" +
    "						</a>\n" +
    "					</li>\n" +
    "					<li class=\"col-xs-4\" style=\"cursor: pointer;\" bs-tooltip title='View All Properties'>\n" +
    "						<a href=\"#/trees\" class=\"stat\">\n" +
    "							<p class=\"number\" ng-bind=\"initData.stats.siteCount\"></p>\n" +
    "							<p class=\"text\">Properties</p>\n" +
    "						</a>\n" +
    "					</li>\n" +
    "					<li class=\"col-xs-4\" style=\"cursor: pointer;\" bs-tooltip title='View All Trees'>\n" +
    "						<a href=\"#/trees\" class=\"stat\">\n" +
    "							<p class=\"number\" ng-bind=\"initData.stats.treeCount\"></p>\n" +
    "							<p class=\"text\">Trees</p>\n" +
    "						</a>\n" +
    "					</li>\n" +
    "				</ul>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"col-sm-6 col\" ng-if=\"data.mode()=='estimate'\">\n" +
    "			<div class=\"action-block no-border action-block-3\">\n" +
    "				<div class=\"row row-xs\">\n" +
    "					<div class=\"col-xs-4 col\" ng-if=\"auth.isAtleast('inventory')\">\n" +
    "						<a href=\"#\" class=\"btn btn-sm btn-block btn-green\"><i class=\"fa fa-check\"></i> Job Done</a>\n" +
    "					</div>\n" +
    "					<div class=\"col-xs-4 col\">\n" +
    "						<button ng-if=\"report.actionButton\" tos-accept-button on-confirm-callback=\"approveEstimate()\"\n" +
    "                                class=\"btn btn-sm btn-block btn-green\" ng-disabled=\"disableApproveButton\">\n" +
    "								<i class=\"fa fa-check\"></i> Approve Estimate\n" +
    "						</button>\n" +
    "						<!-- possible values for status: approved, completed. billed, paid -->\n" +
    "						<span ng-if=\"!report.actionButton\" ng-class=\"'big-tag '+report.status\" ng-bind='report.status'></span>\n" +
    "					</div>\n" +
    "					\n" +
    "					<!-- hide for now, since the feature is not ready -->\n" +
    "					<div class=\"col-xs-4 col\" ng-if=\"1==2 && report.actionButton\">\n" +
    "						<a href=\"#\" class=\"btn btn-sm btn-block btn-orange\"><i class=\"fa fa-times\"></i> Request Changes</a>\n" +
    "					</div>\n" +
    "					<!-- hide for now, since the feature is not ready -->\n" +
    "					<div class=\"col-xs-4 col\" ng-if=\"report.token\">\n" +
    "						<a href=\"/go/estimate/pdf/{{report.token}}\" target=_new class=\"btn btn-sm btn-block btn-blue\"><i class=\"fa fa-arrow-down\"></i> Download PDF</a>\n" +
    "					</div>\n" +
    "					\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "		<div class=\"clearfix\"></div>\n" +
    "	</div>\n" +
    "</div>  \n" +
    "");
}]);

angular.module("js/trees/edit.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/trees/edit.tpl.html",
    "<tree-edit></tree-edit>\n" +
    "<!--\n" +
    "powerline: \"\",\n" +
    "damage: \"\",\n" +
    "building: \"\",\n" +
    "caDamage: \"\",\n" +
    "originalImage: \"Amador/IMG_0860\",\n" +
    "imageSmall: \"001-0001-000361-000123-036w.jpg\",\n" +
    "imageMedium: \"001-0001-000361-000122-375w.jpg\",\n" +
    "imageLarge: \"001-0001-000361-000121-480w.jpg\",\n" +
    "latitude: \"37.66055523\",\n" +
    "longitude: \"-122.0948727\",\n" +
    "nonProp: \"no\",\n" +
    "hTreeID: null,\n" +
    "tstamp_lastSurveyed: \"2010-05-07\",\n" +
    "notes: \"\",\n" +
    "tstamp_created: null,\n" +
    "tstamp_updated: \"2014-03-11 18:39:46\",\n" +
    "deleted: null,\n" +
    "importBatchID: null,\n" +
    "batchOrderID: null\n" +
    "-->\n" +
    "");
}]);

angular.module("js/trees/emailReport.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/trees/emailReport.tpl.html",
    "<div class=\"modal\" tabindex=\"-1\" role=\"dialog\">\n" +
    "	<div class=\"modal-dialog\">\n" +
    "		<div class=\"modal-content\">\n" +
    "			<div class=\"modal-header\" ng-show=\"modalTitle\">\n" +
    "			<button type=\"button\" class=\"close\" ng-click=\"$hide()\">&times;</button>\n" +
    "			<h4 class=\"modal-title\" ng-bind=\"modalTitle\"></h4>\n" +
    "			</div>\n" +
    "			<div class=\"modal-body\"> <!-- //// BODY START ///// -->\n" +
    "\n" +
    "\n" +
    "			<form class=\"form-inline\" ng-submit=\"emailEstimate()\">\n" +
    "				<table cellpadding='2'>\n" +
    "					 <tr ng-if=\"type === 'bulk'\">\n" +
    "                         <td>Sites:</td>\n" +
    "                         <td>\n" +
    "							 <div class=\"label label-primary\" ng-repeat=\"name in emailRpt.siteNames\" style=\"margin-right: 5px; font-size: 13px; float: left; margin-bottom: 5px;\">{{name}}</div>\n" +
    "                         </td>\n" +
    "                     </tr>\n" +
    "					 <tr ng-if=\"type !== 'bulk'\">\n" +
    "                         <td>To:</td>\n" +
    "                         <td>\n" +
    "                             <br><tags-input ng-model=\"emailRpt.contactEmails\" placeholder=\"Add email\"></tags-input><br>\n" +
    "                         </td>\n" +
    "                     </tr>\n" +
    "					 <!-- Comment out for now, because the backend isnt ready for this... see branch tim/22 for #wip\n" +
    "					 <tr>\n" +
    "                         <td>CC:</td>\n" +
    "                         <td>\n" +
    "                             <br><tags-input ng-model=\"emailRpt.ccEmails\" placeholder=\"Add email\"></tags-input><br>\n" +
    "                         </td>\n" +
    "                     </tr>\n" +
    "					 -->\n" +
    "					 <tr>\n" +
    "                         <td>From:</td>\n" +
    "                         <td>\n" +
    "                             <input type=\"text\" ng-model=\"emailRpt.senderEmail\" size=55 readonly>\n" +
    "                         </td>\n" +
    "                     </tr>\n" +
    "					 <tr>\n" +
    "                         <td>Subject:</td>\n" +
    "                         <td>\n" +
    "                             <input type=\"text\" ng-model=\"emailRpt.subject\" size=55>\n" +
    "                         </td>\n" +
    "                     </tr>\n" +
    "					 <tr>\n" +
    "                         <td>&nbsp;</td>\n" +
    "                         <td>\n" +
    "                             <textarea form style='width:450px; height:220px;' ng-model=\"emailRpt.message\"></textarea><BR>\n" +
    "					 	<span style='color:#f33; font-weight:bold;'>The link will automatically be included in the email</span><BR>\n" +
    "				 		<label>\n" +
    "                            <input type=\"checkbox\" ng-model=\"emailRpt.sendCopy\" >\n" +
    "							Send me a copy\n" +
    "                        </label>\n" +
    "					 	</td>\n" +
    "                     </tr>\n" +
    "				</table>\n" +
    "			</form>\n" +
    "\n" +
    "\n" +
    "			</div><!-- }}}} .modal-body -->\n" +
    "			<div class=\"modal-footer\">\n" +
    "			<button type=\"button\" class=\"btn btn-default\" ng-click=\"$hide()\">Close</button>\n" +
    "			<button type=\"button\" class=\"btn btn-primary\" ng-click=\"sendReport($hide, $show)\" \n" +
    "					ng-disabled='emailRpt.disableSendBtn'>{{emailRpt.sendBtnText}}</button>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("js/trees/report.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/trees/report.tpl.html",
    "<div ng-controller=\"ReportCtrl as ReportCtrl\" class='ReportCtrl div_{{routeParams.stateID}} padding-top-none'>\n" +
    "\n" +
    "    <!-- LOAD recent estimates list -->\n" +
    "    <div ng-if=\"data.mode()=='trees' && !auth.is('customer')\" style=\"margin-bottom: 15px;\">\n" +
    "        <recent-estimates model=\"rdata.recentReportID\" recent-report-list=\"recentReportList\" get-recent-report-title=\"getRecentReportTitle(report)\"></recent-estimates>\n" +
    "        <br><br>\n" +
    "        <button class=\"btn btn-blue clr-white\" ng-cloak ng-click=\"newReport();\">New Report</button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"touch-boundry\">\n" +
    "        <div ng-include=\"'js/trees/action.tpl.html'\" ng-if=\"data.mode()=='estimate' && auth.is('customer')\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!--BEGIN ESTIMATE TABLE SECTION-->\n" +
    "    <div bindonce=\"report\" class=\"table_estimate estimate-container report_main mode_{{data.mode()}}\" ng-if=\"report.siteID\">\n" +
    "        <!--Directive is not performing anything what is the point having simple HTML in directive-->\n" +
    "        <!--<estimate-summary report=\"report\" mode=\"data.mode()\"></estimate-summary>-->\n" +
    "\n" +
    "        <!--Estimate Summary Starts-->\n" +
    "        <div class=\"estimate-summary\">\n" +
    "            <div class=\"row row-estimate\">\n" +
    "                <div class=\"col-md-6 col\">\n" +
    "                    <div class=\"estimate-info\">\n" +
    "                        <dl class=\"small\">\n" +
    "                            <dt>\n" +
    "                                Created: <span ng-bind=\"report.tstamp_updated\"></span> &nbsp; &nbsp; &nbsp; &nbsp;\n" +
    "                                Estimate ID: <span ng-bind=\"report.reportID\"></span>\n" +
    "                            </dt>\n" +
    "                        </dl>\n" +
    "                        <h1 class=\"title\" ng-text=\"'Estimate for ' + report.siteName\"></h1>\n" +
    "                        <p class=\"name\">\n" +
    "                            <span ng-if=\"mode() === 'trees'\">\n" +
    "                                <a href editable-text='report.name' class='reportName'>{{report.name}}</a> &nbsp;\n" +
    "                            </span>\n" +
    "                            <span ng-if=\"mode() !== 'trees'\">\n" +
    "                                {{report.name}}\n" +
    "                            </span>\n" +
    "                        </p>\n" +
    "                        <dl>\n" +
    "                            <dt>Contact: </dt>\n" +
    "                            <dd ng-bind=\"report.contact + ' ' + report.contactPhone|formatPhoneNumber\"></dd>\n" +
    "                        </dl>\n" +
    "                        <dl>\n" +
    "                            <dt>Client: </dt>\n" +
    "                            <dd ng-bind='report.clientName'></dd>\n" +
    "                        </dl>\n" +
    "                        <dl>\n" +
    "                            <dt>Property: </dt>\n" +
    "                            <dd ng-bind=\"report.siteName\"></dd>\n" +
    "                        </dl>\n" +
    "                        <dl>\n" +
    "                            <dt>Address: </dt>\n" +
    "                            <dd ng-bind=\"report.street + ', ' + report.city + ',' + report.state + ' ' + report.zip\"></dd>\n" +
    "                        </dl>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"col-md-2 col\" ng-if='report.sales_email'>\n" +
    "                    <div class=\"estimate-info\">\n" +
    "                        <p class=\"name clr-orange\">Sales Rep</p>\n" +
    "                        <dl ng-if=\"report.sales_fname\">\n" +
    "                            <dd ng-text=\"report.sales_fname + ' ' + report.sales_lname\"></dd>\n" +
    "                        </dl>\n" +
    "                        <dl>\n" +
    "                            <dd><a href='mailto:{{report.sales_email}}' target=_new ng-bind='report.sales_email' style='color:#fff;'></a></dd>\n" +
    "                        </dl>\n" +
    "                        <dl ng-if=\"report.sales_phone\">\n" +
    "                            <dd ng-bind='report.sales_phone|formatPhoneNumber'></dd>\n" +
    "                        </dl>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "\n" +
    "                <div class=\"col-md-4 col\">\n" +
    "                    <div class=\"bid-info\">\n" +
    "                        <div class=\"logos\">\n" +
    "                            <span class=\"logo\"><img src=\"img/logo_tcia.png\"></span>\n" +
    "                        </div>\n" +
    "                        <p class=\"bid\">Total Bid: ${{(report.total.grand || 0)|formatPrice}}</p>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <!--Estimate Summary Ends-->\n" +
    "\n" +
    "        <!--Directive is not performing anything what is the point having simple HTML in directive-->\n" +
    "        <div class=\"estimate-actions\" ng-if=\"data.mode()=='trees'\">\n" +
    "            <button class=\"btn btn-red clr-white\" ng-click=\"saveReport()\">Save</button>\n" +
    "            <button class=\"btn btn-red clr-white\"\n" +
    "                    data-backdrop='static'\n" +
    "                    data-keyboard=true\n" +
    "                    bs-modal\n" +
    "                    data-template=\"js/trees/emailReport.tpl.html\"\n" +
    "                    ng-click=\"initEmailModal()\">\n" +
    "                Send\n" +
    "            </button>\n" +
    "            &nbsp;\n" +
    "            <span ng-if=\"report.reportID\">\n" +
    "                <a ng-if='report.reportLink && report.reportID' href='/go/estimate/pdf/{{report.token}}' target='_cust_view'>PDF Version</a> &nbsp;|&nbsp;\n" +
    "                <a ng-if='report.reportLink && report.reportID' href='{{report.reportLink}}' target='_cust_view'\n" +
    "                   onclick='return confirm(\"This will log you out. Continue?\\n(Alternatively, you can copy and paste this into a completely different browser)\");'>Customer View</a> &nbsp;|&nbsp;\n" +
    "            </span>\n" +
    "            <a ng-if='report.reportID && report.saveCount>1' href='/go/estimate/revisions/{{report.reportID}}' target=_new>Past Revisions</a>\n" +
    "\n" +
    "            <div class=\"clearfix\"></div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Email logs -->\n" +
    "        <email-logs report=\"report\"></email-logs>\n" +
    "        \n" +
    "\n" +
    "        <div class=\"table-container\">\n" +
    "            <div class=\"row row-table\">\n" +
    "                <div class=\"col-md-4\" ng-if=\"data.mode()=='estimate'\">\n" +
    "                    <div id=\"treeMap_estimate\" class=\"map-container mode_{{data.mode()}}\">\n" +
    "                        <div id=\"treeMap2\" class=\"mode_{{data.mode()}}\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"col-md-8 col-info-{{data.mode()}}\">\n" +
    "                    <!--<report-estimates-table></report-estimates-table>-->\n" +
    "                    <!--Estimate table Starts-->\n" +
    "                    <div class=\"table-responsive\">\n" +
    "                        <table class=\"table table-striped table-bordered table-hover ng-scope ng-table mode_{{data.mode()}}\">\n" +
    "                            <thead>\n" +
    "                                <tr id=\"estimate_table_heading\">\n" +
    "                                    <td class=\"td-image\">Tree</td>\n" +
    "                                    <td class=\"td-id\">ID</td>\n" +
    "                                    <td class=\"td-name\">Name</td>\n" +
    "                                    <td class=\"td-treatment\">Treatment</td>\n" +
    "                                    <td class=\"td-bid\">Bid ($)</td>\n" +
    "                                    <td class=\"td-action\"></td>\n" +
    "                                </tr>\n" +
    "                            </thead>\n" +
    "                            <tbody>\n" +
    "                                <!-- todo-bindonce - i removed it from below... cuz it broke editing of values...\n" +
    "                                if we can get rebind to work, then we need to rebind if the user is an admin (and they want to edit)\n" +
    "                                and leave bindonce if the user is a customer t-->\n" +
    "                                <tr ng-repeat=\"item in groupedItems\" ng-if=\"report.items.length>0\"\n" +
    "                                    ng-init=\"itemIndex = $index\"\n" +
    "                                    ng-class=\"rowHighlightClass(item)\"\n" +
    "                                    class='hoverHotspot'\n" +
    "                                    ng-mouseover=\"hover=true;onItemRollOver(TreesCtrl.findMarker(item.treeID))\"\n" +
    "                                    ng-mouseleave=\"hover=false;onItemRollOut(TreesCtrl.findMarker(item.treeID))\"\n" +
    "                                    id=\"rpt_item_{{item.treeID}}\">\n" +
    "                                    <td data-title=\"listing_image\" class=\"td-image\">\n" +
    "\n" +
    "                                        <tree-image-popover item=\"item\" cache-buster=\"tree_cachebuster\" />\n" +
    "                                    </td>\n" +
    "                                    <td data-title=\"listing_ID\" class=\"td-id\">{{item.localTreeID}}</td>\n" +
    "                                    <td data-title=\"listing_species\" class=\"td-name\">\n" +
    "                                        {{item.dbhID | dbhID2Name:this }}\n" +
    "                                        {{item.commonName || 'Not specified'}} <span ng-if=\"item.botanicalName\">({{item.botanicalName}})</span>\n" +
    "                                        <span class=\"light\" bo-text=\"'[' + item.treeID + ']'\"></span>\n" +
    "                                        <a href='#/tree_edit/{{item.treeID}}' class='row-action leftSpace10' ng-if=\"auth.isAtleast('inventory')\">\n" +
    "                                            <i class=\"fa fa-pencil clr-primary _size5 hoverDisplay\"></i>\n" +
    "                                        </a>\n" +
    "                                        <div ng-if=\"item.notes\" id=\"estimate_table_notes\">{{item.notes}}</div>\n" +
    "                                    </td>\n" +
    "                                    <td data-title=\"listing_treatment\" colspan=\"3\" class=\"td-treatment-bid\">\n" +
    "                                        <table class=\"\">\n" +
    "                                            <tr ng-repeat=\"treatment in item.treatments\" ng-init=\"treatmentIndex = $index\">\n" +
    "                                                <td ng-if=\"auth.isAtleast('inventory') && !auth.is('customer')\" data-title=\"listing_treatment\" class=\"td-treatment\">\n" +
    "                                                    <a href e-ng-options=\"obj.code as obj.treatmentType for obj in initData.filters.treatments\"\n" +
    "                                                       editable-select=\"treatment.treatmentTypeCode\"\n" +
    "                                                       onshow=\"onShowEditItem(item.$$hashKey)\"\n" +
    "                                                       onaftersave=\"onTreatmentTypeUpdate(item, treatment)\"\n" +
    "                                                       onhide=\"onHideEditItem()\">\n" +
    "                                                        {{treatment.treatmentTypeCode|treatmentTypeCode2Name:this}}\n" +
    "                                                    </a>\n" +
    "                                                </td>\n" +
    "                                                <td ng-if=\"auth.is('customer')\">\n" +
    "                                                    <span ng-bind=\"treatment.treatmentTypeCode|treatmentTypeCode2Name:this\">\n" +
    "                                                    </span>\n" +
    "                                                </td>\n" +
    "                                                <td ng-if=\"auth.isAtleast('inventory') && !auth.is('customer')\" data-title=\"listing_price\" class=\"td-bid\">\n" +
    "                                                    &#36;<a href editable-text='treatment.price' onshow=\"onShowEditItem(item.$$hashKey)\" onhide=\"onHideEditItem()\" onaftersave=\"onTreatmentPriceUpdate()\">{{treatment.price|formatPrice}}</a>\n" +
    "                                                </td>\n" +
    "                                                <td ng-if=\"auth.is('customer')\">\n" +
    "                                                    <span ng-bind=\"treatment.price|formatPrice\"></span>\n" +
    "                                                </td>\n" +
    "\n" +
    "                                                <td data-title=\"listing_options\" class=\"td-action\">\n" +
    "                                                    <a href ng-click=\"removeTreatmentFromEstimate(itemIndex, treatmentIndex)\" class='row-action' ng-if=\"auth.is('admin')\">\n" +
    "                                                        <i class=\"fa fa-times clr-danger _size5 hoverDisplay\"></i>\n" +
    "                                                    </a>\n" +
    "                                                </td>\n" +
    "                                            </tr>\n" +
    "                                        </table>\n" +
    "                                    </td>	<!-- }}} listing_treatment colspan=3 -->\n" +
    "                                </tr>\n" +
    "                                <tr ng-if=\"report.total.items && data.mode()=='trees'\">\n" +
    "                                    <td colspan=\"4\" class=\"td-bid\">Subtotal:</td>\n" +
    "                                    <td class=\"td-bid\">&#36;{{report.total.items|formatPrice}}</td>\n" +
    "                                    <td>&nbsp;</td>\n" +
    "                                </tr>\n" +
    "                            </tbody>\n" +
    "                        </table>\n" +
    "                    </div>\n" +
    "                    <!--Estimate table Ends-->\n" +
    "\n" +
    "                    <report-misc-services-table></report-misc-services-table>\n" +
    "\n" +
    "                    <div class=\"total-amount\">\n" +
    "                        Total: &#36;{{(report.total.grand || 0)|formatPrice}}\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"section-container\" ng-if=\"data.mode()=='trees' && auth.isAtleast('inventory')\">\n" +
    "                        <h6 class=\"section-sub-title\">Notes</h6>\n" +
    "                        <textarea ckeditor=\"editorOptions\" ng-model=\"report.notes\" placeholder=\"Notes\" style='width:100%;height:100px;'></textarea>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"section-container\" ng-if=\"data.mode()!='trees' || !auth.isAtleast('inventory')\">\n" +
    "                        <h6 ng-if=\"report.notes\" class=\"section-sub-title\" style='padding-bottom:1em;'>Notes</h6>\n" +
    "                        <span ng-bind-html=\"report.notes\"></span><br><br>\n" +
    "\n" +
    "                        <h6 ng-if=\"treatmentDescriptions.length\" class=\"section-sub-title\">Definition of Treatments</h6>\n" +
    "                        <div ng-repeat=\" desc in treatmentDescriptions \">\n" +
    "                            <p><span style='font-weight:bold;'>{{desc.treatmentType}}</span> - {{desc.desc}}</p><br>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div class=\"logo-container\">\n" +
    "                        <span class=\"logo\"><img src=\"img/logo_wcisa.png\"></span>\n" +
    "                        <span class=\"logo\"><img src=\"img/logo_ctsp.png\"></span>\n" +
    "                        <span class=\"logo\"><img src=\"img/logo_papa.jpg\"></span>\n" +
    "                        <span class=\"logo\"><img src=\"img/logo_treeworker.jpg\"></span>\n" +
    "                        <span class=\"logo\"><img src=\"img/logo_bcma.jpg\"></span>\n" +
    "                    </div>\n" +
    "\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "</div> <!-- }}} .report_main -->\n" +
    "\n" +
    "<div style='margin:15px 0 60px 70px; font-size:130%; color:#555;' class=\"\" ng-if=\"report.items.length<1\">\n" +
    "    (No Trees Added to Estimate Yet)\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"clearfloat\"></div>\n" +
    "");
}]);

angular.module("js/trees/trees.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/trees/trees.tpl.html",
    "<main ng-controller=\"TreesCtrl as TreesCtrl\">\n" +
    "\n" +
    "<div ng-include=\"'js/trees/action.tpl.html'\" ng-if=\"data.mode()=='trees' && auth.is('customer')\"></div>\n" +
    "\n" +
    "<div class=\"trees-container\" ng-show=\"data.mode()=='trees'\">\n" +
    "	<div class=\"trees-container-inner\">\n" +
    "		<div class=\"row row-nopad\">\n" +
    "			<div class=\"col-sm-3 col\">\n" +
    "				<div class=\"filters-container\">\n" +
    "					<!--<left-column-filters-section></left-column-filters-section>-->\n" +
    "\n" +
    "                    <section ng-if=\"data.mode()=='trees'\">\n" +
    "\n" +
    "                        <div class=\"filter-container-title\" ng:cloak ng-show=\"TFSdata.selectedFilters.length>0\">\n" +
    "                            <span ng-if=\"!TFSdata.containsContradictingFilters\">{{TFSdata.selectedFilters.length}}&nbsp;</span>Filters Active &nbsp; <span class=\"lnk-clear\">\n" +
    "                                <a href ng-click='clearFilters();'>\n" +
    "                                    <i class=\"fa fa-times\"></i>\n" +
    "                                </a>\n" +
    "                            </span>\n" +
    "                        </div>\n" +
    "\n" +
    "                        <div class=\"row row-xss\">\n" +
    "                            <div class=\"col-xs-6 col\">\n" +
    "\n" +
    "                                <div class='filter-container' ng-if=\"auth.is('customer') && initData.sites.length>1\">\n" +
    "                                    <div class=\"row row-xs row-nopad\">\n" +
    "                                        <div class=\"col-xs-5 col\">\n" +
    "                                            <div class=\"filter-header\">\n" +
    "                                                <h3>Property</h3>\n" +
    "                                            </div>\n" +
    "                                        </div>\n" +
    "                                        <div class=\"col-xs-7 col\">\n" +
    "                                            <div class=\"filter-input\">\n" +
    "                                                <select id=\"select_site\" class='inpt inpt-select' ng-disabled=\"filteredSites.length === 0\"\n" +
    "                                                        ng-model=\"selected.siteID\"\n" +
    "                                                        ng-change=\"onSelectSiteID(selected.siteID)\">\n" +
    "                                                    <option bindonce class=\"option\" ng-repeat=\"site in filteredSites\" value=\"{{site.siteID}}\" bo-bind=\"site.siteName\"></option>\n" +
    "                                                </select>\n" +
    "                                            </div>\n" +
    "                                        </div>\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "\n" +
    "                                <!--FILTER SECTION: SPECIES-->\n" +
    "                                <filter-species tfs-species=\"TFSdata.filterTypeCounts.species\" filter-search-species=\"filterSearch.species\" init-data-species=\"initData.filters.species\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-species>\n" +
    "                                <!-- END SPECIES FILTER SECTION -->\n" +
    "\n" +
    "                            </div>\n" +
    "                            <div class=\"col-xs-6 col\">\n" +
    "\n" +
    "                                <!--FILTER SECTION: TREATMENT TYPE-->\n" +
    "                                <filter-treatment-type tfs-treatments=\"TFSdata.filterTypeCounts.treatments\" filter-search-treatments=\"filterSearch.treatments\" init-data-treatments=\"initData.filters.treatments\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-treatment-type>\n" +
    "                                <!-- END TREATMENT TYPE FILTER SECTION -->\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "\n" +
    "                        <div class=\"collapse-container\">\n" +
    "                            <div class=\"collapse-head\">\n" +
    "                                <a href=\"#\" onclick='return false;'>Filters <i class=\"fa fa-angle-double-down\"></i></a>\n" +
    "                            </div>\n" +
    "                            <div class=\"collapse-preview\">\n" +
    "                                <!-- START YEAR FILTER SECTION -->\n" +
    "                                <filter-years filters-year=\"filters.year\" filters-years=\"filters.years\" on-select-year=\"onSelectYear(id)\"></filter-years>\n" +
    "                                <!-- END YEAR FILTER SECTION -->\n" +
    "                            </div>\n" +
    "\n" +
    "                            <div class=\"collapse-body\">\n" +
    "                                <div class=\"row row-xss\">\n" +
    "                                    <div class=\"col-xs-6 col\">\n" +
    "                                        <!--FILTER SECTION: Building, Hardscape and Powerline -->\n" +
    "                                        <filter-hazards tfs-counts=\"TFSdata.filterTypeCounts\" init-data-hazards=\"initdata.filters.hazards\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-hazards>\n" +
    "                                        <!-- END Building, Hardscape, POWERLINE FILTER SECTION -->\n" +
    "                                        <!--FILTER SECTION: SIZE-->\n" +
    "                                        <filter-size tfs-counts-treatments=\"TFSdata.filterTypeCounts.treatments\" init-data-dbh=\"initData.filters.dbh\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-size>\n" +
    "                                        <!-- END SIZE FILTER SECTION -->\n" +
    "                                    </div>\n" +
    "\n" +
    "                                    <div class=\"col-xs-6 col\">\n" +
    "                                        <!--FILTER SECTION: HEALTH-->\n" +
    "                                        <filter-health tfs-counts-rating=\"TFSdata.filterTypeCounts.rating\" init-data-ratings=\"initData.filters.ratings\" on-filter-change=\"onFilterChange(filterType, ID, value)\"></filter-health>\n" +
    "                                        <!-- END HEALTH FILTER SECTION -->\n" +
    "                                    </div>\n" +
    "                                </div>\n" +
    "                            </div>\n" +
    "                        </div>\n" +
    "\n" +
    "                    </section>\n" +
    "\n" +
    "				</div>\n" +
    "			</div>\n" +
    "			<div class=\"col-sm-9 col\">\n" +
    "				<div class=\"row row-nopad\">\n" +
    "\n" +
    "					<div class=\"col-sm-8 col\">\n" +
    "						<div class=\"content-container\">\n" +
    "\n" +
    "                            <div class=\"admin-filter-container\" ng-if=\"data.mode()=='trees' && auth.isAtleast('inventory')\">\n" +
    "                                <center-top-block></center-top-block>\n" +
    "                            </div>\n" +
    "\n" +
    "							<!-- begin center content area -->\n" +
    "							<section class=\"map-container mainContent top-margin-none {{'mode_'+data.mode()}}\" ng-class=\"'mode_' + data.mode()\">\n" +
    "								<div id='treeDetails' ng-cloak ng-show=\"data.showTreeDetails && data.mode()=='trees'\">\n" +
    "                                    <tree-edit></tree-edit>\n" +
    "								</div>\n" +
    "\n" +
    "                                <div ng-include=\"'js/common/directives/maps/map.search.panel/map.search.panel.tpl.html'\"/>\n" +
    "\n" +
    "                                <div ng-cloak ng-show=\"data.showMap && data.mode()=='trees'\" id=\"treeMap\" ng-class=\"data.mode()\" class=\"map\"></div>\n" +
    "							</section>	<!-- }}} mainContent -->\n" +
    "						</div>\n" +
    "					</div>\n" +
    "\n" +
    "					<div class=\"col-sm-4 col\">\n" +
    "						<div class=\"result-container\">\n" +
    "							<section class=\"nav_listings\" ng-if=\"data.mode()=='trees'\">\n" +
    "								<div class=\"table-responsive\" ng-if=\"filteredSites.length > 0 && !trees.length && TFSdata.selectedFilters.length\">\n" +
    "									<div sites-selector items=\"filteredSites\" selected=\"bulkEstimates.selectedSites\" name=\"sites\">\n" +
    "									</div>\n" +
    "\n" +
    "									<sites-list filtered-sites=\"filteredSites\" selected-sites=\"bulkEstimates.selectedSites\">\n" +
    "									</sites-list>\n" +
    "\n" +
    "									<div sites-selector items=\"filteredSites\" selected=\"bulkEstimates.selectedSites\" name=\"sites\">\n" +
    "									</div>\n" +
    "\n" +
    "									<table class=\"tree-list-container\" ng-if=\"auth.isAtleast('inventory')\">\n" +
    "										<tfoot>\n" +
    "											<tr>\n" +
    "												<td colspan=\"4\">\n" +
    "													<button class=\"btn btn-block btn-red clr-white txt-bold\" ng-click=\"createBulkEstimate()\" ng-show=\"bulkEstimates.selectedSites.length && bulkEstimates.overrideTreatmentCodes.length\">Create Bulk Estimate</button>\n" +
    "												</td>\n" +
    "											</tr>\n" +
    "											<tr>\n" +
    "												<td colspan=\"4\">\n" +
    "													<override-treatment codes=\"bulkEstimates.overrideTreatmentCodes\" treatments=\"initData.filters.treatments\" field=\"treatmentTypeID\"></override-treatment>\n" +
    "												</td>\n" +
    "											</tr>\n" +
    "										</tfoot>\n" +
    "									</table>\n" +
    "								</div>\n" +
    "\n" +
    "								<div class=\"table-responsive\" ng-if=\"trees.length > 0\">\n" +
    "                                    <div trees-selector ng-if=\"auth.isAtleast('inventory')\" toggle-checked-trees=\"toggleCheckedTrees(opt)\" selected-trees=\"selectedTrees\" count=\"TFSdata.treeResultsCount\"></div>\n" +
    "\n" +
    "                                    <trees-list></trees-list>\n" +
    "\n" +
    "                                    <div trees-selector ng-if=\"auth.isAtleast('inventory')\" toggle-checked-trees=\"toggleCheckedTrees(opt)\" selected-trees=\"selectedTrees\" count=\"TFSdata.treeResultsCount\"></div>\n" +
    "\n" +
    "                                    <table class=\"tree-list-container\" ng-if=\"auth.isAtleast('inventory') && trees.length\">\n" +
    "										<tfoot>\n" +
    "											<tr>\n" +
    "												<td colspan=\"4\">\n" +
    "													<button class=\"btn btn-block btn-red clr-white txt-bold\" ng-click=\"addToEstimate()\">Add to Estimate</button>\n" +
    "												</td>\n" +
    "											</tr>\n" +
    "                                            <tr>\n" +
    "                                                <td colspan=\"4\">\n" +
    "                                                    <override-treatment codes=\"data.overrideTreatmentCodes\" treatments=\"initData.filters.treatments\"></override-treatment>\n" +
    "                                                </td>\n" +
    "                                            </tr>\n" +
    "										</tfoot>\n" +
    "									</table>\n" +
    "								</div>\n" +
    "							</section>\n" +
    "						</div>	\n" +
    "					</div>\n" +
    "\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"clearfix\"></div>\n" +
    "<div ng-include=\"'js/trees/report.tpl.html'\"></div>\n" +
    "\n" +
    "</main>\n" +
    "");
}]);
