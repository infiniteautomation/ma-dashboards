/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.module.DefaultPagesDefinition;

/**
 * Class that will allow overidding the default login page if the system setting is set to a valid string
 * @author Terry Packer
 *
 */
public class DefaultPagesDef extends DefaultPagesDefinition {
    
	@Override
    public String getLoginPageUri(HttpServletRequest request, HttpServletResponse response) {
    	
		String loginPage = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE, null);
		
		if(!StringUtils.isEmpty(loginPage)){
			return loginPage;
		}else{
			return null;
		}
    }
}
