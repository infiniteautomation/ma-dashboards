/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

validationMessages.$inject = ['maUtil'];
function validationMessages(maUtil) {

    class ValidationMessagesController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return []; }
        
        constructor() {
        }
        
        $onInit() {
            // use a validator that always returns true so that when a user changes the input the error is always cleared
            const allwaysValidate = () => true;

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
                const path = maUtil.splitPropertyName(item.property).join('.');
                let messages = this.messages[path];
                if (!messages) {
                    messages = this.messages[path] = [];
                }
                messages.push(item.message);
            });

            this.checkControls();
        }
        
        checkControls(control = this.ngFormCtrl, parentPath = null) {
            const path = !parentPath ? [] : parentPath.concat(maUtil.splitPropertyName(control.$name, true));
            
            const isForm = Array.isArray(control.$$controls);
            if (isForm) {
                control.$$controls.forEach(child => {
                    this.checkControls(child, path);
                });
            }
            
            let messages;
            if (path.length) {
                messages = this.messages[path.join('.')];
            } else if (control === this.ngFormCtrl) {
                messages = this.messages[''];
            }

            if (messages && messages.length) {
                const message = this.multipleMessages ? messages.join('\n') : messages[0];
                control.validationMessage = message;
                // only set inputs to invalid
                if (!isForm) {
                    control.$setValidity('validationMessage', false);
                }
            } else {
                delete control.validationMessage;
                if (!isForm) {
                    control.$setValidity('validationMessage', true);
                }
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
