/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';

scriptingEditorFactory.$inject = ['$http'];
function scriptingEditorFactory($http) {
    
    const baseUrl = '/rest/latest/script/validate';
    
    const defaultProperties = {
        wrapInFunction: false,
        context: [],
        logLevel: 'ERROR',
        permissions: [],
        script:'',
        resultDataType: null 
    };

    class ScriptingEditor {
        constructor(properties) {
            Object.assign(this, angular.copy(defaultProperties), properties);
        } 
        
        validate(url = baseUrl, opts = {}) {
            return $http({
                method: 'POST',
                url: url,
                data: this 
            }, opts).then(response => {
                return response.data;
            });
        }
        
       
    }
    
    return ScriptingEditor;
}

export default scriptingEditorFactory;
