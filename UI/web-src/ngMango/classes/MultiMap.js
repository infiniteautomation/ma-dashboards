/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

class MultiMap extends Map {
    has(key, value) {
        const values = super.get(key);
        if (value !== undefined) {
            return !!values && values.has(value);
        }
        return !!values;
    }
    
    getOrCreate(key) {
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
        const values = this.getOrCreate(key);
        values.add(value);
        return this;
    }
    
    add(key, value) {
        return this.set.apply(this, arguments);
    }
    
    delete(key, value) {
        const values = super.get(key);
        if (!values) {
            return new Set();
        }
        
        if (value !== undefined) {
            const deleted = values.delete(value);
            if (!values.size) {
                super.delete(key);
            }
            
            if (deleted) {
                return new Set([value]);
            } else {
                return new Set();
            }
        }
        
        super.delete(key);
        return values;
    }
    
    entries() {
        const entries = new Set();
        for (let [key, setObj] of super.entries()) {
            for (let value of setObj) {
                entries.add([key, value]);
            }
        }
        return entries;
    }
    
    values() {
        const values = new Set();
        for (let setObj of super.values()) {
            for (let value of setObj) {
                values.add(value);
            }
        }
        return values;
    }
    
    get size() {
        let size = 0;
        for (let setObj of super.values()) {
            size += setObj.size;
        }
        return size;
    }
}

export default MultiMap;