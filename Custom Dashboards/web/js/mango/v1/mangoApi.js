/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

(function(factory) { // anonymous function
    // Support multiple module loading scenarios
    if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(['jquery'], factory);
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        this.mangoRest = factory(jQuery);
    }
}(function($) { // factory function

/**
 * Make a promise cancellable.
 * 
 * The cancel function should stop the action which the promise represents then
 * reject the deferred
 * 
 * @param promise
 * @param cancel - function to call to cancel the promise
 */
function cancellable(promise, cancel) {
    // assume promise.then has been replaced if cancel exists
    if (!promise.cancel) {
        promise.cancel = cancel;
        replaceThen(promise);
    }
    
    return promise;
}

function replaceThen(promise) {
    var originalThen = promise.then;
    promise.then = function() {
        var newPromise = originalThen.apply(this, arguments);
        newPromise.cancel = this.cancel;
        replaceThen(newPromise);
        return newPromise;
    };
}

/**
 * An extension of $.when that preserves the cancel method and cancels all the promises
 * when any individual promise fails
 * 
 * @param promises - array of promises
 */
function when(promises) {
    var cancelling = false;
    var promise = $.when.apply($, promises);
    
    // assume promise.then has been replaced
    if (!promise.cancel) {
        promise.cancel = function() {
            cancelling = true;
            for (var i in promises) {
                promises[i].cancel();
            }
        };
        
        // triggered when at least one promise has failed, ensure all other promises are cancelled
        promise.fail(function() {
            // prevents cancel from running twice as fail will be triggered when
            // the first promise is cancelled
            if (!cancelling) {
                this.cancel();
            }
        });
        
        replaceThen(promise);
    }
    return promise;
}

function ajaxTemplate(ajaxOptions) {
    ajaxOptions = $.extend({}, {dataType: 'json'}, ajaxOptions);
    var deferred = $.Deferred();
    var ajax = $.ajax(ajaxOptions).done(function() {
        deferred.resolve.apply(deferred, arguments);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        jqXHR.url = this.url;
        var mangoMessage = jqXHR.getResponseHeader("errors");
        deferred.reject(jqXHR, textStatus, errorThrown, mangoMessage);
    });
    
    var promise = deferred.promise();
    cancellable(promise, ajax.abort.bind(ajax));
    
    return promise;
}

function resolvedPromise() {
    var deferred = $.Deferred();
    return deferred.resolve.apply(deferred, arguments).promise();
}

/**
 * 
 * Mango Rest API Object
 */
var mangoRest = {
        /**
         * Login via GET
         * 
         * @param username
         * @param password
         * @param logout - optional, logout existing user
         * @return promise that will be resolved when done
         */
        login: function(username, password, logout) {
            if (logout === undefined)
                logout = true;
            logout = logout ? true : false; // coerce to actual boolean
            var promise = ajaxTemplate({
                type: "GET",
                url : "/rest/v1/login/" + encodeURIComponent(username),
                headers: {
                    password: password,
                    logout: logout
                },
                contentType: "application/json"
            }).then(function(data, status, jqXHR) {
                return resolvedPromise(data);
            });
            
            return promise;
        },
        
        /**
         * Login via PUT
         * 
         * @param username
         * @param password
         * @param done - function(jsonData, defaultUrl) callback with logged In UserModel
         * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
         * @param options - object to pass into done method along with data
         * @return promise that will be resolved when done
         */
        loginPut: function(username, password, done, fail, options) {
            var promise = ajaxTemplate({
                type: "PUT",
                url : "/rest/v1/login/" + encodeURIComponent(username) + "?password=" + encodeURIComponent(password),
                contentType: "application/json"
            }).then(function(data, status, jqXHR) {
                var defaultUrl = jqXHR.getResponseHeader("user-home-uri");
                return resolvedPromise(data, defaultUrl, options);
            });
            
            if (typeof done == 'function') promise.done(done);
            if (typeof fail == 'function') promise.fail(fail);
            
            return promise;
        },
        
        /**
         * Login via POST
         * 
         * @param username
         * @param password
         * @param done - function(jsonData, defaultUrl, options) callback with logged In UserModel
         * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
         * @param options - object to pass into done method along with data
         * @return promise that will be resolved when done
         */
        loginPost: function(username, password, done, fail, options) {
            var promise = ajaxTemplate({
                type: "POST",
                url : "/rest/v1/login/" + encodeURIComponent(username) + "?password=" + encodeURIComponent(password),
                contentType: "application/json"
            }).then(function(data, status, jqXHR) {
                var defaultUrl = jqXHR.getResponseHeader("user-home-uri");
                return resolvedPromise(data, defaultUrl, options);
            });
            
            if (typeof done == 'function') promise.done(done);
            if (typeof fail == 'function') promise.fail(fail);
            
            return promise;
        },
        
        /**
         * Logout via GET
         * 
         * @return promise that will be resolved when done
         */
        logout: function() {
            var promise = ajaxTemplate({
                type: "GET",
                url : "/rest/v1/logout/",
                contentType: "application/json"
            }).then(function(data, status, jqXHR) {
                return resolvedPromise(data);
            });
            
            return promise;
        },
        
        /**
         * Logout via POST
         * 
         * @param username
         * @param done - function(jsonData) callback with logged Out UserModel
         * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
         * @param options - object to pass into done method along with data
         * @return promise that will be resolved when done
         */
        logoutPost: function(username, done, fail, options) {
            var promise = ajaxTemplate({
                type: "POST",
                url : "/rest/v1/logout/" + encodeURIComponent(username),
                contentType: "application/json"
            }).then(function(data, status, jqXHR) {
                return resolvedPromise(data, options);
            });
            
            if (typeof done == 'function') promise.done(done);
            if (typeof fail == 'function') promise.fail(fail);
            
            return promise;
        },
        
        /**
         * Make a request for any JSON data
         * 
         * @param url
         * @param done - function(jsonData) callback
         * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
         * @param options - object to pass into done method along with data
         * @return promise that will be resolved when done
         */
        getJson: function(url, done, fail, options){
            var promise = ajaxTemplate({
                url : url,
                contentType: "application/json"
            }).then(function(data, status, jqXHR) {
                return resolvedPromise(data, options);
            });
            
            if (typeof done == 'function') promise.done(done);
            if (typeof fail == 'function') promise.fail(fail);
            
            return promise;
        },
        
        
        /**
         * Data Point access
         */
        dataPoints: {
            
            /**
             * Get All Data Points 
             * 
             * @param done - function(jsonData) callback with array of points as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @param options - object to pass into done method along with data
             * @return promise that will be resolved when done
             */
            getAll: function(done, fail, options) {
                var promise = ajaxTemplate({
                    url: "/rest/v1/data-points"
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * Get One Data Point
             * 
             * @param xid
             * @param done - function(jsonData, options) callback one point as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @param options - object to pass into done method along with data
             * @return promise that will be resolved when done
             */
            get: function(xid, done, fail, options) {
                var promise = ajaxTemplate({
                    url: "/rest/v1/data-points/" + encodeURIComponent(xid)
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },

            /**
             * Save Data Point
             * 
             * @param dataPoint - point to save
             * @param done - function(jsonData) callback with saved point as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise that will be resolved when done
             */
            put: function(dataPoint, done, fail, options) {
                var promise = ajaxTemplate({
                    type: "PUT",
                    url : "/rest/v1/data-points/" + encodeURIComponent(dataPoint.xid),
                    contentType: "application/json",
                    data: JSON.stringify(dataPoint)
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            /**
             * Save Data Point
             * 
             * @param dataPoint - point to save
             * @param done - function(jsonData) callback with saved point as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise that will be resolved when done
             */
            putCSV: function(xid, csvData, done, fail, options) {
                var promise = ajaxTemplate({
                    type: "PUT",
                    url : "/rest/v1/data-points/" + encodeURIComponent(xid),
                    contentType: "text/csv",
                    data: csvData
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            }
        },
    
        /**
         * Historical Point Values Access
         */
        pointValues: {
            
            /**
             * Create a new point value object
             */
            createNew: function(){
                //TODO setup new API Controller to create New objects
                
                return {
                    annotation: null,
                    dataType: null, //['ALPHANUMERIC', 'BINARY', 'MULTISTATE', 'NUMERIC']
                    value: null,
                    timestamp: null};
                
            },
        
            /**
             * Get values based on date ranges with optional rollup
             * 
             * @param xid - for point desired
             * @param from - date from formatted using this.formatLocalDate
             * @param to - date to formatted using this.formatLocalDate
             * @param rollup - null or ['AVERAGE', 'MAXIMUM', 'MINIMUM', 'SUM', 'FIRST', 'LAST', 'COUNT']
             * @param timePeriodType - null or ['MILLISECONS', 'SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS']
             * @param timePeriods - null or integer number of periods to use
             * @param done - function(jsonData, xid, options) callback with data in time order, oldest first
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @param options - object to pass into done method along with data
             * @return promise that will be resolved when done
             */
            get: function(xid, from, to, rollup, timePeriodType, timePeriods, done, fail, options){
                //Create the parameter list
                var params = "";
                if(rollup)
                    params += "&rollup=" + rollup;
                if(timePeriodType)
                    params += "&timePeriodType=" + timePeriodType;
                if(timePeriods)
                    params += "&timePeriods=" + timePeriods;
                var url = "/rest/v1/point-values/" + encodeURIComponent(xid) + "?from=" + from + "&to=" + to + params;
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, xid, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            getFirstLast: function(xid, from, to) {
                var url = "/rest/v1/point-values/" + encodeURIComponent(xid) + "/firstLast?from=" +
                    from + "&to=" + to;
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return data;
                });
                
                return promise;
            },

            /**
             * Get the latest limit number of values
             * 
             * @param xid - for point desired
             * @param limit - number of results
             * @param done - function(jsonData, xid, options) callback with data in reverse order, most recent first the going backwards
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise after if (typeof done == 'function') done()
             */
            getLatest: function(xid, limit, done, fail, options){
                var url = "/rest/v1/point-values/" + encodeURIComponent(xid) + "/latest?limit=" + limit;
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, xid, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * Get the point statistics
             * 
             * @param xid - for point desired
             * @param from - date from formatted using this.formatLocalDate
             * @param to - date to formatted using this.formatLocalDate
             * @param done - function(jsonData,xid, options) callback with statistics object as data
             * 
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @param options - object to pass into done method along with data
             * @return promise that will be resolved when done
             */
            getStatistics: function(xid, from, to, done, fail, options) {
                var url = "/rest/v1/point-values/" + encodeURIComponent(xid) + "/statistics?from=" +
                    from + "&to=" + to;
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, xid, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * 
             * Save Point Value
             * @param xid - for data point to save to
             * @param value - PointValueTimeModel Number, boolean or String
             * @param done - function(jsonData, options) callback with saved point as data
             * 
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @param options - object to pass into done method along with data
             * @return promise when done
             */
            put: function(xid, pointValue, done, fail, options){
                var url = "/rest/v1/point-values/" + encodeURIComponent(xid);
                var data = JSON.stringify(pointValue);
                
                var promise = ajaxTemplate({
                    type: "PUT",
                    url: url,
                    contentType: "application/json",
                    data: data
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, xid, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * Register for point value events
             * @param xid - xid of data point
             * @param events - ['INITIALIZE', 'UPDATE', 'CHANGE', 'SET', 'BACKDATE', 'TERMINATE']
             * @param onMessage(message) - method to call on message received evt.data
             * @param onError(message) - method to call on error
             * @param onOpen - method to call on Socket 
             * @param onClose - method to call on Close
             * @returns webSocket
             */
            registerForEvents: function(xid, events, onMessage, onError, onOpen, onClose){
                if ('WebSocket' in window){
                    var socket = new WebSocket('ws://' + document.location.host + '/rest/v1/websocket/point-value');
                    socket.onopen = function(){
                        //Register for recieving point values
                        // using a PointValueRegistrationModel
                        socket.send(JSON.stringify(
                                {'xid': xid,
                                 'eventTypes': events
                                }));
                        onOpen();
                     };
                     socket.onclose = onClose;
                     socket.onmessage = function(event){
                         onMessage(JSON.parse(event.data));
                     };
                    return socket;
                }else{
                    alert('Websockets not supported!');
                }
            },
            
            /**
             * Modify the existing events for a point on a socket
             * @param xid - xid of data point
             * @param events - ['INITIALIZE', 'UPDATE', 'CHANGE', 'SET', 'BACKDATE', 'TERMINATE']
             * @returns
             */
            modifyRegisteredEvents: function(socket, xid, events){
                socket.send(JSON.stringify(
                        {'xid': xid,
                         'eventTypes': events
                        }));
            },
            
            openSocket: function() {
                return new WebSocket('ws://' + document.location.host + '/rest/v1/websocket/point-value');
            }
        },

        /**
         * Realtime Values Access
         */
        realtime: {
            /**
             * Get Current Value
             * 
             * @param xid - for point desired
             * 
             * @param done - function(jsonData) callback with current point value as data
             * 
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise that will be resolved when done
             */
            getCurrentValue: function(xid, done, fail){
                var url = "/rest/v1/realtime/by-xid/" + encodeURIComponent(xid);
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return data;
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * Get All Current Values for running points
             * 
             * @param limit results too this
             * @param done - function(jsonData) callback with current point values as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise that will be resolved when done
             */
            getAll: function(limit, done, fail) {
                var url = "/rest/v1/realtime?limit=" + limit;
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return data;
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            }
        },
        
        /**
         * Realtime Values Access
         */
        hierarchy: {
            /**
             * List Root 
             * 
             * @param done - function(jsonData) callback with root contents as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @param options - anything you'd like to pass into done
             * @return promise when done
             */
            getRoot: function(done, fail, options) {
                var url = "/rest/v1/hierarchy/full";
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return resolvedPromise(data, options);
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * Get Contents of a given folder
             * 
             * @param name of folder
             * @param done - function(jsonData) callback with folder contents as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise that will be resolved when done
             */
            getFolderByName: function(name, done, fail) {
                var url = "/rest/v1/hierarchy/by-name/" + encodeURIComponent(name);
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return data;
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            },
            
            /**
             * Get Contents of a given folder
             * 
             * @param id of folder
             * @param done - function(jsonData) callback with folder contents as data
             * @param fail - function(jqXHR, textStatus, errorThrown, mangoMessage) on failure callback
             * @return promise that will be resolved when done
             */
            getFolderById: function(id, done, fail) {
                var url = "/rest/v1/hierarchy/by-id/" + encodeURIComponent(id);
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return data;
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            }
        },
        
        users: {
            getCurrent: function() {
                var url = "/rest/v1/users/current";
                
                var promise = ajaxTemplate({
                    url: url
                }).then(function(data, status, jqXHR) {
                    return data;
                });
                
                if (typeof done == 'function') promise.done(done);
                if (typeof fail == 'function') promise.fail(fail);
                
                return promise;
            }
        },
        
        /**
         * 
         * Format the date for use as a REST API URL parameter
         * Jan 1 2014 at midnight
         * ie. 2014-01-01T00:00:00.000+10:00
         * 
         * @param now
         * @returns {String}
         */
        formatLocalDate: function(now) {
                var tzo = -now.getTimezoneOffset(),
                dif = tzo >= 0 ? '+' : '-',
                pad = function(num) {
                    norm = Math.abs(Math.floor(num));
                    return (norm < 10 ? '0' : '') + norm;
                };
            var formatted = now.getFullYear() +
                '-' + pad(now.getMonth()+1) +
                '-' + pad(now.getDate()) +
                'T' + pad(now.getHours()) +
                ':' + pad(now.getMinutes()) +
                ':' + pad(now.getSeconds()) +
                '.' + "000" +
                dif + pad(tzo / 60) +
                ':' + pad(tzo % 60);
            return encodeURIComponent(formatted);
        },
        
        cancellable: cancellable,
        when: when
};

return mangoRest;

})); // close factory function and execute anonymous function
