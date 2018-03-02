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

const ngMangoMaterial = angular.module('ngMangoMaterial', ['ngMango', 'ngMaterial', 'mdPickers', 'md.data.table']);
ngMangoMaterial.component('maColorPreview', colorPreview);
ngMangoMaterial.factory('maDialogHelper', dialogHelperFactory);
ngMangoMaterial.factory('maFileStoreDialog', fileStoreDialogFactory);
ngMangoMaterial.factory('maStatsDialog', statsDialogFactory);
ngMangoMaterial.factory('maSetPointDialog', setPointDialogFactory);

export default ngMangoMaterial;
