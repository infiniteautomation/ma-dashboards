/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';
import purgePointValuesTemplate from './purgePointValues.html';
import './purgePointValues.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maPurgePointValues
 * @restrict E
 * @description Used to purge point values for a set of data points or a data source
 */

class PurgePointValuesController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDialogHelper', 'maPointValues', '$scope']; }
    
    constructor(DialogHelper, pointValues, $scope) {
        this.DialogHelper = DialogHelper;
        this.pointValues = pointValues;
        this.$scope = $scope;
        
        this.duration = {
            periods: 1,
            type: 'YEARS'
        };
        
        this.useTimeRange = false;
        this.to = moment().startOf('month').toDate();
        this.from = moment(this.to).subtract(1, 'month').toDate();
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
        if (changes.cancelAttr && !changes.cancelAttr.isFirstChange()) {
            this.cancel();
        }
    }
    
    confirmStart(event) {
        if (Array.isArray(this.dataPoints) && this.dataPoints.length) {
            this.DialogHelper.confirm(event, ['ui.app.bulkEditConfirmPurge', this.dataPoints.length]).then(() => {
                this.start();
            }, () => null);
        } else if (this.dataSource) {
            this.DialogHelper.confirm(event, ['ui.app.bulkEditConfirmPurgeDataSource', this.dataPoints.length]).then(() => {
                this.start();
            }, () => null);
        }
    }
    
    start() {
        this.purgeTask = new this.pointValues.PurgeTemporaryResource({
            xids: Array.isArray(this.dataPoints) && this.dataPoints.map(p => p.xid),
            dataSourceXid: this.dataSource && this.dataSource.xid,
            purgeAll: this.purgeAll,
            duration: this.duration,
            useTimeRange: this.useTimeRange,
            timeRange: {
                from: this.from,
                to: this.to
            }
        });
        
        this.purgePromise = this.purgeTask.start(this.$scope);

        this.purgePromise.then(purgeTask => {
            this.purgeTask = purgeTask;
        }, null, update => {
            this.purgeTask = update;
        }).finally(() => {
            delete this.purgeTask;
            delete this.purgePromise;
        });
    }
    
    cancel() {
        if (this.purgeTask) {
            this.pointValues.cancelPurge(this.purgeTask.id);
        }
    }
}

export default {
    template: purgePointValuesTemplate,
    controller: PurgePointValuesController,
    bindings: {
        dataPoints: '<?points',
        dataSource: '<?source',
        onPurge: '&?',
        cancelAttr: '<?cancel'
    }
};
