/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './userStatus.html';

class VerifyEmailController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {}
}

export default {
    controller: VerifyEmailController,
    template: componentTemplate,
    bindings: {
        user: '<?'
    }
};