/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

JsonStoreMenuController.$inject = ['$scope', 'Menu', '$rootScope'];
function JsonStoreMenuController($scope, Menu, $rootScope) {

    this.$onInit = function() {
        this.retrieveMenu();
        
        this.deregister = $rootScope.$on('maUIMenuChanged', function(event, menuHierarchy) {
            this.createMenuItemArray(menuHierarchy);
        }.bind(this));
        $scope.$on('$destroy', this.deregister);
    };

    this.retrieveMenu = function() {
        Menu.getMenuHierarchy().then(function(menuHierarchy) {
            this.createMenuItemArray(menuHierarchy);
        }.bind(this));
    };
    
    this.createMenuItemArray = function(menuHierarchy) {
        // combine root menu items and items under ui into a top level menu array
        var menuItems = [];
        menuHierarchy.children.forEach(function(item) {
            if (item.name === 'ui') {
                Array.prototype.push.apply(menuItems, item.children);
            } else {
                menuItems.push(item);
            }
        });
        this.menuItems = menuItems;
    };
}

return {
    controller: JsonStoreMenuController,
    template: '<ma-ui-menu menu-items="$ctrl.menuItems" user="$ctrl.user"></ma-ui-menu>',
    bindings: {
        user: '<user'
    }
};

}); // define
