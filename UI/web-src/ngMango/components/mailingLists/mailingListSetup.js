/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './mailingListSetup.html';
import angular from 'angular';

const $inject = Object.freeze(['$scope', 'maMailingList', 'maDialogHelper', 'maUser']);

class MailingListSetupController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maMailingList, maDialogHelper, maUser) {
        this.$scope = $scope;
        this.maMailingList = maMailingList;
        this.maDialogHelper = maDialogHelper;
        this.maUser = maUser;
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
        this.validationMessages = [];

        this.list.save().then(() => {
            
            this.list = new this.maMailingList();
            this.$scope.emit('mailingListUpdated', true);
            this.$scope.emit('newMailingList', true);
            this.setViewValue();
            this.render();
            this.maDialogHelper.toastOptions({textTr: ['ui.app.mailingLists.saved']});

        }, (error) => {
            this.validationMessages = error.data.result.messages;

            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.mailingLists.notSaved', error.mangoStatusText],
                classes: 'md-warn',
                hideDelay: 10000
            });
            
        });

    }

    checkError(property) {
        if (!this.validationMessages || this.validationMessages.length == 0) {
            return null;
        }

        return this.validationMessages.filter((item) => {
            return item.property.includes(property);
        }, property)[0];
    }

    delete(event) {
        this.maDialogHelper.confirm(event, ['ui.app.mailingLists.confirmDeleteList']).then(() => {
            this.list.delete().then(() => {
                
                this.list = new this.maMailingList();
                this.$scope.emit('mailingListUpdated', true);
                this.$scope.emit('newMailingList', true);
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
        this.$scope.emit('mailingListUpdated', true);
        this.$scope.emit('newMailingList', true);
        this.setViewValue();
        this.render();
    }

    getUsers() {
        this.maUser.rql("").$promise.then(users => {
            this.users = users;
        })
    }

    addRecipient() {
        const recipient = {
            type: 'USER',
            username: this.users[0].username
        };
        
        this.recipients.push(recipient);

    }

    deleteRecipient(recipient) {
        const index = this.recipients.indexOf(recipient);

        if (index > -1) {
            this.recipients.splice(index, 1);
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
