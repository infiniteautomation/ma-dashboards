/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

PageFactory.$inject = ['maJsonStore', 'MA_UI_PAGES_XID', 'maUtil', '$q', 'maDialogHelper', 'maUser'];
function PageFactory(JsonStore, MA_UI_PAGES_XID, Util, $q, maDialogHelper, maUser) {

    class Page {
        getPages() {
            return JsonStore.get({
                xid: MA_UI_PAGES_XID
            }).$promise;
        }
        
        loadPage(xid) {
            return JsonStore.get({
                xid: xid
            }).$promise.then(null, error => {
                const user = maUser.current;
                
                // the whole purpose of this section is to remove missing pages from the list of pages
                if (error.status === 404 && user) {
                    this.getPages().then(pagesStore => {
                        if (user.hasAnyRole(pagesStore.editPermission)) {
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
            storeObject.editPermission = []; // TODO Mango 4.0 get roles for ui.pages.edit and use it here
            storeObject.readPermission = ['user'];
            return storeObject;
        }
    }

    return new Page();
}

export default PageFactory;
