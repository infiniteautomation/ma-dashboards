/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

jwtInput.$inject = ['$parse', 'maUtil'];
function jwtInput($parse, maUtil) {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, ngModel) {
            ngModel.$validators.jwtExpired = function(modelValue, viewValue) {
                const value = modelValue || viewValue;
                
                try {
                    const claims = maUtil.parseJwt(value);
                    return claims.exp * 1000 - Date.now() >= 0;
                } catch (e) {
                    return false;
                }
            };
            
            ngModel.$validators.jwtClaims = function(modelValue, viewValue) {
                const value = modelValue || viewValue;
                
                try {
                    const claims = maUtil.parseJwt(value);
                    
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
            
            ngModel.$validators.jwtParse = function(modelValue, viewValue) {
                const value = modelValue || viewValue;
                
                try {
                    maUtil.parseJwt(value);
                    return true;
                } catch (e) {
                    return false;
                }
            };
        }
    };
}

export default jwtInput;


