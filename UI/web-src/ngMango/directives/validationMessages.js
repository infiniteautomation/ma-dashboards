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
                    if (control.$validators) {
                        control.$validators.validationMessage = allwaysValidate;
                    }
                });
                
                const addControl = this.ngFormCtrl.$addControl;
                this.ngFormCtrl.$addControl = function(control) {
                    if (control.$validators) {
                        control.$validators.validationMessage = allwaysValidate;
                    }
                    return addControl.apply(this, arguments);
                };
            }
            
            this.checkMessages();
        }
        
        $onChanges(changes) {
            if (changes.messagesArray && !changes.messagesArray.isFirstChange()) {
                this.checkMessages();
            }
        }

        checkMessages() {
            this.messages = {};
            const messagesArray = Array.isArray(this.messagesArray) ? this.messagesArray : [];
            
            messagesArray.forEach(item => {
                // standardize path from segment[1].test to segment.1.test
                const path = this.splitName(item.property).join('.');
                let messages = this.messages[path];
                if (!messages) {
                    messages = this.messages[path] = [];
                }
                messages.push(item.message);
            });

            this.checkControls();
        }
        
        splitName(name) {
            const propArray = name.split('.');
            
            // forms are often named "$ctrl.name", remove the prefix
            if (propArray.length && propArray[0] === '$ctrl') {
                propArray.shift();
            }
            
            for (let i = 0; i < propArray.length; i++) {
                const j = i;
                let prop = propArray[j];
                
                const arrayIndexMatch = /^(.+)\[(\d+)\]$/.exec(prop);
                if (arrayIndexMatch) {
                    prop = propArray[j] = arrayIndexMatch[1];
                    propArray.splice(j + 1, 0, arrayIndexMatch[2]);
                    i++; // skip in entry we just spliced in
                }
                
                const matchesInternal = /^(.+)_internal$/.exec(prop);
                if (matchesInternal) {
                    prop = propArray[j] = matchesInternal[1];
                }
            }
            
            return propArray;
        }
        
        checkControls(control = this.ngFormCtrl, parentPath = null) {
            const path = !parentPath ? [] : parentPath.concat(this.splitName(control.$name));
            
            if (Array.isArray(control.$$controls)) {
                control.$$controls.forEach(child => {
                    this.checkControls(child, path);
                });
            }
            
            const messages = this.messages[path.join('.')];
            if (messages && messages.length) {
                const message = this.multipleMessages ? messages.join('\n') : messages[0];
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
            messagesArray: '<maValidationMessages',
            multipleMessages: '<?'
        },
        require: {
            ngFormCtrl: 'form'
        },
        controller: ValidationMessagesController
    };
}

export default validationMessages;
