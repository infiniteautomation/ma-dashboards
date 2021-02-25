/**
 * Copyright (C) 2020 RadixIot. All rights reserved.
 * @author Mert Cingöz
 */

import angular from 'angular';
import pointValueImportTemplate from './pointValueImport.html';
import './pointValueImport.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maPointValueImport
 * @restrict E
 * @description Provides an interface to import point values from csv file.
 */

class PointValueImportController {
    static get $$ngIsClass() {
        return true;
    }

    static get $inject() {
        return ['$mdColors', 'maPointValues', 'maDialogHelper'];
    }

    constructor($mdColors, PointValues, DialogHelper) {
        this.PointValues = PointValues;
        this.DialogHelper = DialogHelper;

        this.accentColor = $mdColors.getThemeColor('accent');
    }

    fileDropped(data) {
        const types = data.getDataTransferTypes();
        if (types.includes('Files')) {
            const transfer = data.getDataTransfer();
            if (transfer.length) {
                const file = transfer[0];
                const csvMimeTypes = [
                    'application/csv',
                    'application/x-csv',
                    'application/vnd.ms-excel',
                    'text/csv',
                    'text/x-csv',
                    'text/comma-separated-values',
                    'text/x-comma-separated-values'
                ];

                if (!file.type || csvMimeTypes.includes(file.type)) {
                    this.doImport(file);
                    this.showDialog = {};
                }
            }
        }
    }

    fileSelected($event) {
        const fileInput = $event.target;
        if (fileInput.files && fileInput.files.length) {
            this.doImport(fileInput.files[0]);
            fileInput.value = '';
            this.showDialog = {};
        }
    }

    doImport(file) {
        this.infoMessages = [];
        this.progress = 0;
        this.error = null;

        const params = {
            fireEvents: this.fireEvents
        };

        this.PointValues.importFromCsvFile(file, params).then(
            (data) => {
                this.infoMessages = data;
                this.DialogHelper.toastOptions({
                    textTr: ['ui.app.pointValueImport.imported'],
                    hideDelay: 5000
                });
            },
            (err) => {
                this.error = err.mangoStatusText;
            }
        ).then(() => {
            this.progress = 100;
        });
    }
}

export default {
    controller: PointValueImportController,
    template: pointValueImportTemplate,
    designerInfo: {
        translation: 'ui.components.pointValueImport',
        icon: 'file_upload'
    }
};
