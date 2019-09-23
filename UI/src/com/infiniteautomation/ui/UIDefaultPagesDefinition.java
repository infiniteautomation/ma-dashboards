/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.module.DefaultPagesDefinition;
import com.serotonin.m2m2.vo.User;

/**
 * Class that will allow overidding the default login page if the system setting is set to a valid string
 * @author Terry Packer
 */
public class UIDefaultPagesDefinition extends DefaultPagesDefinition {

    @Override
    public String getLoginPageUri(HttpServletRequest request, HttpServletResponse response) {

        String loginPage = SystemSettingsDao.instance.getValue(UICommon.UI_LOGIN_PAGE);

        if(!StringUtils.isEmpty(loginPage)){
            return loginPage;
        }else{
            return null;
        }
    }

    @Override
    public String getPasswordResetPageUri() {
        String passwordResetPage = SystemSettingsDao.instance.getValue(UICommon.UI_PASSWORD_RESET_PAGE);

        if(!StringUtils.isEmpty(passwordResetPage)){
            return passwordResetPage;
        }else{
            return null;
        }
    }

    @Override
    public String getFirstLoginPageUri(HttpServletRequest request, HttpServletResponse response) {
        return "/ui/agree-to-license";
    }

    @Override
    public String getLoggedInPageUri(HttpServletRequest request, HttpServletResponse response, User user) {
        String page = SystemSettingsDao.instance.getValue(UICommon.UI_LOGGED_IN_PAGE);

        if(!StringUtils.isEmpty(page)){
            return page;
        }else{
            return null;
        }
    }

    @Override
    public String getFirstUserLoginPageUri(HttpServletRequest request, HttpServletResponse response, User user) {
        String page = SystemSettingsDao.instance.getValue(UICommon.UI_FIRST_USER_LOGIN_PAGE);

        if(!StringUtils.isEmpty(page)){
            return page;
        }else{
            return null;
        }
    }

    @Override
    public String getLoggedInPageUriPreHome(HttpServletRequest request, HttpServletResponse response, User user) {
        String page = SystemSettingsDao.instance.getValue(UICommon.UI_LOGGED_IN_PAGE_PRE_HOME);

        if(!StringUtils.isEmpty(page)){
            return page;
        }else{
            return null;
        }
    }

    @Override
    public String getUnauthorizedPageUri(HttpServletRequest request, HttpServletResponse response, User user) {
        String page = SystemSettingsDao.instance.getValue(UICommon.UI_UNAUTHORIZED_PAGE);

        if(!StringUtils.isEmpty(page)){
            return page;
        }else{
            return null;
        }
    }

    @Override
    public String getNotFoundPageUri(HttpServletRequest request, HttpServletResponse response) {
        String page = SystemSettingsDao.instance.getValue(UICommon.UI_NOT_FOUND_PAGE);

        if(!StringUtils.isEmpty(page)){
            String requested = request.getRequestURI();
            return UriComponentsBuilder.fromPath(page).queryParam("path", requested).toUriString();
        }else{
            return null;
        }
    }

    @Override
    public String getErrorPageUri(HttpServletRequest request, HttpServletResponse response) {
        String page = SystemSettingsDao.instance.getValue(UICommon.UI_ERROR_PAGE);

        if(!StringUtils.isEmpty(page)){
            return page;
        }else{
            return null;
        }

    }

    @Override
    public String getStartupPageUri(HttpServletRequest request, HttpServletResponse response) {
        return null; //TODO Configure this as a hard URL when ready.  This cannot get info from the DB since the DB will not be ready yet
    }

    @Override
    public String getEmailVerificationPageUri() {
        String uri = SystemSettingsDao.instance.getValue(UICommon.UI_EMAIL_VERIFICATION_PAGE);

        if (uri != null && !uri.isEmpty()) {
            return uri;
        }

        return null;
    }
}
