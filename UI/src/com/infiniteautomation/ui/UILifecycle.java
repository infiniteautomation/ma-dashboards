/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui;

import java.util.Collections;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.db.dao.JsonDataDao;
import com.serotonin.m2m2.db.dao.RoleDao;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.ModuleElementDefinition;
import com.serotonin.m2m2.vo.json.JsonDataVO;
import com.serotonin.m2m2.vo.role.Role;
import com.serotonin.m2m2.vo.role.RoleVO;

/**
 * @author Jared Wiltshire
 *
 */
public class UILifecycle extends ModuleElementDefinition {
    // must match variables defined in web/ui/app.js
    public static final String MA_UI_MENU_XID = "mangoUI-menu";
    public static final String MA_UI_PAGES_XID = "mangoUI-pages";
    public static final String MA_UI_SETTINGS_XID = "mangoUI-settings";
    public static final String MA_UI_EDIT_MENUS_PERMISSION = "edit-ui-menus";
    public static final String MA_UI_EDIT_PAGES_PERMISSION = "edit-ui-pages";
    public static final String MA_UI_EDIT_SETTINGS_PERMISSION = "edit-ui-settings";
    public static final String MA_UI_DEFAULT_READ_PERMISSION = "user";

    private JsonNodeFactory nodeFactory;

    public UILifecycle() {
        this.nodeFactory = JsonNodeFactory.withExactBigDecimals(false);
    }

    @Override
    public void postInitialize(boolean install, boolean upgrade) {
        installMenuData();
        installPageData();
        installSettingsData();
    }

    public void installMenuData() {
        boolean isNew = false;
        JsonDataVO menu = JsonDataDao.getInstance().getByXid(MA_UI_MENU_XID);
        if (menu == null) {
            menu = new JsonDataVO();
            menu.setXid(MA_UI_MENU_XID);
            menu.setName("UI Menu");
            menu.setPublicData(false);
            menu.setReadRoles(Collections.singleton(getDefaultReadRole()));
            menu.setEditRoles(Collections.singleton(getEditMenuRole()));
            isNew = true;
        }

        if (menu.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("menuItems", nodeFactory.arrayNode());
            menu.setJsonData(object);
        }

        if(isNew) {
            JsonDataDao.getInstance().insert(menu);
        }else {
            JsonDataDao.getInstance().update(menu.getId(), menu);
        }
    }

    public void installPageData() {
        boolean isNew = false;
        JsonDataVO pages = JsonDataDao.getInstance().getByXid(MA_UI_PAGES_XID);
        if (pages == null) {
            pages = new JsonDataVO();
            pages.setXid(MA_UI_PAGES_XID);
            pages.setName("UI Pages");
            pages.setPublicData(false);
            pages.setReadRoles(Collections.singleton(getDefaultReadRole()));
            pages.setEditRoles(Collections.singleton(getEditPagesRole()));
            isNew = true;
        }

        if (pages.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("pages", nodeFactory.arrayNode());
            pages.setJsonData(object);
        }

        if(isNew) {
            JsonDataDao.getInstance().insert(pages);
        }else {
            JsonDataDao.getInstance().update(pages.getId(), pages);
        }
    }

    public void installSettingsData() {
        boolean isNew = false;
        JsonDataVO settings = JsonDataDao.getInstance().getByXid(MA_UI_SETTINGS_XID);
        if (settings == null) {
            settings = new JsonDataVO();
            settings.setXid(MA_UI_SETTINGS_XID);
            settings.setName("UI Settings");
            settings.setPublicData(true);
            settings.setReadRoles(Collections.singleton(getDefaultReadRole()));
            settings.setEditRoles(Collections.singleton(getEditSettingsRole()));
            isNew = true;
        }

        if (settings.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            settings.setJsonData(object);
        }

        if(isNew) {
            JsonDataDao.getInstance().insert(settings);
        }else {
            JsonDataDao.getInstance().update(settings.getId(), settings);
        }
    }

    public Role getDefaultReadRole() {
        RoleDao dao = RoleDao.getInstance();
        RoleVO uiDefaultReadRole = dao.getByXid(MA_UI_DEFAULT_READ_PERMISSION);
        if(uiDefaultReadRole == null) {
            uiDefaultReadRole = new RoleVO(Common.NEW_ID, MA_UI_DEFAULT_READ_PERMISSION,
                    new TranslatableMessage("ui.permissions.defaultReadRole").translate(Common.getTranslations()));
            dao.insert(uiDefaultReadRole);
        }
        return uiDefaultReadRole.getRole();
    }

    public Role getEditMenuRole() {
        RoleDao dao = RoleDao.getInstance();
        RoleVO uiEditMenuRole = dao.getByXid(MA_UI_EDIT_MENUS_PERMISSION);
        if(uiEditMenuRole == null) {
            uiEditMenuRole = new RoleVO(Common.NEW_ID, MA_UI_EDIT_MENUS_PERMISSION,
                    new TranslatableMessage("ui.permissions.editMenuRole").translate(Common.getTranslations()));
            dao.insert(uiEditMenuRole);
        }
        return uiEditMenuRole.getRole();
    }

    public Role getEditPagesRole() {
        RoleDao dao = RoleDao.getInstance();
        RoleVO role = dao.getByXid(MA_UI_EDIT_PAGES_PERMISSION);
        if(role == null) {
            role = new RoleVO(Common.NEW_ID, MA_UI_EDIT_PAGES_PERMISSION,
                    new TranslatableMessage("ui.permissions.editPagesRole").translate(Common.getTranslations()));
            dao.insert(role);
        }
        return role.getRole();
    }

    public Role getEditSettingsRole() {
        RoleDao dao = RoleDao.getInstance();
        RoleVO role = dao.getByXid(MA_UI_EDIT_SETTINGS_PERMISSION);
        if(role == null) {
            role = new RoleVO(Common.NEW_ID, MA_UI_EDIT_SETTINGS_PERMISSION,
                    new TranslatableMessage("ui.permissions.editSettingsRole").translate(Common.getTranslations()));
            dao.insert(role);
        }
        return role.getRole();
    }
}
