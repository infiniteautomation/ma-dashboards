/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './mailingListSetup.html';
import angular from 'angular';

const $inject = Object.freeze(['$scope', 'maMailingList', 'maDialogHelper', 'maUser', 'maServer', 'maTranslate']);

class MailingListSetupController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maMailingList, maDialogHelper, maUser, maServer, maTranslate) {
        this.$scope = $scope;
        this.maMailingList = maMailingList;
        this.maDialogHelper = maDialogHelper;
        this.maUser = maUser;
        this.maServer = maServer;
        this.maTranslate = maTranslate;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.getUsers();
        this.recipients = [];
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.list);
    }

    render() {
        this.validationMessages = [];
        this.list = this.ngModelCtrl.$viewValue;

        this.form.$setPristine();
        this.form.$setUntouched();
    }

    save() {  

        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }

        this.validationMessages = [];

        this.list.save().then(() => {
            
            this.list = new this.maMailingList();
            this.setViewValue();
            this.render();
            this.maDialogHelper.toastOptions({textTr: ['ui.app.mailingLists.saved']});

        }, (error) => {
            if (error.status === 422) {
                this.validationMessages = error.data.result.messages;
            }

            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.mailingLists.notSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 5000
            });
            
        });

    }

    delete(event) {
        this.maDialogHelper.confirm(event, ['ui.app.mailingLists.confirmDeleteList']).then(() => {
            this.list.delete().then(() => {
                
                this.list = new this.maMailingList();
                this.setViewValue();
                this.render();
                this.maDialogHelper.toastOptions({textTr: ['ui.app.mailingLists.deleted']});

            }, (error) => {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.mailingLists.notDeleted'],
                    classes: 'md-warn',
                    hideDelay: 5000
                });
            });
        }, angular.noop);  
    }

    cancel(event) {
        this.list = new this.maMailingList();
        this.setViewValue();
        this.render();
    }

    getUsers() {
        this.maUser.query().$promise.then(users => {
            this.users = users;
        });
    }

    addRecipient() {
        const recipient = {
            recipientType: 'USER',
            username: this.users[0].username
        };
        
        this.list.recipients.push(recipient);
    }

    deleteRecipient(recipient) {
        const index = this.list.recipients.indexOf(recipient);

        if (index > -1) {
            this.list.recipients.splice(index, 1);
        }
    }

}

export default {
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: MailingListSetupController,
    template: componentTemplate
};
