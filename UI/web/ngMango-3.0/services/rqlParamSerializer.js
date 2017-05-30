/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function rqlParamSerializerFactory($httpParamSerializer) {
    return function(params) {
        var rqlPart;
        if (params && params.rqlQuery) {
            rqlPart = params.rqlQuery;
            delete params.rqlQuery;
        }
        var serialized = $httpParamSerializer(params);
        if (rqlPart) {
            if (serialized)
                serialized += '&';
            serialized += rqlPart;
        }
        return serialized;
    };
}

rqlParamSerializerFactory.$inject = ['$httpParamSerializer'];

return rqlParamSerializerFactory;

}); // define
