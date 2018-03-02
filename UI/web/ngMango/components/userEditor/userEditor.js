/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';
import moment from 'moment-timezone';


UserEditorController.$inject = ['maUser', '$http', '$mdDialog', 'maTranslate', '$mdToast', 'maLocales'];
function UserEditorController(User, $http, $mdDialog, Translate, $mdToast, maLocales) {
    this.User = User;
    this.$http = $http;
    this.timezones = moment.tz.names();
    this.$mdDialog = $mdDialog;
    this.Translate = Translate;
    this.$mdToast = $mdToast;
    
    maLocales.get().then(function(locales) {
        this.locales = locales;
    }.bind(this));
}

UserEditorController.prototype.$onChanges = function(changes) {
    if (changes.originalUser && this.originalUser) {
        this.user = angular.copy(this.originalUser);
        this.prepareUser(this.user);
        this.resetForm();
    }
};

UserEditorController.prototype.hashRegExp = /^\{(.*?)\}(.*)$/;

UserEditorController.prototype.prepareUser = function(user) {
    user.password = '';
    user.confirmPassword = '';
};

UserEditorController.prototype.resetForm = function() {
    if (this.userForm) {
        this.userForm.$setPristine();
        this.userForm.$setUntouched();
    }
};

UserEditorController.prototype.save = function() {
    if (this.userForm.$valid) {
        this.user.saveOrUpdate({username: this.originalUser.username}).then(function(user) {
            var previous = angular.copy(this.originalUser);
            delete this.originalUser.isNew;
            angular.merge(this.originalUser, user);
            
            // update the cached user if we are modifying our own user
            if (previous.username === this.User.current.username) {
                this.User.current = this.originalUser;
            }
            
            var toast = this.$mdToast.simple()
                .textContent(this.Translate.trSync('ui.components.userSaved', user.username))
                .action(this.Translate.trSync('common.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(10000);
            this.$mdToast.show(toast);
            
            this.onSave({$user: this.originalUser, $previous: previous});
            this.prepareUser(user);
            this.resetForm();
        }.bind(this), function(response) {
            this.validationMessages = response.data.validationMessages;
            
            var toast = this.$mdToast.simple()
                .textContent(this.Translate.trSync('ui.components.errorSavingUser', this.user.username))
                .action(this.Translate.trSync('common.ok'))
                .highlightAction(true)
                .highlightClass('md-warn')
                .position('bottom center')
                .hideDelay(10000);
            this.$mdToast.show(toast);
        }.bind(this));
    }
};

UserEditorController.prototype.revert = function() {
    this.user = angular.copy(this.originalUser);
    this.prepareUser(this.user);
    this.resetForm();
};

UserEditorController.prototype.remove = function(event) {
    var $ctrl = this;
    
    var confirm = this.$mdDialog.confirm()
        .title(this.Translate.trSync('ui.app.areYouSure'))
        .textContent(this.Translate.trSync('ui.components.confirmDeleteUser'))
        .ariaLabel(this.Translate.trSync('ui.app.areYouSure'))
        .targetEvent(event)
        .ok(this.Translate.trSync('common.ok'))
        .cancel(this.Translate.trSync('common.cancel'));

    this.$mdDialog.show(confirm).then(function() {
        var username = $ctrl.originalUser.username;
        $ctrl.originalUser.$delete().then(function(user) {
            $ctrl.user = null;
            $ctrl.originalUser = null;
            $ctrl.resetForm();
            $ctrl.onDelete({$user: user});
            
            var toast = $ctrl.$mdToast.simple()
                .textContent($ctrl.Translate.trSync('ui.components.userDeleted', username))
                .action($ctrl.Translate.trSync('common.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(10000);
            $ctrl.$mdToast.show(toast);
        }, function(response) {
            var toast = $ctrl.$mdToast.simple()
                .textContent($ctrl.Translate.trSync('ui.components.errorDeletingUser', username))
                .action($ctrl.Translate.trSync('common.ok'))
                .highlightAction(true)
                .highlightClass('md-warn')
                .position('bottom center')
                .hideDelay(10000);
            $ctrl.$mdToast.show(toast);
        });
    });
};

UserEditorController.prototype.sendTestEmail = function() {
    var $ctrl = this;
    this.User.current.sendTestEmail().then(function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent(response.data)
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('ui.components.errorSendingEmail', this.User.current.email))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .highlightClass('md-warn')
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }.bind(this));
};

UserEditorController.prototype.switchUser = function(event) {
    var $ctrl = this;
    var username = this.user.username;
    this.User.switchUser({username: username}).$promise.then(function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('ui.components.switchedUser', username))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('ui.components.errorSwitchingUser', username))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .highlightClass('md-warn')
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
    templateUrl: requirejs.toUrl('./userEditor.html'),
    bindings: {
        originalUser: '<?user',
        onSave: '&?',
        onDelete: '&?'
    },
    designerInfo: {
        hideFromMenu: true
    }
};


