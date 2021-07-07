/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import fileStoreBrowserTemplate from './fileStoreBrowser.html';
import './fileStoreBrowser.css';
import sha512 from 'js-sha512';

const localStorageKey = 'fileStoreBrowser';

class FileStoreBrowserController {
    static get $$ngIsClass() { return true; }

    static get $inject() { return ['maFileStore', '$element', 'maDialogHelper', '$q', '$filter', '$injector',
        'localStorageService', '$scope', 'maScript', 'maDiscardCheck', 'maUser']; }
    constructor(maFileStore, $element, maDialogHelper, $q, $filter, $injector, localStorageService,
                $scope, maScript, maDiscardCheck, maUser) {
        this.maFileStore = maFileStore;
        this.$element = $element;
        this.maDialogHelper = maDialogHelper;
        this.$q = $q;
        this.$filter = $filter;
        this.localStorageService = localStorageService;
        this.$scope = $scope;
        this.maScript = maScript;
        this.maDiscardCheck = maDiscardCheck;
        this.maUser = maUser;

        if ($injector.has('$state')) {
            this.$state = $injector.get('$state');
            this.$stateParams = $injector.get('$stateParams');
        }

        this.tableOrder = ['-directory', 'filename'];
        this.filterAndReorderFilesBound = (...args) => {
            return this.filterAndReorderFiles(...args);
        };
    }

    $onInit() {
        this.$element.on('keydown', event => this.keyDownHandler(event));

        this.scriptExtensions = new Set();
        this.scriptMimes = new Set();
        this.scriptEnginesPromise = this.maScript.scriptEngines().then(engines => {
            this.scriptEngines = engines;
            engines.forEach(e => {
                e.mimeTypes.forEach(m => this.scriptMimes.add(m));
                e.extensions.forEach(e => this.scriptExtensions.add(e));
            });
        }, error => this.scriptEngines = []);

        this.path = [this.restrictToStore || this.defaultStore || 'default'];
        this.ngModelCtrl.$render = (...args) => {
            return this.render(...args);
        };

        this.discardCheck = new this.maDiscardCheck({
            $scope: this.$scope,
            isDirty: () => this.editFile && this.editFileModified()
        });
    }

    $onChanges(changes) {
        if (changes.mimeTypes) {
            const mimeTypeMap = this.mimeTypeMap = {};
            if (this.mimeTypes) {
                this.mimeTypes.split(/\s*,\s*/).forEach(mimeType => {
                    if (!mimeType) return;
                    mimeTypeMap[mimeType.toLowerCase()] = true;
                });
            }
        }
        if (changes.extensions) {
            const extensionMap = this.extensionMap = {};
            if (this.extensions) {
                this.extensions.split(/\s*,\s*/).forEach(ext => {
                    if (!ext) return;
                    if (ext[0] === '.') ext = ext.substr(1);
                    extensionMap[ext.toLowerCase()] = true;
                });
            }
        }

        if (changes.extensions || changes.mimeTypes) {
            const accept = [];

            Object.keys(this.extensionMap).forEach(ext => {
                accept.push('.' + ext);
            });

            Object.keys(this.mimeTypeMap).forEach(mime => {
                accept.push(mime);
            });

            this.acceptAttribute = accept.join(',');
        }
    }

