/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

autofocus.$inject = ['$timeout'];
function autofocus($timeout) {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {
            let autoFocusEnabled = true;
            let selectAll = false;
            if ($attrs.maAutofocus) {
                autoFocusEnabled = $scope.$eval($attrs.maAutofocus);
            }
            if ($attrs.maAutofocusSelectAll) {
                selectAll = $scope.$eval($attrs.maAutofocusSelectAll);
            }
            
            if (autoFocusEnabled) {
                // element is linked and added to dom but parent element is set
                // to display:none still (due to ui router) so focus will not work.
                // have to wait until its visible
                $timeout(() => {
                    const element = $element[0];
                    element.focus();
                    
                    if (selectAll) {
                        element.setSelectionRange(0, element.value.length);
                    }
                }, 100, false);
            }
        }
    };
}

export default autofocus;