/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maDialog
 * @restrict E
 * @description
 */

import angular from 'angular';
import dialogTemplate from './dialog.html';

dialog.$inject = ['$compile', '$parse', '$q'];
function dialog($compile, $parse, $q) {

    class DialogController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs', '$transclude', '$mdDialog', '$mdMedia']; }
        
        constructor($scope, $element, $attrs, $transclude, $mdDialog, $mdMedia) {
            this.$scope = $scope;
            this.$element = $element;
            this.$transclude = $transclude;
            this.$mdDialog = $mdDialog;
            this.$mdMedia = $mdMedia;
            
            this.padding = true;
            
            if ($attrs.hasOwnProperty('canShow')) {
                const getter = $parse($attrs.canShow);
                this.canShow = options => getter($scope.$parent, {$options: options});
            }
            if ($attrs.hasOwnProperty('canHide')) {
                const getter = $parse($attrs.canHide);
                this.canHide = result => getter($scope.$parent, {$result: result});
            }
            if ($attrs.hasOwnProperty('canCancel')) {
                const getter = $parse($attrs.canCancel);
                this.canCancel = error => getter($scope.$parent, {$error: error});
            }
            if ($attrs.hasOwnProperty('onShow')) {
                const getter = $parse($attrs.onShow);
                this.onShow = options => getter($scope.$parent, {$options: options});
            }
            if ($attrs.hasOwnProperty('onHide')) {
                const getter = $parse($attrs.onHide);
                this.onHide = result => getter($scope.$parent, {$result: result});
            }
            if ($attrs.hasOwnProperty('onCancel')) {
                const getter = $parse($attrs.onCancel);
                this.onCancel = error => getter($scope.$parent, {$error: error});
            }
            if ($attrs.hasOwnProperty('onClose')) {
                const getter = $parse($attrs.onClose);
                this.onClose = error => getter($scope.$parent, {});
            }
        }
        
        $onChanges(changes) {
            if (changes.showTrigger && !changes.showTrigger.isFirstChange() && this.showTrigger) {
                this.show(this.showTrigger);
            }
        }
        
        $onInit() {
            if (!this.lazyCompile && !this.destroyDialog) {
                this.createElement();
            }
            
            if (this.showTrigger) {
                this.show(this.showTrigger);
            }
            
            this.$scope.$on('$destroy', () => {
                if (this.dialogPromise) {
                    this.$mdDialog.cancel();
                }
            });
        }

        createElement() {
            const $container = this.$container = angular.element('<div class="md-dialog-container"></div>');

            let $userContents;
            this.$transclude((tClone, tScope) => {
                tScope.$dialog = this;
                
                this.transcludeScope = tScope;
                $userContents = tClone;
            });

            // check if user supplied a md-dialog
            if ($userContents.maMatch('md-dialog').length) {
                $container.append($userContents);
            } else {
                // user didn't supply a md-dialog, only its contents, create a md-dialog from our template
                $compile(dialogTemplate)(this.$scope, ($dialogClone) => {
                    $container.append($dialogClone);
                });

                $container.maFind('md-dialog-content').append($userContents);
                const $title = $userContents.maMatch('.ma-dialog-title');
                $container.maFind('div.md-toolbar-tools > h2').append($title);
            }
        }
        
        destroyElement() {
            this.$container = null;
            this.transcludeScope.$destroy();
        }
        
        fullscreen() {
            return this.$mdMedia('xs') || this.$mdMedia('sm');
        }

        show(options = {}) {
            $q.resolve(this.canShow ? this.canShow(options) : true).then(shouldShow => {
                if (shouldShow) {
                    this.doShow(options);
                }
            }, () => null);
        }
        
        doShow(userOptions) {
            if (!this.$container) {
                this.createElement();
            }

            const options = Object.assign({
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen: this.fullscreen(),
                contentElement: this.$container[0],
                onRemoving: (...args) => {
                    if (typeof userOptions.onRemoving === 'function') {
                        userOptions.onRemoving.apply(undefined, args);
                    }
                    this.transcludeScope.$broadcast('maDialogRemoving', ...args);
                }
            }, userOptions);

            if (this.onShow) {
                this.onShow(options);
            }

            const showPromise = this.$mdDialog.show(options);
            
            if (options.hidePromise) {
                options.hidePromise.then(r => this.hide(r), e => this.cancel(e));
            }

            this.dialogPromise = showPromise.then(result => {
                if (this.onHide) {
                    this.onHide(result);
                }
                if (this.onClose) {
                    this.onClose();
                }
            }, error => {
                if (this.onCancel) {
                    this.onCancel(error);
                }
                if (this.onClose) {
                    this.onClose();
                }
            }).finally(() => {
                delete this.dialogPromise;
                if (this.destroyDialog) {
                    this.destroyElement();
                }
            });
        }
        
        isOpen() {
            return !!this.dialogPromise;
        }
        
        hide(result) {
            $q.resolve(this.canHide ? this.canHide(result) : true).then(shouldHide => {
                if (shouldHide) {
                    this.$mdDialog.hide(result);
                }
            }, () => null);
        }
        
        cancel(error) {
            $q.resolve(this.canCancel ? this.canCancel(error) : true).then(shouldCancel => {
                if (shouldCancel) {
                    this.$mdDialog.cancel(error);
                }
            }, () => null);
        }
    }
    
    return {
        scope: {},
        restrict: 'E',
        transclude: true,
        terminal: true,
        controller: DialogController,
        controllerAs: '$dialog',
        bindToController: {
            showTrigger: '<?showDialog',
            lazyCompile: '<?',
            destroyDialog: '<?',
            padding: '<?'
        }
    };
}

export default dialog;