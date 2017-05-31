/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

slideUp.$inject = ['$animateCss'];
function slideUp($animateCss) {
    return {
        enter: function($element, onDone) {
            var boundingRect = $element[0].getBoundingClientRect();
            var height = boundingRect.height;
            var $parent = $element.parent();

            $parent.css('max-height', 0);
            
            var animation = $animateCss($element, {
                event: 'enter',
                structural: true,
                from: { transform: 'translateY(-100%)' },
                to: { transform: 'translateY(0)' }
            }).start();
            
            $parent.addClass('ma-slide-up-parent-enter');
            $parent.css('max-height', height + 'px');

            animation.done(function() {
                $parent.removeClass('ma-slide-up-parent-enter');
                $parent.css('max-height', '');
                onDone();
            });
        },
        leave: function($element, onDone) {
            var boundingRect = $element[0].getBoundingClientRect();
            var height = boundingRect.height;
            var $parent = $element.parent();

            $parent.css('max-height', height + 'px');
            
            var animation = $animateCss($element, {
                event: 'leave',
                structural: true,
                from: { transform: 'translateY(0)' },
                to: { transform: 'translateY(-100%)' }
            }).start();
            
            $parent.addClass('ma-slide-up-parent-leave');
            $parent.css('max-height', 0);
            
            animation.done(function() {
                $parent.removeClass('ma-slide-up-parent-leave');
                $parent.css('max-height', '');
                onDone();
            });
        }
    };
}

return slideUp;

}); // define
