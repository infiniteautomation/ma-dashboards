/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import tagHierarchyTemplate from './tagHierarchy.html';
import './tagHierarchy.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maTagHierarchy
 * @restrict E
 * @description Displays a hierarchy/tree view of data point tags
 * 
 * @param {object[]=} ng-model Object or array of objects (for multi-select) representing which folders are selected,
 * object properties are the tag keys and the values are tag values.
 * @param {boolean} ng-multiple Allows the selection of multiple tag values, if true the model is an array
 * @param {string[]} tags Array of tag keys to display in the hierarchy
 * @param {expression=} points Expression that is evaluated when points are fetched. Available locals are <code>$points</code>.
 */

class TagHierarchyController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags', '$q', 'maPoint']; }
    
    constructor(maDataPointTags, $q, maPoint) {
        this.maDataPointTags = maDataPointTags;
        this.$q = $q;
        this.maPoint = maPoint;
    }
    
    $onInit() {
        if (this.ngModelCtrl) {
            this.ngModelCtrl.$render = () => this.render();
        } else {
            this.render();
        }
    }
    
    $onChanges(changes) {
        if (changes.tags) {
            if (!Array.isArray(this.tags) || !this.tags.length) {
                this.rootPromise = this.$q.resolve([]);
            } else {
                this.rootPromise = this.queryTagValues();
            }
        }
    }
    
    queryTagValues(parent) {
        const depth = parent && parent.depth + 1 || 0;
        const restrictions = parent && parent.restrictions || {};
        
        const tagKey = this.tags[depth];
        
        const queryBuilder = this.maDataPointTags.buildQuery(tagKey);
        Object.keys(restrictions).forEach(key => {
            queryBuilder.eq(key, restrictions[key]);
        });

        return queryBuilder.query().then(values => {
            return values.filter(v => !!v).sort().map(tagValue => {
                const $ctrl = this;

                return {
                    depth,
                    tagKey,
                    tagValue,
                    restrictions: Object.assign({
                        [tagKey]: tagValue
                    }, restrictions),
                    loadChildren() {
                        return $ctrl.queryTagValues(this);
                    },
                    hasChildren: depth < this.tags.length - 1,
                    get selected() {
                        return $ctrl.isSelected(this.restrictions);
                    },
                    set selected(value) {
                        if (value) {
                            $ctrl.select(this.restrictions);
                        } else {
                            $ctrl.deselect(this.restrictions);
                        }
                    },
                    get disabled() {
                        return parent && parent.selected;
                    },
                    get childSelected() {
                        return $ctrl.isChildSelected(this.restrictions);
                    }
                };
            });
        });
    }
    
    matches(r1, r2) {
        const k1 = Object.keys(r1);
        return k1.length && k1.every(k => r1[k] === r2[k]);
    }
    
    isSelected(restrictions) {
        return this.selected.some(r => this.matches(r, restrictions));
    }
    
    isChildSelected(restrictions) {
        return this.selected.some(r => this.matches(restrictions, r));
    }
    
    select(restrictions) {
        if (this.multiple) {
            this.selected = this.selected.filter(r => !this.matches(restrictions, r));
        } else {
            this.selected = [];
        }
        this.selected.push(restrictions);
        this.setViewValue();
    }
    
    deselect(restrictions) {
        this.selected = this.selected.filter(r => !this.matches(restrictions, r));
        this.setViewValue();
    }

    render() {
        this.selected = [];
        if (this.ngModelCtrl) {
            const viewValue = this.ngModelCtrl.$viewValue;
            if (this.multiple && Array.isArray(viewValue)) {
                this.selected = viewValue;
            } else if (!this.multiple && viewValue != null) {
                this.selected = [viewValue];
            }

            this.selected = this.selected.map(tags => {
                return Object.keys(tags).reduce((newTags, k) => {
                    // remove any null/undefined values from the tag objects
                    const value = tags[k];
                    if (value != null) {
                        newTags[k] = value;
                    }
                    return newTags;
                }, {});
            }).filter(tags => Object.keys(tags).length); // remove any tag objects that have no keys/values
        }
        this.retrievePoints();
    }
    
    setViewValue() {
        if (this.ngModelCtrl) {
            if (this.multiple) {
                this.ngModelCtrl.$setViewValue(this.selected);
            } else {
                this.ngModelCtrl.$setViewValue(this.selected[0] || {});
            }
        }
        this.retrievePoints();
    }
    
    retrievePoints() {
        if (this.queryPromise) {
            this.maPoint.cancelRequest(this.queryPromise);
        }
        if (this.selected.length && typeof this.pointsCallback === 'function') {
            const queryBuilder = this.maPoint.buildQuery();

            queryBuilder.or();
            this.selected.forEach(restrictions => {
                queryBuilder.and();
                Object.keys(restrictions).forEach(k => {
                    queryBuilder.eq(`tags.${k}`, restrictions[k]);
                });
                queryBuilder.up();
            });
            queryBuilder.up();
            
            this.queryPromise = queryBuilder.query();
            this.queryPromise.then(points => {
                this.pointsCallback({$points: points});
            }, error => null);
        }
    }
}

export default {
    template: tagHierarchyTemplate,
    controller: TagHierarchyController,
    bindings: {
        tags: '<',
        pointsCallback: '&?points',
        multiple: '<?ngMultiple'
    },
    require: {
        ngModelCtrl: '?ngModel'
    },
    designerInfo: {
        translation: 'ui.components.tagHierarchy',
        icon: 'account_tree'
    }
};
