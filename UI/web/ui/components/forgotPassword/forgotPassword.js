/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

class ForgotPasswordController {
    static get $inject() { return ['maUser', '$stateParams']; }
    
    constructor(maUser, $stateParams) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
    }
    
    $onInit() {
        if (this.$stateParams.username) {
            this.username = this.$stateParams.username;
        }
    }

    sendEmail() {
        this.forgotForm.$setSubmitted();

        if (this.forgotForm && this.forgotForm.username) {
            this.forgotForm.username.$setValidity('found', true);
        }
        if (this.forgotForm && this.forgotForm.email) {
            this.forgotForm.email.$setValidity('matches', true);
        }
        
        if (this.forgotForm.$invalid) return;
        
        return this.maUser.sendPasswordResetEmail(this.username, this.email).then(response => {
            console.log(response);
        }, error => {
            if (this.forgotForm && this.forgotForm.username) {
                this.forgotForm.username.$setValidity('found', false);
            }
            if (this.forgotForm && this.forgotForm.email) {
                this.forgotForm.email.$setValidity('matches', false);
            }
        });
    }
}

return {
    controller: ForgotPasswordController,
    templateUrl: require.toUrl('./forgotPassword.html')
};

}); // define