    // ng-model value changed outside of this directive
    render() {
        let urls = this.ngModelCtrl.$viewValue;
        if (!Array.isArray(urls)) {
            urls = urls ? [urls] : [];
        }

        const settings = this.localStorageService.get(localStorageKey) || {};
        let userPath;
        if (this.$stateParams && this.$stateParams.fileStore) {
            userPath = [this.$stateParams.fileStore]
            if (this.$stateParams.folderPath) {
                userPath.push(...this.$stateParams.folderPath.split('/'));
            }
        } else if (settings.fileStore) {
            userPath = [settings.fileStore];
            if (Array.isArray(settings.folderPath)) {
                userPath.push(...settings.folderPath);
            }
        }

        const defaultStore = this.defaultStore || 'default';
        if (this.restrictToStore) {
            this.path = userPath && userPath[0] === this.restrictToStore ? userPath : [this.restrictToStore];
        } else {
            this.path = userPath || [defaultStore];
        }

        const filenames = {};
        urls.forEach((url, index) => {
            let path;
            try {
                path = this.maFileStore.fromUrl(url);
            } catch (e) {
                return;
            }

            if (!path.directory) {
                const filename = path.pop(); // remove filename from path
                filenames[filename] = true;
            }

            if (index === 0) {
                this.path = path;
            }
        });

        this.listFiles().then(files => {
            this.filenames = filenames;
            let firstSelected = true;

            this.selectedFiles = files.filter((file, index) => {
                if (filenames[file.filename]) {
                    if (firstSelected) {
                        // set the preview file to the first file in filenames
                        this.previewFile = file;

                        // set the lastIndex for shift clicking to the first selected file
                        this.lastIndex = index;

                        firstSelected = false;
                    }
                    return true;
                }
            });

            if (this.$stateParams) {
                const editFile = this.$stateParams && this.$stateParams.editFile;
                const foundFile = editFile && files.find(f => f.filename === editFile);
                if (foundFile) {
                    this.doEditFile(null, foundFile);
                }
            }
        });
    }

    hasFileStoreWritePermission() {
        return this.fileStore && this.maUser.current &&
            this.maUser.current.hasPermission(this.fileStore.writePermission);
    }

    listFiles() {
        const listErrorHandler = () => {
            this.files = [];
            this.filteredFiles = [];
            this.previewFile = null;
            this.filenames = {};
            this.selectedFiles = [];
            delete this.lastIndex;

            const defaultStore = this.restrictToStore || this.defaultStore || 'default';
            if (!(this.path.length === 1 && this.path[0] === defaultStore)) {
                this.path = [defaultStore];
                return this.listFiles();
            }
            return this.filteredFiles;
        };

        this.previewFile = null;
        this.filenames = {};
        this.selectedFiles = [];
        delete this.lastIndex;

        if (this.path.length) {
            const storeXid = this.path[0];
            if (!this.fileStore || this.fileStore.xid !== storeXid) {
                this.maFileStore.get(storeXid).then(store => {
                    this.fileStore = store;
                }, error => delete this.fileStore);
            }

            this.listPromise = this.maFileStore.listFiles(this.path).then(files => {
                this.files = files;
                this.filterAndReorderFiles();
                return this.filteredFiles;
            }, error => listErrorHandler());
        } else {
            delete this.fileStore;
            this.listPromise = this.maFileStore.query().then(fileStores => {
                    this.files = fileStores.map(store => {
                        return this.storeToFile(store);
                    });
                    this.filterAndReorderFiles();
                    return this.filteredFiles;
            }, listErrorHandler);
        }

        this.listPromise['finally'](() => {
            delete this.listPromise;
        });

        const folderPath = this.path.slice();
        const fileStore = folderPath.shift() || null;

        if (this.$state) {
            const params = {
                fileStore,
                folderPath: folderPath.join('/')
            };
            this.$state.go('.', params, {location: 'replace', notify: false});
        }

        const settings = this.localStorageService.get(localStorageKey) || {};
        settings.fileStore = fileStore;
        settings.folderPath = folderPath;
        this.localStorageService.set(localStorageKey, settings);

        return this.listPromise;
    }

    filterFiles(file) {
        if (this.path.length) {
            const currentFolderPath = this.path.slice(1).join('/');
            if (file.folderPath !== currentFolderPath) {
                return false;
            }
        }

        if (file.directory) return true;

        if (this.extensions) {
            const match = /\.([^\.]+)$/.exec(file.filename);
            if (match && this.extensionMap[match[1].toLowerCase()]) return true;
        }
        if (this.mimeTypes) {
            if (this.mimeTypeMap['*/*']) return true;
            if (!file.mimeType) return false;
            if (this.mimeTypeMap[file.mimeType.toLowerCase()]) return true;
            if (this.mimeTypeMap[file.mimeType.toLowerCase().replace(/\/.+$/, '/*')]) return true;
        }

        return !this.extensions && !this.mimeTypes;
    }

