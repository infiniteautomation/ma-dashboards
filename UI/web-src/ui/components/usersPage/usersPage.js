/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import usersPageTemplate from './usersPage.html';
import './usersPage.css';

UsersPageController.$inject = ['maUser', '$state', '$mdMedia'];
function UsersPageController(User, $state, $mdMedia) {
    this.User = User;
    this.$state = $state;
    this.$mdMedia = $mdMedia;
}

UsersPageController.prototype.$onInit = function() {
    if (this.$state.params.username) {
        this.User.get({username: this.$state.params.username}).$promise.then(function(user) {
            // causes a stack overflow when we try and deep merge this object later
            delete user.$promise;
            this.user = user;
        }.bind(this), function() {
            this.user = this.User.current;
            this.updateUrl();
        }.bind(this));
    } else {
        this.user = this.User.current;
        this.updateUrl();
    }
};

UsersPageController.prototype.updateUrl = function() {
    this.$state.params.username = this.user && this.user.username || null;
    this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
};

UsersPageController.prototype.userDeleted = function(user) {
    this.addUser();
};

UsersPageController.prototype.userSaved = function(user, prevUser) {
    // username might have been updated
    this.updateUrl();
};

UsersPageController.prototype.addUser = function($event) {
    this.user = new this.User();
    this.user.isNew = true;
    this.user.username = '';
    this.user.name = '';
    this.user.email = '';
    this.user.phone = '';
    this.user.homeUrl = '';
    this.user.locale = '';
    this.user.systemLocale = '';
    this.user.timezone = '';
    this.user.systemTimezone = '';
    this.user.permissions = 'user';
    this.user.muted = true;
    this.user.receiveOwnAuditEvents = false;
    this.user.disabled = false;
    this.user.receiveAlarmEmails = 'IGNORE';
    this.updateUrl();
};

export default {
    controller: UsersPageController,
    template: usersPageTemplate
};

