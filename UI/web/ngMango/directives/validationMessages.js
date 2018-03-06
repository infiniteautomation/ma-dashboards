/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

ValidationMessagesController.$inject = [];
function ValidationMessagesController() {
}

ValidationMessagesController.prototype.$onInit = function() {
    this.checkMessages();
    this.ngModelCtrl.$validators.validationMessage = function() {
        return true;
    };
};

ValidationMessagesController.prototype.$onChanges = function(changes) {
    if (changes.messages) {
        this.checkMessages();
    }
};

ValidationMessagesController.prototype.checkMessages = function() {
    if (!this.ngModelCtrl) return;
    if (this.messages) {
        for (var i = 0; i < this.messages.length; i++) {
            if (this.messages[i].property === this.ngModelCtrl.$name) {
                this.ngModelCtrl.validationMessage = this.messages[i].message;
                this.ngModelCtrl.$setValidity('validationMessage', false);
                return;
            }
        }
    }
    delete this.ngModelCtrl.validationMessage;
    this.ngModelCtrl.$setValidity('validationMessage', true);
};

function ValidationMessages() {
    return {
        restrict: 'A',
        bindToController: {
            messages: '<maValidationMessages'
        },
        require: {
            ngModelCtrl: 'ngModel'
        },
        controller: ValidationMessagesController
    };
}

export default ValidationMessages;


