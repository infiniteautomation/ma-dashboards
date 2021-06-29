/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */
package com.infiniteautomation.ui;

import java.util.HashMap;
import java.util.Map;

import com.serotonin.m2m2.i18n.ProcessResult;
import com.serotonin.m2m2.module.SystemSettingsDefinition;

/**
 * @author Jared Wiltshire
 */
public class UISystemSettingsDefinition extends SystemSettingsDefinition {

    @Override
    public String getDescriptionKey() {
        return "ui.settings";
    }

    @Override
    public Map<String, Object> getDefaultValues() {
        Map<String, Object> defaults = new HashMap<String, Object>();
        defaults.put(UICommon.UI_FIRST_USER_LOGIN_PAGE, UICommon.DEFAULT_UI_FIRST_USER_LOGIN_PAGE);
        defaults.put(UICommon.UI_PASSWORD_RESET_PAGE, UICommon.DEFAULT_UI_PASSWORD_RESET_PAGE);
        defaults.put(UICommon.UI_LOGGED_IN_PAGE, UICommon.DEFAULT_UI_LOGGED_IN_PAGE);
        defaults.put(UICommon.UI_LOGGED_IN_PAGE_PRE_HOME, UICommon.DEFAULT_UI_LOGGED_IN_PAGE_PRE_HOME);
        defaults.put(UICommon.UI_LOGIN_PAGE, UICommon.DEFAULT_UI_LOGIN_PAGE);
        defaults.put(UICommon.UI_LOGIN_ERROR_PAGE, UICommon.DEFAULT_UI_LOGIN_ERROR_PAGE);
        defaults.put(UICommon.UI_LOGOUT_SUCCESS_PAGE, UICommon.DEFAULT_UI_LOGOUT_SUCCESS_PAGE);
        defaults.put(UICommon.UI_UNAUTHORIZED_PAGE, UICommon.DEFAULT_UI_UNAUTHORIZED_PAGE);
        defaults.put(UICommon.UI_NOT_FOUND_PAGE, UICommon.DEFAULT_UI_NOT_FOUND_PAGE);
        defaults.put(UICommon.UI_ERROR_PAGE, UICommon.DEFAULT_UI_ERROR_PAGE);
        defaults.put(UICommon.UI_EMAIL_VERIFICATION_PAGE, UICommon.DEFAULT_UI_EMAIL_VERIFICATION_PAGE);
        return defaults;
    }

    @Override
    public Integer convertToValueFromCode(String key, String code) {
        return null;
    }

    @Override
    public String convertToCodeFromValue(String key, Integer value) {
        return null;
    }

    @Override
    public void validateSettings(Map<String, Object> settings, ProcessResult response) {
    }

}
