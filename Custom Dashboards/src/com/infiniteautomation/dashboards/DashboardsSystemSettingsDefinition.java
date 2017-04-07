/**
 * Copyright (C) 2015 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards;

import java.util.HashMap;
import java.util.Map;

import com.serotonin.m2m2.i18n.ProcessResult;
import com.serotonin.m2m2.module.SystemSettingsDefinition;

/**
 * @author Terry Packer
 *
 */
public class DashboardsSystemSettingsDefinition extends SystemSettingsDefinition{

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#getDescriptionKey()
	 */
	@Override
	public String getDescriptionKey() {
		return "dashboards.settings";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#getSectionJspPath()
	 */
	@Override
	public String getSectionJspPath() {
		return "web/settings.jsp";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.SystemSettingsDefinition#getDefaultValues()
	 */
	@Override
	public Map<String, Object> getDefaultValues() {
		Map<String, Object> defaults = new HashMap<String, Object>();
		defaults.put(DashboardsCommon.DASHBOARDS_ICON_DESTINATION, DashboardsCommon.DEFAULT_DASHBOARDS_ICON_DESTINATION);
		defaults.put(DashboardsCommon.DASHBOARDS_ICON_LOCATION, DashboardsCommon.DEFAULT_DASHBOARDS_ICON_LOCATION);
		defaults.put(DashboardsCommon.DASHBOARDS_LOGIN_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_LOGIN_PAGE);
		defaults.put(DashboardsCommon.DASHBOARDS_PRIVATE_FILES_LOCATION, DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_FILES_LOCATION);
		defaults.put(DashboardsCommon.DASHBOARDS_PRIVATE_URL_PREFIX, DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_URL_PREFIX);
		defaults.put(DashboardsCommon.DASHBOARDS_PUBLIC_FILES_LOCATION, DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_FILES_LOCATION);
		defaults.put(DashboardsCommon.DASHBOARDS_PUBLIC_URL_PREFIX, DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_URL_PREFIX);
		
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