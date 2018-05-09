/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import fileStoreBrowserTemplate from './fileStoreBrowser.html';
import sha512 from 'js-sha512';

const localStorageKey = 'fileStoreBrowser';

class FileStoreBrowserController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['maFileStore', '$element', 'maDialogHelper', '$q', '$filter', '$injector', 'localStorageService']; }
    constructor(maFileStore, $element, maDialogHelper, $q, $filter, $injector, localStorageService) {
        this.maFileStore = maFileStore;
        this.$element = $element;
        this.maDialogHelper = maDialogHelper;
        this.$q = $q;
        this.$filter = $filter;
        this.localStorageService = localStorageService;
        
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
    	this.path = [this.restrictToStore || 'default'];
        this.ngModelCtrl.$render = (...args) => {
            return this.render(...args);
        };
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
    
    	this.path = [this.restrictToStore || 'default'];
    	
    	const settings = this.localStorageService.get(localStorageKey) || {};
    	if (settings.fileStore === null) {
    	    this.path = [];
    	} else if (settings.fileStore) {
    	    if (!this.restrictToStore || this.restrictToStore === settings.fileStore) {
                this.path = Array.isArray(settings.folderPath) ? settings.folderPath : [];
                this.path.unshift(settings.fileStore);
            }
    	}
    	
        if (this.$stateParams) {
            const fileStore = this.$stateParams.fileStore;
            const folderPath = this.$stateParams.folderPath ? this.$stateParams.folderPath.split('/') : [];
            
            if (fileStore && (!this.restrictToStore || this.restrictToStore === fileStore)) {
                folderPath.unshift(fileStore);
                this.path = folderPath;
            }
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
    	});
    }
    
    listFiles() {
    	const listErrorHandler = () => {
    		this.files = [];
            this.filteredFiles = [];
    		this.previewFile = null;
    		this.filenames = {};
    		this.selectedFiles = [];
    		delete this.lastIndex;
    
    		const defaultStore = this.restrictToStore || 'default';
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
    		this.listPromise = this.maFileStore.listFiles(this.path).then(files => {
    			this.files = files;
    			this.filterAndReorderFiles();
    	    	return this.filteredFiles;
    		}, listErrorHandler);
    	} else {
    		this.listPromise = this.maFileStore.list().then(fileStores => {
    			const fileStoreNames = this.fileStoreNames = {};
    			this.files = fileStores.map(store => {
    				fileStoreNames[store] = true;
    				
    				return {
    					filename: store,
    					directory: true
    				};
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
    	
    	if (this.$state && this.$stateParams) {
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
    	this.filteredFiles = this.$filter('orderBy')(files, this.tableOrder);
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
    
    	const confirmPromise = this.maDialogHelper.confirm(event,
    			file.directory ? 'ui.app.areYouSureDeleteFolder' : 'ui.app.areYouSureDeleteFile');
    
    	confirmPromise.then(() => {
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
    	this.$element.find('input[type=file]').trigger('click');
    }
    
    uploadFilesChanged(event, allowZip = true) {
        const files = event.target.files;
        if (!files.length) return;
        this.uploadFiles(files, allowZip);
    }
    
    fileDropped(data) {
        const types = data.getDataTransferTypes();
        if (types && types.length && types[0] === 'Files') {
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
            this.$element.find('input[type=file]').val('');
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
    	event.stopPropagation();
    	
    	this.maFileStore.downloadFile(file).then(textContent => {
    		this.editFile = file;
    		this.editText = textContent;
    		this.editHash = sha512.sha512(textContent);
    		
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
        if (this.editHash === sha512.sha512(this.editText)) {
            this.maDialogHelper.toast(['ui.fileBrowser.fileNotChanged', this.editFile.filename]);
            return this.$q.resolve();
        }
        
    	const files = [this.editFile.createFile(this.editText)];
    	return this.maFileStore.uploadFiles(this.path, files, true).then(uploaded => {
    		const index = this.files.indexOf(this.editFile);
    		this.files.splice(index, 1, uploaded[0]);
            this.filterAndReorderFiles();
    		
    		this.maDialogHelper.toast(['ui.fileBrowser.savedSuccessfully', this.editFile.filename]);
    	}, error => {
    		const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
    		this.maDialogHelper.toast(['ui.fileBrowser.errorUploading', this.editFile.filename, msg], 'md-warn');
    	});
    }
    
    cancelEditFile(event) {
    	this.editFile = null;
    	this.editText = null;
        this.editHash = null;
        
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
    
    keyDown(event) {
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
            this.setSelection([newSelectedFile]);
            this.setViewValueToSelection();
        }
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
