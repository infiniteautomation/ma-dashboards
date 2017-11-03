/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var pointHierarchyFolder = function pointHierarchyFolder() {
    this.$onInit = function() {
        this.parentController = this.browserCtrl || this.pointSelectorCtrl;
        this.hideFoldersWithNoPoints = this.parentController.hideFoldersWithNoPoints;
        this.checkIfShouldOpen();
        this.findStatusPoint();
    };
    
    this.$onChanges = function(changes) {
        if (changes.folder) {
            this.checkIfShouldOpen();
            this.findStatusPoint();
        }
    };
    
    this.findStatusPoint = function() {
        if (!this.folder || !this.folder.points || !this.parentController || !this.parentController.folderStatusPoint) return;
        
        const regex = new RegExp(this.parentController.folderStatusPoint);
        const statusPoint = this.folder.points.find(pt => regex.test(pt.name));
        if (statusPoint) {
            this.statusPointXid = statusPoint.xid;
        }
    };
    
    this.checkIfShouldOpen = function() {
        this.open = false;
        if (this.parentController && this.hasContents()) {
            const expanded = this.parentController.expanded;
            this.open = isFinite(expanded) ? this.depth < expanded : !!expanded;
        }
    };
    
    this.folderClicked = function folderClicked($event) {
        if (this.hasContents()) {
            this.open = !this.open;
        }
    };
    
    this.showFolder = function(folder) {
        if (!folder) return false;
        if (!this.hideFoldersWithNoPoints) {
            return true;
        }
        return folder.totalPoints > 0;
    };
    
    this.hasContents = function() {
        if (!this.folder) return false;
        if (this.selectPoints && this.folder.points.length) return true;
        
        if (this.hideFoldersWithNoPoints) {
            return this.folder.totalPoints > this.folder.points.length;
        }
        
        return this.folder.subfolders.length > 0;
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
    },
    designerInfo: {
        hideFromMenu: true
    }
};

}); // define
