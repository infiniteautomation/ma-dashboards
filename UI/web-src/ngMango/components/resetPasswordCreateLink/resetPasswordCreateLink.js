/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './resetPasswordCreateLink.html';

class RestPasswordCreateLinkController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser']; }
    
    constructor(maUser) {
        this.maUser = maUser;
        
        this.lockPassword = true;
        this.sendEmail = true;
    }

    $onChanges(changes) {
        if (changes && changes.user) {
            delete this.resetData;
        }
    }
    
    createLink() {
        return this.maUser.createPasswordResetLink(this.user.username, this.lockPassword, this.sendEmail).then(data => {
            this.resetData = data;
        });
    }
    
    onOk() {
        console.log(this.maDialog);
    }
}

export default {
    controller: RestPasswordCreateLinkController,
    template: componentTemplate,
    require: {
        maDialog: '?^maDialog'
    },
    bindings: {
        user: '<?',
        onOk: '&?'
    }
};