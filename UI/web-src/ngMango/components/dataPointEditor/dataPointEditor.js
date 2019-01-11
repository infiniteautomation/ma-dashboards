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

const $inject = Object.freeze(['maPoint', '$q', 'maDialogHelper', '$scope', '$window', 'maTranslate', '$element', 'maUtil', '$attrs', '$parse']);

class Multiple {
    constructor(length) {
        this.values = Array(length);
    }

    addEmpty(count = 1) {
        this.values.length = this.values.length + count;
    }
    
    addValue(value) {
        this.values.push(value);
    }
    
    getFirstValue() {
        return this.values[0];
    }
    
    hasValue(i) {
        return this.values.hasOwnProperty(i);
    }
    
    getValue(i) {
        return this.values[i];
    }

    get isMultiple() {
        return true;
    }
    
    isAllEqual() {
        const first = this.getFirstValue();
        return this.values.every((v, i, arr) => arr.hasOwnProperty(i) && v === first);
    }
    
    valueOf() {
        if (this.isAllEqual()) {
            return this.getFirstValue();
        }
        return this;
    }
    
    toString() {
        if (this.isAllEqual()) {
            return String(this.getFirstValue());
        }
        return `<<mutiple values (${this.values.length})>>`;
    }
    
    toJSON() {
        return this.valueOf();
    }
}

class DataPointEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return $inject; }
    
    constructor(maPoint, $q, maDialogHelper, $scope, $window, maTranslate, $element, maUtil, $attrs, $parse) {
        this.maPoint = maPoint;
        this.$q = $q;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.$element = $element;
        this.maUtil = maUtil;

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
        if (changes.backToDataPoint) {
            this.dataPoint = null;
        }
    }
    
    goBack() {
        this.dataPoint = null;
        this.setViewValue();
        this.render();
    }
    
    render(confirmDiscard = false) {
        if (confirmDiscard && !this.confirmDiscard('modelChange')) {
            this.setViewValue();
            return;
        }
        
        this.validationMessages = [];
        this.activeTab = 0;
        this.points = null;
        
        const viewValue = this.ngModelCtrl.$viewValue;
        if (viewValue) {
            if (Array.isArray(viewValue)) {
                this.points = viewValue.slice();
                this.dataPoint = this.createCombinedPoint(this.points);
            } else if (viewValue instanceof this.maPoint) {
                this.dataPoint = viewValue.copy();
            } else {
                this.dataPoint = Object.assign(Object.create(this.maPoint.prototype), viewValue);
            }
        } else {
            this.dataPoint = null;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }
    
    createCombinedPoint(points) {
        if (!points.length) {
            this.dataPoint = null;
            return;
        }

        const combined = points.reduce((combined, point, i) => {
            return this.combineInto(combined, point, i);
        }, null);

        return this.replaceEqualValues(combined);
    }
    
    /**
     * Constructs an object with Multiple properties from an array of objects
     */
    combineInto(dst, src, index) {
        if (dst == null) {
            dst = Array.isArray(src) ? [] : Object.create(Object.getPrototypeOf(src));
        }
        
        // check for different dst/src types
        
        const allKeysSet = new Set(Object.keys(src));
        Object.keys(dst).forEach(k => allKeysSet.add(k));
        
        allKeysSet.forEach(key => {
            const srcValue = src[key];
            const dstValue = dst[key];

            if (srcValue != null && typeof srcValue === 'object') {
                dst[key] = this.combineInto(dstValue, srcValue, index);
            } else {
                let multiple;
                if (dstValue instanceof Multiple) {
                    multiple = dstValue;
                } else {
                    dst[key] = multiple = new Multiple(index);
                }
                
                if (src.hasOwnProperty(key)) {
                    multiple.addValue(srcValue);
                } else {
                    multiple.addEmpty();
                }
            }
        });

        return dst;
    }
    
    /**
     * Traverses the object tree and replaces Multiple properties which have the same value with the primitive value
     */
    replaceEqualValues(obj) {
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value instanceof Multiple) {
                obj[key] = value.valueOf();
            } else if (value != null && typeof value === 'object') {
                this.replaceEqualValues(value);
            } else {
                throw new Error('Values should always be an object or array');
            }
        });
        
        return obj;
    }
    
    /**
     * Splits a combined object with Multiple property values into an array of objects
     */
    splitCombined(src, index) {
        const dst = Array.isArray(src) ? [] : Object.create(Object.getPrototypeOf(src));

        Object.keys(src).forEach(key => {
            const srcValue = src[key];
            
            if (srcValue instanceof Multiple) {
                if (srcValue.hasValue(index)) {
                    dst[key] = srcValue.getValue(index);
                }
            } else if (srcValue != null && typeof srcValue === 'object') {
                dst[key] = this.splitCombined(srcValue, index);
            } else {
                dst[key] = srcValue;
            }
        });

        return dst;
    }
    
    setViewValue() {
        if (this.points) {
            const newPoints = this.points.map((point, i) => {
                return this.splitCombined(this.dataPoint, i);
            });
            
            this.ngModelCtrl.$setViewValue(newPoints);
            return;
        }
        
        this.ngModelCtrl.$setViewValue(this.dataPoint);
    }

    saveItem(event) {
        this.form.$setSubmitted();
        
        if (!this.form.$valid) {
            this.maDialogHelper.errorToast('ui.components.fixErrorsOnForm');
            return;
        }
        
        this.validationMessages = [];
        
        if (this.points) {
            this.setViewValue();
            this.render();
            return;
        }
        
        this.dataPoint.save().then(item => {
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
