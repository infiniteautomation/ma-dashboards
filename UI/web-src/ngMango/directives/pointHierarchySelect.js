/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import pointHierarchySelectMdTemplate from './pointHierarchySelect-md.html';
import pointHierarchySelectTemplate from './pointHierarchySelect.html';

pointHierarchySelect.$inject = ['$injector'];
function pointHierarchySelect($injector) {
    return {
        restrict: 'E',
        template: function() {
            if ($injector.has('$mdUtil')) {
                return pointHierarchySelectMdTemplate;
            }
            return pointHierarchySelectTemplate;
        },
        controllerAs: '$ctrl',
        bindToController: true,
        replace: true,
        scope: {
            path: '<?',
            points: '<?',
            subfolders: '<?',
            subfoldersOnly: '<?',
            maxDepth: '<?',
            nameMatches: '@?',
            replaceName: '@?',
            uniqueNames: '<?',
            showClear: '<?'
        },
        controller: PointHierarchyController,
        designerInfo: {
            translation: 'ui.components.maPointHierarchySelect',
            icon: 'share'
        }
    };
}

PointHierarchyController.$inject = ['$attrs', 'maPointHierarchy'];
function PointHierarchyController($attrs, PointHierarchy) {
    this.$onChanges = function(changes) {
        this.doQuery();
    };
    
    this.doQuery = function doQuery() {
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
        
        this.queryPromise = hierarchy.$promise.then(function(folder) {
            PointHierarchy.walkHierarchy(folder, function(subFolder, parent, index, depth) {
                if ((subfoldersOnly && subFolder === folder) || (this.maxDepth != null && depth > this.maxDepth)) return;
                if (matcher) {
                    subFolder.matches = matcher.exec(subFolder.name);
                    matcher.lastIndex = 0;
                    if (this.replaceName && subFolder.matches) {
                        subFolder.replacedName = subFolder.name.replace(matcher, this.replaceName);
                    }
                }
                const displayName = subFolder[this.displayProp];
                if ((!matcher || subFolder.matches) && !(this.uniqueNames && seenNames[displayName])) {
                    this.folderList.push(subFolder);
                    seenNames[displayName] = true;
                }
            }.bind(this));
        }.bind(this));
    };
    
    this.onOpen = function onOpen() {
        return this.queryPromise;
    };
}

export default pointHierarchySelect;