    filterAndReorderFiles(file) {
        const files = this.files.filter(this.filterFiles, this);
        let tableOrder = typeof this.tableOrder === 'string' ? this.tableOrder.split(',') : this.tableOrder;
        if (!this.path.length && Array.isArray(tableOrder)) {
            tableOrder = tableOrder.map(key => key.replace(/\bfilename\b/g, 'store.name'));
        }
        this.filteredFiles = this.$filter('orderBy')(files, tableOrder);
    }

    pathClicked(event, index) {
        let popNum = this.path.length - index - 1;
        while(popNum-- > 0) {
            this.path.pop();
        }

        this.listFiles();

        if (!this.multiple && this.selectDirectories && this.path.length) {
            this.ngModelCtrl.$setViewValue(this.maFileStore.toUrl(this.path, true));
        }
    }

    fileClicked(event, file, index) {
        this.previewFile = file;

        if (file.directory) {
            this.path.push(file.filename);
            this.listFiles();

            if (!this.multiple && this.selectDirectories) {
                this.ngModelCtrl.$setViewValue(file.url);
            }
            return;
        }

        if (this.multiple && (event.ctrlKey || event.metaKey)) {
            this.lastIndex = index;

            if (this.filenames[file.filename]) {
                this.removeFileFromSelection(file);
            } else {
                this.addFileToSelection(file);
            }
        } else if (this.multiple && event.shiftKey && isFinite(this.lastIndex)) {
            event.preventDefault();

            let fromIndex, toIndex;
            if (this.lastIndex < index) {
                fromIndex = this.lastIndex;
                toIndex = index;
            } else {
                fromIndex = index;
                toIndex = this.lastIndex;
            }

            this.setSelection(this.filteredFiles.slice(fromIndex, toIndex + 1));
        } else {
            this.lastIndex = index;
            this.setSelection([file]);
        }

        this.setViewValueToSelection();
    }

    setViewValueToSelection() {
        const urls = this.selectedFiles.map(file => {
            return file.url;
        });

        this.ngModelCtrl.$setViewValue(this.multiple ? urls : urls[0]);
    }

    setSelection(files) {
        this.selectedFiles = [];
        this.filenames = {};
        for (let i = 0; i < files.length; i++) {
            this.addFileToSelection(files[i]);
        }
    }

    addFileToSelection(file) {
        this.filenames[file.filename] = true;
        this.selectedFiles.push(file);
    }

    removeFileFromSelection(file) {
        delete this.filenames[file.filename];
        const index = this.selectedFiles.indexOf(file);
        if (index >= 0)
            return this.selectedFiles.splice(index, 1);
    }

    cancelClick(event) {
        event.stopPropagation();
    }

    deleteFile(event, file) {
        event.stopPropagation();

        let messageKey;
        if (file.store) {
            messageKey = 'ui.filestore.confirmDelete';
        } else {
            messageKey = file.directory ? 'ui.app.areYouSureDeleteFolder' : 'ui.app.areYouSureDeleteFile';
        }
        this.maDialogHelper.confirm(event, messageKey).then(() => {
            if (file.store) {
                // TODO Mango 4.0 recursive param
                return file.store.delete();
            }
            return this.maFileStore.remove(this.path.concat(file.filename), true);
        }).then(() => {
            const index = this.files.indexOf(file);
            if (index >= 0) {
                this.files.splice(index, 1);
            }
            this.filterAndReorderFiles();
            if (this.removeFileFromSelection(file)) {
                this.setViewValueToSelection();
            }
            if (this.previewFile === file) {
                this.previewFile = this.selectedFiles.length ? this.selectedFiles[0] : null;
            }
            this.maDialogHelper.toast(['ui.fileBrowser.deletedSuccessfully', file.filename]);
        }, error => {
            if (!error) return; // dialog cancelled
            const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
            this.maDialogHelper.toast(['ui.fileBrowser.errorDeleting', file.filename, msg], 'md-warn');
        });
    }

