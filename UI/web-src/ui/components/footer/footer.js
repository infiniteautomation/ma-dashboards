/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import footerTemplate from './footer.html';
import moment from 'moment-timezone';

class FooterController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiServerInfo']; }

    constructor(maUiServerInfo) {
        this.maUiServerInfo = maUiServerInfo;
        this.year = moment().year();
    }
}

export default {
    controller: FooterController,
    template: footerTemplate
};

