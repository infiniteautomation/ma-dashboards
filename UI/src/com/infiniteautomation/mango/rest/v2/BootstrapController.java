/*
 * Copyright (C) 2018 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.mango.rest.v2;

import java.io.IOException;
import java.io.InputStream;
import java.util.TimeZone;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.env.Environment;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.infiniteautomation.mango.rest.v2.TranslationsController.TranslationsModel;
import com.infiniteautomation.mango.rest.v2.model.jsondata.JsonDataModel;
import com.infiniteautomation.mango.rest.v2.model.modules.AngularJSModuleDefinitionGroupModel;
import com.infiniteautomation.mango.rest.v2.model.user.UserModel;
import com.infiniteautomation.mango.spring.MangoRuntimeContextConfiguration;
import com.infiniteautomation.mango.spring.components.PublicUrlService;
import com.infiniteautomation.ui.UILifecycle;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.ICoreLicense;
import com.serotonin.m2m2.db.dao.JsonDataDao;
import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.vo.User;
import com.serotonin.m2m2.vo.json.JsonDataVO;
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
@RequestMapping("/ui-bootstrap")
public class BootstrapController {

    private static final String[] PUBLIC_TRANSLATIONS = new String[] {"login", "header", "users", "validate"};
    private static final String[] PRIVATE_TRANSLATIONS = new String[] {"ui", "common", "pointEdit", "rest", "footer", "dateAndTime"};

    private final JsonDataDao jsonDataDao;
    private final SystemSettingsDao systemSettingsDao;
    private final ObjectMapper objectMapper;
    private final ServletContext servletContext;
    private final PublicUrlService publicUrlService;
    private final Environment env;

    @Autowired
    public BootstrapController(JsonDataDao jsonDataDao, @Qualifier(MangoRuntimeContextConfiguration.REST_OBJECT_MAPPER_NAME) ObjectMapper objectMapper,
            ServletContext servletContext, PublicUrlService publicUrlService, Environment env) {
        this.jsonDataDao = jsonDataDao;
        this.systemSettingsDao = SystemSettingsDao.instance;
        this.objectMapper = objectMapper;
        this.servletContext = servletContext;
        this.publicUrlService = publicUrlService;
        this.env = env;
    }

    private void merge(ObjectNode dest, ObjectNode src) throws IOException {
        ObjectReader updater = objectMapper.readerForUpdating(dest);
        updater.readValue(src);
    }

    @ApiOperation(value = "Get the PWA (Progressive Web App) manifest")
    @RequestMapping(method = RequestMethod.GET, path = "/pwa-manifest")
    public ObjectNode manifest(@AuthenticationPrincipal User user, UriComponentsBuilder builder) throws IOException {

        JsonNodeFactory nodeFactory = objectMapper.getNodeFactory();

        ObjectNode uiSettings;
        try (InputStream in = servletContext.getResourceAsStream("/modules/mangoUI/web/uiSettings.json")) {
            uiSettings = (ObjectNode) objectMapper.readTree(in);
        }

        JsonDataVO uiSettingsVo = this.jsonDataDao.getByXid(UILifecycle.MA_UI_SETTINGS_XID);
        if (uiSettingsVo != null) {
            Object uiSettingsData = uiSettingsVo.getJsonData();
            if (uiSettingsData instanceof ObjectNode) {
                merge(uiSettings, (ObjectNode) uiSettingsData);
            }
        }

        ObjectNode manifest = (ObjectNode) uiSettings.get("pwaManifest");

        if (uiSettings.hasNonNull("pwaAutomaticName")) {
            String mode = uiSettings.get("pwaAutomaticName").textValue();

            String autoName = null;
            String instanceDescription = systemSettingsDao.getValue(SystemSettingsDao.INSTANCE_DESCRIPTION);

            builder = publicUrlService.getUriComponentsBuilder(builder);
            String host = builder.build().getHost();

            if ("AUTO".equals(mode)) {
                if (user == null) {
                    autoName = host;
                } else {
                    autoName = instanceDescription;
                }
            } else if ("INSTANCE_DESCRIPTION".equals(mode)) {
                autoName = instanceDescription;
            } else if ("HOST".equals(mode)) {
                autoName = host;
            }

            if (autoName != null) {
                String prefix = uiSettings.hasNonNull("pwaAutomaticNamePrefix") ? uiSettings.get("pwaAutomaticNamePrefix").asText() : null;

                if (prefix != null && !prefix.isEmpty()) {
                    manifest.set("name", nodeFactory.textNode(prefix + " (" + autoName + ")"));
                } else {
                    manifest.set("name", nodeFactory.textNode(autoName));
                }
            }
        }

        return manifest;
    }

    @ApiOperation(value = "Get the data needed before logging in")
    @RequestMapping(method = RequestMethod.GET, path = "/pre-login")
    public PreLoginData preLogin(@AuthenticationPrincipal User user) {
        PreLoginData data = new PreLoginData();

        boolean devEnabled = env.getProperty("development.enabled", Boolean.class, false);
        data.setAngularJsModules(ModulesRestController.getAngularJSModules(devEnabled));

        JsonDataVO uiSettings = this.jsonDataDao.getByXid(UILifecycle.MA_UI_SETTINGS_XID);
        if (uiSettings != null) {
            data.setUiSettings(new JsonDataModel(uiSettings));
        }

        data.setServerTimezone(TimeZone.getDefault().getID());
        data.setServerLocale(Common.getLocale().toLanguageTag());
        data.setLastUpgradeTime(Common.getLastUpgradeTime());
        data.setPublicRegistrationEnabled(systemSettingsDao.getBooleanValue(SystemSettingsDao.USERS_PUBLIC_REGISTRATION_ENABLED));
        data.setDevlopmentMode(devEnabled);

        if (user != null) {
            data.setUser(new UserModel(user));
            data.setTranslations(TranslationsController.getTranslations(PUBLIC_TRANSLATIONS, user.getLocaleObject()));
        } else {
            data.setTranslations(TranslationsController.getTranslations(PUBLIC_TRANSLATIONS, Common.getLocale()));
        }

        return data;
    }

    @ApiOperation(value = "Get the data needed after logging in")
    @RequestMapping(method = RequestMethod.GET, path = "/post-login")
    @PreAuthorize("isAuthenticated()")
    public PostLoginData postLogin(@AuthenticationPrincipal User user) {
        PostLoginData data = new PostLoginData();

        data.setInstanceDescription(systemSettingsDao.getValue(SystemSettingsDao.INSTANCE_DESCRIPTION));
        data.setGuid(Providers.get(ICoreLicense.class).getGuid());
        data.setCoreVersion(Common.getVersion().toString());

        JsonDataVO menuData = this.jsonDataDao.getByXid(UILifecycle.MA_UI_MENU_XID);
        JsonDataVO pageData = this.jsonDataDao.getByXid(UILifecycle.MA_UI_PAGES_XID);

        if (menuData != null) {
            data.setMenu(new JsonDataModel(menuData));
        }
        if (pageData != null) {
            data.setPages(new JsonDataModel(pageData));
        }

        data.setTranslations(TranslationsController.getTranslations(PRIVATE_TRANSLATIONS, user.getLocaleObject()));

        return data;
    }

    public static class PreLoginData {
        private AngularJSModuleDefinitionGroupModel angularJsModules;
        private JsonDataModel uiSettings;
        private String serverTimezone;
        private String serverLocale;
        private TranslationsModel translations;
        private int lastUpgradeTime;
        private UserModel user;
        private boolean publicRegistrationEnabled;
        private boolean devlopmentMode;

        public TranslationsModel getTranslations() {
            return translations;
        }
        public void setTranslations(TranslationsModel translations) {
            this.translations = translations;
        }
        public AngularJSModuleDefinitionGroupModel getAngularJsModules() {
            return angularJsModules;
        }
        public void setAngularJsModules(AngularJSModuleDefinitionGroupModel angularJsModules) {
            this.angularJsModules = angularJsModules;
        }
        public String getServerTimezone() {
            return serverTimezone;
        }
        public void setServerTimezone(String serverTimezone) {
            this.serverTimezone = serverTimezone;
        }
        public String getServerLocale() {
            return serverLocale;
        }
        public void setServerLocale(String serverLocale) {
            this.serverLocale = serverLocale;
        }
        public int getLastUpgradeTime() {
            return lastUpgradeTime;
        }
        public void setLastUpgradeTime(int lastUpgradeTime) {
            this.lastUpgradeTime = lastUpgradeTime;
        }
        public UserModel getUser() {
            return user;
        }
        public void setUser(UserModel user) {
            this.user = user;
        }
        public JsonDataModel getUiSettings() {
            return uiSettings;
        }
        public void setUiSettings(JsonDataModel uiSettings) {
            this.uiSettings = uiSettings;
        }
        public boolean isPublicRegistrationEnabled() {
            return publicRegistrationEnabled;
        }
        public void setPublicRegistrationEnabled(boolean publicRegistrationEnabled) {
            this.publicRegistrationEnabled = publicRegistrationEnabled;
        }
        public boolean isDevlopmentMode() {
            return devlopmentMode;
        }
        public void setDevlopmentMode(boolean devlopmentMode) {
            this.devlopmentMode = devlopmentMode;
        }
    }

    public static class PostLoginData {
        private String instanceDescription;
        private String guid;
        private String coreVersion;
        private JsonDataModel menu;
        private JsonDataModel pages;
        private TranslationsModel translations;

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
        public TranslationsModel getTranslations() {
            return translations;
        }
        public void setTranslations(TranslationsModel translations) {
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
