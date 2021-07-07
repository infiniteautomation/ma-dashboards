/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

 /**
  * @ngdoc directive
  * @name ngMango.directive:maWatchListGet
  * @restrict E
  * @description Gets a watch list by its XID and outputs it into the AngularJS scope. Does not display anything.
  *
  * @param {expression} ng-model Assignable expression to output the watch list to.
  * @param {string=} watch-list-xid The XID of the watch list to output.
  * @param {expression=} parameters Assignable expression to output the watch list parameters to. If parameters are passed in the defaults for the
  *     selected watch list will be applied to it.
  * @param {boolean=} [auto-state-params=false] Automatically update $stateParams (url parameters) when watch list parameters change. Also sets watch
  *     list parameters from the $stateParams when the watch list is loaded.
  * @param {expression=} on-points-change Expression is evaluated when the points change. Available scope parameters are `$points`.
  *     e.g. `on-points-change="$ctrl.pointsChanged($points)"`)
  * @param {expression=} on-parameters-change Expression is evaluated when the parameter values change. Available scope parameters are `$parameters`.
  *     e.g. `on-parameters-change="$ctrl.paramsChanged($parameters)"`)
  */

import WatchListSelectController from './WatchListSelectController';

watchListGetDirective.$inject = [];
function watchListGetDirective() {

    class WatchListGetController extends  WatchListSelectController {
        static get $$ngIsClass() {
            return true;
        }

        static get $inject() {
            return WatchListSelectController.$inject;
        }

        $onInit() {
            this.ngModelCtrl.$render = this.render.bind(this);
        }

        render() {
            super.render(...arguments);

            const prevUnsubscribe = this.unsubscribe;
            this.subscribe();
            if (prevUnsubscribe) {
                prevUnsubscribe();
            }
        }

        subscribe() {
            if (this.watchList) {
                this.unsubscribe = this.WatchList.notificationManager.subscribe({
                    scope: this.$scope,
                    handler: this.updateHandler.bind(this),
                    xids: [this.watchList.xid]
                });
            }
        }

        updateHandler(event, update) {
            if (event.name === 'update' && this.watchList && item.xid === this.watchList.xid) {
                this.setViewValue(item);
            }
        }
    }

    return {
        restrict: 'E',
        scope: {},
        controller: WatchListGetController,
        controllerAs: '$ctrl',
        bindToController: {
            watchListXid: '@?',
            parameters: '=?',
            autoStateParams: '<?',
            onPointsChange: '&?',
            onParametersChange: '&?'
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        designerInfo: {
            translation: 'ui.components.watchListGet',
            icon: 'remove_red_eye',
            category: 'watchLists'
        }
    };
}

export default watchListGetDirective;