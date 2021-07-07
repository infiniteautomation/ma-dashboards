/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import footerTemplate from './footer.html';
import eulaPdf from '../licensePage/EULA.pdf';
import moment from 'moment-timezone';

class FooterController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiServerInfo']; }

    constructor(maUiServerInfo) {
        this.maUiServerInfo = maUiServerInfo;
        this.year = moment().year();
        this.eulaPdf = eulaPdf;
    }
}

export default {
    controller: FooterController,
    template: footerTemplate
};

