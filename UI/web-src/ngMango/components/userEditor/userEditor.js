/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import userEditorTemplate from './userEditor.html';
import './userEditor.css';
import moment from 'moment-timezone';

class UserEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$http', '$mdDialog', 'maTranslate', 'maLocales', '$window', '$injector', 'maDialogHelper', '$scope']; }
    
    constructor(User, $http, $mdDialog, Translate, maLocales, $window, $injector, maDialogHelper, $scope) {
        this.User = User;
        this.$http = $http;
        this.timezones = moment.tz.names();
        this.$mdDialog = $mdDialog;
        this.Translate = Translate;
        this.$window = $window;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;

        this.formName = '';
        this.showStatus = true;
        
        maLocales.get().then(locales => {
            this.locales = locales;
        });

        /* Cannot get this to work effectively until we have some sort of version / updated property
        if (this.User.current) {
            this.User.notificationManager.subscribe((event, item, attributes) => {
                if (this.originalUser && !this.originalUser.isNew() && this.originalUser.username === item.username) {
                    this.updatedUserEvent = event.name;
                    this.updatedUser = item;
                }
            }, this.$scope);
        }
        */
    }
    
    $onChanges(changes) {
        if (changes.originalUser && this.originalUser) {
            this.render();
        }
        
        if (changes.disabledAttr) {
            this.disabled = this.disabledAttr || !this.registerMode && !this.User.current.hasAnyPermission('permissions.user.editSelf');
        }
    }
    
    render(user = this.originalUser) {
        delete this.updatedUserEvent;
        delete this.updatedUser;
        
        if (this.registerMode) {
            this.user = user;
        } else {
            this.user = angular.copy(user);
        }
        this.resetForm();
    }

    resetForm() {
        this.password = '';
        this.confirmPassword = '';
        
        delete this.validationMessages;
        
        if (this.userForm) {
            this.userForm.$setPristine();
            this.userForm.$setUntouched();
        }
    }
    
    save() {
        this.userForm.$setSubmitted();
        if (!this.userForm.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }

        this.saving = true;
        
        this.user.save().then(user => {
            const previous = angular.copy(this.originalUser);
            angular.merge(this.originalUser, user);
            
            // update the cached user if we are modifying our own user
            if (previous.username === this.User.current.username) {
                this.User.current = this.originalUser;
            }
    
            this.maDialogHelper.toast(['ui.components.userSaved', user.username]);
            
            this.onSave({$user: this.originalUser, $previous: previous});
            this.render();
        }, error => {
            if (error.data && error.data.validationMessages) {
                this.validationMessages = error.data.validationMessages;
            }
    
            this.maDialogHelper.errorToast(['ui.components.errorSavingUser', this.user.username, error.mangoStatusText]);
        }).finally(() => delete this.saving);
    }
    
    revert() {
        this.render(this.updatedUser);
    }
    
    remove(event) {
        this.deleting = true;
        
        const confirm = this.$mdDialog.confirm()
            .title(this.Translate.trSync('ui.app.areYouSure'))
            .textContent(this.Translate.trSync('ui.components.confirmDeleteUser'))
            .ariaLabel(this.Translate.trSync('ui.app.areYouSure'))
            .targetEvent(event)
            .ok(this.Translate.trSync('common.ok'))
            .cancel(this.Translate.trSync('common.cancel'));
    
        this.$mdDialog.show(confirm).then(() => {
            const username = this.originalUser.username;
            this.originalUser.$delete().then(user => {
                this.user = null;
                this.originalUser = null;
                this.resetForm();
                this.onDelete({$user: user});
    
                this.maDialogHelper.toast(['ui.components.userDeleted', username]);
            }, error => {
                this.maDialogHelper.errorToast(['ui.components.errorDeletingUser', username, error.mangoStatusText]);
            });
        }).catch(e => null).finally(() => delete this.deleting);
    }

    regExpEscape(s) {
        return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    passwordChanged() {
        if (this.password && this.password === this.confirmPassword) {
            this.user.password = this.password;
        } else {
            delete this.user.password;
        }
    }
}

export default {
    controller: UserEditorController,
    template: userEditorTemplate,
    bindings: {
        originalUser: '<?user',
        onSave: '&?',
        onDelete: '&?',
        disabledAttr: '@?disabled',
        registerMode: '<?',
        showStatus: '<?',
        formName: '@?name'
    },
    designerInfo: {
        hideFromMenu: true
    }
};
