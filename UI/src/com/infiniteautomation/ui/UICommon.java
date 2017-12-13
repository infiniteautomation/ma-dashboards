/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui;

/**
 * @author Jared Wiltshire
 */
public class UICommon {
	public static final String UI_LOGIN_PAGE = "ui.login.page";
    public static final String UI_PASSWORD_RESET_PAGE = "ui.login.passwordReset";
	public static final String UI_FIRST_USER_LOGIN_PAGE = "ui.login.userFirstLogin.page";
	public static final String UI_LOGGED_IN_PAGE = "ui.login.loggedIn.page";
    public static final String UI_LOGGED_IN_PAGE_PRE_HOME = "ui.login.loggedInPreHome.page";
	public static final String UI_UNAUTHORIZED_PAGE = "ui.unauthorized.page";
	public static final String UI_NOT_FOUND_PAGE = "ui.notFound.page";
	public static final String UI_ERROR_PAGE = "ui.error.page";

	public static final String DEFAULT_UI_LOGIN_PAGE = "/ui/login";
    public static final String DEFAULT_UI_PASSWORD_RESET_PAGE = "/ui/login";
    public static final String DEFAULT_UI_FIRST_USER_LOGIN_PAGE = "/ui/help/getting-started";
    public static final String DEFAULT_UI_LOGGED_IN_PAGE = "/ui/data-point-details/";
    public static final String DEFAULT_UI_LOGGED_IN_PAGE_PRE_HOME = "";
    public static final String DEFAULT_UI_UNAUTHORIZED_PAGE = "/ui/unauthorized";
	public static final String DEFAULT_UI_NOT_FOUND_PAGE = "/ui/not-found";
	public static final String DEFAULT_UI_ERROR_PAGE = "/ui/server-error";
}
