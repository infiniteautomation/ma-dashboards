/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

class JsonModelController {
    static get $$ngIsClass() { return true; }
    
    constructor() {
        this.pretty = 4;
    }
    
    $onInit() {
        this.ngModelCtrl.$parsers.push(value => {
            if (typeof value !== 'string' || value === '')
                return value;
            return angular.fromJson(value);
        });
        
        this.ngModelCtrl.$formatters.push(value => {
            if (value === undefined)
                return value;
            return angular.toJson(value, this.pretty);
        });
    }
}

const jsonModel = function jsonModel() {
    return {
        restrict: 'A',
        require: {
            ngModelCtrl: 'ngModel'
        },
        scope: false,
        bindToController: {
            pretty: '<?maJsonModelPretty'
        },
        controller: JsonModelController
    };
};

return jsonModel;

}); // define
