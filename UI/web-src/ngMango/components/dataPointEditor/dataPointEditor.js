/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataPointEditorTemplate from './dataPointEditor.html';
import './dataPointEditor.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointEditor
 * @restrict E
 * @description Editor for a data point, allows creating, updating or deleting
 */

const $inject = Object.freeze(['maPoint', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$element', 'maUtil', '$attrs', '$parse',
    'maMultipleValues']);

class DataPointEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maPoint, $q, maDialogHelper, $scope, $window, maTranslate, $element, maUtil, $attrs, $parse,
            MultipleValues) {
        
        this.maPoint = maPoint;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$element = $element;
        this.maUtil = maUtil;
        this.MultipleValues = MultipleValues;

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
    }

    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue(this.prevViewValue);
            return;
        }
        
        this.validationMessages = [];
        this.activeTab = 0;
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

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }

    setViewValue(viewValue = this.dataPoint) {
        this.ngModelCtrl.$setViewValue(viewValue);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
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
                
                const withProperty = this.validationMessages.filter(m => m.property);
                if (withProperty.length) {
                    const property = withProperty[0].property;
                    const inputElement = this.maUtil.findInputElement(property, this.form);
                    this.activateTab(inputElement);
                }
            }
            
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
            const responses = resource.result.responses;
            responses.forEach((response, i) => {
                const point = newPoints[i];
                if (response.body) {
                    angular.copy(response.body, point);
                } else if (response.error) {
                    // TODO
                    point.$error = response.error;
                }
            });

            this.setViewValue(newPoints);
            this.render();
            this.notifyBulkEditComplete(resource);
            
            // do for individual
//            let statusText = error.mangoStatusText;
//            
//            if (error.status === 422) {
//                statusText = error.mangoStatusTextShort;
//                this.validationMessages = error.data.result.messages;
//                
//                const withProperty = this.validationMessages.filter(m => m.property);
//                if (withProperty.length) {
//                    const property = withProperty[0].property;
//                    const inputElement = this.maUtil.findInputElement(property, this.form);
//                    this.activateTab(inputElement);
//                }
//            }
            
        }, error => {
            this.notifyBulkEditError(error);
        }, resource => {
            // progress
        }).finally(() => {
            delete this.bulkTask;
            delete this.savePromise;
        });
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
    
}

export default {
    template: dataPointEditorTemplate,
    controller: DataPointEditorController,
    bindings: {
        discardOptions: '<?confirmDiscard',
        fixedType: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.dataPointEditor',
        icon: 'link'
    }
};
