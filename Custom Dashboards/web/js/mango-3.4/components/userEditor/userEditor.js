/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

UserEditorController.$inject = ['User', '$http', '$mdDialog', 'Translate', '$mdToast'];
function UserEditorController(User, $http, $mdDialog, Translate, $mdToast) {
    this.User = User;
    this.$http = $http;
    this.timezones = moment.tz.names();
    this.$mdDialog = $mdDialog;
    this.Translate = Translate;
    this.$mdToast = $mdToast;
    
    $http.get(require.toUrl('dashboards/vendor/localeList.json')).then(function(response) {
        this.locales = response.data;
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
                .textContent(this.Translate.trSync('dashboards.v3.components.userSaved', user.username))
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
                .textContent(this.Translate.trSync('dashboards.v3.components.errorSavingUser', this.user.username))
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
        .title(this.Translate.trSync('dashboards.v3.app.areYouSure'))
        .textContent(this.Translate.trSync('dashboards.v3.components.confirmDeleteUser'))
        .ariaLabel(this.Translate.trSync('dashboards.v3.app.areYouSure'))
        .targetEvent(event)
        .ok(this.Translate.trSync('common.ok'))
        .cancel(this.Translate.trSync('common.cancel'));

    this.$mdDialog.show(confirm).then(function() {
        var username = $ctrl.originalUser;
        $ctrl.originalUser.$delete().then(function(user) {
            $ctrl.user = null;
            $ctrl.originalUser = null;
            $ctrl.resetForm();
            $ctrl.onDelete({$user: user});
            
            var toast = $ctrl.$mdToast.simple()
                .textContent($ctrl.Translate.trSync('dashboards.v3.components.userDeleted', username))
                .action($ctrl.Translate.trSync('common.ok'))
                .highlightAction(true)
                .position('bottom center')
                .hideDelay(10000);
            $ctrl.$mdToast.show(toast);
        }, function(response) {
            var toast = $ctrl.$mdToast.simple()
                .textContent($ctrl.Translate.trSync('dashboards.v3.components.errorDeletingUser', username))
                .action($ctrl.Translate.trSync('common.ok'))
                .highlightAction(true)
                .highlightClass('md-warn')
                .position('bottom center')
                .hideDelay(10000);
            $ctrl.$mdToast.show(toast);
        });
    });
};

UserEditorController.prototype.showMessages = function(field) {
    return this.userForm[field].$invalid && (this.userForm[field].$touched || this.userForm.$submitted);
};

UserEditorController.prototype.sendTestEmail = function() {
    var $ctrl = this;
    var emailAddress = this.user.email;
    
    this.$http({
        url: '/rest/v1/server/email/test',
        params: {
            username: this.user.username,
            email: emailAddress
        },
        method: 'PUT',
        data: null,
        accept: 'application/json'
    }).then(function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent(response.data)
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('dashboards.v3.components.errorSendingEmail', emailAddress))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .highlightClass('md-warn')
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    });
};

UserEditorController.prototype.switchUser = function(event) {
    var $ctrl = this;
    var username = this.user.username;
    
    this.User.switchUser({username: username}).$promise.then(function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('dashboards.v3.components.switchedUser', username))
            .action($ctrl.Translate.trSync('common.ok'))
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(10000);
        $ctrl.$mdToast.show(toast);
    }, function(response) {
        var toast = $ctrl.$mdToast.simple()
            .textContent($ctrl.Translate.trSync('dashboards.v3.components.errorSwitchingUser', username))
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

return {
    controller: UserEditorController,
    templateUrl: require.toUrl('./userEditor.html'),
    bindings: {
        originalUser: '<?user',
        onSave: '&?',
        onDelete: '&?'
    }
};

}); // define