    uploadFilesButtonClicked(event) {
        this.$element.maFind('input[type=file]')
            .val(null)
            .maClick();
    }

    uploadFilesChanged(event, allowZip = true) {
        const files = event.target.files;
        if (!files.length) return;
        this.uploadFiles(files, allowZip);
    }

    fileDropped(data) {
        const types = data.getDataTransferTypes();
        if (types.includes('Files')) {
            const files = data.getDataTransfer();
            if (files && files.length) {
                this.uploadFiles(files);
            }
        }
    }

    uploadFiles(files, allowZip = true) {
        this.uploadPromise = this.$q.when().then(() => {
            if (allowZip && files.length === 1) {
                const file = files[0];
                if (file.type === 'application/x-zip-compressed' || file.type === 'application/zip' || file.name.substr(-4) === '.zip') {

                    return this.maDialogHelper.confirm(event, 'ui.fileBrowser.confirmExtractZip').then(() => {
                        return this.maFileStore.uploadZipFile(this.path, file, this.overwrite);
                    }, angular.noop);
                }
            }
        }).then(uploaded => {
            // already did zip upload
            if (uploaded) {
                return uploaded;
            }

            return this.maFileStore.uploadFiles(this.path, files, this.overwrite);
        }).then((uploaded) => {
            // this code block is a little complicated, could just refresh the current folder?
            const strPath = this.path.slice(1).join('/');
            uploaded.forEach(file => {
                if (file.folderPath === strPath) {
                    // file is in this folder
                    const existingFileIndex = this.files.findIndex(f => f.filename === file.filename);
                    if (existingFileIndex >= 0) {
                        this.files[existingFileIndex] = file;
                    } else {
                        this.files.push(file);
                    }
                } else if (file.folderPath.indexOf(strPath) === 0) {
                    // file is in a subdirectory
                    const uploadedFilePath = file.folderPath.split('/');
                    const folderName = uploadedFilePath[this.path.length - 1];

                    const existingSubFolder = this.files.findIndex(f => f.filename === folderName);
                    if (existingSubFolder < 0)  {
                        // file upload created a subdirectory, add it to the view

                        this.files.push(new this.maFileStore.newFileStoreFile(this.path[0], {
                            directory: true,
                            filename: folderName,
                            folderPath: strPath,
                            lastModified: file.lastModified,
                            mimeType: null,
                            size: 0
                        }));
                    }
                }
            });

            this.filterAndReorderFiles();

            if (uploaded.length) {
                this.setSelection(uploaded.filter(this.filterFiles, this));
                this.setViewValueToSelection();
                this.previewFile = this.selectedFiles.length ? this.selectedFiles[0] : null;

                this.maDialogHelper.toast(['ui.fileBrowser.filesUploaded', uploaded.length]);
            }
        }, (error) => {
            let msg;
            if (error.status && error.data) {
                msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
            } else {
                msg = '' + error;
            }
            this.maDialogHelper.toast(['ui.fileBrowser.uploadFailed', msg], 'md-warn');
        }).finally(() => {
            delete this.uploadPromise;
            this.$element.maFind('input[type=file]').val('');
        });
    }

    downloadFiles(event) {
        this.downloadPromise = this.maFileStore.downloadFiles(this.path).finally(() => {
            delete this.downloadPromise;
        });
    }

    createNewFolder(event) {
        let folderName;
        this.maDialogHelper.prompt(event, 'ui.app.createNewFolder', null, 'ui.app.folderName').then(_folderName => {
            if (!_folderName) {
                return this.$q.reject();
            }

            folderName = _folderName;
            return this.maFileStore.createNewFolder(this.path, folderName);
        }).then(folder => {
            this.files.push(folder);
            this.filterAndReorderFiles();
            this.maDialogHelper.toast(['ui.fileBrowser.folderCreated', folder.filename]);
        }, error => {
            if (!error) return; // dialog cancelled
            if (error.status === 409) {
                this.maDialogHelper.toast(['ui.fileBrowser.folderExists', folderName], 'md-warn');
            } else {
                const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
                this.maDialogHelper.toast(['ui.fileBrowser.errorCreatingFolder', folderName, msg], 'md-warn');
            }
        });
    }

