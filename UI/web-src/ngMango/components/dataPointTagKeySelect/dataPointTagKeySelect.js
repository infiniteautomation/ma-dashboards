/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointTagKeySelectTemplate from './dataPointTagKeySelect.html';

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
    static get $inject() { return ['maDataPointTags']; }
    
    constructor(maDataPointTags) {
        this.maDataPointTags = maDataPointTags;
        
        this.queryOnOpen = true;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
        
        this.doQuery();
    }
    
    $onChanges(changes) {
        if (changes.disabledOptions) {
            this.rebuildDisabledOptions();
        }
        
        if (changes.excludeTags) {
            this.updateExcluded();
        }
    }
    
    doQuery() {
        if (!this.queryOnOpen && this.queryPromise) {
            return this.queryPromise;
        }
        
        this.queryPromise = this.maDataPointTags.keys().then(values => {
            this.values = this.allValues = values.sort();
            this.updateExcluded();
            
            return this.values;
        });
        
        if (this.onQuery) {
            this.onQuery({$promise: this.queryPromise});
        }
        
        return this.queryPromise;
    }
    
    updateExcluded() {
        if (Array.isArray(this.allValues) && Array.isArray(this.excludeTags)) {
            this.values = this.allValues.filter(v => !this.excludeTags.includes(v));
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
}

export default {
    bindings: {
        disabledOptions: '<?',
        selectMultiple: '<?',
        selectedText: '<?',
        excludeTags: '<?',
        noFloat: '<?',
        onQuery: '&?',
        queryOnOpen: '<?'
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


