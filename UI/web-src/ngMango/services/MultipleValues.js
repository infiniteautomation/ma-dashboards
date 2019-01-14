/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

multipleValuesFactory.$inject = [];
function multipleValuesFactory() {

    class MultipleValues {
        constructor(length) {
            this.values = Array(length);
        }

        addEmpty(count = 1) {
            this.values.length = this.values.length + count;
        }
        
        addValue(value) {
            this.values.push(value);
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
        
        isAllEqual() {
            const first = this.first();
            return this.values.every((v, i, arr) => arr.hasOwnProperty(i) && v === first);
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
            return `<<mutiple values (${this.values.length})>>`;
        }
        
        toJSON() {
            return this.valueOf();
        }
        
        static fromArray(arr) {
            const combined = arr.reduce((combined, item, i) => {
                return this.combineInto(combined, item, i);
            }, null);

            return this.replaceEqualValues(combined);
        }
        
        static toArray(obj, length) {
            return Array(length).fill().map((v, i) => {
                return this.splitCombined(obj, i);
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
        static splitCombined(src, index) {
            const dst = Array.isArray(src) ? [] : Object.create(Object.getPrototypeOf(src));

            Object.keys(src).forEach(key => {
                const srcValue = src[key];
                
                if (srcValue instanceof this) {
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
    }

    return MultipleValues;
}

export default multipleValuesFactory;