    createNewFile(event) {
        let fileName;
        this.maDialogHelper.prompt(event, 'ui.app.createNewFile', null, 'ui.app.fileName').then(_fileName => {
            if (!_fileName) {
                return this.$q.reject();
            }

            fileName = _fileName;
            return this.maFileStore.createNewFile(this.path, fileName);
        }).then(file => {
            this.files.push(file);
            this.filterAndReorderFiles();
            this.maDialogHelper.toast(['ui.fileBrowser.fileCreated', file.filename]);
            if (file.editMode)
                this.doEditFile(event, file);
        }, error => {
            if (!error) return; // dialog cancelled
            if (error.status === 409) {
                this.maDialogHelper.toast(['ui.fileBrowser.fileExists', fileName], 'md-warn');
            } else {
                const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
                this.maDialogHelper.toast(['ui.fileBrowser.errorCreatingFile', fileName, msg], 'md-warn');
            }
        });
    }

    doEditFile(event, file) {
        if (event) {
            event.stopPropagation();
        }

        this.maFileStore.downloadFile(file).then(textContent => {
            this.editFile = file;
            this.editText = textContent;
            this.editHash = sha512.sha512(textContent);

            if (this.$state) {
                this.$state.go('.', {editFile: file.filename}, {location: 'replace', notify: false});
            }

            this.scriptEnginesPromise.then(() => {
                this.supportedEngines = this.scriptEngines.filter(e => {
                    return e.mimeTypes.includes(file.mimeType) || e.extensions.includes(file.extension);
                });
                this.selectedEngine = this.supportedEngines[0];
            });

            if (this.editingFile) {
                this.editingFile({
                    $file: this.editFile,
                    $save: (...args) => {
                        return this.saveEditFile(...args);
                    }
                });
            }
        }, error => {
            const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
            this.maDialogHelper.toast(['ui.fileBrowser.errorDownloading', file.filename, msg], 'md-warn');
        });
    }

    saveEditFile(event) {
        const currentHash = sha512.sha512(this.editText);
        if (this.editHash === currentHash) {
            this.maDialogHelper.toast(['ui.fileBrowser.fileNotChanged', this.editFile.filename]);
            return this.$q.resolve();
        }

        const files = [this.editFile.createFile(this.editText)];
        return this.maFileStore.uploadFiles(this.path, files, true).then(uploaded => {
            const index = this.files.indexOf(this.editFile);

            this.editHash = currentHash;
            this.editFile = uploaded[0];

            this.files.splice(index, 1, this.editFile);
            this.filterAndReorderFiles();

            this.maDialogHelper.toast(['ui.fileBrowser.savedSuccessfully', this.editFile.filename]);
        }, error => {
            const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
            this.maDialogHelper.toast(['ui.fileBrowser.errorUploading', this.editFile.filename, msg], 'md-warn');
        });
    }

    cancelEditFile(event) {
        if (!this.discardCheck.canDiscard()) {
            return;
        }

        this.editFile = null;
        this.editText = null;
        this.editHash = null;
        this.supportedEngines = [];
        delete this.selectedEngine;
        delete this.aceEditor;

        if (this.$state) {
            this.$state.go('.', {editFile: null}, {location: 'replace', notify: false});
        }

        if (this.editingFile) {
            this.editingFile({$file: null, $save: null});
        }
    }

