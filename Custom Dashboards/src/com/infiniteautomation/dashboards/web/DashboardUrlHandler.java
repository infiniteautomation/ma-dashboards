/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.eclipse.jetty.util.resource.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.View;

import com.serotonin.ShouldNeverHappenException;
import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.web.OverridingFileResource;
import com.serotonin.m2m2.web.mvc.UrlHandler;
import com.serotonin.m2m2.web.mvc.rest.v1.exception.ResourceNotFoundException;

/**
 * @author Terry Packer
 *
 */
public class DashboardUrlHandler implements UrlHandler{
	
	private String dashboardsBasePath;
	private String urlPrefix;
	
	/**
	 * 
	 * @param modulePath - From Lifecycle at runtime
	 * @param fileLocation - Prefix for where files actually are in reference to modulePath
	 * @param urlPrefix - Prefix for url requesting the file
	 */
	public DashboardUrlHandler(String modulePath, String fileLocation, String urlPrefix){
		this.dashboardsBasePath = modulePath + fileLocation;
		this.urlPrefix = urlPrefix;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.web.mvc.UrlHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.util.Map)
	 */
	@Override
	public View handleRequest(HttpServletRequest request,
			HttpServletResponse response, Map<String, Object> model)
			throws Exception {
		
		//Here we would map to the pages by loading the view
		String contextPath = request.getRequestURI();
		//Load in the dashboard
		String[] parts = contextPath.split(urlPrefix);
		
		String baseFilePath = dashboardsBasePath + parts[1];
		OverridingFileResource ofr;
        try {
            ofr = new OverridingFileResource(Resource.newResource(Common.MA_HOME + "/overrides" + baseFilePath),
                    Resource.newResource(Common.MA_HOME + baseFilePath));
            if(ofr.exists()){
    			DashboardView dbv = new DashboardView(FileUtils.readFileToString(ofr.getFile()));
    			ofr.close();
    			return dbv;
    		}else{
    			//Return a 404
    			ofr.close();
    			throw new ResourceNotFoundException(contextPath);
    		}
        }
        catch (IOException e) {
            throw new ShouldNeverHappenException(e);
        }

	}

	
    static class DashboardView implements View {
        private final String content;

        public DashboardView(String content) {
            this.content = content;
        }

        @Override
        public String getContentType() {
            return MediaType.TEXT_HTML_VALUE; //"text/html;charset=UTF-8";
        }

        @Override
        public void render(@SuppressWarnings("rawtypes") Map model, HttpServletRequest request,
                HttpServletResponse response) throws Exception {
        	response.setContentType(getContentType());
            response.getWriter().write(content);
        }
    }
    
    
    static class DashboardJavascriptResourceView implements View {
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
        	//Although this isn't used AFAIK
        	response.setHeader("Content-Type", getContentType());
            response.getWriter().write(content);
        }
    }
}
