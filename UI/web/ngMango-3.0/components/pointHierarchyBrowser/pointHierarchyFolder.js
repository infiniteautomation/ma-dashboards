/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var pointHierarchyFolder = function pointHierarchyFolder() {
    this.$onInit = function() {
        this.parentController = this.browserCtrl || this.pointSelectorCtrl;
        var expanded = this.parentController.expanded;
        this.open = isFinite(expanded) ? this.depth < expanded : !!expanded;
    };
    
    this.folderClicked = function folderClicked($event) {
        this.open = !this.open;
    };
    
    this.folderCheckChanged = function folderCheckChanged() {
        this.parentController.folderCheckChanged(this.folder);
    };
    
    this.pointCheckChanged = function pointCheckChanged(point) {
        this.parentController.pointCheckChanged(this.folder, point);
    };
};

pointHierarchyFolder.$inject = [];

return {
    controller: pointHierarchyFolder,
    templateUrl: require.toUrl('./pointHierarchyFolder.html'),
    bindings: {
        folder: '<',
        parent: '<',
        selectPoints: '<',
        depth: '<',
        showDeviceNames: '<'
    },
    require: {
        browserCtrl: '^^?maPointHierarchyBrowser',
        pointSelectorCtrl: '^^?maPointHierarchyPointSelector'
    }
};

}); // define
