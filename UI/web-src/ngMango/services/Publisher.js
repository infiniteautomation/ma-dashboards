/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

publisherProvider.$inject = [];
function publisherProvider() {
    
    const publisherTypes = [];
    
    this.registerPublisherType = function(type) {
        const existing = publisherTypes.find(t => t.type === type.type);
        if (existing) {
            console.error('Tried to register publisher type twice', type);
            return;
        }
        publisherTypes.push(type);
    };
    
    this.$get = publisherFactory;
    
    publisherFactory.$inject = ['maRestResource', '$templateCache'];
    function publisherFactory(RestResource, $templateCache) {

        const publisherBaseUrl = '/rest/v2/publishers-v2';
        const publisherWebSocketUrl = '/rest/v2/websocket/publishers';
        const publisherXidPrefix = 'PUB_';

        const publisherTypesByName = Object.create(null);
        publisherTypes.forEach(publisherType => {
            publisherTypesByName[publisherType.type] = publisherType;
            
            // put the templates in the template cache so we can ng-include them
            if (publisherType.template && !publisherType.templateUrl) {
                publisherType.templateUrl = `publishers.${publisherType.type}.html`;
                $templateCache.put(publisherType.templateUrl, publisherType.template);
            }
            
            Object.freeze(publisherType);
        });
        
        Object.freeze(publisherTypes);
        Object.freeze(publisherTypesByName);
        
    	const defaultProperties = {
    	};
    	
        class Publisher extends RestResource {
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
            
            static publisherTypes() {
                return publisherTypes;
            }
            
            static publisherTypesByName() {
                return publisherTypesByName;
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
        }

        return Publisher;
    }
}

export default publisherProvider;