/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

slideUp.$inject = ['$animateCss'];
function slideUp($animateCss) {
    return {
        enter: function($element, onDone) {
            const boundingRect = $element[0].getBoundingClientRect();
            const height = boundingRect.height;
            const $parent = $element.parent();

            $parent.css('max-height', 0);
            
            const animation = $animateCss($element, {
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
            const boundingRect = $element[0].getBoundingClientRect();
            const height = boundingRect.height;
            const $parent = $element.parent();

            $parent.css('max-height', height + 'px');
            
            const animation = $animateCss($element, {
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

export default slideUp;


