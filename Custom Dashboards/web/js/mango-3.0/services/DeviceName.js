/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

/*
 * Provides service for getting list of device names
 */
function DeviceNameFactory($resource) {
    var DeviceName = $resource('/rest/v1/device-names', {}, {
        query: {
            method: 'GET',
            isArray: true,
            withCredentials: true,
            cache: true
        },
        byDataSourceId: {
        	url: '/rest/v1/device-names/by-data-source-id/:id',
            method: 'GET',
            isArray: true,
            withCredentials: true,
            cache: true
        },
        byDataSourceXid: {
            url: '/rest/v1/device-names/by-data-source-xid/:xid',
            method: 'GET',
            isArray: true,
            withCredentials: true,
            cache: true
        }
    });

    return DeviceName;
}

DeviceNameFactory.$inject = ['$resource'];
return DeviceNameFactory;

}); // define
