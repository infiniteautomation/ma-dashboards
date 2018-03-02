/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import math from 'mathjs';


MathFactory.$inject = [];
function MathFactory() {
    const restricted = math.create();

    restricted.import({
        import: function () { throw new Error('Function import is disabled'); },
        createUnit: function () { throw new Error('Function createUnit is disabled'); },
        eval: function () { throw new Error('Function eval is disabled'); },
        parse: function () { throw new Error('Function parse is disabled'); },
        simplify: function () { throw new Error('Function simplify is disabled'); },
        derivative: function () { throw new Error('Function derivative is disabled'); }
    }, {override: true});
    
    return restricted;
}

export default MathFactory;


