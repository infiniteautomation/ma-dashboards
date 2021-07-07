/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import componentTemplate from './mailingListEmail.html';

const $inject = Object.freeze(['maDialogHelper', 'maServer', 'maTranslate', 'maUser']);

class MailingListSetupController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor(maDialogHelper, maServer, maTranslate, maUser) {
        this.maDialogHelper = maDialogHelper;
        this.maServer = maServer;
        this.maTranslate = maTranslate;
        this.maUser = maUser;
    }

    $onInit() {

    }

    $onChanges(changes) {
        if (this.mailingList) {
            this.maTranslate.trAll({
                testEmail: ['ui.app.mailingLists.testEmail', this.mailingList.name],
                subject: 'ui.app.mailingLists.testSubject'
            }).then((tr) => {
                this.initValues = {
                    subject: tr.subject,
                    htmlContent: `<p>${tr.testEmail}</p>`,
                    plainContent: tr.testEmail,
                    type: 'HTML_AND_TEXT'
                };
                this.email = angular.copy(this.initValues);

                if (this.defaultSubject) this.email.subject = this.defaultSubject;
                if (this.defaultHtmlContent) this.email.htmlContent = this.defaultHtmlContent;
                if (this.defaultTextContent) this.email.plainContent = this.defaultTextContent;
            });
        }
    }

    send() {
        this.form.$setPristine();
        this.form.$setUntouched();

        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }

        let data = angular.copy(this.email);

        if (data.type === 'HTML') delete data.plainContent;
        if (data.type === 'TEXT') delete data.htmlContent;

        this.maServer.sendEmailToMailingList(this.mailingList.xid, data).then(response => {
            this.maDialogHelper.toastOptions({text: response.data});
        }, error => {
            if (error.status === 403) {
                return this.maTranslate.tr('systemSettings.permissions.sendToMailingList').then(tr => {
                    this.maDialogHelper.errorToast([
                        'ui.app.mailingLists.sendEmailPermissionError',
                        `\"${tr}\"`
                    ]);
                })
            }
            this.maDialogHelper.errorToast(['ui.components.errorSendingEmail', this.mailingList.name, error.mangoStatusText]);
        })
    }

}

export default {
    bindings: {
        mailingList: '<',
        sendEmailButtonTitle: '@?',
        defaultSubject: '@?',
        defaultHtmlContent: '@?',
        defaultTextContent: '@?'
    },
    controller: MailingListSetupController,
    template: componentTemplate
};
