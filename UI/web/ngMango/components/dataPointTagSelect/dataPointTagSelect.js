/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

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
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
    }
    
    $onChanges(changes) {
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
        });
        
        if (this.onQuery) {
            this.onQuery({$promise: this.queryPromise});
        }
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
}

return {
    bindings: {
        key: '@',
        restrictions: '<?',
        selectMultiple: '<?',
        deselectOnQuery: '<?',
        onQuery: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        label: '?maLabel'
    },
    templateUrl: require.toUrl('./dataPointTagSelect.html'),
    controller: DataPointTagSelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagSelect',
        icon: 'label',
        attributes: {
            key: {options: ['name', 'device']},
        }
    }
};

}); // define
