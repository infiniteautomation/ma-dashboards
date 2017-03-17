/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', './WatchListSelectController'], function(angular, require, WatchListSelectController) {
'use strict';

watchListGetFactory.$inject = [];
function watchListGetFactory() {
    return {
        restrict: 'E',
        scope: {},
        controller: WatchListGetController,
        controllerAs: '$ctrl',
        bindToController: {
            watchListXid: '@?',
            selectFirst: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            parameters: '<?',
            onPointsChange: '&?'
        },
        require: {
            'ngModelCtrl': 'ngModel'
        }
    };
}

WatchListGetController.$inject = WatchListSelectController.$inject;
function WatchListGetController() {
    WatchListSelectController.apply(this, arguments);
}

WatchListGetController.prototype = Object.create(WatchListSelectController.prototype);
WatchListGetController.prototype.constructor = WatchListGetController;

return watchListGetFactory;

}); // define
