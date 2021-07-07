/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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