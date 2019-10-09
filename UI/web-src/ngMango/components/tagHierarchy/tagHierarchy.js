/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import tagHierarchyTemplate from './tagHierarchy.html';
import './tagHierarchy.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maTagHierachy
 * @restrict E
 * @description Displays a hierarchy/tree view of data point tags
 * 
 * @param {object} ng-model Controls which hierarchy folders are selected. Object properties are tag keys and the values are arrays of the selected tag values.
 * @param {string[]} tags Array of tag keys to display in the hierarchy
 */

class TagHierarchyController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags', '$q']; }
    
    constructor(maDataPointTags, $q) {
        this.maDataPointTags = maDataPointTags;
        this.$q = $q;
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
        if (changes.tags && Array.isArray(this.tags)) {
            if (!this.tags.length) {
                this.rootPromise = this.$q.resovle([]);
            } else {
                this.rootPromise = this.queryTagValues(0, {});
            }
        }
    }
    
    queryTagValues(depth, restrictions) {
        const tagKey = this.tags[depth];
        
        const queryBuilder = this.maDataPointTags.buildQuery(tagKey);
        Object.keys(restrictions).forEach(key => {
            queryBuilder.eq(key, restrictions[key]);
        });

        return queryBuilder.query().then(values => {
            return values.filter(v => !!v).map(tagValue => {
                return {
                    tagKey,
                    tagValue,
                    hasChildren: depth < this.tags.length - 1,
                    loadChildren: () => {
                        return this.queryTagValues(depth + 1, Object.assign({
                            [tagKey]: tagValue
                        }, restrictions));
                    }
                };
            });
        });
    }
}

export default {
    template: tagHierarchyTemplate,
    controller: TagHierarchyController,
    bindings: {
        tags: '<'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.tagHierarchy',
        icon: 'account_tree'
    }
};
