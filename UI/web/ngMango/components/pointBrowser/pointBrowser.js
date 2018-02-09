/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

class PointBrowserController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return []; }
    constructor() {
    }

    $onInit() {
    }
    
    $onChanges(changes) {
    }
}

return {
    templateUrl: require.toUrl('./pointBrowser.html'),
    controller: PointBrowserController,
    bindings: {
    },
    require: {
    }
};

}); // define
