/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */




function rqlParamSerializerFactory($httpParamSerializer) {
    return function(params) {
        let rqlPart;
        if (params && params.hasOwnProperty('rqlQuery')) {
            rqlPart = params.rqlQuery;
            delete params.rqlQuery;
        }
        let serialized = $httpParamSerializer(params);
        if (rqlPart) {
            if (serialized)
                serialized += '&';
            serialized += rqlPart;
        }
        return serialized;
    };
}

rqlParamSerializerFactory.$inject = ['$httpParamSerializer'];

export default rqlParamSerializerFactory;


