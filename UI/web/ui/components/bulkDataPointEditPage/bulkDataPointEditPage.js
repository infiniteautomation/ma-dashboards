/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'tinycolor'], function(angular, require, tinycolor) {
'use strict';

const selectedProperty = typeof Symbol === 'function' ? Symbol('selected') : '___selected___';
const errorProperty = typeof Symbol === 'function' ? Symbol('error') : '___error___';

class BulkDataPointEditPageController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return [
        'maPoint',
        'maDataPointTags',
        'maDialogHelper',
        'maTranslate',
        '$timeout',
        'maWatchList',
        '$mdColorPicker',
        'MA_ROLLUP_TYPES',
        'MA_CHART_TYPES']; }
    constructor(maPoint,
            maDataPointTags,
            maDialogHelper,
            maTranslate,
            $timeout,
            maWatchList,
            $mdColorPicker,
            MA_ROLLUP_TYPES,
            MA_CHART_TYPES) {
        this.maPoint = maPoint;
        this.maDataPointTags = maDataPointTags;
        this.maDialogHelper = maDialogHelper;
        this.maTranslate = maTranslate;
        this.$timeout = $timeout;
        this.maWatchList = maWatchList;
        this.$mdColorPicker = $mdColorPicker;
        this.MA_ROLLUP_TYPES = MA_ROLLUP_TYPES;
        this.MA_CHART_TYPES = MA_CHART_TYPES;
        
        this.numberOfRows = 25;
        this.pageNumber = 1;
        this.tableOrder = 'name';
        this.browserOpen = true;

        this.columns = [
            {name: 'xid', label: 'ui.app.xidShort', disableEdit: true},
            {name: 'deviceName', label: 'common.deviceName'},
            {name: 'name', label: 'common.name'},
            {name: 'enabled', label: 'common.enabled', type: 'checkbox'},
            {name: 'readPermission', label: 'pointEdit.props.permission.read', type: 'permission'},
            {name: 'setPermission', label: 'pointEdit.props.permission.set', type: 'permission'},
            {name: 'unit', label: 'pointEdit.props.unit'},
            {name: 'chartColour', label: 'pointEdit.props.chartColour', type: 'color'},
            {name: 'plotType', label: 'pointEdit.plotType', type: 'plotType'},
            {name: 'rollup', label: 'common.rollup', type: 'rollup'},
            {name: 'templateXid', label: 'ui.app.templateXid'},
            {name: 'integralUnit', label: 'pointEdit.props.integralUnit'},
            {name: 'pointFolderId', label: 'ui.app.hierarchyFolderId', type: 'number'}
        ];

        this.selectedColumns = this.columns.slice(0, -3);
        this.availableTagsByKey = {};
        this.availableTags = [];
        this.selectedTags = [];

        this.pointSelectedBound = (...args) => {
            this.pointSelected(...args);
        };
        this.pointDeselectedBound = (...args) => {
            this.pointDeselected(...args);
        };
        
        this.reset();
    }
    
    reset() {
        this.selectedPoints = [];
        this.selectAll = false;
        this.selectAllIndeterminate = false;
        this.updateBody = {
            tags: {},
            mergeTags: true
        };
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
        
        this.maDataPointTags.keys().then(keys => {
            keys.forEach(tagKey => this.addTagToAvailable(tagKey));
        });
    }
    
    $onChanges(changes) {
    }
    
    addTagToAvailable(tagKey) {
        if (tagKey === 'device' || tagKey === 'name' || this.availableTagsByKey[tagKey]) return;
        
        const option = {
            name: tagKey,
            label: this.maTranslate.trSync('ui.app.tag', tagKey)
        };
        
        this.availableTags.push(option);
        this.availableTagsByKey[tagKey] = option;
        
        return option;
    }

    addTagColumn(event) {
        this.maDialogHelper.prompt(event, 'ui.app.tagName').then(tagKey => {
            const newOption = this.addTagToAvailable(tagKey);
            if (!newOption) {
                return;
            }
            this.selectedTags.push(newOption);
        }, angular.noop);
    }

    start(event) {
        if (!this.selectedPoints.length) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoPointsSelected'],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            return;
        }

        const body = angular.copy(this.updateBody);
        if (!Object.keys(body.tags).length) {
            delete body.tags;
            delete body.mergeTags;
        }
        
        if (!Object.keys(body).length) {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.bulkEditNoChanges'],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            return;
        }

        let tagsOnly = false;
        const requests = this.selectedPoints.map(pt => ({xid: pt.xid}));
        if (body.tags && Object.keys(body).length === 2) {
            tagsOnly = true;
            
            this.bulkTask = new this.maDataPointTags.bulk({
                action: 'MERGE',
                body: body.tags,
                requests
            });
        } else {
            this.bulkTask = new this.maPoint.bulk({
                action: 'UPDATE',
                body,
                requests
            });
        }
        
        this.selectedPoints.forEach(pt => {
            delete pt[errorProperty];
        });

        this.bulkTaskPromise = this.bulkTask.start().then(resource => {
            const responses = resource.result.responses;
            responses.forEach((response, i) => {
                const point = this.selectedPoints[i];
                if (response.body) {
                    if (tagsOnly) {
                        point.tags = response.body;
                    } else {
                        angular.copy(response.body, point);
                    }
                } else if (response.error) {
                    point[errorProperty] = response.error;
                }
            });
            
            // deselect the points without errors
            for (let i = 0, j = 0; i < this.selectedPoints.length && j < responses.length; j++) {
                const point = this.selectedPoints[i];
                if (!point[errorProperty]) {
                    this.selectedPoints.splice(i, 1);
                    this.pointDeselected(point);
                } else {
                    i++;
                }
            }

            const toastOptions = {
                textTr: [null, resource.position, resource.maximum, this.selectedPoints.length],
                hideDelay: 10000,
                classes: 'md-warn'
            };

            switch (resource.status) {
            case 'CANCELLED':
                toastOptions.textTr[0] = 'ui.app.bulkEditCancelled';
                break;
            case 'TIMED_OUT':
                toastOptions.textTr[0] = 'ui.app.bulkEditTimedOut';
                break;
            case 'ERROR':
                toastOptions.textTr[0] = 'ui.app.bulkEditError';
                toastOptions.textTr.push(resource.error.localizedMessage);
                break;
            case 'SUCCESS':
                if (!this.selectedPoints.length) {
                    toastOptions.textTr = ['ui.app.bulkEditSuccess', resource.position];
                    delete toastOptions.classes;
                } else {
                    toastOptions.textTr[0] = 'ui.app.bulkEditSuccessWithErrors';
                }
                break;
            }

            this.maDialogHelper.toastOptions(toastOptions);
            //resource.delete();
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.errorStartingBulkEdit', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        }, resource => {
            // progress
        }).finally(() => {
            delete this.bulkTaskPromise;
        });
    }
    
    cancel(event) {
        this.bulkTask.cancel();
    }

    watchListChanged() {
        if (!this.watchList) return;
        this.reset();
        
        if (this.wlPointsPromise) {
            this.wlPointsPromise.cancel();
        }
        this.wlPointsPromise = this.watchList.getPoints();
        
        this.pointsPromise = this.wlPointsPromise.then(points => {
            this.points = points;
            
            const seenTagKeys = {};
            this.points.forEach(pt => {
                Object.keys(pt.tags).forEach(key => {
                    seenTagKeys[key] = true;
                });
            });
            
            this.selectedTags = Object.keys(seenTagKeys).map(tagKey => {
                return this.availableTagsByKey[tagKey];
            });
            
        }, () => {
            // TODO toast error
            this.points = [];
        }).finally(() => {
            delete this.pointsPromise;
        });
    }
    
    getPointError(point) {
        return point && point[errorProperty];
    }

    pointSelected(point) {
        point[selectedProperty] = true;
        this.selectedPointsChanged();
    }
    
    pointDeselected(point) {
        delete point[selectedProperty];
        this.selectedPointsChanged();
    }
    
    selectedPointsChanged() {
        if (this.selectedPoints.length === this.points.length) {
            this.selectAllIndeterminate = false;
            // seems to be a bug changing md-checkbox indeterminate and checked at same time
            this.$timeout(() => {
                this.selectAll = true;
            }, 0);
        } else {
            this.selectAll = false;
            this.selectAllIndeterminate = !!this.selectedPoints.length;
        }
    }
    
    selectAllChanged() {
        if (this.selectAllIndeterminate) {
            this.selectAll = false;
            this.selectedPoints = [];
        } else {
            this.selectedPoints = this.selectAll && this.points ? this.points.slice() : [];
        }
        
        this.selectAllIndeterminate = false;
        
        if (this.points) {
            if (this.selectAll) {
                this.points.forEach(pt => pt[selectedProperty] = true);
            } else {
                this.points.forEach(pt => delete pt[selectedProperty]);
            }
        }
    }

    sortColumn(column) {
        if (column.name === this.tableOrder) {
            this.tableOrder = '-' + column.name;
        } else {
            this.tableOrder = column.name;
        }
    }
    
    resetColumn(column) {
        delete this.updateBody[column.name];
    }
    
    resetTag(tag) {
        delete this.updateBody.tags[tag.name];
    }
    
    removeTag(tag) {
        this.updateBody.tags[tag.name] = null;
    }
    
    columnModified(column, point) {
        return point[selectedProperty] && this.updateBody.hasOwnProperty(column.name);
    }
    
    tagModified(tag, point) {
        return point[selectedProperty] && this.updateBody.tags.hasOwnProperty(tag.name);
    }
    
    valueForColumn(column, point) {
        if (this.columnModified(column, point)) {
            return this.updateBody[column.name];
        } else {
            return point[column.name];
        }
    }
    
    valueForTag(tag, point) {
        if (this.tagModified(tag, point)) {
            return this.updateBody.tags[tag.name];
        } else {
            return point.tags[tag.name];
        }
    }
    
    chooseColor($event, column) {
        this.$mdColorPicker.show({
            value: this.updateBody[column.name] || tinycolor.random().toHexString(),
            defaultValue: '',
            random: false,
            clickOutsideToClose: true,
            hasBackdrop: true,
            skipHide: false,
            preserveScope: false,
            mdColorAlphaChannel: true,
            mdColorSpectrum: true,
            mdColorSliders: false,
            mdColorGenericPalette: true,
            mdColorMaterialPalette: false,
            mdColorHistory: false,
            mdColorDefaultTab: 0,
            $event: $event
        }).then((color) => {
            this.updateBody[column.name] = color;
        });
    }
}

return {
    templateUrl: require.toUrl('./bulkDataPointEditPage.html'),
    controller: BulkDataPointEditPageController,
    bindings: {
    },
    require: {
    }
};

}); // define
