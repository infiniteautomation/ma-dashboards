/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

VirtualSerialPortFactory.$inject = ['maRestResource'];
function VirtualSerialPortFactory(RestResource) {
    
    const baseUrl = '/rest/v2/virtual-serial-ports';
    const webSocketUrl = '/rest/v2/websocket/virtual-serial-ports';
    const xidPrefix = 'VSP_';

    const defaultProperties = {
        portName: '',
        address: '',
        port: 9000,
        timeout: 0,
        portType: ''
    };


    class VirtualSerialPortResource extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }

        static get baseUrl() {
            return baseUrl;
        }

        static get webSocketUrl() {
            return webSocketUrl;
        }
        
        static get xidPrefix() {
            return xidPrefix;
        }

        static list() {
            return this.http({
                url: this.baseUrl,
                method: 'GET'
            }).then(response => {
                const items = response.data.map(item => {
                    return new this(item);
                });
                items.$total = response.data.length;
                return items;
            });
        }
    }
    
    return VirtualSerialPortResource;
}

export default VirtualSerialPortFactory;