/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function addParams(url) {
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'showHeader=false&showFooter=false&showToolbar=false';
}

var iframeView = function() {
    return {
        scope: {
            src: '@',
            pollInterval: '=?'
        },
        template: '<iframe sandbox="allow-scripts allow-same-origin allow-forms" scrolling="no"></iframe>',
        link: function($scope, $element) {
            var $iframe = $element.find('iframe');
            $iframe.attr('src', addParams($scope.src));
            
            var timer;
            
            $iframe.on('load', function() {
                var iFrame = this;
                var iframeDocument = this.contentWindow.document;
                var iframeHeight = iframeDocument.body.offsetHeight;
                iFrame.style.height = iframeHeight + 'px';
                
                // J.W. no other way of doing this I believe
                timer = setInterval(function() {
                    var iframeHeight = iframeDocument.body.offsetHeight;
                    iFrame.style.height = iframeHeight + 'px';
                }, $scope.pollInterval || 50);
                
                var links = iframeDocument.querySelectorAll('a');
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    link.removeAttribute('target');
                    var href = link.getAttribute('href');
                    link.setAttribute('href', addParams(href));
                }
            });
            
            $scope.$on('$destroy', function() {
                if (timer)
                    clearInterval(timer);
            });
        }
    };
};

iframeView.$inject = [];

return iframeView;

}); // define
