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
                this.user = user;
            }, () => {
                this.user = null;
                this.updateUrl();
            });
        } else {
            this.user = null;
            this.updateUrl();
        }
    }
    
    updateUrl() {
        this.$state.params.username = this.user && !this.user.isNew() && this.user.username || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
    
    addUser($event) {
        this.user = new this.User();
        this.updateUrl();
    }
    
    userEditorClosed() {
        this.user = null;
        this.selectedTab = 0;
        this.updateUrl();
    }
}

export default {
    controller: UsersPageController,
    template: usersPageTemplate
};