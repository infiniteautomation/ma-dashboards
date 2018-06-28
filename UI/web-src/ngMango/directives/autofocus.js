/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

autofocus.$inject = ['$timeout'];
function autofocus($timeout) {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {

            console.log($element[0]);

            // element is linked and added to dom but parent element is set
            // to display:none still (due to ui router) so focus will not work.
            // have to wait until its visible
            $timeout(() => {
                $element[0].focus();
            }, 100, false);
        }
    };
}

export default autofocus;