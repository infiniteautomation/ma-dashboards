/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

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
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
        
        this.queryPromise = this.maDataPointTags.keys().then(values => {
            this.values = values.sort();
            if (Array.isArray(this.excludeTags)) {
                this.values = this.values.filter(v => !this.excludeTags.includes(v));
            }
        });
        
        if (this.onQuery) {
            this.onQuery({$promise: this.queryPromise});
        }
    }
    
    $onChanges(changes) {
        if (changes.disabledOptions) {
            this.rebuildDisabledOptions();
        }
    }
    
    rebuildDisabledOptions() {
        this.disabledOptionsMap = {};
        if (this.disabledOptions) {
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

return {
    bindings: {
        disabledOptions: '<?',
        selectMultiple: '<?',
        selectedText: '<?',
        excludeTags: '<?',
        noFloat: '<?',
        onQuery: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        label: '?maLabel'
    },
    templateUrl: require.toUrl('./dataPointTagKeySelect.html'),
    controller: DataPointTagKeySelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagKeySelect',
        icon: 'label'
    }
};

}); // define
