/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import autoLoginSettingsTemplate from './autoLoginSettings.html';

const autoLoginSettings = function autoLoginSettings(User, $scope) {
    this.$onInit = function() {
        this.storedUsername = User.storedUsername();
    };
    
    this.checkUser = function checkUser() {
        if (!this.username) return;
        User.get({username: this.username}).$promise.then(function(user) {
            $scope.autoLoginSettings.username.$setValidity('notFound', true);
            $scope.autoLoginSettings.username.$setValidity('adminUser', !user.hasRole('superadmin'));
        }, function() {
            $scope.autoLoginSettings.username.$setValidity('notFound', false);
            $scope.autoLoginSettings.username.$setValidity('adminUser', true);
        });
    };
    
    this.saveCredentials = function saveCredentials() {
        if ($scope.autoLoginSettings.$valid) {
            User.storeCredentials(this.username, this.password);
            this.storedUsername = this.username;
        }
    };
    
    this.deleteCredentials = function deleteCredentials() {
        User.clearStoredCredentials();
        this.storedUsername = null;
    };
};

autoLoginSettings.$inject = ['maUser', '$scope'];

export default {
    controller: autoLoginSettings,
    template: autoLoginSettingsTemplate
};


