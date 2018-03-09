/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import 'ace-builds';
import {require as requirejs} from 'requirejs';

let ace;

const promise = new Promise((resolve, reject) => {
    requirejs(['ace/ace', 'ace/lib/net', 'ace/edit_session'], (_ace, net, editSession) => {
        ace = _ace;
        
        net.loadScript = function(path, callback) {
            let promise;
            if (path.indexOf('theme-') === 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/theme-' + path.slice('theme-'.length));
            } else if (path.indexOf('mode-') === 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/mode-' + path.slice('mode-'.length));
            } else if (path.indexOf('ext-') === 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/ext-' + path.slice('ext-'.length));
            } else if (path.indexOf('keybinding-') === 0) {
                promise = import(/* webpackMode: "eager" */ 'ace-builds/src/keybinding-' + path.slice('keybinding-'.length));
            }
            
            promise.then(callback);
        };
        
        editSession.EditSession.prototype.$useWorker = false;
        
        resolve(_ace);
    }, reject);
});

export {promise, ace};
