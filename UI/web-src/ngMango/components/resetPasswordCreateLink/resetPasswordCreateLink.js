/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './resetPasswordCreateLink.html';
import './resetPasswordCreateLink.css';

class RestPasswordCreateLinkController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maUser', '$document']; }
    
    constructor($element, maUser, $document) {
        this.$element = $element;
        this.maUser = maUser;
        this.$document = $document;
        
        this.lockPassword = true;
        this.sendEmail = false;
    }

    $onChanges(changes) {
        if (changes && changes.user) {
            delete this.resetData;
        }
    }
    
    createLink(event) {
        return this.maUser.createPasswordResetLink(this.user.username, this.lockPassword, this.sendEmail).then(data => {
            this.resetToken = data;
        });
    }

    copyToClipboard(event) {
        const textarea = this.$element[0].querySelector('textarea');
        textarea.focus();
        textarea.select();
        this.$document[0].execCommand("copy");
    }
}

export default {
    controller: RestPasswordCreateLinkController,
    template: componentTemplate,
    bindings: {
        user: '<?'
    }
};