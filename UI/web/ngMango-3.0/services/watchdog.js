    /**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.mangoWatchdog
*
* @description
* The mangoWatchdog service checks for connectivity to the Mango API and checks if a user is logged in. It does this by
* periodically pinging an API endpoint.
* 
* The watchdog service broadcasts an event named 'maWatchdog' on the root scope which provides information about
* the current status of Mango.
* 
* The watchdog service check interval is set by defining the 'MA_WATCHDOG_TIMEOUT' constant and when Mango is down
* the service will try and reconnect every 'MA_RECONNECT_DELAY' milliseconds.
* 
* - <a ui-sref="ui.examples.utilities.watchdog">View Demo</a>
*/

/**
* @ngdoc event
* @name mangoWatchdog#mangoWatchdog
* @eventType broadcast on root scope
* @eventOf ngMangoServices.mangoWatchdog
*
* @description
* Broadcast periodically, indicates the current status of Mango.
* 
* @param {object} angularEvent Synthetic event object
* @param {object} current mango status
* @param {object} previous mango status
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.mangoWatchdog
* @name enable
*
* @description
* Enables the watchdog service.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.mangoWatchdog
* @name disable
*
* @description
* Disables the watchdog service.
*
*/

mangoWatchdog.$inject = ['MA_WATCHDOG_TIMEOUT', 'MA_RECONNECT_DELAY', '$rootScope', '$http', '$interval', 'maUser'];
function mangoWatchdog(mangoWatchdogTimeout, mangoReconnectDelay, $rootScope, $http, $interval, User) {

    var API_DOWN = 'API_DOWN';
    var STARTING_UP = 'STARTING_UP';
    var API_UP = 'API_UP';
    var API_ERROR = 'API_ERROR';
    var LOGGED_IN = 'LOGGED_IN';

	function MangoWatchdog(options) {
		this.enabled = true;
		angular.extend(this, options);
		
		// assume good state until proved otherwise
		this.loggedIn = true;
		this.apiUp = true;
		
		if (this.timeout <= 0)
			this.enabled = false;
		
		if (this.enabled)
		    this.setInterval(this.timeout);
	}

	MangoWatchdog.prototype.doPing = function() {
	    $http({
            method: 'GET',
            url: '/rest/v1/users/current',
            timeout: this.interval / 2
        }).then(function(response) {
            return {
                status: LOGGED_IN,
                user: response.data
            };
        }, function(response) {
            var startupState = response.headers('Mango-Startup-State');
            var startupProgress = response.headers('Mango-Startup-Progress');
            
            if (response.status < 0) {
                return {status: API_DOWN};
            } else if (response.status === 401) {
                return {status: API_UP};
            } else if (response.status === 503 && startupState) {
                return {
                    status: STARTING_UP,
                    info: {
                        startupState: startupState,
                        startupProgress: startupProgress
                    }
                };
            } else {
                return {status: API_ERROR, info:{responseStatus: response.status}};
            }
        }).then(this.setStatus.bind(this));
    };
    
    MangoWatchdog.prototype.setStatus = function setStatus(pingResult) {
        var previous = {
            status: this.status || (User.current ? 'LOGGED_IN' : 'API_UP'),
            apiUp: this.apiUp,
            loggedIn: this.loggedIn,
            info: this.info,
            user: User.current
        };
        switch(pingResult.status) {
        case STARTING_UP:
        case API_ERROR:
        case API_DOWN:
            User.current = null;
            
            // we may still be logged in (aka session valid) but cannot prove it
            this.loggedIn = false;
            this.apiUp = false;
            // setup a faster check while API is down
            if (this.interval !== this.reconnectDelay) {
                this.setInterval(this.reconnectDelay);
            }
            break;
        case API_UP:
            User.current = null;
            
            this.loggedIn = false;
            this.apiUp = true;
            // consider API up but not logged in as a failure but stop the faster retry
            if (this.interval !== this.timeout) {
                this.setInterval(this.timeout);
            }
            break;
        case LOGGED_IN:
            if (pingResult.user && !angular.equals(User.current, pingResult.user)) {
                var user = pingResult.user;
                if (!(user instanceof User)) {
                    user = angular.extend(new User(), pingResult.user);
                }
                User.current = user;
            }
            
            this.loggedIn = true;
            this.apiUp = true;
            // stop the faster retry
            if (this.interval !== this.timeout) {
                this.setInterval(this.timeout);
            }
            break;
        }

        this.status = pingResult.status;
        this.info = pingResult.info;
        
        var current = {
            status: this.status,
            apiUp: this.apiUp,
            loggedIn: this.loggedIn,
            info: this.info,
            user: User.current,
            wasLogout: pingResult.wasLogout
        };
        
        $rootScope.$broadcast('maWatchdog', current, previous);
    };
    
    MangoWatchdog.prototype.setInterval = function(interval) {
        if (angular.isUndefined(interval)) {
            interval = this.timeout;
        }
        if (this.timer) {
            $interval.cancel(this.timer);
        }
        this.interval = interval;
        this.timer = $interval(this.doPing.bind(this), interval);
    };
	
	MangoWatchdog.prototype.enable = function() {
	    if (this.enabled) return;
	    this.setInterval(this.timeout);
		this.enabled = true;
	};

	MangoWatchdog.prototype.disable = function() {
	    if (this.timer) {
	        $interval.cancel(this.timer);
	    }
		this.enabled = false;
	};

	return new MangoWatchdog({timeout: mangoWatchdogTimeout, reconnectDelay: mangoReconnectDelay});
}

return mangoWatchdog;

}); // define
