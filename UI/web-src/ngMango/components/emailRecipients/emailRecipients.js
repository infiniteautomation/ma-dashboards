/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import emailRecipientsTemplate from './emailRecipients.html';
import './emailRecipients.css';

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
        this.updateUsers();
    }
    
    updateUsers() {
        this.users = this.recipients.filter(r => r.type === 'USER')
            .map(r => ({username: r.username}));
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.recipients.slice());
    }
    
    removeRecipient(recipient, index) {
        this.recipients.splice(index, 1);
        this.updateUsers();
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
    
    usersChanged() {
        const current = new Set(this.recipients.filter(r => r.type === 'USER').map(u => u.username));
        const selected = this.users.map(u => u.username);

        // have to do this check for sets being equal as when mdSelect populates it checks that the model item is equal to the one in the array
        // and calls $setViewValue if its not. Our model item initially looks like {username: 'admin'} and the one from REST in the array is a full
        // user item, so angular.equals() returns false.
        if (!(selected.length === current.size && selected.every(u => current.has(u)))) {
            const usersAsRecipients = this.users.map(u => ({type: 'USER', username: u.username}));

            this.recipients = this.recipients.filter(r => r.type !== 'USER')
                .concat(usersAsRecipients);
            
            this.setViewValue();
        }
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
            this.email = null;
        }
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
