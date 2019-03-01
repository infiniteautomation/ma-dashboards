/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

// TODO overide iterator and size
class MultiMap extends Map {
    has(key, value) {
        const values = super.get(key);
        if (arguments.length > 1) {
            return !!values && values.has(value);
        }
        return !!values;
    }
    
    createSet(key) {
        if (super.has(key)) {
            return super.get(key);
        }
        const values = new Set();
        super.set(key, values);
        return values;
    }

    get(key) {
        const values = super.get(key);
        return values || new Set();
    }
    
    set(key, value) {
        const values = this.createSet(key);
        values.add(value);
        return this;
    }
    
    delete(key, value) {
        if (arguments.length > 1) {
            const values = super.get(key);
            if (values) {
                const result = values.delete(value);
                if (!values.size) {
                    super.delete(key);
                }
                return result;
            }
            return false;
        }
        return super.delete(key);
    }
}

export default MultiMap;