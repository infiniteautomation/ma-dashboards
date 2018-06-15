    /**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

/**
* @ngdoc service
* @name ngMangoServices.maWatchdog
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
* @eventOf ngMangoServices.maWatchdog
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
* @methodOf ngMangoServices.maWatchdog
* @name enable
*
* @description
* Enables the watchdog service.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maWatchdog
* @name disable
*
* @description
* Disables the watchdog service.
*
*/

mangoWatchdog.$inject = ['MA_WATCHDOG_TIMEOUT', 'MA_RECONNECT_DELAY', '$rootScope', '$http', '$interval', 'maUser'];
function mangoWatchdog(mangoWatchdogTimeout, mangoReconnectDelay, $rootScope, $http, $interval, User) {

    const API_DOWN = 'API_DOWN';
    const STARTING_UP = 'STARTING_UP';
    const API_UP = 'API_UP';
    const API_ERROR = 'API_ERROR';
    const LOGGED_IN = 'LOGGED_IN';

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
            const startupState = response.headers('Mango-Startup-State');
            const startupProgress = response.headers('Mango-Startup-Progress');
            
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
        const previous = {
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
            if (this.enabled && this.interval !== this.reconnectDelay) {
                this.setInterval(this.reconnectDelay);
            }
            break;
        case API_UP:
            User.current = null;
            
            this.loggedIn = false;
            this.apiUp = true;
            // consider API up but not logged in as a failure but stop the faster retry
            if (this.enabled && this.interval !== this.timeout) {
                this.setInterval(this.timeout);
            }
            break;
        case LOGGED_IN:
            if (pingResult.user && !angular.equals(User.current, pingResult.user)) {
                let user = pingResult.user;
                if (!(user instanceof User)) {
                    user = angular.extend(new User(), pingResult.user);
                }
                User.current = user;
            }
            
            this.loggedIn = true;
            this.apiUp = true;
            // stop the faster retry
            if (this.enabled && this.interval !== this.timeout) {
                this.setInterval(this.timeout);
            }
            break;
        }

        this.status = pingResult.status;
        this.info = pingResult.info;
        
        const current = {
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
        if (interval === undefined) {
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

export default mangoWatchdog;


