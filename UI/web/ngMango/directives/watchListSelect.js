/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListSelect
  * @restrict E
  * @description
  * `<ma-watch-list-select watch-list="myWatchlist"></ma-watch-list-select>`
  * - The `<ma-watch-list-select>` component can be used to load watch list data onto a custom page.
  * - Can be combined with `<ma-watch-list-chart>` to display the watch list's custom chart designed on the watch list page.
  *
  * @param {object} ng-model Variable holds the resulting watch list object.
  * @param {string=} watch-list-xid Set to the XID of a watch list to auto load.
  * @param {boolean=} select-first Set to `false` to not auto select a the first watch list. (Defaults to `true`)
  * @param {boolean=} ng-disabled Set to `true` to disable the dropdown input. (Defaults to `false`)
  * @param {object=} query Filters the results by a property of the watch list object
  * @param {array=} sort Sorts the resulting list by a property of the watch list object. Passed as array of strings. (eg:
  * `['-xid']` sorts descending by xid)
  * @param {number=} start Sets the starting index for the resulting list. Must be used in conjunction with a `limit` value. (Defaults to `0`)
  * @param {number=} limit Limits the results in the list to a specified number of watch lists. Limit takes place after query
  * and sorting (no limit by default)
  * @param {object=} parameters Pass in parameters from `<ma-watch-list-parameters>`
  * @param {expression=} on-points-change Expression is evaluated when the points change. Available scope parameters are `$points`.
  *     e.g. `on-points-change="$ctrl.pointsChanged($points)"`)
  * 
  * @usage
  * <ma-watch-list-select no-select="true" watch-list-xid="{{watchlistXID}}" watch-list="myWatchlist"></ma-watch-list-select>
  *
  */

define(['angular', 'require', './WatchListSelectController'], function(angular, require, WatchListSelectController) {
'use strict';

watchListSelectFactory.$inject = ['$injector'];
function watchListSelectFactory($injector) {
    return {
        restrict: 'E',
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./watchListSelect-md.html');
            }
            return require.toUrl('./watchListSelect.html');
        },
        scope: {},
        controller: WatchListSelectDirectiveController,
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
            ngDisabled: '<?'
        },
        require: {
            ngModelCtrl: 'ngModel'
        },
        designerInfo: {
            translation: 'ui.components.watchListSelect',
            icon: 'remove_red_eye',
            category: 'watchLists',
            attributes: {
                ngModel: {defaultValue: 'designer.watchList', type: 'bidirectional', optional: false},
                parameters: {defaultValue: 'designer.parameters'}
            }
        }
    };
}

WatchListSelectDirectiveController.$inject = WatchListSelectController.$inject;
function WatchListSelectDirectiveController() {
    WatchListSelectController.apply(this, arguments);
}

WatchListSelectDirectiveController.prototype = Object.create(WatchListSelectController.prototype);
WatchListSelectDirectiveController.prototype.constructor = WatchListSelectDirectiveController;

WatchListSelectDirectiveController.prototype.onOpen = function() {
    return this.queryPromise;
};

return watchListSelectFactory;

}); // define
