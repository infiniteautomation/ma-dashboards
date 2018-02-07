/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListSelect
  * @restrict E
  * @description Displays a drop-down input for selecting a watch list.
  * - Can be combined with `<ma-watch-list-chart>` to display the watch list's custom chart designed on the watch list page.
  *
  * @param {expression} ng-model Assignable expression to output the selected watch list to.
  * @param {string=} watch-list-xid Set to the XID of a watch list to auto load.
  * @param {boolean=} [select-first=true] Set to `false` to not auto select a the first watch list.
  * @param {boolean=} [ng-disabled=false] Set to `true` to disable the drop-down input.
  * @param {object=} query Query object, filters the resulting list of watch lists. e.g. `{name: 'boiler'}` means watch list name contains boiler .
  * @param {string[]=} sort Sorts the resulting list by a property of the watch list object. Passed as array of strings. e.g.
  * `['-xid', 'name']` sorts descending by xid, then by name).
  * @param {number=} [start=0] Sets the starting index for the resulting list. Must be used in conjunction with a `limit` value.
  * @param {number=} limit Limits the results in the list to a specified number of watch lists. Limit takes place after query
  * and sorting.
  * @param {expression=} parameters Assignable expression to output the watch list parameters to. If parameters are passed in the defaults for the
  *     selected watch list will be applied to it.
  * @param {expression=} on-points-change Expression is evaluated when the points change. Available scope parameters are `$points`.
  *     e.g. `on-points-change="$ctrl.pointsChanged($points)"`)
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
