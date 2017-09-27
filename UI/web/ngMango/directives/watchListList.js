/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', './WatchListSelectController'], function(angular, require, WatchListSelectController) {
'use strict';

watchListListFactory.$inject = ['$injector'];
function watchListListFactory($injector) {
    return {
        restrict: 'E',
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./watchListList-md.html');
            }
            return require.toUrl('./watchListList.html');
        },
        scope: {},
        controller: WatchListListController,
        controllerAs: '$ctrl',
        bindToController: {
            watchListXid: '@?',
            selectFirst: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            parameters: '=?',
            onPointsChange: '&?',

            showNewButton: '<?',
            showEditButtons: '<?',
            newButtonClicked: '&',
            editButtonClicked: '&'
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        designerInfo: {
            translation: 'ui.components.watchListList',
            icon: 'remove_red_eye',
            category: 'watchLists'
        }
    };
}

WatchListListController.$inject = WatchListSelectController.$inject.concat('maUser');
function WatchListListController(User) {
    WatchListSelectController.apply(this, arguments);
    this.User = User;
}

WatchListListController.prototype = Object.create(WatchListSelectController.prototype);
WatchListListController.prototype.constructor = WatchListListController;

return watchListListFactory;

}); // define
