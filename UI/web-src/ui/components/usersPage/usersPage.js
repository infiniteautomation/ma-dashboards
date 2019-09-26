/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import usersPageTemplate from './usersPage.html';
import './usersPage.css';

class UsersPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$state', '$mdMedia']; }

    constructor(User, $state, $mdMedia) {
        this.User = User;
        this.$state = $state;
        this.$mdMedia = $mdMedia;
    }

    $onInit() {
        if (this.$state.params.username) {
            this.User.get({username: this.$state.params.username}).$promise.then(user => {
                // causes a stack overflow when we try and deep merge this object later
                delete user.$promise;
                this.user = user;
            }, () => {
                this.user = this.User.current;
                this.updateUrl();
            });
        } else {
            this.user = this.User.current;
            this.updateUrl();
        }
    }
    
    updateUrl() {
        this.$state.params.username = this.user && !this.user.isNew() && this.user.username || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
    
    userDeleted(user) {
        this.addUser();
    }
    
    userSaved(user, prevUser) {
        // username might have been updated
        this.updateUrl();
    }
    
    addUser($event) {
        this.user = new this.User();
        this.updateUrl();
    }
}

export default {
    controller: UsersPageController,
    template: usersPageTemplate
};