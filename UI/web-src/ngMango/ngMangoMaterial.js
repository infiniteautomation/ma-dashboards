/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import './ngMango';
import colorPreview from './components/colorPreview/colorPreview';
import dialogHelperFactory from './services/dialogHelper';
import fileStoreDialogFactory from './services/fileStoreDialog';
import statsDialogFactory from './services/statsDialog';
import setPointDialogFactory from './services/setPointDialog';
import 'angular-material';
import 'md-pickers';
import 'angular-material-data-table';

import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'font-awesome/css/font-awesome.css';
import 'angular-material/angular-material.css';
import 'angular-material-data-table/dist/md-data-table.css';
import 'md-pickers/dist/mdPickers.css';

const ngMangoMaterial = angular.module('ngMangoMaterial', ['ngMango', 'ngMaterial', 'mdPickers', 'md.data.table']);
ngMangoMaterial.component('maColorPreview', colorPreview);
ngMangoMaterial.factory('maDialogHelper', dialogHelperFactory);
ngMangoMaterial.factory('maFileStoreDialog', fileStoreDialogFactory);
ngMangoMaterial.factory('maStatsDialog', statsDialogFactory);
ngMangoMaterial.factory('maSetPointDialog', setPointDialogFactory);


ngMangoMaterial.config(['$provide', function($provide) {
    $provide.decorator('$mdDialog', ['$delegate', function($delegate) {
        const originalShow = $delegate.show;
        $delegate.show = function(options) {
            if (options && options.skipHide) {
                options.multiple = true;
            }
            return originalShow.apply(this, arguments);
        };
        return $delegate;
    }]);
}]);

export default ngMangoMaterial;