    renameFile(event, file) {
        event.stopPropagation();

        let newName;
        this.maDialogHelper.prompt(event, 'ui.app.renameOrMoveTo', null, 'ui.app.fileName', file.filename).then(_newName => {
            newName = _newName;
            if (newName === file.filename)
                return this.$q.reject();
            return this.maFileStore.renameFile(this.path, file, newName);
        }).then(renamedFile => {
            const index = this.files.indexOf(file);
            if (renamedFile.folderPath === file.folderPath) {
                // replace it
                this.files.splice(index, 1, renamedFile);
            } else {
                // remove it
                this.files.splice(index, 1);
            }
            this.filterAndReorderFiles();

            if (renamedFile.filename === file.filename) {
                this.maDialogHelper.toast(['ui.fileBrowser.fileMoved', renamedFile.filename, renamedFile.fileStore + '/' + renamedFile.folderPath]);
            } else {
                this.maDialogHelper.toast(['ui.fileBrowser.fileRenamed', renamedFile.filename]);
            }
        }, error => {
            if (!error) return; // dialog cancelled or filename the same
            if (error.status === 409) {
                this.maDialogHelper.toast(['ui.fileBrowser.fileExists', newName], 'md-warn');
            } else {
                const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
                this.maDialogHelper.toast(['ui.fileBrowser.errorCreatingFile', newName, msg], 'md-warn');
            }
        });
    }

    copyFile(event, file) {
        event.stopPropagation();

        let newName;
        this.maDialogHelper.prompt(event, 'ui.app.copyFileTo', null, 'ui.app.fileName', file.filename).then(_newName => {
            newName = _newName;
            if (newName === file.filename)
                return this.$q.reject();
            return this.maFileStore.copyFile(this.path, file, newName);
        }).then(copiedFile => {
            if (copiedFile.folderPath === file.folderPath) {
                this.files.push(copiedFile);
                this.filterAndReorderFiles();
            }
            this.maDialogHelper.toast(['ui.fileBrowser.fileCopied', copiedFile.filename, copiedFile.fileStore + '/' + copiedFile.folderPath]);
        }, error => {
            if (!error) return; // dialog cancelled or filename the same
            if (error.status === 409) {
                this.maDialogHelper.toast(['ui.fileBrowser.fileExists', newName], 'md-warn');
            } else {
                const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
                this.maDialogHelper.toast(['ui.fileBrowser.errorCreatingFile', newName, msg], 'md-warn');
            }
        });
    }

    selectionKeyDown(event) {
        if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey || ![38, 40].includes(event.keyCode)) return;
        if (this.selectedFiles.length > 1) return;

        const selectedFile = this.selectedFiles.length && this.selectedFiles[0];
        const selectedFileIndex = this.filteredFiles.indexOf(selectedFile);

        let nextIndex = 0;
        if (event.keyCode === 38) {
            // up
            nextIndex = selectedFileIndex - 1;
        } else if (event.keyCode === 40) {
            // down
            nextIndex = selectedFileIndex + 1;
        }

        event.preventDefault();

