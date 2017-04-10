/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
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

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#getDescriptionKey()
	 */
	@Override
	public String getDescriptionKey() {
		return "ui.settings";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#getSectionJspPath()
	 */
	@Override
	public String getSectionJspPath() {
		return null;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#getDefaultValues()
	 */
	@Override
	public Map<String, Object> getDefaultValues() {
		Map<String, Object> defaults = new HashMap<String, Object>();
		defaults.put(UICommon.UI_FIRST_LOGIN_PAGE, UICommon.DEFAULT_UI_FIRST_LOGIN_PAGE);
		defaults.put(UICommon.UI_FIRST_USER_LOGIN_PAGE, UICommon.DEFAULT_UI_FIRST_USER_LOGIN_PAGE);
		defaults.put(UICommon.UI_LOGGED_IN_PAGE, UICommon.DEFAULT_UI_LOGGED_IN_PAGE);
        defaults.put(UICommon.UI_LOGGED_IN_PAGE_PRE_HOME, UICommon.DEFAULT_UI_LOGGED_IN_PAGE_PRE_HOME);
		defaults.put(UICommon.UI_LOGIN_PAGE, UICommon.DEFAULT_UI_LOGIN_PAGE);
		defaults.put(UICommon.UI_UNAUTHORIZED_PAGE, UICommon.DEFAULT_UI_UNAUTHORIZED_PAGE);
		defaults.put(UICommon.UI_NOT_FOUND_PAGE, UICommon.DEFAULT_UI_NOT_FOUND_PAGE);
		defaults.put(UICommon.UI_ERROR_PAGE, UICommon.DEFAULT_UI_ERROR_PAGE);
		return defaults;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#convertToValueFromCode(java.lang.String, java.lang.String)
	 */
	@Override
	public Integer convertToValueFromCode(String key, String code) {
		return null;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#convertToCodeFromValue(java.lang.String, java.lang.Integer)
	 */
	@Override
	public String convertToCodeFromValue(String key, Integer value) {
		return null;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#validateSettings(java.util.Map, com.serotonin.m2m2.i18n.ProcessResult)
	 */
	@Override
	public void validateSettings(Map<String, Object> settings, ProcessResult response) {
		// TODO Not Sure How to Validate These?
	}

}
