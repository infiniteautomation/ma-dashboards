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
    static get $inject() { return ['maDialogHelper', 'maPointValues']; }
    
    constructor(DialogHelper, pointValues) {
        this.DialogHelper = DialogHelper;
        this.pointValues = pointValues;
        
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
        if (changes.cancelAttr) {
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
        if (Array.isArray(this.dataPoints) && this.dataPoints.length) {
            this.purgePromise = this.pointValues.purgeDataPoints({
                dataPoints: this.dataPoints,
                purgeAll: this.purgeAll,
                duration: this.duration,
                useTimeRange: this.useTimeRange,
                timeRange: {
                    from: this.from,
                    to: this.to
                }
            });
        } else if (this.dataSource) {
            this.purgePromise = this.pointValues.purgeDataSource({
                dataSource: this.dataSource,
                purgeAll: this.purgeAll,
                duration: this.duration,
                useTimeRange: this.useTimeRange,
                timeRange: {
                    from: this.from,
                    to: this.to
                }
            });
        }
        
        if (typeof this.onPurge === 'function') {
            this.onPurge({$promise: this.purgePromise});
        }
        
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
        console.log('cancelled');
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