        const newSelectedFile = this.filteredFiles[nextIndex];
        if (newSelectedFile) {
            this.previewFile = newSelectedFile;
            this.setSelection([newSelectedFile]);
            this.setViewValueToSelection();
        }
    }

    keyDownHandler(event) {
        const keyActions = {
            // Ctrl-s
            83: {ctrl: true, action: () => this.saveEditFile(event)},
            // Ctrl-e
            69: {ctrl: true, action: () => this.evalScript(event)},
            // ESC
            27: {action: () => this.cancelEditFile(event)}
        };

        if (this.editFile && event.which in keyActions) {
            const action = keyActions[event.which];
            if (!action.ctrl || event.ctrlKey || event.metaKey) {
                event.stopPropagation();
                event.preventDefault();
                this.$scope.$apply(() => {
                    action.action();
                })
            };
        }
    }

    evalScript(event) {
        event.stopPropagation();

        if (this.editFileModified()) {
            this.maDialogHelper.errorToast(['ui.fileBrowser.saveScriptBeforeEval']);
            return;
        }

        this.scriptResult = {
            file: this.editFile
        };

        if (this.aceEditor) {
            this.aceEditor.session.clearAnnotations();
        }

        this.scriptResult.evalPromise = this.editFile.evalScript(undefined, {
            engineName: this.selectedEngine.engineName
        }, {
            responseType: 'blob',
            transformResponse: blob => blob
        }).then(response => {
            const result = response.data;

            this.scriptResult.success = true;
            this.scriptResult.outputBlob = result;
            this.scriptResult.outputBlobUrl = URL.createObjectURL(result);

            const isText = result.type.indexOf('text/') === 0;
            const isJson = result.type === 'application/json';

            if (response.filename) {
                this.scriptResult.outputFilename = response.filename;
            } else {
                let outputFilename = this.scriptResult.file.filename;
                const lastDot = outputFilename.lastIndexOf('.');
                if (lastDot >= 0) {
                    outputFilename = outputFilename.slice(0, lastDot);
                }
                outputFilename += '_response';
                if (isText) {
                    outputFilename += '.txt';
                } else if (isJson) {
                    outputFilename += '.json';
                }
                this.scriptResult.outputFilename = outputFilename;
            }

            if (isText || isJson) {
                this.scriptResult.canShowText = true;
                // automatically show text if the size is less than 100 KiB
                if (result.size < 100 * 1024) {
                    this.getScriptResultText();
                }
            }
        }, error => {
            this.scriptResult.error = error;

            let filesMatch = false;
            if (error.data.fileName) {
                const normalized = error.data.fileName.replace(/\\/g, '/');
                if (normalized.indexOf('/') >= 0) {
                    filesMatch = normalized.endsWith(this.editFile.filePath)
                } else {
                    filesMatch = error.data.fileName === this.editFile.filename;
                }
            }

            if (this.aceEditor && error.data && error.data.lineNumber != null && filesMatch) {
                this.aceEditor.session.setAnnotations([{
                    row: error.data.lineNumber - 1,
                    column: error.data.columnNumber,
                    text: error.data.shortMessage || error.mangoStatusText,
                    type: 'error'
                }]);
            }
        }).finally(() => delete this.scriptResult.evalPromise);
    }

    getScriptResultText() {
        this.scriptResult.canShowText = false;
        this.scriptResult.textLoading = true;
        this.$q.resolve(this.scriptResult.outputBlob.text()).then(text => {
            delete this.scriptResult.textLoading;
            this.scriptResult.output = text;
        });
    }

    canEvalScript(file) {
        return file.mimeType != null && this.scriptMimes.has(file.mimeType) || file.extension != null && this.scriptExtensions.has(file.extension);
    }

    editFileModified() {
        const currentHash = sha512.sha512(this.editText);
        return this.editHash !== currentHash;
    }

    createNewFileStore(event) {
        this.showFileStoreEditDialog = {
            targetEvent: event,
            fileStore: new this.maFileStore()
        };
    }

    editFileStore(event, file) {
        event.stopPropagation();
        this.showFileStoreEditDialog = {
            targetEvent: event,
            file,
            fileStore: file.store
        };
    }

    fileStoreSaved() {
        const file = this.showFileStoreEditDialog.file;
        const fileStore = this.showFileStoreEditDialog.fileStore;

        if (file && !fileStore) {
            // deleted
            const index = this.files.indexOf(file);
            if (index >= 0) {
                this.files.splice(index, 1);
            }
        } else if (file && fileStore) {
            // updated, ensure filename updated
            file.filename = fileStore.xid;
            file.store = fileStore;
        } else if (fileStore) {
            // created
            this.files.push(this.storeToFile(fileStore));
        }
        this.filterAndReorderFiles();

        delete this.showFileStoreEditDialog;
    }

    fileStoreEditorCancelled() {
        delete this.showFileStoreEditDialog;
    }

    storeToFile(store) {
        return {
            store: store,
            filename: store.xid,
            directory: true
        };
    }
}

const fileStoreBrowser = {
    controller: FileStoreBrowserController,
    template: fileStoreBrowserTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        restrictToStore: '@?store',
        defaultStore: '@?',
        selectDirectories: '<?',
        mimeTypes: '@?',
        extensions: '@?',
        preview: '<?',
        disableEdit: '<?',
        editingFile: '&?',
        multiple: '<?'
    },
    designerInfo: {
        attributes: {
            selectDirectories: {type: 'boolean'},
            multiple: {type: 'boolean'}
        },
        translation: 'ui.components.fileStoreBrowser',
        icon: 'folder_open'
    }
};

export default fileStoreBrowser;
