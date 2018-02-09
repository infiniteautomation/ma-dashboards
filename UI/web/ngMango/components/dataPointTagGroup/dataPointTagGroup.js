/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointTagGroup
 * @restrict 'E'
 * @scope
 *
 * @description Provides an interface to select tag values for a group of tag keys.
 **/

class DataPointTagGroupController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags']; }
    
    constructor(maDataPointTags) {
        this.maDataPointTags = maDataPointTags;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };

        const promise = this.maDataPointTags.keys().then(tagKeys => {
            this.tagKeys = tagKeys.sort();
        });
        
        if (this.onQuery) {
            this.onQuery({$promise: promise});
        }
    }
    
    $onChanges(changes) {
        
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(Object.assign({}, this.selected));
    }
}

return {
    bindings: {
        onQuery: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    templateUrl: require.toUrl('./dataPointTagGroup.html'),
    controller: DataPointTagGroupController
};

}); // define
