/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import upgradesBannerTemplate from './upgradesBanner.html';

import './upgradesBanner.css';

const localStorageKey = 'upgradesBanner';

class UpgradesBannerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', 'maModules', 'localStorageService']; }
    
    constructor($scope, maModules, localStorageService) {
        this.$scope = $scope;
        this.maModules = maModules;
        this.localStorageService = localStorageService;
    }
    
    $onInit() {
        this.settings = this.localStorageService.get(localStorageKey) || {};

        this.setAvailableUpgrades(this.maModules.availableUpgrades());
        
        this.$scope.$on('maAvailableUpgrades', (event, availableUpgrades) => {
            this.setAvailableUpgrades(availableUpgrades.current);
        });
    }
    
    setAvailableUpgrades(availableUpgrades) {
        this.availableUpgrades = availableUpgrades;
        
        if (availableUpgrades === 0) {
            this.settings.dismissed = false;
        }
        
        this.localStorageService.set(localStorageKey, this.settings);
    }

    dismiss() {
        this.settings.dismissed = true;
        this.localStorageService.set(localStorageKey, this.settings);
    }
}

export default {
    template: upgradesBannerTemplate,
    controller: UpgradesBannerController
};
