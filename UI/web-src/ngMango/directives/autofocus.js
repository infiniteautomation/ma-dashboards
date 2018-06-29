/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

autofocus.$inject = ['$timeout', '$parse'];
function autofocus($timeout, $parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {
            let autoFocusEnabled = true;
            if ($attrs.maAutofocus) {
                autoFocusEnabled = $parse($attrs.maAutofocus)($scope);
            }
            
            if (autoFocusEnabled) {
                // element is linked and added to dom but parent element is set
                // to display:none still (due to ui router) so focus will not work.
                // have to wait until its visible
                $timeout(() => {
                    $element[0].focus();
                }, 100, false);
            }
        }
    };
}

export default autofocus;