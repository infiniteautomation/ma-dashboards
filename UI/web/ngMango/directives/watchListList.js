/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListList
  * @restrict E
  * @description Displays a scrollable list of watch lists for selecting a watch list.
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
  * @param {expression=} on-parameters-change Expression is evaluated when the parameter values change. Available scope parameters are `$parameters`.
  *     e.g. `on-parameters-change="$ctrl.paramsChanged($parameters)"`)
  * @param {boolean=} [show-new-button=false] Show a button for adding a new watch list
  * @param {boolean=} [show-edit-buttons=false] Show edit buttons next to each watch list
  * @param {expression=} new-button-clicked Action to take when button is clicked. Available scope parameters are `$event` and `$watchList`.
  * @param {expression=} edit-button-clicked Action to take when button is clicked. Available scope parameters are `$event` and `$watchList`.
  * 
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
            onParametersChange: '&?',

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
