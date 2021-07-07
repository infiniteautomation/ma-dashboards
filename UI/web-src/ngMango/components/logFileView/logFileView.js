/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import logFileViewTemplate from './logFileView.html';
import './logFileView.css';

export default {
    template: logFileViewTemplate,
    bindings: {
        fileName: '<'
    }
};