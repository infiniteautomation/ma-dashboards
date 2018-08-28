/*
 * Copyright (C) 2018 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui.rest;

import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.infiniteautomation.mango.rest.v2.model.user.UserModel;
import com.infiniteautomation.ui.UILifecycle;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.ICoreLicense;
import com.serotonin.m2m2.db.dao.JsonDataDao;
import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.vo.User;
import com.serotonin.m2m2.web.mvc.rest.v1.ModulesRestController;
import com.serotonin.m2m2.web.mvc.rest.v1.TranslationsController;
import com.serotonin.m2m2.web.mvc.rest.v1.model.jsondata.JsonDataModel;
import com.serotonin.m2m2.web.mvc.rest.v1.model.modules.AngularJSModuleDefinitionGroupModel;
import com.serotonin.provider.Providers;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

/**
 * Returns a conglomeration of data for use in the UI module AngularJS application bootstrap process.
 *
 * @author Jared Wiltshire
 */
@Api(value="UI application bootstrap")
@RestController
@RequestMapping("/v2/ui-bootstrap")
public class BootstrapController {

    private static final String[] PUBLIC_TRANSLATIONS = new String[] {"login", "header"};
    private static final String[] PRIVATE_TRANSLATIONS = new String[] {"ui", "common", "pointEdit", "rest", "footer"};

    private final JsonDataDao jsonDataDao;
    private final SystemSettingsDao systemSettingsDao;

    @Autowired
    public BootstrapController(JsonDataDao jsonDataDao) {
        this.jsonDataDao = jsonDataDao;
        this.systemSettingsDao = SystemSettingsDao.instance;
    }

    @ApiOperation(value = "Get the data needed before logging in")
    @RequestMapping(method = RequestMethod.GET, path = "/pre-login")
    public PreLoginData preLogin(@AuthenticationPrincipal User user) {
        PreLoginData data = new PreLoginData();

        data.setAngularJsModules(ModulesRestController.getAngularJSModules());
        data.setSettings(new JsonDataModel(this.jsonDataDao.getByXid(UILifecycle.MA_UI_SETTINGS_XID)));
        data.setTimezone(TimeZone.getDefault());
        data.setLocale(Common.getLocale());
        data.setLoadedTranslations(PUBLIC_TRANSLATIONS);
        data.setTranslations(TranslationsController.getTranslationMap(PUBLIC_TRANSLATIONS, Common.getLocale()));
        data.setLastUpgradeTime(Common.getLastUpgradeTime());

        if (user != null) {
            data.setCurrentUser(new UserModel(user));
        }

        return data;
    }

    @ApiOperation(value = "Get the data needed after logging in")
    @RequestMapping(method = RequestMethod.GET, path = "/post-login")
    @PreAuthorize("isAuthenticated()")
    public PostLoginData postLogin() {
        PostLoginData data = new PostLoginData();

        data.setInstanceDescription(systemSettingsDao.getValue(SystemSettingsDao.INSTANCE_DESCRIPTION));
        data.setGuid(Providers.get(ICoreLicense.class).getGuid());
        data.setCoreVersion(Common.getVersion().toString());
        data.setMenu(new JsonDataModel(this.jsonDataDao.getByXid(UILifecycle.MA_UI_MENU_XID)));
        data.setPages(new JsonDataModel(this.jsonDataDao.getByXid(UILifecycle.MA_UI_PAGES_XID)));
        data.setLoadedTranslations(PRIVATE_TRANSLATIONS);
        data.setTranslations(TranslationsController.getTranslationMap(PRIVATE_TRANSLATIONS, Common.getLocale()));

        return data;
    }

    public static class PreLoginData {
        private AngularJSModuleDefinitionGroupModel angularJsModules;
        private JsonDataModel settings;
        private TimeZone timezone;
        private Locale locale;
        private String[] loadedTranslations;
        private Map<String, ?> translations;
        private int lastUpgradeTime;
        private UserModel currentUser;

        public Map<String, ?> getTranslations() {
            return translations;
        }
        public void setTranslations(Map<String, ?> translations) {
            this.translations = translations;
        }
        public AngularJSModuleDefinitionGroupModel getAngularJsModules() {
            return angularJsModules;
        }
        public void setAngularJsModules(AngularJSModuleDefinitionGroupModel angularJsModules) {
            this.angularJsModules = angularJsModules;
        }
        public TimeZone getTimezone() {
            return timezone;
        }
        public void setTimezone(TimeZone timezone) {
            this.timezone = timezone;
        }
        public Locale getLocale() {
            return locale;
        }
        public void setLocale(Locale locale) {
            this.locale = locale;
        }
        public int getLastUpgradeTime() {
            return lastUpgradeTime;
        }
        public void setLastUpgradeTime(int lastUpgradeTime) {
            this.lastUpgradeTime = lastUpgradeTime;
        }
        public UserModel getCurrentUser() {
            return currentUser;
        }
        public void setCurrentUser(UserModel currentUser) {
            this.currentUser = currentUser;
        }
        public String[] getLoadedTranslations() {
            return loadedTranslations;
        }
        public void setLoadedTranslations(String[] loadedTranslations) {
            this.loadedTranslations = loadedTranslations;
        }
        public JsonDataModel getSettings() {
            return settings;
        }
        public void setSettings(JsonDataModel settings) {
            this.settings = settings;
        }
    }

    public static class PostLoginData {
        private String instanceDescription;
        private String guid;
        private String coreVersion;
        private JsonDataModel menu;
        private JsonDataModel pages;
        private String[] loadedTranslations;
        private Map<String, ?> translations;

        public String getInstanceDescription() {
            return instanceDescription;
        }
        public void setInstanceDescription(String instanceDescription) {
            this.instanceDescription = instanceDescription;
        }
        public String getGuid() {
            return guid;
        }
        public void setGuid(String guid) {
            this.guid = guid;
        }
        public JsonDataModel getMenu() {
            return menu;
        }
        public void setMenu(JsonDataModel menu) {
            this.menu = menu;
        }
        public JsonDataModel getPages() {
            return pages;
        }
        public void setPages(JsonDataModel pages) {
            this.pages = pages;
        }
        public String[] getLoadedTranslations() {
            return loadedTranslations;
        }
        public void setLoadedTranslations(String[] loadedTranslations) {
            this.loadedTranslations = loadedTranslations;
        }
        public Map<String, ?> getTranslations() {
            return translations;
        }
        public void setTranslations(Map<String, ?> translations) {
            this.translations = translations;
        }
        public String getCoreVersion() {
            return coreVersion;
        }
        public void setCoreVersion(String coreVersion) {
            this.coreVersion = coreVersion;
        }

    }
}
