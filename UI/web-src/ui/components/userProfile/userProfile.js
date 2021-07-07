/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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