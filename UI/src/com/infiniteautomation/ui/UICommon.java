/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */
package com.infiniteautomation.ui;

/**
 * @author Jared Wiltshire
 */
public class UICommon {
    private UICommon() {}

    public static final String UI_LOGIN_PAGE = "ui.login.page";
    public static final String UI_LOGIN_ERROR_PAGE = "ui.loginError.page";
    public static final String UI_LOGOUT_SUCCESS_PAGE = "ui.logoutSuccess.page";
    public static final String UI_PASSWORD_RESET_PAGE = "ui.login.passwordReset";
    public static final String UI_FIRST_USER_LOGIN_PAGE = "ui.login.userFirstLogin.page";
    public static final String UI_LOGGED_IN_PAGE = "ui.login.loggedIn.page";
    public static final String UI_LOGGED_IN_PAGE_PRE_HOME = "ui.login.loggedInPreHome.page";
    public static final String UI_UNAUTHORIZED_PAGE = "ui.unauthorized.page";
    public static final String UI_NOT_FOUND_PAGE = "ui.notFound.page";
    public static final String UI_ERROR_PAGE = "ui.error.page";
    public static final String UI_EMAIL_VERIFICATION_PAGE = "ui.emailVerification.page";

    public static final String DEFAULT_UI_LOGIN_PAGE = "/ui/login";
    public static final String DEFAULT_UI_LOGIN_ERROR_PAGE = "/ui/login";
    public static final String DEFAULT_UI_LOGOUT_SUCCESS_PAGE = "/ui/login";
    public static final String DEFAULT_UI_PASSWORD_RESET_PAGE = "/ui/change-password";
    public static final String DEFAULT_UI_FIRST_USER_LOGIN_PAGE = "/ui/help/getting-started";
    public static final String DEFAULT_UI_LOGGED_IN_PAGE = "/ui/data-point-details/";
    public static final String DEFAULT_UI_LOGGED_IN_PAGE_PRE_HOME = "";
    public static final String DEFAULT_UI_UNAUTHORIZED_PAGE = "/ui/unauthorized";
    public static final String DEFAULT_UI_NOT_FOUND_PAGE = "/ui/not-found";
    public static final String DEFAULT_UI_ERROR_PAGE = "/ui/server-error";
    public static final String DEFAULT_UI_EMAIL_VERIFICATION_PAGE = "/ui/verify-email-token";


    // must match variables defined in web/ui/app.js
    public static final String MA_UI_PAGES_XID = "mangoUI-pages";
    public static final String MA_UI_MENU_XID = "mangoUI-menu";
    public static final String MA_UI_SETTINGS_XID = "mangoUI-settings";
}
