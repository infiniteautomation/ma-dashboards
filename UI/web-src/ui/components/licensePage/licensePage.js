/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import licensePageTemplate from './licensePage.html';
import eulaPdf from './EULA.pdf';
import './licensePage.css';

class LicensePageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$state', 'maSystemSettings', '$q', 'maDialogHelper', '$http']; }

    constructor($state, SystemSettings, $q, DialogHelper, $http) {
        this.$state = $state;
        this.$q = $q;
        this.DialogHelper = DialogHelper;
        this.$http = $http;

        this.eulaPdf = eulaPdf;
        this.upgradeChecksEnabled = new SystemSettings('upgradeChecksEnabled', 'BOOLEAN', true);
        this.usageTrackingEnabled = new SystemSettings('usageTrackingEnabled', 'BOOLEAN', true);
    }

    $onInit() {
    }

    $onChanges(changes) {
    }

    agreeToLicense(event) {
        const p1 = this.upgradeChecksEnabled.setValue();
        const p2 = this.usageTrackingEnabled.setValue();
        const p3 = this.$http({
            method: 'POST',
            url: '/rest/latest/server/accept-license-agreement',
            params: {
                agree: true
            }
        });

        this.$q.all([p1, p2, p3]).then(() => {
            this.$state.go('ui.settings.home', {helpOpen: true});
        }, error => {
            this.DialogHelper.httpErrorToast(error);
        });
    }
}

export default {
    template: licensePageTemplate,
    controller: LicensePageController
};