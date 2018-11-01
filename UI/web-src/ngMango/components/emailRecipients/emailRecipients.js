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

const typeOrder = {
    MAILING_LIST: 1,
    USER: 2,
    ADDRESS: 3
};

class EmailRecipientsController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
        // COMMA, SEMICOLON, ENTER
        this.separatorKeys = [188, 186, 13];
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }
    
    render() {
        if (Array.isArray(this.ngModelCtrl.$viewValue)) {
            this.recipients = this.ngModelCtrl.$viewValue.slice();
            this.sortRecipients();
        } else {
            this.recipients = [];
        }
        
        this.email = null;
        if (this.emailCtrl) {
            this.emailCtrl.$setPristine();
            this.emailCtrl.$setUntouched();
        }
        
        this.updateSelectedUsers();
        this.updateSelectedMailingLists();
    }
    
    sortRecipients() {
        this.recipients.sort((a, b) => {
            if (typeOrder[a.type] > typeOrder[b.type]) return 1;
            if (typeOrder[a.type] < typeOrder[b.type]) return -1;
            return 0;
        });
    }
    
    updateSelectedUsers() {
        this.users = this.recipients.filter(r => r.type === 'USER')
            .map(r => ({username: r.username}));
    }
    
    updateSelectedMailingLists() {
        this.mailingLists = this.recipients.filter(r => r.type === 'MAILING_LIST')
            .map(r => ({
                xid: r.xid,
                id: r.id,
                name: r.name,
                inactiveIntervals: r.inactiveIntervals
            }));
    }

    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.recipients.slice());
    }
    
    chipsChanged() {
        this.updateSelectedUsers();
        this.updateSelectedMailingLists();
        this.setViewValue();
    }
    
    emailToRecipient(address) {
        const existing = this.recipients.find(r => r.type === 'ADDRESS' && r.address === address);
        if (existing) {
            // dont add
            return null;
        }
        
        return {
            type: 'ADDRESS',
            address
        };
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
        if (!(selected.length === current.size && selected.every(un => current.has(un)))) {
            const usersAsRecipients = this.users.map(u => ({type: 'USER', username: u.username}));

            this.recipients = this.recipients.filter(r => r.type !== 'USER')
                .concat(usersAsRecipients);

            this.sortRecipients();
            this.setViewValue();
        }
    }
    
    mailingListsChanged() {
        const current = new Set(this.recipients.filter(r => r.type === 'MAILING_LIST').map(ml => ml.xid));
        const selected = this.mailingLists.map(ml => ml.xid);

        // have to do this check for sets being equal as when mdSelect populates it checks that the model item is equal to the one in the array
        // and calls $setViewValue if its not. Our model item initially looks like {username: 'admin'} and the one from REST in the array is a full
        // user item, so angular.equals() returns false.
        if (!(selected.length === current.size && selected.every(xid => current.has(xid)))) {
            const mailingListsAsRecipients = this.mailingLists.map(ml => ({
                type: 'MAILING_LIST',
                xid: ml.xid,
                id: ml.id,
                name: ml.name,
                inactiveIntervals: ml.inactiveIntervals
            }));

            this.recipients = this.recipients.filter(r => r.type !== 'MAILING_LIST')
                .concat(mailingListsAsRecipients);

            this.sortRecipients();
            this.setViewValue();
        }
    }
    
    chipKeyDown(event) {
        // stops the email being added if it is invalid
        if (this.separatorKeys.includes(event.keyCode)) {
            if (this.emailCtrl && this.emailCtrl.$invalid) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.emailCtrl.$setTouched();
            }
        }
    }
}

export default {
    template: emailRecipientsTemplate,
    controller: EmailRecipientsController,
    bindings: {
        hideMailingLists: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.emailRecipients',
        icon: 'email'
    }
};
