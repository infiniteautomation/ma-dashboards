/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var dualPaneEditor = function() {
    return {
        templateUrl: function($element, attrs) {
            var htmlContent = $element.html().trim();
            $element.empty();
            if (htmlContent)
                $element.data('htmlContent', htmlContent);
            return require.toUrl('./dualPaneEditor.html');
        },
        link: function($scope, $element, $attrs) {
            var content = $element.data('htmlContent');
            $element.removeData('htmlContent');
            if (content) {
                var editor = $element.find('div[live-editor]')[0];
                var editorCtrl = angular.element(editor).controller('liveEditor');
                editorCtrl.setText(content);
            }
        }
    };
};

dualPaneEditor.$inject = [];

return dualPaneEditor;

}); // define
