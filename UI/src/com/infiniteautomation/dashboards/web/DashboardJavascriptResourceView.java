/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.View;

/**
 * @author tpacker
 *
 */
public class DashboardJavascriptResourceView implements View {
	
    private final String content;

    public DashboardJavascriptResourceView(String content) {
        this.content = content;
    }

    @Override
    public String getContentType() {
        return "application/javascript";
    }

    @Override
    public void render(@SuppressWarnings("rawtypes") Map model, HttpServletRequest request,
            HttpServletResponse response) throws Exception {
    	response.setContentType(getContentType());
        response.getWriter().write(content);
    }
}