/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

class BoundedMap extends Map {

    /**
     * @param {number} maxSize maximum number of entries
     */
    constructor(maxSize) {
        super();
        this.maxSize = maxSize;
    }
    
    set(key, value, evict = true) {
        if (evict || this.size < this.maxSize || this.has(key)) {
            super.set(key, value);
        }
        this.evict();
        return this;
    }

    /**
     * @param {number} maxSize maximum number of entries
     */
    resize(maxSize) {
        this.maxSize = maxSize;
        this.evict();
    }

    /**
     * Removes the oldest entries until the size drops to the maximum allowed size
     */
    evict() {
        while (this.size > this.maxSize) {
            const [firstKey] = this.keys();
            this.delete(firstKey);
        }
    }
}

export default BoundedMap;