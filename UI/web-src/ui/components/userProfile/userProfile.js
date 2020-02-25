/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import userProfileTemplate from './userProfile.html';

class UserProfileController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser']; }

    constructor(maUser) {
        this.user = maUser.current;
    }
}

export default {
    controller: UserProfileController,
    template: userProfileTemplate
};