/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */


function addParams(url) {
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'showHeader=false&showFooter=false&showToolbar=false';
}

const iframeView = function() {
    return {
        scope: {
            src: '@',
            pollInterval: '<?',
            disableResize: '<?'
        },
        template: '<iframe flex sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" scrolling="no"></iframe>',
        link: function($scope, $element) {
            const $iframe = $element.maFind('iframe');
            $iframe.attr('src', addParams($scope.src));
            
            let timer;
            let lastHeight;
            
            $iframe.on('load', function() {
                const iFrame = this;
                const iFrameDocument = this.contentWindow.document;
                
                // J.W. no other way of doing this I believe
                if (!$scope.disableResize) {
                    timer = setInterval(setIFrameHeight, $scope.pollInterval || 50);
                }
                
                const links = iFrameDocument.querySelectorAll('a');
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    const href = link.getAttribute('href');
                    
                    if (link.host === window.location.host) {
                        link.removeAttribute('target');
                        if (href && href.indexOf('#') !== 0) {
                            link.setAttribute('href', addParams(href));
                        }
                    } else {
                        link.setAttribute('target', '_blank');
                    }
                }
                
                lastHeight = undefined;
                
                function setIFrameHeight() {
                    let height = iFrameDocument.body.offsetHeight;
                    // offsetHeight sometimes returns 0 for some reason, cache the last known
                    // height and use that instead
                    if (height === 0) {
                        height = lastHeight;
                    } else {
                        lastHeight = height;
                    }
                    if (height) {
                        iFrame.style.height = height + 'px';
                    }
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

export default iframeView;


