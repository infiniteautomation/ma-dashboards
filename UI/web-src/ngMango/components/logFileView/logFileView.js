/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Pier Puccini
 */

import logFileViewTemplate from './logFileView.html';
import './logFileView.css';

export default {
    template: logFileViewTemplate,
    bindings: {
        fileName: '<'
    }
};