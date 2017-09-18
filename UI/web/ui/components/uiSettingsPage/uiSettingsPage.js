/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

class UiSettingsPageController {
    static get $inject() { return ['maUiSettings', '$scope', '$window', 'maTranslate', 'maDialogHelper']; }
    constructor(maUiSettings, $scope, $window, maTranslate, maDialogHelper) {
        this.uiSettings = maUiSettings;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.maDialogHelper = maDialogHelper;
    }
    
    $onInit() {
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (this.form.$dirty) {
                if (!this.$window.confirm(this.maTranslate.trSync('ui.app.discardUnsavedChanges'))) {
                    event.preventDefault();
                    return;
                }
            }
            
            this.uiSettings.reset();
        });

        const oldUnload = this.$window.onbeforeunload;
        this.$window.onbeforeunload = (event) => {
            if (this.form.$dirty) {
                const text = this.maTranslate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
        
        this.$scope.$on('$destroy', () => {
            this.$window.onbeforeunload = oldUnload;
        });
    }
    
    save(event) {
        this.uiSettings.save().then(() => {
            this.form.$setPristine();

            this.maDialogHelper.toast('ui.app.uiSettingsSaved');
        }, error => {
            this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.statusText]);
        });
    }
    
    revert(event) {
        this.uiSettings.reset();
        this.form.$setPristine();
    }

    resetToDefault(event) {
        this.maDialogHelper.confirm(event, 'ui.app.confirmResetUiSettings').then(() => {
            this.uiSettings.delete().then(() => {
                this.form.$setPristine();
                
                this.maDialogHelper.toast('ui.app.uiSettingsSaved');
            }, error => {
                this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.statusText]);
            });
        }, angular.noop);
    }
}

return {
    controller: UiSettingsPageController,
    templateUrl: require.toUrl('./uiSettingsPage.html')
};

}); // define
