/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import emailRecipientsTemplate from './emailRecipients.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEmailRecipients
 * @restrict E
 * @description Component for selecting a list of email, users and mailing lists to send an email to
 */

class EmailRecipientsController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    render() {
        this.recipients = this.ngModelCtrl.$viewValue || [];
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.recipients.slice());
    }
    
    removeRecipient(recipient, index) {
        this.recipients.splice(index, 1);
        this.setViewValue();
    }
    
    iconForRecipient(recipient) {
        switch(recipient.type) {
        case 'ADDRESS': return 'email';
        case 'USER': return 'person';
        case 'MAILING_LIST': return 'people';
        default: return '';
        }
    }
    
    userChanged() {
        if (this.user) {
            const existing = this.recipients.find(r => r.type === 'USER' && r.username === this.user.username);
            if (!existing) {
                this.recipients.push({
                    type: 'USER',
                    username: this.user.username
                });
                this.setViewValue();
            }
        }
        this.user = null;
    }
    
    emailChanged() {
        if (this.email) {
            const existing = this.recipients.find(r => r.type === 'ADDRESS' && r.address === this.email);
            if (!existing) {
                this.recipients.push({
                    type: 'ADDRESS',
                    address: this.email
                });
                this.setViewValue();
            }
        }
        this.email = null;
    }
}

export default {
    template: emailRecipientsTemplate,
    controller: EmailRecipientsController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.emailRecipients',
        icon: 'email'
    }
};
