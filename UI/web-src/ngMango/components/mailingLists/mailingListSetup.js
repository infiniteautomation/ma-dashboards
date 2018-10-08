/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './mailingListSetup.html';
import angular from 'angular';

const $inject = Object.freeze(['$rootScope', '$scope', 'maMailingList', 'maDialogHelper', '$http']);

class MailingListSetupController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($rootScope, $scope, maMailingList, maDialogHelper, $http) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.maMailingList = maMailingList;
        this.maDialogHelper = maDialogHelper;
        this.$http = $http;
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
            this.$rootScope.$broadcast('MailingListUpdated', true);
            this.$rootScope.$broadcast('newMailingList', true);
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
                this.$rootScope.$broadcast('mailingListUpdated', true);
                this.$rootScope.$broadcast('newMailingList', true);
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
        this.$rootScope.$broadcast('mailingListUpdated', true);
        this.$rootScope.$broadcast('newMailingList', true);
        this.setViewValue();
        this.render();
    }

    getUsers() {
        this.$http({
            url: '/rest/v1/users',
            method: 'GET'
        }).then(
            (data) => {
                this.users = data.data.items;
            }, function(error) {
                console.log(error);
            }
        );
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
