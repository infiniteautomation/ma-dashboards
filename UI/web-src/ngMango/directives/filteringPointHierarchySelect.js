/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import filteringPointHierarchySelectTemplate from './filteringPointHierarchySelect.html';

filteringPointHierarchySelect.$inject = ['$injector'];
function filteringPointHierarchySelect($injector) {
    return {
        restrict: 'E',
        scope: {},
        template: filteringPointHierarchySelectTemplate,
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

PointHierarchyController.$inject = ['$attrs', 'maPointHierarchy'];
function PointHierarchyController($attrs, PointHierarchy) {
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
        const subfoldersOnly = $attrs.subfoldersOnly === undefined ? true : !!this.subfoldersOnly;
        const subfolders = $attrs.subfolders === undefined ? this.maxDepth == null || this.maxDepth > 0 : !!this.subfolders;
        const getPoints = $attrs.points === undefined ? true : !!this.points;
        
        let path;
        if (!this.path) {
            path = [];
        } else {
            path = typeof this.path === 'string' ? this.path.split(',') : this.path;
        }
        
        const hierarchy = path.length ?
                PointHierarchy.byPath({path: path, subfolders: subfolders, points: getPoints}) :
                PointHierarchy.getRoot({subfolders: subfolders, points: getPoints});

        this.folderList = [];
        const seenNames = {};
        const matcher = this.nameMatches && new RegExp(this.nameMatches, 'gi');
        this.displayProp = this.replaceName ? 'replacedName' : 'name';
        const displayNameMatcher = this.searchText && new RegExp(this.searchText, 'gi');
        
        return hierarchy.$promise.then(function(folder) {
            PointHierarchy.walkHierarchy(folder, function(subFolder, parent, index, depth) {
                if ((subfoldersOnly && subFolder === folder) || (this.maxDepth != null && depth > this.maxDepth)) return;
                if (matcher) {
                    subFolder.matches = matcher.exec(subFolder.name);
                    if (this.replaceName && subFolder.matches) {
                        subFolder.replacedName = subFolder.name.replace(matcher, this.replaceName);
                    }
                }
                const displayName = subFolder[this.displayProp];
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

export default filteringPointHierarchySelect;


