/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import userAuthTokensTemplate from './userAuthTokens.html';
import moment from 'moment-timezone';

/**
 * @ngdoc directive
 * @name ngMango.directive:maUserAuthTokens
 * @restrict E
 * @scope
 * 
 * @description Creates and revokes JWT authentication tokens for a user.
 * 
 * @param {object} user The user to create or revoke tokens for
 */

class UserAuthTokensController {
    static get $$ngIsClass() { return true; }
    static get $inject() {
        return ['maUser', '$element', 'maDialogHelper'];
    }
    
    constructor(maUser, $element, maDialogHelper) {
        this.maUser = maUser;
        this.$element = $element;
        this.maDialogHelper = maDialogHelper;
        
        this.expiryPreset = '1 day';
        this.expiryDate = moment().add(1, 'day').toDate();
    }
    
    $onInit() {
    }

    $onChanges(changes) {
        delete this.authToken;
    }

    expiryDateChanged() {
        delete this.authToken;
        
        this.expiryPreset = null;
    }
    
    expiryPresetChanged() {
        delete this.authToken;
        
        const split = this.expiryPreset.split(' ');
        this.expiryDate = moment().add(parseInt(split[0], 10), split[1]).toDate();
    }
    
    createAuthToken(event) {
        delete this.authToken;
        
        this.maUser.createAuthToken(this.expiryDate, this.user.username).then(token => {
            this.authToken = token;

//            this.maDialogHelper.toastOptions({
//                textTr: ['ui.app.createAuthTokenSuccess']
//            });
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.createAuthTokenFailure', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    }
    
    revokeAuthTokens(event) {
        this.maDialogHelper.confirm(event, ['ui.app.confirmRevokeAuthTokensForUser', this.user.username]).then(() => {
            delete this.authToken;
            
            this.maUser.revokeAuthTokens(this.user.username).then(() => {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.revokeAuthTokensForUserSuccess', this.user.username]
                });
            }, error => {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.revokeAuthTokensForUserFailure', this.user.username, error.mangoStatusText],
                    hideDelay: 10000,
                    classes: 'md-warn'
                });
            });
        }, angular.noop);
    }
    
    revokeAllAuthTokens(event) {
        this.maDialogHelper.confirm(event, ['ui.app.confirmRevokeAllAuthTokens']).then(() => {
            delete this.authToken;

            this.maUser.revokeAllAuthTokens(this.user.username).then(() => {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.revokeAllAuthTokensSuccess']
                });
            }, error => {
                this.maDialogHelper.toastOptions({
                    textTr: ['ui.app.revokeAllAuthTokensFailure', error.mangoStatusText],
                    hideDelay: 10000,
                    classes: 'md-warn'
                });
            });
        }, angular.noop);
    }

    copyToClipboard(event) {
        this.$element[0].querySelector('.ma-user-auth-token').select();
        if (document.execCommand('copy')) {
            this.maDialogHelper.toastOptions({
                textTr: 'ui.app.copyToClipboardSucess'
            });
        } else {
            this.maDialogHelper.toastOptions({
                textTr: 'ui.app.copyToClipboardFailed',
                hideDelay: 10000,
                classes: 'md-warn'
            });
        }
    }
}

export default {
    template: userAuthTokensTemplate,
    controller: UserAuthTokensController,
    bindings: {
        user: '<'
    },
    designerInfo: {
        translation: 'ui.dox.userAuthTokens',
        icon: 'vpn_key'
    }
};


