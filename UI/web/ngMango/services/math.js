/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['mathjs/math'], function(math) {
'use strict';

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

return MathFactory;

});
