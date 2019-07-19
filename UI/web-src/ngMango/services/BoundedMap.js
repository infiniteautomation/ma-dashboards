/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

class BoundedMap extends Map {
    
    constructor(maxSize) {
        super();
        this.maxSize = maxSize;
    }
    
    set(key, value, evict = true) {
        if (evict || this.size < this.maxSize || this.has(key)) {
            super.set(key, value);
        }
        
        if (this.size > this.maxSize) {
            const [firstKey] = this.keys();
            this.delete(firstKey);
        }
        
        return this;
    }
}

export default BoundedMap;