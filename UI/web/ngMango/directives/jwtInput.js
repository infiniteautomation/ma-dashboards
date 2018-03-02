/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


jwtInput.$inject = ['$parse'];
function jwtInput($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, ngModel) {
            
            
            ngModel.$validators.jwtExpired = function(modelValue, viewValue) {
                const value = modelValue || viewValue;
                
                try {
                    const claims = parseJwt(value);
                    return claims.exp * 1000 - Date.now() >= 0;
                } catch (e) {
                    return false;
                }
            };
            
            ngModel.$validators.jwtClaims = function(modelValue, viewValue) {
                const value = modelValue || viewValue;
                
                try {
                    const claims = parseJwt(value);
                    
                    if ($attrs.maJwtInput) {
                        const expectedClaims = $parse($attrs.maJwtInput)($scope);
                        if (expectedClaims) {
                            return !Object.keys(expectedClaims).some(key => {
                                const expected = expectedClaims[key];
                                const actual = claims[key];
                                return expected !== actual;
                            });
                        }
                    }
                    
                    return true;
                } catch (e) {
                    return false;
                }
            };
            
            function parseJwt(token) {
                const parts = token.split('.');
                const claimsStr = parts[1];
                const jsonStr = atob(claimsStr);
                return JSON.parse(jsonStr);
            }
        }
    };
}

export default jwtInput;


