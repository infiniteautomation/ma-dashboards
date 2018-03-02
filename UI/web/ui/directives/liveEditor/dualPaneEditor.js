/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import requirejs from 'requirejs/require';


var dualPaneEditor = function() {
    return {
        templateUrl: function($element, attrs) {
            var htmlContent = $element.html().trim();
            $element.empty();
            if (htmlContent)
                $element.data('htmlContent', htmlContent);
            return requirejs.toUrl('./dualPaneEditor.html');
        },
        link: function($scope, $element, $attrs) {
            var content = $element.data('htmlContent');
            $element.removeData('htmlContent');
            content = content.replace(new RegExp('=""', 'g'),'');
            $scope.text = content;
        }
    };
};

dualPaneEditor.$inject = [];

export default dualPaneEditor;


