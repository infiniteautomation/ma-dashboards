/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */
import ace from 'ace';


var prettyprint = function(uiSettings) {
    return {
        restrict: 'C',
        scope: {
            prettyprintMode: '@'
        },
        link: function($scope, $element) {
            $scope.editor = ace.edit($element[0]);
            $scope.editor.setTheme('ace/theme/' + uiSettings.codeTheme);
            $scope.editor.getSession().setMode('ace/mode/' + ($scope.prettyprintMode || 'html'));
            $scope.editor.setShowPrintMargin(false);
            $scope.editor.setReadOnly(true);
            $scope.editor.setHighlightActiveLine(false);
            $scope.editor.renderer.setShowGutter(false);
            $scope.editor.cursorStyle = 'none';
            $scope.editor.setOptions({
                maxLines: Infinity
            });
            $element[0].style.fontSize = '.9em';
            $element[0].style.lineHeight = 1.7;
        }
    };
};

prettyprint.$inject = ['maUiSettings'];

export default prettyprint;


