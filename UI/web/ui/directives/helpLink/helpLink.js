/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

helpLink.$inject = ['$state'];
function helpLink($state) {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {
            $attrs.$observe('maUiHelpLink', function(value) {
                $attrs.$set('href', $state.href(value));
            });

            $element.on('click', followLink);
            $scope.$on('$destroy', function() {
                $element.off('click', followLink);
            });

            function followLink(event) {
                // dont do anything if its a middle click etc
                if (event.which > 1 || event.ctrlKey || event.metaKey || event.shiftKey || $attrs.target)
                    return;
                
                event.preventDefault();
                $scope.$apply(function() {
                    var params = {};
                    if (!$state.includes('ui.help')) {
                        params.sidebar = true;
                    }
                    $state.go($attrs.maUiHelpLink, params);
                });
            }
        }
    };
}

return helpLink;

}); // define
