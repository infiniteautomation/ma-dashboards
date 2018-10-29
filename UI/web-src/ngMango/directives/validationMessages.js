/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

function validationMessages() {

    class ValidationMessagesController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return []; }
        
        constructor() {
        }
        
        $onInit() {
            // use a validator that always returns true so that when a user changes the input the error is always cleared
            const allwaysValidate = () => true;
            
            if (this.ngModelCtrl) {
                this.ngModelCtrl.$validators.validationMessage = allwaysValidate;
            }
            
            if (this.ngFormCtrl) {
                this.ngFormCtrl.$$controls.forEach(control => {
                    control.$validators.validationMessage = allwaysValidate;
                });
                
                const addControl = this.ngFormCtrl.$addControl;
                this.ngFormCtrl.$addControl = function(control) {
                    control.$validators.validationMessage = allwaysValidate;
                    return addControl.apply(this, arguments);
                };
            }
            
            this.checkMessages();
        }
        
        $onChanges(changes) {
            if (changes.messages && !changes.messages.isFirstChange()) {
                this.checkMessages();
            }
        }
        
        checkMessages() {
            const messages = this.messages || [];
            this.messagesByProperty = messages.reduce((map, item) => {
                if (map[item.property]) {
                    map[item.property] += '\n' + item.message;
                } else {
                    map[item.property] = item.message;
                }
                return map;
            }, {});
            
            if (this.ngFormCtrl) {
                this.ngFormCtrl.$$controls.forEach(control => {
                    this.checkControl(control);
                });
            }
            
            if (this.ngModelCtrl) {
                this.checkControl(this.ngModelCtrl);
            }
        }
        
        checkControl(control) {
            const message = this.messagesByProperty[control.$name];
            if (message) {
                control.validationMessage = message;
                control.$setValidity('validationMessage', false);
            } else {
                delete control.validationMessage;
                control.$setValidity('validationMessage', true);
            }
        }
    }

    return {
        restrict: 'A',
        bindToController: {
            messages: '<maValidationMessages'
        },
        require: {
            ngModelCtrl: '?ngModel',
            ngFormCtrl: '?form'
        },
        controller: ValidationMessagesController
    };
}

export default validationMessages;
