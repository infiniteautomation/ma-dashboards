/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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

import 'font-awesome/css/font-awesome.css';
import 'material-design-icons-iconfont/dist/fonts/material-icons.css';
import 'angular-material/angular-material.css';
import 'angular-material-data-table/dist/md-data-table.css';
import 'md-pickers/dist/mdPickers.css';

const ngMangoMaterial = angular.module('ngMangoMaterial', ['ngMango', 'ngMaterial', 'mdPickers', 'md.data.table']);
ngMangoMaterial.component('maColorPreview', colorPreview);
ngMangoMaterial.factory('maDialogHelper', dialogHelperFactory);
ngMangoMaterial.factory('maFileStoreDialog', fileStoreDialogFactory);
ngMangoMaterial.factory('maStatsDialog', statsDialogFactory);
ngMangoMaterial.factory('maSetPointDialog', setPointDialogFactory);

export default ngMangoMaterial;
