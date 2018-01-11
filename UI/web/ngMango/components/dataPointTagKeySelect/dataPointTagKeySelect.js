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
    }
    
    $onChanges(changes) {
        this.maDataPointTags.keys().then(values => {
            this.values = values.sort();
        });
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
}

return {
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    templateUrl: require.toUrl('./dataPointTagKeySelect.html'),
    controller: DataPointTagKeySelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagKeySelect',
        icon: 'label'
    }
};

}); // define
