/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import usersPageTemplate from './usersPage.html';
import './usersPage.css';

class UsersPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$state']; }

    constructor(User, $state) {
        this.User = User;
        this.$state = $state;
    }

    $onInit() {
        if (this.$state.params.username) {
            this.User.get({username: this.$state.params.username}).$promise.then(user => {
                // causes a stack overflow when we try and deep merge this object later
                delete user.$promise;
                this.editUser(user);
            }, () => {
                this.editUser(null);
            });
        } else {
            this.editUser(null);
        }
    }

    addUser($event) {
        this.editUser(new this.User());
    }
    
    editUser(user) {
        this.user = user;
        this.$state.params.username = this.user && !this.user.isNew() && this.user.username || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
        
        if (user != null && !this.showDialog) {
            this.showDialog = {};
        }
    }
    
    userEditorClosed() {
        delete this.showDialog;
        this.editUser(null);
        this.selectedTab = 0;
    }
    
    deleteUsers($event) {
        
    }
    
    rowClicked(event, item, index, tableCtrl) {
        if (event.target.classList.contains('ma-checkbox-column')) {
            tableCtrl.selectRow(event, item, index);
        } else {
            this.editUser(item);
        }
    }
}

export default {
    controller: UsersPageController,
    template: usersPageTemplate
};