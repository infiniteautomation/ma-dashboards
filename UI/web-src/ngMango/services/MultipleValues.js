/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

multipleValuesFactory.$inject = [];
function multipleValuesFactory() {

    const empty = {};
    
    class MultipleValues {
        constructor(length) {
            this.values = Array(length);
            this.valuesSet = new Set();
            if (length > 0) {
                this.valuesSet.add(empty);
            }
        }

        addEmpty(count = 1) {
            this.values.length = this.values.length + count;
            this.valuesSet.add(empty);
        }
        
        addValue(value) {
            this.values.push(value);
            this.valuesSet.add(value);
        }
        
        first() {
            return this.values[0];
        }
        
        firstNonEmpty() {
            return this.values.find(v => !!v);
        }
        
        firstNonNull() {
            return this.values.find(v => v != null);
        }
        
        hasValue(i) {
            return this.values.hasOwnProperty(i);
        }
        
        getValue(i) {
            return this.values[i];
        }

        hasMultipleValues() {
            return true;
        }
        
        has(v) {
            return this.values.includes(v);
        }
        
        hasAny(values) {
            return values.some(v => this.values.includes(v));
        }
        
        hasEvery(values) {
            return values.every(v => this.values.includes(v));
        }
        
        isAllEqual() {
            //const first = this.first();
            //return this.values.every((v, i, arr) => arr.hasOwnProperty(i) && v === first);
            
            try {
                return this.valuesSet.size <= 1;
            } catch (e) {
                // AngularJS does a deep copy of this object when doing debug logging, getting the size of the set subsequently fails
                // fall back to using array
                const first = this.first();
                return this.values.every((v, i, arr) => arr.hasOwnProperty(i) && v === first);
            }
        }
        
        valueOf() {
            if (this.isAllEqual()) {
                return this.first();
            }
            return this;
        }
        
        toString() {
            if (this.isAllEqual()) {
                return String(this.first());
            }

            //return `<<multiple values (${this.values.length})>>`;
            return `<<multiple values (${this.valuesSet.size})>>`;
        }
        
        toJSON() {
            return this.valueOf();
        }
        
        static fromArray(arr) {
            const combined = arr.reduce((combined, item, i) => {
                return this.combineInto(combined, item, i);
            }, null);
            
            if (combined != null) {
                return this.replaceEqualValues(combined);
            }
        }
        
        /**
         * The option removeEmptyObjects was added so we didn't send an empty purgePeriod object which caused validation to fail.
         * However this also strips the tags object from data points so it is impossible to remove all tags from a data point.
         * We add an empty tags object back to the data points in dataPointEditor.js saveMultiple().
         */
        static toArray(obj, length, removeEmptyObjects = true) {
            return Array(length).fill().map((v, i) => {
                return this.splitCombined(obj, i, removeEmptyObjects);
            });
        }

        /**
         * Constructs an object with MultipleValues properties from an array of objects
         */
        static combineInto(dst, src, index) {
            // dst can be a multiple if we previously encountered this key containing a primitive (e.g. null)
            if (dst == null || dst instanceof this) {
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
                    if (dstValue instanceof this) {
                        multiple = dstValue;
                    } else if (dstValue != null && typeof dstValue === 'object') {
                        // previously encountered this key as an object/array, wont override this with a MultipleValues of a primitive
                        // instead merge an empty object in
                        dst[key] = this.combineInto(dstValue, Array.isArray(dstValue) ? [] : {}, index);
                        return;
                    } else {
                        dst[key] = multiple = new this(index);
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
         * Traverses the object tree and replaces MultipleValues properties which have the same value with the primitive value
         */
        static replaceEqualValues(obj) {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (value instanceof this) {
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
         * Splits a combined object with MultipleValues property values into an array of objects
         */
        static splitCombined(src, index, removeEmptyObjects = true) {
            const dst = Array.isArray(src) ? [] : Object.create(Object.getPrototypeOf(src));

            Object.keys(src).forEach(key => {
                const srcValue = src[key];
                
                if (srcValue instanceof this) {
                    if (srcValue.hasValue(index)) {
                        dst[key] = srcValue.getValue(index);
                    }
                } else if (srcValue != null && typeof srcValue === 'object') {
                    const result = this.splitCombined(srcValue, index);
                    if (!removeEmptyObjects || Object.keys(result).length) {
                        dst[key] = result;
                    }
                } else {
                    dst[key] = srcValue;
                }
            });

            return dst;
        }
        
        /**
         * Checks form controls with untouched MultipleValues models are set to valid
         */
        static checkFormValidity(form) {
            form.$getControls().forEach(control => {
                if (typeof control.$getControls === 'function') {
                    this.checkFormValidity(control);
                } else if (control.$modelValue instanceof this) {
                    Object.keys(control.$error).forEach(errorName => {
                        control.$setValidity(errorName, true);
                    });
                }
            });
        }

        static hasMultipleValues(value) {
            return value instanceof this || value != null && typeof value === 'object' &&
                Object.keys(value).some(k => this.hasMultipleValues(value[k]));
        }
    }

    return MultipleValues;
}

export default multipleValuesFactory;