/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import dataPointEditorTemplate from './dataPointEditor.html';
import './dataPointEditor.css';
import loggingPropertiesTemplate from './loggingProperties.html';
import textRendererTemplate from './textRenderer.html';

const templates = {
    loggingProperties: loggingPropertiesTemplate,
    textRenderer: textRendererTemplate
};

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointEditor
 * @restrict E
 * @description Editor for a data point, allows creating, updating or deleting
 */

/**
 * Stores a map of validation property keys that come back from the API and what they actually map to in the model.
 */
const validationMessagePropertyMap = {
    purgeType: 'purgePeriod.type',
    purgePeriod: 'purgePeriod.periods'
};

class DataPointEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPoint', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$attrs',
        '$parse', 'maMultipleValues', '$templateCache', '$filter', 'maUser', 'maUtil']; }
    
    constructor(Point, $q, DialogHelper, $scope, $window, Translate, $attrs,
                $parse, MultipleValues, $templateCache, $filter, User, Util) {

        Object.keys(templates).forEach(key => {
            const name = `maDataPointEditor.${key}.html`;
            if (!$templateCache.get(name)) {
                $templateCache.put(name, templates[key]);
            }
        });
        
        this.Point = Point;
        this.$q = $q;
        this.DialogHelper = DialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.Translate = Translate;
        this.MultipleValues = MultipleValues;
        this.orderBy = $filter('orderBy');
        this.User = User;
        this.rollupTypes = Point.rollupTypes.filter(t => !t.nonAssignable);
        this.plotTypes = Point.chartTypes;
        this.simplifyTypes = Point.simplifyTypes;
        this.loggingTypes = Point.loggingTypes;
        this.intervalLoggingValueTypes = Point.intervalLoggingValueTypes;
        this.textRendererTypes = Point.textRendererTypes;
        this.suffixTextRenderers = new Set(this.textRendererTypes.filter(t => t.suffix).map(t => t.type));
        this.formatTextRenderers = new Set(this.textRendererTypes.filter(t => t.format).map(t => t.type));

        this.types = Point.types.map(t => {
            const item = angular.copy(t);
            Translate.tr(item.description).then(translated => {
                item.descriptionTranslated = translated;
            });
            return item;
        });
        this.typesByName = Util.createMapObject(this.types, 'type');

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
                const text = this.Translate.trSync('ui.app.discardUnsavedChanges');
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
        this.disabled = this.disabledAttr || !(this.dataPoint && this.User.current.hasPermission(this.dataPoint.editPermission));
    }

    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue(this.prevViewValue);
            return;
        }

        this.errorMessages = [];
        this.validationMessages = [];
        this.points = null;
        this.dataTypes = null;
        
        const viewValue = this.prevViewValue = this.ngModelCtrl.$viewValue;
        
        if (Array.isArray(viewValue) && viewValue.length) {
            this.points = viewValue;
            this.dataPoint = this.MultipleValues.fromArray(this.points);
            this.dataTypes = this.points.map(dp => dp.dataType);
        } else if (viewValue instanceof this.Point) {
            this.dataPoint = viewValue.copy();
        } else if (viewValue) {
            this.dataPoint = Object.assign(Object.create(this.Point.prototype), viewValue);
        } else {
            this.dataPoint = null;
        }

        this.dataType = this.dataPoint ? this.dataPoint.dataType : null;
        
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
    
    confirmDataTypeChange(event) {
        if (Array.isArray(this.points)) {
            let newTypes;
            if (this.dataPoint.dataType instanceof this.MultipleValues) {
                newTypes = this.dataPoint.dataType.values;
            } else {
                newTypes = Array(this.points.length).fill(this.dataPoint.dataType);
            }
            
            const changed = this.points.filter((dp, i) => !dp.isNew() && newTypes[i] !== this.dataTypes[i]);
            if (changed.length > 0) {
                return this.DialogHelper.confirm(event, ['ui.app.changeDataTypePlural', changed.length]);
            }
        } else {
            const dataTypeChanged = !this.dataPoint.isNew() && this.dataPoint.dataType !== this.dataType;
            if (dataTypeChanged) {
                return this.DialogHelper.confirm(event, 'ui.app.changeDataType');
            }
        }
    }

    saveItem(event) {
        this.MultipleValues.checkFormValidity(this.form);
        
        this.form.$setSubmitted();

        if (!this.form.$valid) {
            this.form.activateTabWithClientError();
            this.DialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }

        const savingMultiple = Array.isArray(this.points);
        
        this.savePromise = this.$q.resolve().then(() => {
            return this.confirmDataTypeChange(event);
        }).then(() => {
            this.errorMessages = [];
            this.validationMessages = [];

            if (savingMultiple) {
                return this.saveMultiple();
            } else {
                return this.savePoint();
            }
        }).catch(error => null).finally(() => delete this.savePromise);
    }
    
    savePoint() {
        return this.dataPoint.save().then(item => {
            this.setViewValue();
            this.render();
            this.DialogHelper.toast(['ui.components.dataPointSaved', this.dataPoint.name || this.dataPoint.xid]);
        }, error => {
            let statusText = error.mangoStatusText;
            
            if (error.status === 422) {
                statusText = error.mangoStatusTextShort;
                this.validationMessages = this.fixValidationMessages(error.data.result.messages);
            }
            
            this.errorMessages.push(statusText);
            
            this.DialogHelper.errorToast(['ui.components.dataPointSaveError', statusText]);
        });
    }
    
    saveMultiple() {
        const newPoints = this.MultipleValues.toArray(this.dataPoint, this.points.length);
        const action = this.points.every(dp => dp.isNew()) ? 'CREATE' : 'UPDATE';

        this.bulkTask = new this.Point.bulk({
            action,
            requests: newPoints.map(pt => {
                // MultipleValues.toArray() strips empty objects from the data points.
                // Add an empty tags object back in so we can remove tags from a data point.
                if (!pt.tags) {
                    pt.tags = {};
                }
                
                const request = {
                    xid: pt.originalId,
                    body: pt
                };
                
                if (action !== 'CREATE' && pt.isNew()) {
                    request.action = 'CREATE';
                }
                return request;
            })
        });

        return this.bulkTask.start(this.$scope).then(resource => {
            this.saveMultipleComplete(resource, newPoints);
        }, error => {
            this.notifyBulkEditError(error);
        }, resource => {
            // progress
        }).finally(() => {
            delete this.bulkTask;
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
            this.validationMessages = this.fixValidationMessages(validationMessages);
        } else {
            this.setViewValue(savedPoints);
            this.render();
        }

        this.notifyBulkEditComplete(resource);
    }
    
    fixValidationMessages(validationMessages) {
        validationMessages.forEach(vm => {
            const newKey = validationMessagePropertyMap[vm.property];
            if (newKey) {
                vm.property = newKey;
            }
        });
        return validationMessages;
    }

    revertItem(event) {
        if (this.confirmDiscard('revert')) {
            this.render();
        }
    }

    deleteItem(event) {
        const notifyName = this.dataPoint.name || this.dataPoint.originalId;
        this.DialogHelper.confirm(event, ['ui.components.dataPointConfirmDelete', notifyName]).then(() => {
            this.dataPoint.delete().then(() => {
                this.DialogHelper.toast(['ui.components.dataPointDeleted', notifyName]);
                this.dataPoint = null;
                this.setViewValue();
                this.render();
            }, error => {
                this.DialogHelper.toast(['ui.components.dataPointDeleteError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
    
    checkDiscardOption(type) {
        return this.discardOptions === true || (this.discardOptions && this.discardOptions[type]);
    }
    
    confirmDiscard(type) {
        if (this.form && this.form.$dirty && this.checkDiscardOption(type)) {
            return this.$window.confirm(this.Translate.trSync('ui.app.discardUnsavedChanges'));
        }
        return true;
    }

    notifyBulkEditError(error) {
        this.DialogHelper.toastOptions({
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

        this.DialogHelper.toastOptions(toastOptions);
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
            this.bulkTask = new this.Point.bulk();
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
                const pt = Object.assign(Object.create(this.Point.prototype), response.body);
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

    resetCache() {
        this.dataPoint
            .resetCache()
            .then(() => {
                this.DialogHelper.toast('ui.components.dataPointResetCache');
            })
            .catch((err) => {
                this.DialogHelper.errorToast([
                    'ui.components.dataPointResetCacheError',
                    err.mangoStatusText
                ]);
            });
    }
}

export default {
    template: dataPointEditorTemplate,
    controller: DataPointEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard',
        fixedType: '<?',
        importCsv: '<?',
        dataSource: '<?source',
        disabledAttr: '@?disabled'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.dataPointEditor',
        icon: 'link'
    }
};
