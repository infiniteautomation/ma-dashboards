/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataPointEditorTemplate from './dataPointEditor.html';
import './dataPointEditor.css';
import loggingPropertiesTemplate from './loggingProperties.html';
import textRendererTemplate from './textRenderer.html';
import chartRendererTemplate from './chartRenderer.html';

const templates = {
    loggingProperties: loggingPropertiesTemplate,
    textRenderer: textRendererTemplate,
    chartRenderer: chartRendererTemplate
};

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointEditor
 * @restrict E
 * @description Editor for a data point, allows creating, updating or deleting
 */

const $inject = Object.freeze(['maPoint', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$attrs', '$parse',
    'maMultipleValues', '$templateCache', '$filter', 'maUser']);

class DataPointEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maPoint, $q, maDialogHelper, $scope, $window, maTranslate, $attrs, $parse,
            MultipleValues, $templateCache, $filter, User) {

        Object.keys(templates).forEach(key => {
            const name = `maDataPointEditor.${key}.html`;
            if (!$templateCache.get(name)) {
                $templateCache.put(name, templates[key]);
            }
        });
        
        this.maPoint = maPoint;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.MultipleValues = MultipleValues;
        this.orderBy = $filter('orderBy');
        this.User = User;
        this.rollupTypes = maPoint.rollupTypes.filter(t => !t.nonAssignable);
        this.plotTypes = maPoint.chartTypes;
        this.simplifyTypes = maPoint.simplifyTypes;
        this.loggingTypes = maPoint.loggingTypes;
        this.intervalLoggingValueTypes = maPoint.intervalLoggingValueTypes;
        this.textRendererTypes = maPoint.textRendererTypes;
        this.suffixTextRenderers = new Set(this.textRendererTypes.filter(t => t.suffix).map(t => t.type));
        this.formatTextRenderers = new Set(this.textRendererTypes.filter(t => t.format).map(t => t.type));
        this.chartRendererTypes = maPoint.chartRendererTypes;

        this.types = maPoint.types;
        this.typesByName = maPoint.typesByName;

        this.dynamicHeight = true;
        if ($attrs.hasOwnProperty('dynamicHeight')) {
            this.dynamicHeight = $parse($attrs.dynamicHeight)($scope.$parent);
        }
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
    }
    
    $onChanges(changes) {
        if (changes.importCsv && this.importCsv) {
            this.startFromCsv(this.importCsv);
        }
        if (changes.disabledAttr) {
            this.updateDisabled();
        }
    }
    
    updateDisabled() {
        this.disabled = this.disabledAttr || !(this.dataPoint && this.dataPoint.hasEditPermission(this.User.current));
    }

    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue(this.prevViewValue);
            return;
        }

        this.errorMessages = [];
        this.validationMessages = [];
        this.points = null;
        
        const viewValue = this.prevViewValue = this.ngModelCtrl.$viewValue;
        
        if (Array.isArray(viewValue) && viewValue.length) {
            this.points = viewValue;
            this.dataPoint = this.MultipleValues.fromArray(this.points);
        } else if (viewValue instanceof this.maPoint) {
            this.dataPoint = viewValue.copy();
        } else if (viewValue) {
            this.dataPoint = Object.assign(Object.create(this.maPoint.prototype), viewValue);
        } else {
            this.dataPoint = null;
        }
        
        if (this.dataPoint && this.dataPoint.isNew()) {
            this.activeTab = 0;
        }

        this.updateDisabled();
        this.typeChanged();

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }

    setViewValue(viewValue = this.dataPoint) {
        this.ngModelCtrl.$setViewValue(viewValue);
    }

    saveItem(event) {
        this.MultipleValues.checkFormValidity(this.form);
        
        this.form.$setSubmitted();

        if (!this.form.$valid) {
            this.form.activateTabWithClientError();
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.errorMessages = [];
        this.validationMessages = [];
        
        if (Array.isArray(this.points)) {
            this.saveMultiple();
            return;
        }
        
        this.savePromise = this.dataPoint.save().then(item => {
            this.setViewValue();
            this.render();
            this.maDialogHelper.toast(['ui.components.dataPointSaved', this.dataPoint.name || this.dataPoint.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = error.data.result.messages;
            }
            
            this.errorMessages.push(statusText);
            
            this.maDialogHelper.errorToast(['ui.components.dataPointSaveError', statusText]);
        }).finally(() => delete this.savePromise);
    }
    
    saveMultiple() {
        const newPoints = this.MultipleValues.toArray(this.dataPoint, this.points.length);
        
        this.bulkTask = new this.maPoint.bulk({
            action: 'UPDATE',
            requests: newPoints.map(pt => ({
                xid: pt.originalId,
                body: pt
            }))
        });
        
        this.savePromise = this.bulkTask.start(this.$scope).then(resource => {
            this.saveMultipleComplete(resource, newPoints);
        }, error => {
            this.notifyBulkEditError(error);
        }, resource => {
            // progress
        }).finally(() => {
            delete this.bulkTask;
            delete this.savePromise;
        });
    }
    
    saveMultipleComplete(resource, savedPoints) {
        const hasError = resource.result.hasError;
        const responses = resource.result.responses;

        responses.forEach((response, i) => {
            const point = savedPoints[i];
            if (response.body && ['CREATE', 'UPDATE'].includes(response.action)) {
                angular.copy(response.body, point);
            }
        });
        
        if (hasError) {
            const validationMessages = [];
            
            responses.forEach((response, i) => {
                const message = response.error && response.error.localizedMessage;
                if (message && !this.errorMessages.includes(message)) {
                    this.errorMessages.push(message);
                }
                
                if (response.httpStatus === 422) {
                    const messages = response.error.result.messages;
                    messages.forEach(m => {
                        const validationMessage = `${m.level}: ${m.message}`;
                        if (!m.property && !this.errorMessages.includes(validationMessage)) {
                            this.errorMessages.push(validationMessage);
                        }
                        
                        const found = validationMessages.find(m2 => {
                            return m.level === m2.level && m.property === m2.property && m.message === m2.message;
                        });
                        
                        if (!found) {
                            validationMessages.push(m);
                        }
                    });
                }
            });
            this.validationMessages = validationMessages;
        } else {
            this.setViewValue(savedPoints);
            this.render();
        }

        this.notifyBulkEditComplete(resource);
    }

    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.dataPoint.name || this.dataPoint.originalId;
        this.maDialogHelper.confirm(event, ['ui.components.dataPointConfirmDelete', notifyName]).then(() => {
            this.dataPoint.delete().then(() => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleted', notifyName]);
                this.dataPoint = null;
                this.setViewValue();
                this.render();
            }, error => {
                this.maDialogHelper.toast(['ui.components.dataPointDeleteError', error.mangoStatusText]);
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
    
    notifyBulkEditError(error) {
        this.maDialogHelper.toastOptions({
            textTr: ['ui.app.errorStartingBulkEdit', error.mangoStatusText],
            hideDelay: 10000,
            classes: 'md-warn'
        });
    }
    
    notifyBulkEditComplete(resource) {
        const numErrors = resource.result.responses.reduce((accum, response) => response.error ? accum + 1 : accum, 0);
        
        const toastOptions = {
            textTr: [null, resource.position, resource.maximum, numErrors],
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
            if (!numErrors) {
                toastOptions.textTr = ['ui.app.bulkEditSuccess', resource.position];
                delete toastOptions.classes;
            } else {
                toastOptions.textTr[0] = 'ui.app.bulkEditSuccessWithErrors';
            }
            break;
        }

        this.maDialogHelper.toastOptions(toastOptions);
    }
    
    startFromCsv(csvFile) {
        if (!this.confirmDiscard('modelChange')) {
            return;
        }
        
        this.errorMessages = [];
        this.validationMessages = [];
        this.dataPoint = null;
        this.points = null;
        
        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
        
        this.bulkTaskPromise = this.$q.resolve().then(() => {
            this.bulkTask = new this.maPoint.bulk();
            this.bulkTask.setHttpBody(csvFile);
            
            return this.bulkTask.start(this.$scope, {
                headers: {
                    'Content-Type': 'text/csv'
                }
            });
        }).then(resource => {
            const responses = resource.result.responses;
            this.points = responses.filter(response => {
                return (response.body && ['CREATE', 'UPDATE'].includes(response.action));
            }).map(response => {
                const pt = Object.assign(Object.create(this.maPoint.prototype), response.body);
                pt.originalId = pt.xid;
                return pt;
            });
            
            this.dataPoint = this.MultipleValues.fromArray(this.points);

            this.form.$setSubmitted();
            
            this.saveMultipleComplete(resource, this.points);
        }, error => {
            this.notifyBulkEditError(error);
        }, resource => {
            // progress
        }).finally(() => {
            delete this.bulkTaskPromise;
            delete this.bulkTask;
        });
    }
    
    addRange(form) {
        const newRange = {};
        
        let rangeValues = this.dataPoint.textRenderer.rangeValues;
        if (!Array.isArray(rangeValues)) {
            rangeValues = this.dataPoint.textRenderer.rangeValues = [];
        }

        const highestTo = rangeValues.reduce((h, r) => r.to > h ? r.to : h, -Infinity);
        if (Number.isFinite(highestTo)) {
            newRange.from = highestTo;
        }

        this.dataPoint.textRenderer.rangeValues.push(newRange);
        form.$setDirty();
    }
    
    removeRange(range, form) {
        const index = this.dataPoint.textRenderer.rangeValues.indexOf(range);
        this.dataPoint.textRenderer.rangeValues.splice(index, 1);
        form.$setDirty();
    }
    
    addMultistateValue(form) {
        const newValue = {};
        
        let multistateValues = this.dataPoint.textRenderer.multistateValues;
        if (!Array.isArray(multistateValues)) {
            multistateValues = this.dataPoint.textRenderer.multistateValues = [];
        }
        
        const highestKey = multistateValues.reduce((h, r) => r.key > h ? r.key : h, -Infinity);
        if (Number.isFinite(highestKey)) {
            newValue.key = Math.floor(highestKey) + 1;
        }

        this.dataPoint.textRenderer.multistateValues.push(newValue);
        form.$setDirty();
    }
    
    removeMultistateValue(value, form) {
        const index = this.dataPoint.textRenderer.multistateValues.indexOf(value);
        this.dataPoint.textRenderer.multistateValues.splice(index, 1);
        form.$setDirty();
    }

    optionSupported(options, value) {
        if (!(options instanceof Set)) {
            return false;
        }
        
        if (value instanceof this.MultipleValues) {
            return value.values.every(v => options.has(v));
        }
        return options.has(value);
    }
    
    typeChanged() {
        this.dataSourceType = this.typesByName[this.dataPoint && this.dataPoint.dataSourceTypeName];
    }
}

export default {
    template: dataPointEditorTemplate,
    controller: DataPointEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard',
        fixedType: '<?',
        importCsv: '<?',
        dataSource: '<?source'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.dataPointEditor',
        icon: 'link'
    }
};
