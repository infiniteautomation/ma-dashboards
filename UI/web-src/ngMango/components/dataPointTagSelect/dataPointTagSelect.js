/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointTagSelectTemplate from './dataPointTagSelect.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointTagSelect
 * @restrict 'E'
 * @scope
 *
 * @description Displays a drop down list of tag values for a given key. You can set restrictions for other tag keys.
 *
 * @param {string} key The tag key to display available values for.
 * @param {object=} restrictions Restrictions for other tag keys. The object is a map of tag keys to tag values.
 * @param {boolean=} [select-multiple=false] Set to true in order to enable selecting multiple tag values.
 * 
 * @usage
 * <ma-data-point-tag-select ng-model="selectedTagValue" key="name" restrictions="{device: 'Device 1'}" select-multiple="true"></ma-data-point-tag-select>
 *
 **/

class DataPointTagSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags']; }
    
    constructor(maDataPointTags) {
        this.maDataPointTags = maDataPointTags;
        
        this.showAnyOption = true;
        this.queryOnOpen = true;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
    }
    
    $onChanges(changes) {
        if (changes.key || changes.restrictions) {
            this.doQuery();
        }
    }
    
    doQuery() {
        if (this.queryPromise && (!this.queryOnOpen || this.editMode)) {
            return this.queryPromise;
        }
        
        const restrictions = Object.assign({}, this.restrictions);
        delete restrictions[this.key];

        this.queryPromise = this.maDataPointTags.values(this.key, restrictions).then(values => {
            this.values = values.sort();
            
            if (this.deselectOnQuery) {
                if (this.selected === null || typeof this.selected === 'string') {
                    if (!this.values.includes(this.selected)) {
                        this.selected = undefined;
                        this.inputChanged();
                    }
                } else if (Array.isArray(this.selected)) {
                    const newSelections = this.selected.filter(s => this.values.includes(s));
                    if (newSelections.length !== this.selected.length) {
                        this.selected = newSelections;
                        this.inputChanged();
                    }
                }
            }
            
            return this.values;
        });
        
        if (this.onQuery) {
            this.onQuery({$promise: this.queryPromise});
        }
        
        return this.queryPromise;
    }
    
    inputChanged() {
        if (this.editMode) {
            this.ngModelCtrl.$setViewValue(this.selected || this.searchText || '');
        } else {
            this.ngModelCtrl.$setViewValue(this.selected);
        }
    }

    searchTextChanged() {
        this.ngModelCtrl.$setViewValue(this.searchText);
    }
    
    doSearch() {
        return this.doQuery().then(values => {
            return this.filterValues();
        });
    }
    
    filterValues() {
        if (!this.searchText || typeof this.searchText !== 'string') {
            return this.values.slice();
        }
        
        const searchLower = this.searchText.toLowerCase();
        return this.values.filter(val => {
            return val.toLowerCase().includes(searchLower);
        });
    }
}

export default {
    bindings: {
        key: '@',
        restrictions: '<?',
        selectMultiple: '<?',
        deselectOnQuery: '<?',
        selectedText: '<?',
        noFloat: '<?',
        onQuery: '&?',
        showAnyOption: '<?',
        queryOnOpen: '<?',
        editMode: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        label: '?maLabel'
    },
    template: dataPointTagSelectTemplate,
    controller: DataPointTagSelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagSelect',
        icon: 'label',
        attributes: {
            key: {options: ['name', 'device']},
        }
    }
};


