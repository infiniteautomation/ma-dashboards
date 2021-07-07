/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';


class JsonModelController {
    static get $$ngIsClass() { return true; }
    
    constructor() {
        this.pretty = 4;
    }
    
    $onInit() {
        this.ngModelCtrl.$parsers.push(value => {
            this.ngModelCtrl.$setValidity('jsonParseError', true);
            delete this.ngModelCtrl.jsonParseError;
            
            if (typeof value !== 'string' || value === '')
                return value;
            
            try {
                return angular.fromJson(value);
            } catch (e) {
                this.ngModelCtrl.$setValidity('jsonParseError', false);
                this.ngModelCtrl.jsonParseError = '' + e;
            }
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

export default jsonModel;