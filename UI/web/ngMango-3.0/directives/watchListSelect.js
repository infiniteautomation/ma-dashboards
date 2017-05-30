/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

 /**
  * @ngdoc directive
  * @name ngMango.maWatchListSelect
  * @restrict E
  * @description
  * `<ma-watch-list-select watch-list="myWatchlist"></ma-watch-list-select>`
  * - The `<ma-watch-list-select>` component can be used to load watch list data onto a custom page.
  * - Can be combined with `<ma-watch-list-chart>` to display the watch list's custom chart designed on the watch list page.
  *
  * @param {object} watch-list Variable holds the resulting watch list object.
  * @param {string=} watch-list-xid Set to the XID of a watch list to auto load or bind a string for dynamic switching (as shown above).
  * @param {boolean=} no-select Set to `true` to hide the dropdown select from the page, but still availble for loading watchlist data. (Defaults to `false`)
  * @param {array=} points Array of point objects contained in the watch list object.
  * @param {boolean=} select-first Set to `false` to not auto select a the first watch list. (Defaults to `true`)
  * @param {boolean=} disabled Set to `true` to disable the dropdown input. (Defaults to `false`)
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
            parameters: '<?',
            onPointsChange: '&?',
            
            ngDisabled: '<?'
        },
        require: {
            ngModelCtrl: 'ngModel'
        },
        designerInfo: {
            translation: 'ui.components.watchListSelect',
            icon: 'arrow_drop_down',
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
