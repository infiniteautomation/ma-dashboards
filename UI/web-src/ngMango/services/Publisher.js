/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';

publisherProvider.$inject = [];
function publisherProvider() {
    
    const publishTypeCodes = [
        {
            value: 'ALL',
            translationKey: 'publisherEdit.publishType.all'
        },
        {
            value: 'CHANGES_ONLY',
            translationKey: 'publisherEdit.publishType.changesOnly'
        },
        {
            value: 'LOGGED_ONLY',
            translationKey: 'publisherEdit.publishType.loggedOnly'
        },
        {
            value: 'NONE',
            translationKey: 'publisherEdit.publishType.none'
        }
    ];
    
    const publisherTypes = [];
    const publisherTypesByName = Object.create(null);
    
    this.registerPublisherType = function(type) {
        const existing = publisherTypes.find(t => t.type === type.type);
        if (existing) {
            console.error('Tried to register publisher type twice', type);
            return;
        }
        publisherTypes.push(type);
    };
    
    this.$get = publisherFactory;
    
    publisherFactory.$inject = ['maRestResource', '$templateCache', 'maUtil'];
    function publisherFactory(RestResource, $templateCache, Util) {

        const publisherBaseUrl = '/rest/v2/publishers-v2';
        const publisherWebSocketUrl = '/rest/v2/websocket/publishers';
        const publisherXidPrefix = 'PUB_';

        // rest of the defaults are set by first registered type
    	const defaultProperties = {
    	    name: '',
	        xid: '',
	        enabled: false,
	        publishType: 'ALL',
	        cacheWarningSize: 100,
	        cacheDiscardSize: 1000,
	        sendSnapshot: false,
	        snapshotSendPeriod: {
	            periods: 5,
	            type: 'MINUTES'
	        },
	        publishAttributeChanges: false
    	};

        class Publisher extends RestResource {
            
            constructor(properties) {
                if (!properties && publisherTypes.length) {
                    const type = publisherTypes[0];
                    properties = angular.copy(type.defaultPublisher) || {};
                    properties.modelType = type.type;
                }
                super(properties);
                
                if (!this.points) {
                    this.points = [];
                }
                if (!this.eventAlarmLevels) {
                    this.eventAlarmLevels = [];
                }
            }

            static get defaultProperties() {
                return defaultProperties;
            }
            
            static get baseUrl() {
                return publisherBaseUrl;
            }
            
            static get webSocketUrl() {
                return publisherWebSocketUrl;
            }
            
            static get xidPrefix() {
                return publisherXidPrefix;
            }
            
            static get types() {
                return publisherTypes;
            }
            
            static get typesByName() {
                return publisherTypesByName;
            }
            
            static get publishTypeCodes() {
                return publishTypeCodes;
            }

            enable(enabled = true, restart = false) {
                this.$enableToggling = true;
                
                return this.constructor.http({
                    url: this.constructor.baseUrl + '/enable-disable/' + this.constructor.encodeUriSegment(this.getOriginalId()),
                    method: 'PUT',
                    params: {
                        enabled: !!enabled,
                        restart
                    }
                }).then(() => {
                    this.enabled = enabled;
                }).finally(() => {
                    delete this.$enableToggling;
                });
            }
            
            get isEnabled() {
                return this.enabled;
            }
            
            set isEnabled(value) {
                this.enable(value);
            }
            
            changeType(type = this.modelType) {
                const newPublisher = this.constructor.typesByName[type].createPublisher();
                
                // copy only a select set of properties over
                Object.keys(defaultProperties).forEach(k => newPublisher[k] = this[k]);
                
                return newPublisher;
            }
            
            createPublisherPoint(point) {
                const type = this.constructor.typesByName[this.modelType];
                const publisherPoint = type.createPublisherPoint(point);
                publisherPoint.dataPointXid = point.xid;
                publisherPoint.modelType = type.type;
                return publisherPoint;
            }
        }

        class PublisherType {
            constructor(defaults = {}) {
                Object.assign(this, defaults);

                // put the templates in the template cache so we can ng-include them
                if (this.template && !this.templateUrl) {
                    this.templateUrl = `publisherEditor.${this.type}.html`;
                    $templateCache.put(this.templateUrl, this.template);
                }
            }
            
            createPublisher() {
                const publisher = new Publisher(angular.copy(this.defaultPublisher));
                publisher.modelType = this.type;
                return publisher;
            }
            
            createPublisherPoint(point) {
                return angular.copy(this.defaultPublisherPoint || {});
            }
        }

        publisherTypes.forEach((type, i) => {
            publisherTypes[i] = Object.freeze(new PublisherType(type));
        });
        
        Util.createMapObject(publisherTypes, 'type', publisherTypesByName);
        
        Object.freeze(publisherTypes);
        Object.freeze(publisherTypesByName);

        return Publisher;
    }
}

export default publisherProvider;