/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';


PointHierarchyBrowserController.$inject = ['maPointHierarchy'];
function PointHierarchyBrowserController(PointHierarchy) {
    this.$onInit = function() {
        this.ngModelCtrl.$render = this.render;
    };

    this.$onChanges = function(changes) {
        if (changes.path) {
            var resourceObj = this.path && this.path.length ?
                    PointHierarchy.byPath({path: this.path, subfolders: true, points: true}) :
                    PointHierarchy.getRoot({subfolders: true, points: true});
            
            const promise = resourceObj.$promise.then(function(hierarchy) {
                this.hierarchy = hierarchy;
                this.calculateTotalPoints();
                this.render();
            }.bind(this));
            
            if (this.onQuery) {
                this.onQuery({$promise: promise});
            }
        }
    };
    
    this.calculateTotalPoints = function calculateTotalPoints() {
        this.walkHierarchy(this.hierarchy, (folder, parent, index) => {
            if (parent) {
                folder.path = parent.path ? parent.path + ',' + folder.name : folder.name;
            } else {
                folder.path = '';
            }
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
        
        // $viewValue is an array of folders
        var selectedFolders = this.ngModelCtrl.$viewValue;
        if (angular.isUndefined(selectedFolders)) {
            selectedFolders = [];
        }
        
        var selectedFoldersById = {};
        for (var i = 0; i < selectedFolders.length; i++) {
            var folder = selectedFolders[i];
            selectedFoldersById[folder.id] = folder;
        }
        
        this.walkHierarchy(this.hierarchy, (folder, parent, index) => {
            //folder.checked = !!selectedFoldersById[folder.id] || (parent && parent.checked && this.selectSubfolders);
            folder.checked = !!selectedFoldersById[folder.id];
        });
    }.bind(this);

    /**
     * Triggered when a checkbox changes and the $viewValue should be updated, and hence the $modelValue
     */
    this.folderCheckChanged = function folderCheckChanged(changedFolder) {
        var selectedFolders = [];

        var changedFolders = {};
        this.walkHierarchy(changedFolder, function(folder, parent, index) {
            folder.checked = changedFolder.checked;
            changedFolders[folder.id] = folder;
            if (!this.selectSubfolders) {
                return true;
            }
        }.bind(this));
        
        this.walkHierarchy(this.hierarchy, function(folder, parent, index) {
            if (this.selectOneFolder) {
                // reset all other folders to unchecked
                if (!changedFolders[folder.id]) {
                    folder.checked = false;
                }
            }
            
            //if (folder.checked && !(this.selectOneFolder && selectedFolders.length)) {
            if (folder.checked) {
                selectedFolders.push(folder);
            }
        }.bind(this));

        this.ngModelCtrl.$setViewValue(selectedFolders);
    };

    this.walkHierarchy = function walkHierarchy(folder, fn, parent, index) {
        var result = fn(folder, parent, index);
        if (result) return result;
        
        for (var i = 0; i < folder.subfolders.length; i++) {
            result = this.walkHierarchy(folder.subfolders[i], fn, folder, i);
            if (result) return result;
        }
    }.bind(this);
}

export default {
    controller: PointHierarchyBrowserController,
    templateUrl: requirejs.toUrl('./pointHierarchyBrowser.html'),
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        path: '<',
        expanded: '<?',
        selectSubfolders: '<?',
        selectOneFolder: '<?',
        hideFoldersWithNoPoints: '<?',
        folderIcon: '@?',
        folderStatusPoint: '@?',
        folderStyle: '<?',
        onQuery: '&?'
    },
    designerInfo: {
        translation: 'ui.components.maPointHierarchyBrowser',
        icon: 'share'
    }
};


