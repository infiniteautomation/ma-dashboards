/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import bulkDataPointEditPageTemplate from './bulkDataPointEditPage.html';
import './bulkDataPointEditPage.css';

class BulkDataPointEditPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDialogHelper', 'maWatchList', '$q']; }
    
    constructor(maDialogHelper, maWatchList, $q) {
        this.maDialogHelper = maDialogHelper;
        this.maWatchList = maWatchList;
        this.$q = $q;
        
        this.browserOpen = true;
        this.watchListParams = {};
    }

    $onInit() {
        this.maWatchList.objQuery({
            limit: 1,
            sort: 'name'
        }).$promise.then(lists => {
            if (lists.length) {
                this.watchList = lists[0];
                this.watchListChanged();
            }
        });
    }

    $onChanges(changes) {
    }

    watchListChanged() {
        if (this.watchList) {
            this.watchList.defaultParamValues(this.watchListParams);
        }
        this.getPoints();
    }
    
    getPoints() {
        if (this.wlPointsPromise) {
            this.wlPointsPromise.cancel();
        }
        
        if (this.watchList) {
            this.wlPointsPromise = this.watchList.getPoints(this.watchListParams);
        } else {
            this.wlPointsPromise = this.$q.resolve([]);
        }

        this.pointsPromise = this.wlPointsPromise.then(points => {
            return (this.points = points);
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.errorGettingPoints', error.mangoStatusText || '' + error],
                hideDelay: 10000
            });
            this.points = [];
        });
    }
    
    taskStarted(promise) {
        this.bulkTaskPromise = promise.finally(() => delete this.bulkTaskPromise);
    }
}

export default {
    template: bulkDataPointEditPageTemplate,
    controller: BulkDataPointEditPageController,
    bindings: {
    },
    require: {
    }
};