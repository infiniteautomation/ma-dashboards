/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

PointHierarchyPointSelectorController.$inject = ['maPointHierarchy'];
function PointHierarchyPointSelectorController(PointHierarchy) {
    this.$onInit = function() {
        this.ngModelCtrl.$render = this.render;
    };

    this.$onChanges = function(changes) {
        if (changes.path) {
            var resourceObj = this.path && this.path.length ?
                    PointHierarchy.byPath({path: this.path, subfolders: true, points: true}) :
                    PointHierarchy.getRoot({subfolders: true, points: true});
            resourceObj.$promise.then(function(hierarchy) {
                this.hierarchy = hierarchy;
                this.calculateTotalPoints();
                this.render();
            }.bind(this));
        }
    };
    
    this.calculateTotalPoints = function calculateTotalPoints() {
        this.walkHierarchy(this.hierarchy, (folder, parent, index) => {
            folder.parent = parent;
            this.incrementTotalPoints(folder);
        });
        
        // remove parent so there isn't a recursive structure that causes issues for deep copy and JSON
        this.walkHierarchy(this.hierarchy, (folder, parent, index) => {
            delete folder.parent;
        });
    };

    this.incrementTotalPoints = (folder, amount = folder.pointCount) => {
        folder.totalPoints = (folder.totalPoints || 0) + amount;
        
        if (folder.parent && amount > 0) {
            this.incrementTotalPoints(folder.parent, amount);
        }
    };

    /**
     * Takes the $viewValue and checks the folders accordingly
     */
    this.render = function render() {
        if (!this.hierarchy) return;
        
        // $viewValue is an array of points
        var selectedPoints = this.ngModelCtrl.$viewValue;
        if (angular.isUndefined(selectedPoints)) {
            selectedPoints = [];
        }
        
        var selectedPointsByXid = {};
        for (var i = 0; i < selectedPoints.length; i++) {
            var point = selectedPoints[i];
            selectedPointsByXid[point.xid] = point;
        }
        
        this.walkHierarchy(this.hierarchy, (folder, parent, index) => {
            this.updateCheckboxes(folder, selectedPointsByXid);
        });
    }.bind(this);

    /**
     * Triggered when a folder checkbox changes and the $viewValue should be updated, and hence the $modelValue
     */
    this.folderCheckChanged = function folderCheckChanged(changedFolder) {
        function checkFolder(folder, checked) {
            folder.checked = checked;
            folder.partial = false;
            for (var i = 0; i < folder.points.length; i++) {
                var point = folder.points[i];
                point.checked = checked;
            }
        }
        
        if (this.selectSubfolders) {
            this.walkHierarchy(changedFolder, function(folder, parent, index) {
                checkFolder(folder, changedFolder.checked);
            });
        } else {
            checkFolder(changedFolder, changedFolder.checked);
        }

        this.walkHierarchy(this.hierarchy, function(folder, parent, index) {
            this.updateCheckboxes(folder);
        }.bind(this));

        this.updateViewValue();
    };

    /**
     * Triggered when a folder checkbox changes and the $viewValue should be updated, and hence the $modelValue
     */
    this.pointCheckChanged = function pointCheckChanged(folder, changedPoint) {
        this.walkHierarchy(this.hierarchy, function(folder, parent, index) {
            this.updateCheckboxes(folder);
        }.bind(this));
        
        this.updateViewValue();
    };
    
    this.updateCheckboxes = function updateCheckboxes(folder, selectedPointsByXid) {
        var anySelected = false;
        var allSelected = true;
        
        for (var i = 0; i < folder.points.length; i++) {
            var point = folder.points[i];
            if (selectedPointsByXid)
                point.checked = !!selectedPointsByXid[point.xid];
            anySelected = anySelected || point.checked;
            allSelected = allSelected && point.checked;
        }
        
        for (i = 0; i < folder.subfolders.length; i++) {
            var subfolder = folder.subfolders[i];
            anySelected = anySelected || subfolder.checked;
            allSelected = allSelected && subfolder.checked && !subfolder.partial;
        }

        folder.partial = anySelected && !allSelected;
        folder.checked = anySelected;
    };
    
    this.updateViewValue = function updateViewValue() {
        var selectedPoints = [];
        
        this.walkHierarchy(this.hierarchy, function(folder, parent, index) {
            for (var i = 0; i < folder.points.length; i++) {
                var point = folder.points[i];
                if (point.checked) {
                    selectedPoints.push(point);
                }
            }
        }.bind(this));
        
        this.ngModelCtrl.$setViewValue(selectedPoints);
    };

    this.walkHierarchy = function walkHierarchy(folder, fn, parent, index) {
        for (var i = 0; i < folder.subfolders.length; i++) {
            this.walkHierarchy(folder.subfolders[i], fn, folder, i);
        }
        fn(folder, parent, index);
    }.bind(this);
}

return {
    controller: PointHierarchyPointSelectorController,
    templateUrl: require.toUrl('./pointHierarchyPointSelector.html'),
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        path: '<',
        expanded: '<?',
        selectSubfolders: '<?',
        showDeviceNames: '<?',
        hideFoldersWithNoPoints: '<?'
    },
    designerInfo: {
        translation: 'ui.components.maPointHierarchySelector',
        icon: 'share'
    }
};

}); // define
