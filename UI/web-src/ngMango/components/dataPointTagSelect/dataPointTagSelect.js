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
        if (changes.key || changes.restrictions || changes.editMode) {
            delete this.queryPromise;
            delete this.values;
            delete this.searchValues;
            
            if (!this.editMode) {
                this.doQuery(true);
            }
        }
    }
    
    doQuery(forceRefresh = this.queryOnOpen) {
        if (this.queryPromise && !forceRefresh) {
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
        // if we already have the array of tags, just filter it and return it now
        if (Array.isArray(this.searchValues)) {
            return this.filterValues();
        }
        
        // refresh the array of tags and return promise
        return this.doQuery().then(values => {
            this.searchValues = values;
            return this.filterValues();
        });
    }
    
    autocompleteBlurred() {
        // clear the values when the input blurs so next time the drop down opens we call doQuery() again
        this.searchValues = null;
    }
    
    filterValues() {
        if (!this.searchText || typeof this.searchText !== 'string') {
            return this.searchValues.slice();
        }
        
        const searchLower = this.searchText.toLowerCase();
        return this.searchValues.filter(val => {
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
        editMode: '<?',
        labelText: '@?'
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


