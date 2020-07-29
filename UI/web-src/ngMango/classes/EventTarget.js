/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

let EventTarget = global.EventTarget;
try {
    // have to actually try constructing it, may exist but not be instantiable
    new EventTarget();
} catch (e) {
    // polyfill for Safari
    EventTarget = class EventTarget {
        constructor() {
            this.delegate = $window.document.createTextNode('');
        }
        addEventListener() {
            return this.delegate.addEventListener.apply(this.delegate, arguments);
        }
        removeEventListener() {
            return this.delegate.removeEventListener.apply(this.delegate, arguments);
        }
        dispatchEvent() {
            return this.delegate.dispatchEvent.apply(this.delegate, arguments);
        }
    }
}

export default EventTarget;