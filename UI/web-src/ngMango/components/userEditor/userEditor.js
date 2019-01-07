/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import userEditorTemplate from './userEditor.html';
import './userEditor.css';
import moment from 'moment-timezone';

UserEditorController.$inject = ['maUser', '$http', '$mdDialog', 'maTranslate', '$mdToast', 'maLocales', '$window', '$injector'];
function UserEditorController(User, $http, $mdDialog, Translate, $mdToast, maLocales, $window, $injector) {
    this.User = User;
    this.$http = $http;
    this.timezones = moment.tz.names();
    this.$mdDialog = $mdDialog;
    this.Translate = Translate;
    this.$mdToast = $mdToast;
    this.$window = $window;
    this.$state = $injector.has('$state') && $injector.get('$state');
    
    maLocales.get().then(function(locales) {
        this.locales = locales;
    }.bind(this));
}

UserEditorController.prototype.$onChanges = function(changes) {
    if (changes.originalUser && this.originalUser) {
        this.user = angular.copy(this.originalUser);
        this.resetForm();
    }
};

UserEditorController.prototype.hashRegExp = /^\{(.*?)\}(.*)$/;

UserEditorController.prototype.resetForm = function() {
    this.password = '';
    this.confirmPassword = '';
    
    delete this.validationMessages;
    
    if (this.userForm) {
        this.userForm.$setPristine();
        this.userForm.$setUntouched();
    }
};

UserEditorController.prototype.save = function() {
    if (this.userForm.$valid) {
        if (this.password) {
            this.user.password = this.password;
        }
        
        this.user.save().then(user => {
            const previous = angular.copy(this.originalUser);
            angular.merge(this.originalUser, user);
            
            // update the cached user if we are modifying our own user
            if (previous.username === this.User.current.username) {
                this.User.current = this.originalUser;
            }
            
            const toast = this.$mdToast.simple()
                .textContent(this.Translate.trSync('ui.components.userSaved', user.username))
                .action(this.Translate.trSync('common.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(10000);
            this.$mdToast.show(toast);
            
            this.onSave({$user: this.originalUser, $previous: previous});
            this.resetForm();
        }, response => {
            if (response.data && response.data.validationMessages) {
                this.validationMessages = response.data.validationMessages;
            }
            
            let errorText = this.Translate.trSync('ui.components.errorSavingUser', this.user.username, response.mangoStatusText);
            
            const toast = this.$mdToast.simple()
                .textContent(errorText)
                .action(this.Translate.trSync('common.ok'))
                .highlightAction(true)
                .toastClass('md-warn')
                .position('bottom center')
                .hideDelay(10000);
            this.$mdToast.show(toast);
        });
    }
};

UserEditorController.prototype.revert = function() {
    this.user = angular.copy(this.originalUser);
    this.resetForm();
};

UserEditorController.prototype.remove = function(event) {
    const $ctrl = this;
    
    const confirm = this.$mdDialog.confirm()
        .title(this.Translate.trSync('ui.app.areYouSure'))
        .textContent(this.Translate.trSync('ui.components.confirmDeleteUser'))
        .ariaLabel(this.Translate.trSync('ui.app.areYouSure'))
        .targetEvent(event)
        .ok(this.Translate.trSync('common.ok'))
        .cancel(this.Translate.trSync('common.cancel'));

    this.$mdDialog.show(confirm).then(function() {
        const username = $ctrl.originalUser.username;
        $ctrl.originalUser.$delete().then(function(user) {
            $ctrl.user = null;
            $ctrl.originalUser = null;
            $ctrl.resetForm();
            $ctrl.onDelete({$user: user});
            
            const toast = $ctrl.$mdToast.simple()
                .textContent($ctrl.Translate.trSync('ui.components.userDeleted', username))
                .action($ctrl.Translate.trSync('common.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(10000);
            $ctrl.$mdToast.show(toast);
        }, function(response) {
            const toast = $ctrl.$mdToast.simple()
                .textContent($ctrl.Translate.trSync('ui.components.errorDeletingUser', username), response.mangoStatusText)
                .action($ctrl.Translate.trSync('common.ok'))
                .highlightAction(true)
                .toastClass('md-warn')
                .position('bottom center')
                .hideDelay(10000);
            $ctrl.$mdToast.show(toast);
        });
    });
};

UserEditorController.prototype.sendTestEmail = function() {
    const $ctrl = this;
    this.User.current.sendTestEmail().then(function(response) {
        const toast = $ctrl.$mdToast.simple()
            .textContent(response.data)
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        const toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('ui.components.errorSendingEmail', this.User.current.email, response.mangoStatusText))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .toastClass('md-warn')
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }.bind(this));
};

UserEditorController.prototype.switchUser = function(event) {
    const $ctrl = this;
    const username = this.originalUser.username;
    this.User.switchUser({username}).$promise.then(response => {
        const toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('ui.components.switchedUser', username))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
        
        if (this.$state) {
            // reload the resolves and views of this state and its parents
            this.$state.go('.', null, {reload: true});
        } else {
            this.$window.location.reload();
        }
    }, response => {
        const toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('ui.components.errorSwitchingUser', username, response.mangoStatusText))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .toastClass('md-warn')
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    });
};

UserEditorController.prototype.regExpEscape = function(s) {
    return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};

export default {
    controller: UserEditorController,
    template: userEditorTemplate,
    bindings: {
        originalUser: '<?user',
        onSave: '&?',
        onDelete: '&?'
    },
    designerInfo: {
        hideFromMenu: true
    }
};
