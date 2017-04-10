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
import com.serotonin.m2m2.vo.User;

/**
 * Class that will allow overidding the default login page if the system setting is set to a valid string
 * @author Terry Packer
 *
 */
public class DefaultPagesDef extends DefaultPagesDefinition {
    
	@Override
    public String getLoginPageUri(HttpServletRequest request, HttpServletResponse response) {
    	
		String loginPage = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_LOGIN_PAGE);
		
		if(!StringUtils.isEmpty(loginPage)){
			return loginPage;
		}else{
			return null;
		}
    }
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getFirstLoginPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public String getFirstLoginPageUri(HttpServletRequest request, HttpServletResponse response) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_FIRST_LOGIN_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_FIRST_LOGIN_PAGE);
		
		if(!StringUtils.isEmpty(page)){
			return page;
		}else{
			return null;
		}
	}
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getLoggedInPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, com.serotonin.m2m2.vo.User)
	 */
	@Override
	public String getLoggedInPageUri(HttpServletRequest request, HttpServletResponse response, User user) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_LOGGED_IN_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_LOGGED_IN_PAGE);
		
		if(!StringUtils.isEmpty(page)){
			return page;
		}else{
			return null;
		}
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getFirstUserLoginPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, com.serotonin.m2m2.vo.User)
	 */
	@Override
	public String getFirstUserLoginPageUri(HttpServletRequest request, HttpServletResponse response, User user) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_FIRST_USER_LOGIN_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_FIRST_USER_LOGIN_PAGE);
		
		if(!StringUtils.isEmpty(page)){
			return page;
		}else{
			return null;
		}
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getLoggedInPageUriPreHome(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, com.serotonin.m2m2.vo.User)
	 */
	@Override
	public String getLoggedInPageUriPreHome(HttpServletRequest request, HttpServletResponse response, User user) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_LOGGED_IN_PAGE_PRE_HOME, DashboardsCommon.DEFAULT_DASHBOARDS_LOGGED_IN_PAGE_PRE_HOME);
		
		if(!StringUtils.isEmpty(page)){
			return page;
		}else{
			return null;
		}
	}
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getUnauthorizedPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, com.serotonin.m2m2.vo.User)
	 */
	@Override
	public String getUnauthorizedPageUri(HttpServletRequest request, HttpServletResponse response, User user) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_UNAUTHORIZED_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_UNAUTHORIZED_PAGE);
		
		if(!StringUtils.isEmpty(page)){
			return page;
		}else{
			return null;
		}
	}	
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getNotFoundPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public String getNotFoundPageUri(HttpServletRequest request, HttpServletResponse response) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_NOT_FOUND_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_NOT_FOUND_PAGE);
		
		if(!StringUtils.isEmpty(page)){
			String requested = request.getRequestURI();
			return page + "?path=" + requested;
		}else{
			return null;
		}

	}
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getErrorPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public String getErrorPageUri(HttpServletRequest request, HttpServletResponse response) {
		String page = SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_ERROR_PAGE, DashboardsCommon.DEFAULT_DASHBOARDS_ERROR_PAGE);
		
		if(!StringUtils.isEmpty(page)){
			return page;
		}else{
			return null;
		}

	}
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.DefaultPagesDefinition#getStartupPageUri(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public String getStartupPageUri(HttpServletRequest request, HttpServletResponse response) {
		return null; //TODO Configure this as a hard URL when ready.  This cannot get info from the DB since the DB will not be ready yet
	}
	
}



