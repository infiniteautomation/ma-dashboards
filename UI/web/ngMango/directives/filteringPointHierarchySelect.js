/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

filteringPointHierarchySelect.$inject = ['$injector'];
function filteringPointHierarchySelect($injector) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: require.toUrl('./filteringPointHierarchySelect.html'),
        controllerAs: '$ctrl',
        bindToController: {
            path: '<?',
            points: '<?',
            subfolders: '<?',
            subfoldersOnly: '<?',
            maxDepth: '<?',
            nameMatches: '@?',
            replaceName: '@?',
            uniqueNames: '<?',
            labelText: '<'
        },
        require: {
            ngModelCtrl: 'ngModel'
        },
        controller: PointHierarchyController,
        designerInfo: {
            translation: 'ui.components.filteringPointHierarchySelect',
            icon: 'filter_list'
        }
    };
}

PointHierarchyController.$inject = ['$attrs', 'maPointHierarchy', '$timeout'];
function PointHierarchyController($attrs, PointHierarchy, $timeout) {
    this.displayProp = this.replaceName ? 'replacedName' : 'name';
    
    this.$onInit = function() {
        this.ngModelCtrl.render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
    };

    this.onChange = function() {
        this.ngModelCtrl.$setViewValue(this.selected);
    };
    
    this.queryFolders = function queryFolders() {
        var subfoldersOnly = angular.isUndefined($attrs.subfoldersOnly) ? true : !!this.subfoldersOnly;
        var subfolders = angular.isUndefined($attrs.subfolders) ? this.maxDepth == null || this.maxDepth > 0 : !!this.subfolders;
        var getPoints = angular.isUndefined($attrs.points) ? true : !!this.points;
        
        var path;
        if (!this.path) {
            path = [];
        } else {
            path = typeof this.path === 'string' ? this.path.split(',') : this.path;
        }
        
        var hierarchy = path.length ?
                PointHierarchy.byPath({path: path, subfolders: subfolders, points: getPoints}) :
                PointHierarchy.getRoot({subfolders: subfolders, points: getPoints});

        this.folderList = [];
        var seenNames = {};
        var matcher = this.nameMatches && new RegExp(this.nameMatches, 'gi');
        this.displayProp = this.replaceName ? 'replacedName' : 'name';
        var displayNameMatcher = this.searchText && new RegExp(this.searchText, 'gi');
        
        return hierarchy.$promise.then(function(folder) {
            PointHierarchy.walkHierarchy(folder, function(subFolder, parent, index, depth) {
                if ((subfoldersOnly && subFolder === folder) || (this.maxDepth != null && depth > this.maxDepth)) return;
                if (matcher) {
                    subFolder.matches = matcher.exec(subFolder.name);
                    if (this.replaceName && subFolder.matches) {
                        subFolder.replacedName = subFolder.name.replace(matcher, this.replaceName);
                    }
                }
                var displayName = subFolder[this.displayProp];
                if ((!matcher || subFolder.matches) && !(this.uniqueNames && seenNames[displayName]) &&
                        (!displayNameMatcher || displayName.match(displayNameMatcher))) {
                    this.folderList.push(subFolder);
                    seenNames[displayName] = true;
                }
            }.bind(this));
            
            return this.folderList;
        }.bind(this));
    };
}

return filteringPointHierarchySelect;

}); // define
