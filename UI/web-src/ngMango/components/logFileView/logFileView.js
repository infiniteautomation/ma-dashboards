/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Pier Puccini
 */

import logFileViewTemplate from './logFileView.html';
import './logFileView.css';

class logFileViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maLogFileView']; }
    
    constructor(maLogFileView) {
        this.maLogFileView = maLogFileView        
    }
    
    $onInit() {
        if (this.url) {
            this.getFilename();
        }
    }

    $onChanges(changes) {
        if (typeof changes.url.currentValue == "string") {
            this.getFilename();
        }
    }

    getFilename() {
        this.maLogFileView.getFilename(this.url).then(response => {
            this.logFilePath = response;
        });
    }
}

export default {
    controller: logFileViewController,
    template: logFileViewTemplate,
    require: {},
    bindings: {
        url: '<'
    }
};