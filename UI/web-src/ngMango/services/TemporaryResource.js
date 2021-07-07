/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * Old temporary resource service, use maTemporaryRestResource instead.
 * This service is used for Haystack history import and SNMP walk. 
 */

temporaryResourceFactory.$inject = ['$q', '$http', '$timeout'];
function temporaryResourceFactory($q, $http, $timeout) {

    function TemporaryResource(response, readTimeout) {
        this.url = response.headers('Location');
        this.data = response.data;
        this.defered = $q.defer();
        this.errorCount = 0;
        this.readTimeout = readTimeout;
    }
    
    TemporaryResource.prototype.refresh = function() {
        return $http({
            method: 'GET',
            url: this.url,
            timeout: this.readTimeout
        }).then(function(response) {
            this.data = response.data;

            if (this.data.finished) {
                this.defered.resolve(this.data);
            } else {
                this.defered.notify(this.data);
            }

            return this.data;
        }.bind(this), function(error) {
            //this.defered.reject(error);
            this.errorCount++;
            return $q.reject(error);
        }.bind(this));
    };
    
    TemporaryResource.prototype.cancel = function() {
        if (this.timeoutPromise) {
            $timeout.cancel(this.timeoutPromise);
        }
        
        return $http({
            method: 'DELETE',
            url: this.url
        }).then(function(response) {
            this.data = response.data;
            this.defered.resolve(this.data);
            return this.data;
        }.bind(this), function(error) {
            this.defered.reject(error);
            return $q.reject(error);
        }.bind(this));
    };
    
    TemporaryResource.prototype.refreshUntilFinished = function(timeout) {
        if (!isFinite(timeout) || timeout < 0) timeout = 1000;

        if (this.data.finished) {
            this.defered.resolve(this.data);
            return this.defered.promise;
        }

        refreshTimeout.call(this, timeout);
        
        // schedule a notify of the initial data to happen after we return the promise
        // if we trigger a notify before the promise has a progressCallback attached
        // if will never be notified
        $timeout(function() {
            this.defered.notify(this.data);
        }.bind(this));
        
        return this.defered.promise;
    };
    
    function refreshTimeout(timeout) {
        // jshint validthis:true
        this.timeoutPromise = $timeout(function() {
            this.refresh().then(function(data) {
                if (!data.finished) {
                    refreshTimeout.call(this, timeout);
                }
            }.bind(this), function(error) {
                if (this.errorCount >= 3) {
                    console.log(error);
                    this.defered.reject(error);
                } else {
                    refreshTimeout.call(this, timeout);
                }
            }.bind(this));
        }.bind(this), timeout);
    }

    return TemporaryResource;
}

export default temporaryResourceFactory;


