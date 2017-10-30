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
    };
    
    this.$onChanges = function(changes) {
        if (changes.folder) {
            this.checkIfShouldOpen();
        }
    };
    
    this.checkIfShouldOpen = function() {
        this.open = false;
        if (this.parentController && this.canOpenFolder()) {
            const expanded = this.parentController.expanded;
            this.open = isFinite(expanded) ? this.depth < expanded : !!expanded;
        }
    };
    
    this.folderClicked = function folderClicked($event) {
        if (this.canOpenFolder()) {
            this.open = !this.open;
        }
    };
    
    this.canOpenFolder = function(folder = this.folder) {
        if (!folder) return false;
        
        if (this.selectPoints && folder.points.length) return true;
        
        if (this.hideFoldersWithNoPoints) {
            return folder.totalPoints > folder.points.length;
        }
        
        return folder.subfolders.length > 0;
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
