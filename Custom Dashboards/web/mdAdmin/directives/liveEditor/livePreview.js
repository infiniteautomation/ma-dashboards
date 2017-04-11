/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var livePreview = function($compile, $timeout) {
    return {
        scope: false,
        link: function($scope, $element, $attrs) {
            var childScope = $scope.$new();
            var timeoutPromise;
            
            var debounceTimeout = 1000;
            if ($attrs.debounce) {
                debounceTimeout = parseInt($attrs.debounce, 10);
            }
            
            $scope.$watch($attrs.livePreview, function(newValue, oldValue) {
                if (newValue === oldValue || !oldValue || debounceTimeout === 0) {
                    updatePreview(newValue);
                } else {
                    if (timeoutPromise) {
                        $timeout.cancel(timeoutPromise);
                        timeoutPromise = null;
                    }
                    timeoutPromise = $timeout(updatePreview, debounceTimeout, true, newValue);
                }
            });
            
            function updatePreview(text) {
                timeoutPromise = null;
                
                childScope.$destroy();
                childScope = $scope.$new();
                
                if (text) {
                    var compileText = '<div>' + text + '</div>';
                    var $div = $compile(compileText)(childScope);
                    $element.html($div.contents());
                } else {
                    $element.empty();
                }
            }
        }
    };
};

livePreview.$inject = ['$compile', '$timeout'];

return livePreview;

}); // define
