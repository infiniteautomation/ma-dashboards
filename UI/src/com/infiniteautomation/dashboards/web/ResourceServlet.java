/**
 * Copyright (C) 2015 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.MediaType;

import org.apache.commons.io.FileUtils;
import org.eclipse.jetty.util.resource.Resource;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.web.OverridingFileResource;

/**
 * @author Terry Packer
 *
 */
public class ResourceServlet extends HttpServlet {
    
	private static final long serialVersionUID = 1L;
	
	/* Useful Mime Types */
    private static final String TEXT_JAVASCRIPT = "text/javascript";
    private static final String TEXT_CSS = "text/css";
    private static final String IMAGE_PNG = "image/png";
    
	/**
	 * The base url to use as a reference, part of the UriPattern without the wildcards 
	 */
    private String baseUrl;
    
    /**
     * Base path from Mango Web folder to resources to serve
     */
    private String resourceBasePath;
    
    /**
     * 
     * This servlet will split incoming requests and
     * serve up the resources from a mapped directory.
     * 
     * When using: 
     * 
     * baseUrl = mango-api-docs
     * and 
     * resourceBase = /modules/dashboards/web/mango-docs/
     * 
     * 
     * mango-api-docs/test.shtm will map to the file at
     * 
     *  /modules/dashboards/web/mango-docs/test.shtm
     * 
     * 
     * @param baseUrl - Mapped part of URL 
     * @param resourceBase - base of the resources to serve
     */
    public ResourceServlet(String baseUrl, String resourceBase){
    	this.baseUrl = baseUrl;
    	this.resourceBasePath = resourceBase;
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//Here we would map to the pages by loading the view
		String contextPath = request.getRequestURI();
		//Load in the dashboard
		if(!contextPath.contains(baseUrl)){
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
		}

		//Split path so we can locate our resources
		String[] parts = contextPath.split(baseUrl);
		
		//Use overrides in case we have an option to do that
		String baseFilePath = resourceBasePath + parts[1];
		OverridingFileResource ofr;
        ofr = new OverridingFileResource(Resource.newResource(Common.MA_HOME + "/overrides" + baseFilePath),
                Resource.newResource(Common.MA_HOME + baseFilePath));
        if(ofr.exists()){
			if(baseFilePath.endsWith(".html")||baseFilePath.endsWith(".shtm")||baseFilePath.endsWith(".htm"))
				response.setContentType(MediaType.TEXT_HTML);
			else if(baseFilePath.endsWith(".js"))
				response.setContentType(TEXT_JAVASCRIPT);
			else if(baseFilePath.endsWith(".css"))
				response.setContentType(TEXT_CSS);
			else if(baseFilePath.endsWith(".png"))
				response.setContentType(IMAGE_PNG);
			response.getWriter().write(FileUtils.readFileToString(ofr.getFile()));
			ofr.close();
		}else{
			//Return a 404
			ofr.close();
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
	}
    
    /* (non-Javadoc)
     * @see javax.servlet.http.HttpServlet#getLastModified(javax.servlet.http.HttpServletRequest)
     */
    @Override
    protected long getLastModified(HttpServletRequest request) {
    	
    	String contextPath = request.getRequestURI();
    	
		//Split path so we can locate our resources
		String[] parts = contextPath.split(baseUrl);
		
		//Use overrides in case we have an option to do that
		String baseFilePath = resourceBasePath + parts[1];
		OverridingFileResource ofr = null;
		try{
			ofr = new OverridingFileResource(Resource.newResource(Common.MA_HOME + "/overrides" + baseFilePath),
                Resource.newResource(Common.MA_HOME + baseFilePath));
			return ofr.getFile().lastModified();
		}catch(Exception e){
			return -1L;
		}finally{
			if(ofr != null)
				ofr.close();
		}
    }
}
