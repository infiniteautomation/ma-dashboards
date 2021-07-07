/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import 'ace-builds/src/ace';
import {require as requirejs} from 'requirejs';

let ace;

const promise = new Promise((resolve, reject) => {
    requirejs(['ace/ace', 'ace/lib/net', 'ace/edit_session'], (_ace, net, editSession) => {
        ace = _ace;
        
        net.loadScript = function(path, callback) {
            let promise, index;
            if ((index = path.indexOf('theme-')) >= 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/theme-' + path.slice(index + 'theme-'.length));
            } else if ((index = path.indexOf('mode-')) >= 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/mode-' + path.slice(index + 'mode-'.length));
            } else if ((index = path.indexOf('ext-')) >= 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/ext-' + path.slice(index + 'ext-'.length));
            } else if ((index = path.indexOf('keybinding-')) >= 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/keybinding-' + path.slice(index + 'keybinding-'.length));
            }
            
            promise.then(callback);
        };
        
        editSession.EditSession.prototype.$useWorker = false;
        
        resolve(_ace);
    }, reject);
});

export {promise, ace};
