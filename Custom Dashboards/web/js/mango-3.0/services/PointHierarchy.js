/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

/*
 * Provides service for getting point hierarchy
 */
function PointHierarchyFactory($resource) {
    var PointHierarchy = $resource('/rest/v1/hierarchy/by-id/:id', {
    		id: '@id'
    	}, {
    	getRoot: {
    	    method: 'GET',
            url: '/rest/v1/hierarchy/full',
            isArray: false,
            withCredentials: true,
            cache: true
    	},
        byPath: {
            method: 'GET',
            url: '/rest/v1/hierarchy/by-path/:path',
            isArray: false,
            withCredentials: true,
            cache: true
        },
        byName: {
            method: 'GET',
            url: '/rest/v1/hierarchy/by-name/:name',
            isArray: false,
            withCredentials: true,
            cache: true
        }
    });
    
    return PointHierarchy;
}

PointHierarchyFactory.$inject = ['$resource'];
return PointHierarchyFactory;

}); // define
