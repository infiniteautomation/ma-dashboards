/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

var menuToggleController = function menuToggleController($state, $timeout, $element, $scope) {

    this.$onInit = function() {
        this.menuLevel = this.parentToggle ? this.parentToggle.menuLevel + 1 : 1;
        this.height = 0;
        this.addedHeight = 0;
        
        // close/open menus when changing states
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if ($state.includes(this.item.name)) {
                this.open();
            } else {
                this.close();
            }
        }.bind(this));
    };

    this.$onChanges = function(changes) {
        if (changes.openMenu) {
            if (this.isOpen && (!this.openMenu || this.openMenu.name.indexOf(this.item.name) !== 0)) {
                this.close();
            }
        }
        if (changes.item) {
            if (!changes.item.isFirstChange() && changes.item.currentValue.visibleChildren !== changes.item.previousValue.visibleChildren) {
                // do on next cycle as elements have not been added/removed yet
                $timeout(function() {
                    this.calcHeight();
                }.bind(this), 0);
            }
        }
    };

    this.$postLink = function() {
        this.$ul = $element.find('ul');
        
        // use timeout to calc our height after ul has been populated by ng-repeat
        $timeout(function() {
            this.calcHeight();
            
            if ($state.includes(this.item.name) && !this.isOpen) {
                this.open();
            }
        }.bind(this), 0);
    };
    
    this.open = function() {
        if (this.isOpen) return;
        
        //if (this.height === 0) {
        //    this.calcHeight();
        //}
        
        this.isOpen = true;
        if (this.parentToggle) {
            // ensures the transition property is recalculated, use if doing calcHeight() above
            //$window.getComputedStyle(this.parentToggle.$ul[0]).transition;
            this.parentToggle.addHeight(this.height);
        }
        
        this.menu.menuOpened(this);
    };
    
    this.close = function() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        if (this.parentToggle) {
            this.parentToggle.addHeight(-this.height);
        }
        
        this.menu.menuClosed(this);
    };
    
    this.toggle = function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    };

    // calculates the height of ul and sets its height style so transition works correctly.
    // absolute positioning means it is taken out of usual flow so doesn't affect surrounding
    // elements while calculating height, however briefly
    this.calcHeight = function calcHeight() {
        this.preMeasureHeight();
        this.height = this.$ul.prop('clientHeight');
        this.postMeasureHeight();
    };
    
    this.preMeasureHeight = function() {
        if (this.parentToggle) {
            this.parentToggle.preMeasureHeight();
        }
        this.$ul.css({
            height: '',
            visibility: 'hidden',
            position: 'absolute',
            transition: 'none !important'
        });
        if ((this.wasHidden = this.$ul.hasClass('ng-hide')))
            this.$ul.removeClass('ng-hide');
    };
    
    this.postMeasureHeight = function(wasHidden) {
        if (this.wasHidden)
            this.$ul.addClass('ng-hide');
        delete this.wasHidden;
        
        this.$ul.css({
            height: (this.height + this.addedHeight) + 'px',
            visibility: '',
            position: '',
            transition: ''
        });

        if (this.parentToggle) {
            this.parentToggle.postMeasureHeight();
        }
    };
    
    // calculates the ul's current height and adds x pixels to the css height
    this.addHeight = function addHeight(add) {
        this.addedHeight += add;

        this.$ul.css({
            height: (this.height + this.addedHeight) + 'px'
        });
    };
};

menuToggleController.$inject = ['$state', '$timeout', '$element', '$scope'];

return {
    controller: menuToggleController,
    require: {
        menu: '^^dashboardMenu',
        parentToggle: '?^^menuToggle'
    },
    templateUrl: require.toUrl('./menuToggle.html'),
    bindings: {
        item: '<menuItem',
        openMenu: '<'
    }
};

}); // define
