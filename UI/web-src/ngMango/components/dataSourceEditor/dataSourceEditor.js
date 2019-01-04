/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataSourceEditorTemplate from './dataSourceEditor.html';
import './dataSourceEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataSourceEditor
 * @restrict E
 * @description Editor for a data source, allows creating, updating or deleting
 */

const $inject = Object.freeze(['maDataSource', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$element', 'maUtil', '$attrs', '$parse',
    'maPoint', 'MA_TIME_PERIOD_TYPES']);

class DataSourceEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maDataSource, $q, maDialogHelper, $scope, $window, maTranslate, $element, maUtil, $attrs, $parse,
            Point, MA_TIME_PERIOD_TYPES) {
        this.maDataSource = maDataSource;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$element = $element;
        this.maUtil = maUtil;
        this.Point = Point;
        this.timePeriodTypes = MA_TIME_PERIOD_TYPES.slice(0, 4);
        
        this.types = maDataSource.types;
        this.typesByName = maDataSource.typesByName;

        this.points = [];
        this.selectedPoints = [];
        this.pointsQuery = {
            page: 1,
            limit: 10,
            order: 'name'
        };
        
        this.dynamicHeight = true;
        if ($attrs.hasOwnProperty('dynamicHeight')) {
            this.dynamicHeight = $parse($attrs.dynamicHeight)($scope.$parent);
        }
        
        this.queryPointsBound = this.queryPoints.bind(this);
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render(true);
        
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (!this.confirmDiscard('stateChange')) {
                event.preventDefault();
                return;
            }
        });

        const oldUnload = this.$window.onbeforeunload;
        this.$window.onbeforeunload = (event) => {
            if (this.form && this.form.$dirty && this.checkDiscardOption('windowUnload')) {
                const text = this.maTranslate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
        
        this.$scope.$on('$destroy', () => {
            this.$window.onbeforeunload = oldUnload;
        });

        this.Point.notificationManager.subscribe((event, point) => {
            if (this.dataSource && point.dataSourceXid === this.dataSource.xid && this.activeTab === 1) {
                this.queryPoints();
            }
        }, this.$scope);
    }
    
    $onChanges(changes) {
    }
    
    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue();
            return;
        }
        
        this.validationMessages = [];
        this.activeTab = 0;
        
        const viewValue = this.ngModelCtrl.$viewValue;
        if (viewValue) {
            if (viewValue instanceof this.maDataSource) {
                this.dataSource = viewValue.copy();
            } else {
                this.dataSource = Object.assign(Object.create(this.maDataSource.prototype), viewValue);
            }
        } else {
            this.dataSource = null;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
        
        this.points = [];
        this.selectedPoints = [];
        this.pointsQuery.page = 1;
        this.cancelPointsQuery();
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.dataSource);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];
        
        this.dataSource.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.dataSourceSaved', this.dataSource.name || this.dataSource.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.validationMessages;
                
                const withProperty = this.validationMessages.filter(m => m.property);
                if (withProperty.length) {
                    const property = withProperty[0].property;
                    const inputElement = this.maUtil.findInputElement(property, this.form);
                    this.activateTab(inputElement);
                }
            }
            
            this.maDialogHelper.errorToast(['ui.components.dataSourceSaveError', statusText]);
        });
    }
    
    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.dataSource.name || this.dataSource.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataSourceConfirmDelete', notifyName]).then(() => {
            this.dataSource.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataSourceDeleted', notifyName]);
                this.dataSource = null;
                this.setViewValue();
                this.render();
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataSourceDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
    
    checkDiscardOption(type) {
        return this.discardOptions === true || (this.discardOptions && this.discardOptions[type]);
    }
    
    confirmDiscard(type) {
        if (this.form && this.form.$dirty && this.checkDiscardOption(type)) {
            return this.$window.confirm(this.maTranslate.trSync('ui.app.discardUnsavedChanges'));
        }
        return true;
    }
    
    activateTab(query) {
        if (!query) return;
        
        const tabElements = this.$element[0].querySelectorAll('md-tab-content');

        const index = Array.prototype.findIndex.call(tabElements, tab => {
            if (query instanceof Node) {
                return tab.contains(query);
            }
            
            return !!tab.querySelector(query);
        });
        
        if (index >= 0) {
            this.activeTab = index;
        }
    }
    
    cancelPointsQuery() {
        if (this.pointsPromiseQuery) {
            this.Point.cancelRequest(this.pointsPromiseQuery);
        }
    }
    
    queryPoints() {
        this.cancelPointsQuery();

        if (!this.dataSource || this.dataSource.isNew()) {
            return;
        }
        
        const opts = this.pointsQuery;
        
        this.pointsPromiseQuery = this.Point.buildQuery()
            .eq('dataSourceXid', this.dataSource.xid)
            .sort(opts.order)
            .limit(opts.limit, (opts.page - 1) * opts.limit)
            .query();
        
        this.queryRunning = true;

        this.pointsPromise = this.pointsPromiseQuery.then(points => {
            this.points = points;

            // ensure we stay on a page with points
            if (!this.points.length && opts.page > 1) {
                if (this.points.$total > 0) {
                    opts.page = Math.ceil(this.points.$total / opts.limit);
                    this.queryPoints();
                } else {
                    opts.page = 1;
                }
            }
            
            return this.points;
        }).catch(error => {
            if (error.status === -1 && error.resource && error.resource.cancelled) {
                // request cancelled, ignore error
                return;
            }
            
            const message = error.mangoStatusText || (error + '');
            this.maDialogHelper.errorToast(['ui.app.errorGettingPoints', message]);
        }).finally(() => this.queryRunning = false);
        
        return this.pointsPromise;
    }

    createDataPoint(event) {
        this.activeTab++;
    }
    
    editDataPoint(event, item) {
        this.dataPoint = item;
        this.activeTab++;
    }
    
    dataPointEdited() {
        this.activeTab--;
    }
    
    editDataPointTabSelected() {
        if (!this.dataPoint) {
            this.dataPoint = this.typesByName[this.dataSource.modelType].createDataPoint();
            this.dataPoint.dataSourceXid = this.dataSource.originalId;
        }
    }
    
    cancelDataPointEdit() {
        this.dataPoint = null;
    }
    
    deleteDataPoint(event, item) {
        const notifyName = item.name || item.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataPointConfirmDelete', notifyName]).then(() => {
            item.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleted', notifyName]);
                this.queryPoints();
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
}

export default {
    template: dataSourceEditorTemplate,
    controller: DataSourceEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.dataSourceEditor',
        icon: 'link'
    }
};
