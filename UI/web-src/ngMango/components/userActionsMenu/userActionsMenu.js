/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './userActionsMenu.html';

class UserActionsMenuController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$injector', 'maDialogHelper', '$window']; }
    
    constructor(User, $injector, maDialogHelper, $window) {
        this.User = User;
        this.maDialogHelper = maDialogHelper;
        this.$window = $window;
        this.$state = $injector.has('$state') && $injector.get('$state');
    }

    sendTestEmail(event) {
        this.sendingEmail = true;
        this.user.sendTestEmail().then(response => {
            this.maDialogHelper.toastOptions({text: response.data});
        }, error => {
            this.maDialogHelper.errorToast(['ui.components.errorSendingEmail', this.user.email, error.mangoStatusText]);
        }).finally(() => {
            delete this.sendingEmail;
        });
    }
    
    switchUser(event) {
        const username = this.user.username;
        this.switchingUser = true;
        this.User.switchUser({username}).$promise.then(response => {
            this.maDialogHelper.toast(['ui.components.switchedUser', username]);
    
            if (this.$state) {
                // reload the resolves and views of this state and its parents
                this.$state.go('.', null, {reload: true});
            } else {
                this.$window.location.reload();
            }
        }, error => {
            this.maDialogHelper.errorToast(['ui.components.errorSwitchingUser', username, error.mangoStatusText]);
        }).finally(() => {
            delete this.switchingUser;
        });
    }
    
    sendEmailVerification(event) {
        this.sendingEmailVerification = true;
        this.user.sendEmailVerification().then(response => {
            this.maDialogHelper.toast(['ui.components.emailSent', this.user.email]);
        }, error => {
            this.maDialogHelper.errorToast(['ui.components.errorSendingEmail', this.user.email, error.mangoStatusText]);
        }).finally(() => {
            delete this.sendingEmailVerification;
        });
    }
    
    copyUser(event) {
        const copy = this.user.copy(true);
        if (typeof this.onCopy === 'function') {
            this.onCopy({$event: event, $user: copy});
        }
    }
}

export default {
    controller: UserActionsMenuController,
    template: componentTemplate,
    bindings: {
        user: '<?',
        onCopy: '&?'
    }
};