/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointTagKeySelectTemplate from './dataPointTagKeySelect.html';
import './dataPointTagKeySelect.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointTagKeySelect
 * @restrict 'E'
 * @scope
 *
 * @description Displays a drop down list of tag keys.
 *
 * @param {expression} ng-model Assignable expression to output the selected tag key. Output will be a string.
 * 
 * @usage
 * <ma-data-point-tag-key-select ng-model="tagKey"></ma-data-point-tag-key-select>
 *
 **/

class DataPointTagKeySelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags', '$element']; }
    
    constructor(maDataPointTags, $element) {
        this.maDataPointTags = maDataPointTags;
        this.$element = $element;
        
        this.queryOnOpen = true;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
        
        if (!this.editMode) {
            this.doQuery();
        }
    }
    
    $onChanges(changes) {
        if (changes.disabledOptions) {
            this.rebuildDisabledOptions();
        }
        
        if (changes.excludeTags) {
            this.updateExcluded();
            this.searchValues = null;
        }
    }
    
    doQuery(forceRefresh = this.queryOnOpen) {
        if (this.queryPromise && !forceRefresh) {
            return this.queryPromise;
        }
        
        this.queryPromise = this.maDataPointTags.keys().then(values => {
            this.allValues = values.sort();
            this.updateExcluded();
            
            return this.values;
        });
        
        if (this.onQuery) {
            this.onQuery({$promise: this.queryPromise});
        }
        
        return this.queryPromise;
    }
    
    updateExcluded() {
        if (!Array.isArray(this.allValues)) return;
        
        if (Array.isArray(this.excludeTags)) {
            this.values = this.allValues.filter(v => !this.excludeTags.includes(v));
        } else {
            this.values = this.allValues.slice();
        }
    }
    
    rebuildDisabledOptions() {
        this.disabledOptionsMap = {};
        if (Array.isArray(this.disabledOptions)) {
            this.disabledOptions.forEach(o => this.disabledOptionsMap[o] = true);
        }
        if (this.ngModelCtrl) {
            delete this.disabledOptionsMap[this.ngModelCtrl.$modelValue];
        }
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }

    searchTextChanged() {
    }
    
    doSearch() {
        // if we already have the array of tag keys, just filter it and return it now
        if (Array.isArray(this.searchValues)) {
            return this.filterValues();
        }
        
        // refresh the array of tag keys and return promise
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
    
    enterPressed() {
        this.selected = this.searchText;
        this.searchText = '';
        this.inputChanged();
    }
}

export default {
    bindings: {
        disabledOptions: '<?',
        selectMultiple: '<?',
        selectedText: '<?',
        excludeTags: '<?',
        noFloat: '<?',
        onQuery: '&?',
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
    template: dataPointTagKeySelectTemplate,
    controller: DataPointTagKeySelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagKeySelect',
        icon: 'label'
    }
};


