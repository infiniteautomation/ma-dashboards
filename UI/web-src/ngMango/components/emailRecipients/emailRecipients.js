/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
        
        this.typeProp = 'type';
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
        if (changes.typeProperty) {
            this.typeProp = this.typeProperty || 'type';
        }
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
            if (typeOrder[a[this.typeProp]] > typeOrder[b[this.typeProp]]) return 1;
            if (typeOrder[a[this.typeProp]] < typeOrder[b[this.typeProp]]) return -1;
            return 0;
        });
    }
    
    updateSelectedUsers() {
        this.users = this.recipients.filter(r => r[this.typeProp] === 'USER')
            .map(r => ({username: r.username}));
    }
    
    updateSelectedMailingLists() {
        this.mailingLists = this.recipients.filter(r => r[this.typeProp] === 'MAILING_LIST')
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
        const existing = this.recipients.find(r => r[this.typeProp] === 'ADDRESS' && r.address === address);
        if (existing) {
            // dont add
            return null;
        }
        
        return {
            [this.typeProp]: 'ADDRESS',
            address
        };
    }
    
    iconForRecipient(recipient) {
        switch(recipient[this.typeProp]) {
        case 'ADDRESS': return 'email';
        case 'USER': return 'person';
        case 'MAILING_LIST': return 'people';
        default: return '';
        }
    }
    
    usersChanged() {
        const usersAsRecipients = this.users.map(u => ({[this.typeProp]: 'USER', username: u.username}));

        this.recipients = this.recipients.filter(r => r[this.typeProp] !== 'USER')
            .concat(usersAsRecipients);

        this.sortRecipients();
        this.setViewValue();
    }
    
    mailingListsChanged() {
        const mailingListsAsRecipients = this.mailingLists.map(ml => ({
            [this.typeProp]: 'MAILING_LIST',
            xid: ml.xid,
            id: ml.id,
            name: ml.name,
            inactiveIntervals: ml.inactiveIntervals
        }));

        this.recipients = this.recipients.filter(r => r[this.typeProp] !== 'MAILING_LIST')
            .concat(mailingListsAsRecipients);

        this.sortRecipients();
        this.setViewValue();
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
        hideMailingLists: '<?',
        typeProperty: '@?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.emailRecipients',
        icon: 'email'
    }
};
