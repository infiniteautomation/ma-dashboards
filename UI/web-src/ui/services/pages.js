/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

PageFactory.$inject = ['maJsonStore', 'MA_UI_PAGES_XID', 'maUtil', '$q', 'MA_UI_EDIT_PAGES_PERMISSION', 'maDialogHelper', 'maUser'];
function PageFactory(JsonStore, MA_UI_PAGES_XID, Util, $q, MA_UI_EDIT_PAGES_PERMISSION, maDialogHelper, maUser) {

    class Page {
        getPages() {
            return JsonStore.get({
                xid: MA_UI_PAGES_XID
            }).$promise.then(null, error => {
                if (error.status === 404) {
                    return this.getDefaultPages();
                }
                return $q.reject(error);
            });
        }
        
        getDefaultPages() {
            const storeObject = new JsonStore();
            storeObject.xid = MA_UI_PAGES_XID;
            storeObject.name = MA_UI_PAGES_XID;
            storeObject.jsonData = {
                pages: []
            };
            storeObject.editPermission = MA_UI_EDIT_PAGES_PERMISSION;
            storeObject.readPermission = 'user';
            storeObject.publicData = false;

            return storeObject;
        }
        
        loadPage(xid) {
            return JsonStore.get({
                xid: xid
            }).$promise.then(null, error => {
                const user = maUser.current;
                
                // the whole purpose of this section is to remove missing pages from the list of pages
                if (error.status === 404 && user) {
                    this.getPages().then(pagesStore => {
                        if (user.hasPermission(pagesStore.editPermission)) {
                            const pages = pagesStore.jsonData.pages;
                            let pageRemovedFromList = false;
                            for (let i = 0; i < pages.length;) {
                                if (pages[i].xid === xid) {
                                    pages.splice(i, 1);
                                    pageRemovedFromList = true;
                                    continue;
                                }
                                i++;
                            }
                            
                            if (pageRemovedFromList) {
                                pagesStore.$save();
                            }
                        }
                    });
                }
                
                maDialogHelper.errorToast(['ui.app.errorGettingPage', error.mangoStatusText]);

                return $q.reject(error);
            });
        }
        
        newPageContent() {
            const storeObject = new JsonStore();
            storeObject.xid = Util.uuid();
            storeObject.jsonData = {
                markup: ''
            };
            storeObject.editPermission = MA_UI_EDIT_PAGES_PERMISSION;
            storeObject.readPermission = 'user';
            storeObject.publicData = false;
            return storeObject;
        }
    }

    return new Page();
}

export default PageFactory;
